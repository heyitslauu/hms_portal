<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()
            ->count(5)
            ->create()
            ->each(function ($user) {

                $user->syncRoles(['patient']);

                Patient::create([
                    'user_id' => $user->id,
                    'first_name' => fake()->firstName(),
                    'middle_name' => fake()->optional()->firstName(),
                    'last_name' => fake()->lastName(),
                    'birthday' => fake()->date('Y-m-d', '-18 years'),
                    'address' => fake()->address(),
                    'phone' => fake()->phoneNumber(),
                ]);
            });
    }
}
