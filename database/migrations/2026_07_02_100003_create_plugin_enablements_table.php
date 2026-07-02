<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plugin_enablements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plugin_id')->constrained('plugins')->cascadeOnDelete();
            $table->foreignId('journal_id')->nullable()->constrained('journals')->cascadeOnDelete();
            $table->boolean('enabled')->default(false);
            $table->timestamps();

            $table->unique(['plugin_id', 'journal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plugin_enablements');
    }
};
