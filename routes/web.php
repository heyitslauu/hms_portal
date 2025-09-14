<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PermissionController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::middleware('role:admin')->group(function () {
        Route::get('permissions', [PermissionController::class, 'index'])->name('permissions');
        Route::post('permissions', [PermissionController::class, 'store'])->name('permissions.store');
        Route::patch('permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
        Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
