<?php

namespace App\Http\Controllers;

use App\Models\ServiceResult;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceResultController extends Controller
{
    /**
     * Store a newly created service result.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_name' => ['required', 'string', 'max:255'],

            // Scalable validation using departments config
            'service_type' => ['required', 'string', Rule::in(config('departments'))],

            'written_result' => ['nullable', 'string'],
            'file_path' => ['nullable', 'array'],
            'file_path.*' => ['string'], // Each file path should be a string
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'uploaded_by' => ['required', 'integer', 'exists:users,id'],
        ]);

        ServiceResult::create($validated);

        return back()->with('success', 'Service result created successfully.');
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
}
