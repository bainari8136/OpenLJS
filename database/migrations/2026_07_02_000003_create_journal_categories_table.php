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
        Schema::create('journal_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('journal_categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('path')->nullable();
            $table->text('description')->nullable();
            $table->string('article_ordering')->default('sequential');
            $table->string('cover_image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['journal_id', 'slug']);
            $table->index(['journal_id', 'parent_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_categories');
    }
};
