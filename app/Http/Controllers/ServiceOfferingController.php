<?php

namespace App\Http\Controllers;

use App\Models\ServiceOffering;
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
}
