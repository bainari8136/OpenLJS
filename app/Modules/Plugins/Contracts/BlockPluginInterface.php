<?php

namespace App\Modules\Plugins\Contracts;

use App\Modules\Journals\Models\Journal;

interface BlockPluginInterface extends PluginInterface
{
    /**
     * Render this block's HTML for the given journal's public pages.
     */
    public function render(Journal $journal): string;
}
