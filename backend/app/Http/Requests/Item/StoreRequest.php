<?php

namespace App\Http\Requests\Item;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
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
            'name' => "required|unique:items",
            'user_id' => "required",
            'item_category_id' => "required",
            'status' => "nullable",
            'image' => 'nullable|image|mimes:jpg,png,jpeg,gif|max:2048', // Validate the image
        ];
    }
}
