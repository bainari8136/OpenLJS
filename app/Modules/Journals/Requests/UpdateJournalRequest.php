<?php

namespace App\Modules\Journals\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJournalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage-journals');
    }

    public function rules(): array
    {
        return [
            'title'               => ['required', 'string', 'max:255'],
            'acronym'             => ['nullable', 'string', 'max:20'],
            'description'         => ['nullable', 'string', 'max:5000'],
            'author_guidelines'   => ['nullable', 'string'],
            'review_policy'       => ['nullable', 'string'],
            'issn_print'          => ['nullable', 'string', 'max:20'],
            'issn_online'         => ['nullable', 'string', 'max:20'],
            'is_active'           => ['boolean'],
            'submissions_enabled' => ['boolean'],
            'logo'                => ['nullable', 'image', 'max:2048'],
        ];
    }
}
