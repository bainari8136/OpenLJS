<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crossref_doi_deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->unique()->constrained('articles')->cascadeOnDelete();
            $table->string('doi');
            $table->string('status')->default('pending'); // pending|deposited|failed|skipped
            $table->unsignedSmallInteger('response_status')->nullable();
            $table->text('response_body')->nullable();
            $table->timestamp('deposited_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crossref_doi_deposits');
    }
};
