<?php

namespace App\Modules\Journals\Requests;

use App\Modules\Journals\Requests\Concerns\SanitizesHtmlFields;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    use SanitizesHtmlFields;

    public function authorize(): bool
    {
        return $this->user()->can('manage-journals');
    }

    protected function prepareForValidation(): void
    {
        if ($this->parent_id === '') {
            $this->merge(['parent_id' => null]);
        }

        $this->sanitizeHtmlFields(['description']);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => [
                'nullable',
                Rule::exists('journal_categories', 'id')
                    ->where(fn ($query) => $query->where('journal_id', $this->route('journal')->id)),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'article_ordering' => ['nullable', Rule::in(['sequential', 'title', 'date_published', 'author'])],
            'is_active' => ['boolean'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
