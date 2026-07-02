<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            $table->string('principal_contact_name')->nullable()->after('website_url');
            $table->string('principal_contact_email')->nullable()->after('principal_contact_name');
            $table->string('principal_contact_phone')->nullable()->after('principal_contact_email');
            $table->string('principal_contact_affiliation')->nullable()->after('principal_contact_phone');
            $table->text('principal_contact_mailing_address')->nullable()->after('principal_contact_affiliation');
            $table->string('tech_support_name')->nullable()->after('principal_contact_mailing_address');
            $table->string('tech_support_email')->nullable()->after('tech_support_name');
            $table->string('tech_support_phone')->nullable()->after('tech_support_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            $table->dropColumn([
                'principal_contact_name', 'principal_contact_email', 'principal_contact_phone',
                'principal_contact_affiliation', 'principal_contact_mailing_address',
                'tech_support_name', 'tech_support_email', 'tech_support_phone',
            ]);
        });
    }
};
