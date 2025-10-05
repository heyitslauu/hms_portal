<?php

namespace App\Http\Controllers;

use App\Models\ServiceOffering;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ServiceOfferingController extends Controller
{
    /**
     * Display a listing of the service offerings.
     */
    public function index(): Response
    {
        $offerings = ServiceOffering::query()
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('services/index', [
            'offerings' => $offerings,
        ]);
    }

    /**
     * Store a newly created service offering.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(config('departments'))],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        // Ensure is_available is properly cast to boolean
        $validated['is_available'] = (bool) ($validated['is_available'] ?? false);

        ServiceOffering::create($validated);

        return back()->with('success', 'Service offering created successfully.');
    }

    /**
     * Update the specified service offering.
     */
    public function update(Request $request, ServiceOffering $serviceOffering): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(config('departments'))],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        // Ensure is_available is properly cast to boolean
        $validated['is_available'] = (bool) ($validated['is_available'] ?? false);

        $serviceOffering->update($validated);

        return back()->with('success', 'Service offering updated successfully.');
    }

    /**
     * Toggle the availability of the specified service offering.
     */
    public function destroy(ServiceOffering $serviceOffering): RedirectResponse
    {
        $newStatus = !$serviceOffering->is_available;
        $serviceOffering->update(['is_available' => $newStatus]);

        $statusText = $newStatus ? 'available' : 'unavailable';

        return back()->with('success', "Service offering marked as {$statusText} successfully.");
    }
}
