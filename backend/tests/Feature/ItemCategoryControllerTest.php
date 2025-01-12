<?php

use App\Models\ItemCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

it('can list item categories', function () {
    // Arrange: Create some item categories

    $user = User::create([
        "name" => "test user",
        "email" => "test@gmail.com",
        "password" => Hash::make("password")
    ]);

    ItemCategory::factory()->count(10)->create([
        "user_id" => $user->id
    ]);

    // Act: Make a GET request to the index endpoint
    $response = $this->getJson('/api/item-categories?per_page=10');

    // Assert: Check response status and structure
    $response->assertJsonCount(10, 'data'); // Default per_page is 10
});

it('can create an item category', function () {
    // Arrange: Define data

    $user = User::factory()->create();


    // Act: Make a GET request to the index endpoint

    $data = ['name' => 'New Category', "user_id" => $user->id, "status" => true];


    // Act: Make a POST request to the store endpoint
    $response = $this->postJson('/api/item-categories', $data);

    // Assert: Check the response and database
    $response->assertStatus(201);
});

it('can update an item category', function () {

    $user = User::factory()->create();

    // Act: Make a GET request to the index endpoint

    $data = ['name' => 'New Category', "user_id" => $user->id, "status" => true];

    // Arrange: Create an item category
    $itemCategory = ItemCategory::factory()->create($data);

    $data = ['name' => 'Updated Name', "user_id" => $user->id, "status" => true];

    // Act: Make a PUT request to the update endpoint
    $response = $this->putJson("/api/item-categories/{$itemCategory->id}", $data);

    // Assert: Check response and database
    $response->assertStatus(200);
});

it('can delete an item category', function () {
    // Arrange: Create an item category
    $user = User::factory()->create();

    // Act: Make a GET request to the index endpoint

    $data = ['name' => 'New Category', "user_id" => $user->id, "status" => true];

    // Arrange: Create an item category
    $itemCategory = ItemCategory::factory()->create($data);

    // Act: Make a DELETE request to the destroy endpoint
    $response = $this->deleteJson("/api/item-categories/{$itemCategory->id}");

    // Assert: Check response and database
    $response->assertStatus(204);
});
