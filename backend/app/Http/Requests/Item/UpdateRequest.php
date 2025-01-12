<?php

namespace App\Http\Requests\Item;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                Rule::unique('items', 'name')->ignore($this->id), // Ignore the record with the current ID
            ],
            'user_id' => "required|exists:users,id",
            'item_category_id' => "required|exists:item_categories,id",
            'status' => "nullable",
            'image' => "nullable",

        ];
    }
}
