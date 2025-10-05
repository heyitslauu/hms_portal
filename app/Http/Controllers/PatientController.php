<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Patient;
use App\Models\ServiceOffering;
use App\Models\ServiceResult;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class PatientController extends Controller
{
    /**
     * Display a listing of patients (placeholder for now).
     */
    public function index(): Response
    {
        $patients = Patient::with(['user:id,name,email'])
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('patients/index', [
            'patients' => $patients,
        ]);
    }

    /**
     * Display the specified patient details.
     */
    public function show(Patient $patient): Response
    {
        $patient->load(['user:id,name,email,created_at']);

        // Get authenticated user's department
        $user = Auth::user();
        $department = $user->department;

        // Initialize data arrays
        $serviceOfferings = [];
        $serviceResults = [];

        if ($department) {
            $serviceOfferings = ServiceOffering::where('type', $department)
                ->where('is_available', true)
                ->orderBy('name')
                ->get();

            // Get service results for this patient uploaded by current authenticated user
            $serviceResults = ServiceResult::where('patient_id', $patient->id)
                ->where('uploaded_by', $user->id)
                ->with(['uploadedBy:id,name,email'])
                ->latest('created_at')
                ->get();
        }

        return Inertia::render('patients/show', [
            'patient' => $patient,
            'serviceOfferings' => $serviceOfferings,
            'serviceResults' => $serviceResults,
        ]);
    }

    /**
     * Store a newly created patient (and associated user) in storage.
     * Uses the injected Patient model instance instead of the global request helper for creation.
     */
    public function store(Request $request): RedirectResponse
    {

        $data = $request->validate([
            'email' => 'required|email:rfc,dns|unique:users,email',
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:8|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'birthday' => 'required|date',
            'address' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);

            if (Role::where('name', 'patient')->exists()) {
                $user->assignRole('patient');
            }

            $user->patient()->create([
                'first_name'  => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name'   => $data['last_name'],
                'birthday'    => $data['birthday'],
                'address'     => $data['address'],
                'phone'       => $data['phone'] ?? null,
            ]);
        });

        return redirect()->route('patients')
            ->with('success', 'Patient created successfully.');
    }

    /**
     * Update an existing patient and optionally the linked user account.
     */
    public function update(Request $request, Patient $patient): RedirectResponse
    {
        $data = $request->validate([
            'email' => 'required|email:rfc,dns|unique:users,email,' . $patient->user_id,
            'name' => 'required|string|max:255',
            'password' => 'nullable|string|min:8|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'birthday' => 'required|date',
            'address' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($data, $patient) {
            $user = $patient->user;
            $user->name = $data['name'];
            $user->email = $data['email'];
            if (!empty($data['password'])) {
                $user->password = $data['password'];
            }
            $user->save();

            $patient->update([
                'first_name'  => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name'   => $data['last_name'],
                'birthday'    => $data['birthday'],
                'address'     => $data['address'],
                'phone'       => $data['phone'] ?? null,
            ]);
        });

        return redirect()->route('patients')
            ->with('success', 'Patient updated successfully.');
    }

    /**
     * Remove the specified patient (and optionally soft delete user) from storage.
     */
    public function destroy(Patient $patient): RedirectResponse
    {
        DB::transaction(function () use ($patient) {
            // delete patient record
            $patient->delete();

            // Optionally also soft delete the user if no other related domain models would prevent this
            if ($patient->user && !$patient->user->trashed()) {
                $patient->user->delete();
            }
        });

        return redirect()->route('patients')
            ->with('success', 'Patient deleted successfully.');
    }
}
