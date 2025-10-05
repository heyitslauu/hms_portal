<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\ServiceOffering;
use Illuminate\Database\Seeder;

class ServiceOfferingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $serviceOfferings = [
            [
                'name' => 'Blood Test',
                'type' => 'laboratory',
                'description' => 'A comprehensive blood test for overall health.',
                'price' => 500,
                'is_available' => true,
            ],
            [
                'name' => 'MRI Scan',
                'type' => 'imaging',
                'description' => 'MRI scan for detecting abnormalities in the body.',
                'price' => 2000,
                'is_available' => true,
            ],
            [
                'name' => 'Pregnancy Ultrasound',
                'type' => 'obgyn',
                'description' => 'Ultrasound for pregnancy monitoring and checkup.',
                'price' => 1500,
                'is_available' => true,
            ],
            [
                'name' => 'ECG',
                'type' => 'heart-station',
                'description' => 'Electrocardiogram (ECG) for heart health monitoring.',
                'price' => 800,
                'is_available' => true,
            ],
            [
                'name' => 'Complete Blood Count (CBC)',
                'type' => 'laboratory',
                'description' => 'A test to evaluate overall health and detect disorders.',
                'price' => 600,
                'is_available' => true,
            ],
            [
                'name' => 'Lipid Profile',
                'type' => 'laboratory',
                'description' => 'Cholesterol and triglyceride level test.',
                'price' => 1200,
                'is_available' => true,
            ],
            [
                'name' => 'Fasting Blood Sugar (FBS)',
                'type' => 'laboratory',
                'description' => 'Measures glucose levels in the blood.',
                'price' => 500,
                'is_available' => true,
            ],
            [
                'name' => 'Urinalysis',
                'type' => 'laboratory',
                'description' => 'Analysis of urine for kidney and urinary tract health.',
                'price' => 400,
                'is_available' => true,
            ],
            [
                'name' => 'Thyroid Function Test',
                'type' => 'laboratory',
                'description' => 'A test to check thyroid hormone levels.',
                'price' => 1800,
                'is_available' => true,
            ],

            // 🏥 Imaging Tests
            [
                'name' => 'X-ray (Chest)',
                'type' => 'imaging',
                'description' => 'Chest X-ray to check lungs and heart.',
                'price' => 1000,
                'is_available' => true,
            ],
            [
                'name' => 'CT Scan (Brain)',
                'type' => 'imaging',
                'description' => 'Detailed imaging of the brain for abnormalities.',
                'price' => 5000,
                'is_available' => true,
            ],
            [
                'name' => 'Mammography',
                'type' => 'imaging',
                'description' => 'Breast cancer screening with X-ray.',
                'price' => 2500,
                'is_available' => true,
            ],

            // 🤰 OBGYN Services
            [
                'name' => 'Pelvic Ultrasound',
                'type' => 'obgyn',
                'description' => 'Ultrasound for uterus and ovaries examination.',
                'price' => 1700,
                'is_available' => true,
            ],
            [
                'name' => 'Pap Smear',
                'type' => 'obgyn',
                'description' => 'Cervical cancer screening test.',
                'price' => 900,
                'is_available' => true,
            ],

            // ❤️ Heart Station Tests
            [
                'name' => '2D Echocardiogram',
                'type' => 'heart-station',
                'description' => 'Ultrasound of the heart to assess function and structure.',
                'price' => 3500,
                'is_available' => true,
            ],
            [
                'name' => 'Treadmill Stress Test',
                'type' => 'heart-station',
                'description' => 'Test to evaluate heart function under physical stress.',
                'price' => 2800,
                'is_available' => true,
            ],
            [
                'name' => 'Holter Monitoring',
                'type' => 'heart-station',
                'description' => '24-hour ECG monitoring for heart rhythm analysis.',
                'price' => 4500,
                'is_available' => true,
            ],
        ];

        // Loop through and create each service offering
        foreach ($serviceOfferings as $offering) {
            ServiceOffering::create([
                'name' => $offering['name'],
                'type' => $offering['type'],
                'description' => $offering['description'],
                'price' => $offering['price'],
                'is_available' => $offering['is_available'],
            ]);
        }
    }
}
