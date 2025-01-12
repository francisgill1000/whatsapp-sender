<?php

namespace Database\Factories;

use App\Models\ItemCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word,
            'user_id' => User::factory(),
            'item_category_id' => ItemCategory::factory(),
            'status' => fake()->boolean,
            'image' => fake()->imageUrl(),
        ];
    }
}
