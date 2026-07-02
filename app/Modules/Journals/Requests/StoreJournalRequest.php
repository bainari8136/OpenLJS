<?php

namespace App\Modules\Journals\Requests;

use App\Modules\Journals\Requests\Concerns\SanitizesHtmlFields;
use Illuminate\Foundation\Http\FormRequest;

class StoreJournalRequest extends FormRequest
{
    use SanitizesHtmlFields;

    public function authorize(): bool
    {
        return $this->user()->can('manage-journals');
    }

    protected function prepareForValidation(): void
    {
        $this->sanitizeHtmlFields(['description']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'acronym' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:5000'],
            'issn_print' => ['nullable', 'string', 'max:20'],
            'issn_online' => ['nullable', 'string', 'max:20'],
            'submissions_enabled' => ['boolean'],
        ];
    }
}
