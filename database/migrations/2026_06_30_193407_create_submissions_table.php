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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('journal_sections')->nullOnDelete();
            $table->foreignId('submitting_author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->text('abstract')->nullable();
            $table->json('keywords')->nullable();
            $table->string('status')->default('draft');
            $table->string('current_stage')->default('submission');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['journal_id', 'status']);
            $table->index(['submitting_author_id', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
