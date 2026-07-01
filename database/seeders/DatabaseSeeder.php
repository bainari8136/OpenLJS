<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            PermissionsSeeder::class,
        ]);

        $admin = User::factory()->create([
            'name' => 'System Admin',
            'email' => 'admin@openljs.local',
            'password' => bcrypt('password'),
        ]);

        $admin->assignRole('super-admin');
    }
}
