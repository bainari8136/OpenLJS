<?php

namespace App\Modules\Journals\Requests;

use App\Modules\Journals\Requests\Concerns\SanitizesHtmlFields;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJournalRequest extends FormRequest
{
    use SanitizesHtmlFields;

    public function authorize(): bool
    {
        return $this->user()->can('manage-journals');
    }

    protected function prepareForValidation(): void
    {
        $this->sanitizeHtmlFields(['description', 'author_guidelines', 'review_policy']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'acronym' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'website_url' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'author_guidelines' => ['nullable', 'string'],
            'review_policy' => ['nullable', 'string'],
            'issn_print' => ['nullable', 'string', 'max:20'],
            'issn_online' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
            'submissions_enabled' => ['boolean'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'principal_contact_name' => ['nullable', 'string', 'max:255'],
            'principal_contact_email' => ['nullable', 'email', 'max:255'],
            'principal_contact_phone' => ['nullable', 'string', 'max:50'],
            'principal_contact_affiliation' => ['nullable', 'string', 'max:255'],
            'principal_contact_mailing_address' => ['nullable', 'string', 'max:1000'],
            'tech_support_name' => ['nullable', 'string', 'max:255'],
            'tech_support_email' => ['nullable', 'email', 'max:255'],
            'tech_support_phone' => ['nullable', 'string', 'max:50'],
        ];
    }
}
