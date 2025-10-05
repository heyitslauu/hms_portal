<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ServiceOfferingController;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('welcome');
})->name('home');

Route::get('service-offerings', [ServiceOfferingController::class, 'index'])->name('service-offerings');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::middleware('role:admin')->group(function () {
        Route::get('permissions', [PermissionController::class, 'index'])->name('permissions');
        Route::post('permissions', [PermissionController::class, 'store'])->name('permissions.store');
        Route::patch('permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
        Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

        Route::get('roles', [RoleController::class, 'index'])->name('roles');
        Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
        Route::patch('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

        Route::get('users', [UserController::class, 'index'])->name('users');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        Route::get('patients', [PatientController::class, 'index'])->name('patients');
        Route::post('patients', [PatientController::class, 'store'])->name('patients.store');
        Route::patch('patients/{patient}', [PatientController::class, 'update'])->name('patients.update');
        Route::delete('patients/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');

        Route::post('service-offerings', [ServiceOfferingController::class, 'store'])->name('service-offerings.store');
        Route::patch('service-offerings/{serviceOffering}', [ServiceOfferingController::class, 'update'])->name('service-offerings.update');
        Route::delete('service-offerings/{serviceOffering}', [ServiceOfferingController::class, 'destroy'])->name('service-offerings.destroy');
    });
});




require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
