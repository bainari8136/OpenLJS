<?php

namespace App\Modules\Journals\Requests\Concerns;

use Mews\Purifier\Facades\Purifier;

trait SanitizesHtmlFields
{
    /**
     * Strip unsafe markup from rich-text fields before validation, since these
     * fields are edited with RichTextEditor and stored/rendered as raw HTML.
     */
    protected function sanitizeHtmlFields(array $fields): void
    {
        $merge = [];

        foreach ($fields as $field) {
            if ($this->filled($field)) {
                $merge[$field] = Purifier::clean($this->input($field));
            }
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }
}
