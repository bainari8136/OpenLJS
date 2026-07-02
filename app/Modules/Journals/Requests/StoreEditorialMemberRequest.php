<?php

namespace App\Modules\Journals\Requests;

use App\Modules\Journals\Requests\Concerns\SanitizesHtmlFields;
use Illuminate\Foundation\Http\FormRequest;

class StoreEditorialMemberRequest extends FormRequest
{
    use SanitizesHtmlFields;

    public function authorize(): bool
    {
        return $this->user()->can('manage-journals');
    }

    protected function prepareForValidation(): void
    {
        $this->sanitizeHtmlFields(['bio']);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'affiliation' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'orcid' => ['nullable', 'string', 'max:50', 'regex:/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],
        ];
    }
}
