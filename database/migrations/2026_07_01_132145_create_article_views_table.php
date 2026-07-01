<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->string('ip_hash', 64);
            $table->date('viewed_date');
            $table->timestamps();

            $table->unique(['article_id', 'ip_hash', 'viewed_date']);
            $table->index('article_id');
            $table->index('viewed_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_views');
    }
};
