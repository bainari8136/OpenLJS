<?php

namespace App\Modules\Journals\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage-journals');
    }

    protected function prepareForValidation(): void
    {
        if ($this->word_count_limit === '') {
            $this->merge(['word_count_limit' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'abbreviation' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:2000'],
            'policy' => ['nullable', 'string', 'max:5000'],
            'submission_guidelines' => ['nullable', 'string'],
            'word_count_limit' => ['nullable', 'integer', 'min:0'],
            'identify_as' => ['nullable', 'string', 'max:50'],
            'is_peer_reviewed' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
