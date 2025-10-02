<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class CreateUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Notes:
     * - Do NOT add --no-interaction here: Laravel/Symfony provides it globally.
     * - Required for non-interactive use: --name, --email, --password.
     * - You can pass multiple roles: --role=admin --role=manager
     */
    protected $signature = 'user:create {--name=} {--email=} {--password=} {--department=} {--role=*}';

    /**
     * The console command description.
     */
    protected $description = 'Interactively create a user account and assign one or more roles';

    public function handle(): int
    {
        $this->info('Create a new user');

        $isInteractive = $this->input->isInteractive();

        // In non-interactive mode ensure required options are present early.
        if (! $isInteractive) {
            $required = ['name', 'email', 'password'];
            $missing = array_filter($required, fn($opt) => ! $this->option($opt));
            if ($missing) {
                $this->error('Missing required options in non-interactive mode: ' . implode(', ', array_map(fn($m) => "--{$m}", $missing)));
                return self::FAILURE;
            }
        }

        $name = $this->option('name') ?: ($isInteractive ? $this->askRequired('Name') : null);
        $email = $this->option('email') ?: ($isInteractive ? $this->askRequired('Email') : null);
        $password = $this->option('password') ?: ($isInteractive ? $this->secretRequired('Password (hidden)') : null);
        $department = $this->option('department') ?: ($isInteractive ? $this->askOptional('Department (leave blank if none)') : null);

        // basic validation
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'department' => $department,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'department' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $err) {
                $this->error($err);
            }
            return self::FAILURE;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password, // model casts to hashed
            'department' => $department ?: null,
        ]);

        $this->info("User #{$user->id} created successfully.");

        // Role assignment
        $rolesPassed = $this->option('role');
        $assignRoles = [];

        if (!empty($rolesPassed)) {
            $assignRoles = $this->resolveRoles($rolesPassed);
        } elseif ($isInteractive) {
            $assignRoles = $this->promptForRoles();
        }

        if (count($assignRoles)) {
            $user->syncRoles($assignRoles);
            $this->info('Assigned roles: ' . implode(', ', $assignRoles));
        } else {
            $this->line('No roles assigned.');
        }

        return self::SUCCESS;
    }

    protected function askRequired(string $label): string
    {
        do {
            $value = (string) $this->ask($label);
            if ($value !== '') return $value;
            $this->warn('This field is required.');
        } while (true);
    }

    protected function secretRequired(string $label): string
    {
        do {
            $value = (string) $this->secret($label);
            if ($value !== '') return $value;
            $this->warn('This field is required.');
        } while (true);
    }

    protected function askOptional(string $label): ?string
    {
        $v = (string) $this->ask($label);
        return $v === '' ? null : $v;
    }

    /**
     * Interactively select one or more roles.
     */
    protected function promptForRoles(): array
    {
        $all = Role::query()->orderBy('name')->pluck('name')->all();
        if (empty($all)) {
            $this->warn('No roles exist yet. Skipping role assignment.');
            return [];
        }

        if ($this->confirm('Assign any roles to this user?', true)) {
            // Multi-select via repeated choice
            $selected = [];
            $remaining = $all;
            while (count($remaining)) {
                $choice = $this->choice('Select a role (or press Enter to finish)', array_merge(['(Done)'], $remaining), 0, attempts: 1, multiple: false);
                if ($choice === '(Done)') break;
                $selected[] = $choice;
                $remaining = array_values(array_diff($remaining, $selected));
                if (!$this->confirm('Add another role?', false)) {
                    break;
                }
            }
            return $selected;
        }
        return [];
    }

    /**
     * Validate and return only existing role names from provided input.
     */
    protected function resolveRoles(array $names): array
    {
        if (empty($names)) return [];
        $existing = Role::whereIn('name', $names)->pluck('name')->all();
        $missing = array_diff($names, $existing);
        if ($missing) {
            $this->warn('Ignoring non-existent roles: ' . implode(', ', $missing));
        }
        return $existing;
    }
}
