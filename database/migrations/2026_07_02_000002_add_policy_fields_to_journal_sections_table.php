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
        Schema::table('journal_sections', function (Blueprint $table) {
            $table->string('abbreviation')->nullable()->after('title');
            $table->text('policy')->nullable()->after('description');
            $table->unsignedInteger('word_count_limit')->nullable()->after('submission_guidelines');
            $table->string('identify_as')->nullable()->after('word_count_limit');
            $table->boolean('is_peer_reviewed')->default(true)->after('identify_as');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_sections', function (Blueprint $table) {
            $table->dropColumn(['abbreviation', 'policy', 'word_count_limit', 'identify_as', 'is_peer_reviewed']);
        });
    }
};
