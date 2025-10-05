<?php

namespace App\Http\Controllers;

use App\Models\ServiceResult;
use App\Models\ServiceOffering;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ServiceResultController extends Controller
{
    /**
     * Store a newly created service result.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'service_offering_id' => ['required', 'integer', 'exists:service_offerings,id'],
            'notes' => ['nullable', 'string'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'mimes:jpeg,png,jpg,gif,pdf', 'max:10240'], // 10MB max per file
        ]);

        // Get service offering to extract service name and type
        $serviceOffering = ServiceOffering::findOrFail($validated['service_offering_id']);

        // Handle file uploads
        $filePaths = [];
        if (isset($validated['files'])) {
            foreach ($validated['files'] as $file) {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $uniqueFileName = $originalName . '_' . time() . '_' . uniqid() . '.' . $extension;

                $path = $file->storeAs('service-results', $uniqueFileName, 's3');
                $filePaths[] = $path;
            }
        }

        ServiceResult::create([
            'patient_id' => $validated['patient_id'],
            'service_name' => $serviceOffering->name,
            'service_type' => $serviceOffering->type,
            'written_result' => $validated['notes'],
            'file_path' => $filePaths,
            'uploaded_by' => Auth::id(),
        ]);

        return back()->with('success', 'Service result uploaded successfully.');
    }

    /**
     * Update the specified service result.
     */
    public function update(Request $request, ServiceResult $serviceResult)
    {
        $validated = $request->validate([
            'service_name' => ['sometimes', 'required', 'string', 'max:255'],

            // Scalable validation using departments config
            'service_type' => ['sometimes', 'required', 'string', Rule::in(config('departments'))],

            'written_result' => ['sometimes', 'nullable', 'string'],
            'file_path' => ['sometimes', 'nullable', 'array'],
            'file_path.*' => ['string'],
            'patient_id' => ['sometimes', 'required', 'integer', 'exists:patients,id'],
        ]);

        $serviceResult->update($validated);

        return back()->with('success', 'Service result updated successfully.');
    }

    /**
     * Download a file from S3 for a service result.
     */
    public function downloadFile(ServiceResult $serviceResult, int $fileIndex)
    {
        // Check if user has permission to view this patient's results
        // For now, just check if user is authenticated
        // You can enhance this with proper permission checking later
        if (!Auth::check()) {
            abort(403, 'Unauthorized access to patient files.');
        }

        // Validate file index
        if (!$serviceResult->file_path || !isset($serviceResult->file_path[$fileIndex])) {
            abort(404, 'File not found.');
        }

        $filePath = $serviceResult->file_path[$fileIndex];

        try {
            // Get S3 filesystem instance
            $s3 = Storage::disk('s3');

            // Check if file exists in S3 before generating signed URL
            if (!$s3->exists($filePath)) {
                abort(404, 'File not found in storage.');
            }

            // Generate a temporary signed URL (valid for 5 minutes)
            // The temporaryUrl method is available when using AWS S3 driver
            /** @var \Illuminate\Filesystem\AwsS3V3Adapter $adapter */
            $signedUrl = $s3->temporaryUrl(
                $filePath,
                now()->addMinutes(5)
            );

            // Log file access for audit purposes
            Log::info('File accessed via signed URL', [
                'user_id' => Auth::id(),
                'service_result_id' => $serviceResult->id,
                'file_index' => $fileIndex,
                'file_path' => $filePath,
                'expires_at' => now()->addMinutes(5)
            ]);

            // Redirect user directly to S3 with temporary access
            // Benefits: Faster downloads, no server bandwidth usage, CDN-powered
            return redirect($signedUrl);
        } catch (\BadMethodCallException $e) {
            // temporaryUrl method not available - S3 driver not properly configured
            abort(500, 'S3 signed URLs not available. Ensure AWS_* environment variables are set.');
        } catch (\Exception $e) {
            // Other S3 errors (authentication, network, bucket access, etc.)
            Log::error('S3 file access failed', [
                'error' => $e->getMessage(),
                'file_path' => $filePath,
                'user_id' => Auth::id()
            ]);

            abort(500, 'Could not access file from S3. Please try again or contact support.');
        }
    }
}
