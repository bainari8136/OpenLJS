<?php

namespace App\Modules\Users\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Spatie\Permission\Models\Role;

class AssignRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('assign-roles');
    }

    public function rules(): array
    {
        $validRoles = Role::pluck('name')->toArray();

        return [
            'role' => ['required', 'string', 'in:' . implode(',', $validRoles)],
        ];
    }
}
