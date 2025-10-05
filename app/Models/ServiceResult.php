<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_name',
        'service_type',
        'written_result',
        'file_path',
        'patient_id',
        'uploaded_by',
    ];

    protected $casts = [
        'file_path' => 'array', // Automatically handle JSON serialization
    ];

    /**
     * Get the valid service types from config
     */
    public static function getValidServiceTypes(): array
    {
        return config('departments', []);
    }

    /**
     * Check if a service type is valid
     */
    public static function isValidServiceType(string $type): bool
    {
        return in_array($type, self::getValidServiceTypes());
    }

    /**
     * Get the patient that owns the service result
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * Get the user who uploaded the service result
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Scope to filter by service type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('service_type', $type);
    }

    /**
     * Scope to filter by patient
     */
    public function scopeForPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }
}
