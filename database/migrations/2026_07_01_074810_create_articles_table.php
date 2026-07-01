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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('journal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('issue_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('abstract')->nullable();
            $table->json('keywords')->nullable();
            $table->string('doi')->nullable();
            $table->string('slug');
            $table->integer('page_start')->nullable();
            $table->integer('page_end')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['journal_id', 'slug']);
            $table->index(['journal_id', 'published_at']);
            $table->index('issue_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
