<?php

namespace App\Modules\Journals\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage-journals');
    }

    public function rules(): array
    {
        return [
            'title'                 => ['required', 'string', 'max:255'],
            'description'           => ['nullable', 'string', 'max:2000'],
            'submission_guidelines' => ['nullable', 'string'],
            'is_active'             => ['boolean'],
        ];
    }
}
