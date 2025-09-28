<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
}
