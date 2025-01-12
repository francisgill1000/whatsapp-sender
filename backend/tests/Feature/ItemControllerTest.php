<?php

use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

/**
 * Test: Listing items
 */
it('can list items', function () {
    $user = User::factory()->create();

    $itemCategory = ItemCategory::factory()->create([
        'user_id' => $user->id,
    ]);

    Item::factory(10)->create([
        'user_id' => $user->id,
        'item_category_id' => $itemCategory->id,
    ]);

    // Act: Send a GET request
    $response = $this->getJson('/api/items?per_page=10');

    // Assert: Validate response and data count
    $response->assertStatus(200)
        ->assertJsonCount(10, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'user_id', 'item_category_id', 'created_at', 'updated_at'],
            ],
        ]);
});

/**
 * Test: Creating an item
 */
it('can create an item', function () {
    // Arrange: Create a user and a category
    $user = User::factory()->create();
    $itemCategory = ItemCategory::factory()->create(['user_id' => $user->id]);

    $temporaryImagePath = sys_get_temp_dir() . '/default.png';
    $image = imagecreate(100, 100); // Create a 100x100 pixel image
    $textColor = imagecolorallocate($image, 0, 0, 0); // Black text
    imagestring($image, 5, 10, 10, 'Test', $textColor); // Add "Test" text
    imagepng($image, $temporaryImagePath); // Save the image as a PNG
    imagedestroy($image);

    $base64Image = 'data:image/png;base64,' . base64_encode(file_get_contents($temporaryImagePath));

    unlink($temporaryImagePath); // Cleanup

    $data = [
        'name' => 'New Item',
        'user_id' => $user->id,
        'status' => true,
        'item_category_id' => $itemCategory->id,
        'image' => $base64Image,
    ];

    // Act: Send a POST request
    $response = $this->postJson('/api/items', $data);

    // Assert: Validate response and database record
    $response->assertStatus(201)->assertJsonFragment(['name' => 'New Item']);

    // Verify the image is stored
    $savedImage = Item::latest()->first()->image;

    $this->assertTrue(Storage::disk('public')->exists($savedImage));
});

/**
 * Test: Updating an item
 */
it('can update an item', function () {
    // Arrange: Create a user, category, and item
    $user = User::factory()->create();
    $itemCategory = ItemCategory::factory()->create(['user_id' => $user->id]);
    $item = Item::factory()->create([
        'name' => 'Old Item',
        'user_id' => $user->id,
        'item_category_id' => $itemCategory->id,
        'image' => 'https://example.com/image.jpg',
    ]);

    $updatedData = [
        'name' => 'Updated Item',
        'user_id' => $user->id,
        'status' => true,
        'item_category_id' => $itemCategory->id,
        'image' => 'https://example.com/image.jpg',
    ];

    // Act: Send a PUT request
    $response = $this->putJson("/api/items/{$item->id}", $updatedData);

    // Assert: Validate response and updated database record
    $response->assertStatus(200)
        ->assertJsonFragment(['name' => 'Updated Item']);

    $this->assertDatabaseHas('items', $updatedData);
});

/**
 * Test: Deleting an item
 */
it('can delete an item', function () {
    // Arrange: Create a user, category, and item
    $user = User::factory()->create();
    $itemCategory = ItemCategory::factory()->create(['user_id' => $user->id]);
    $item = Item::factory()->create([
        'name' => 'Item to Delete',
        'user_id' => $user->id,
        'item_category_id' => $itemCategory->id,
    ]);

    // Act: Send a DELETE request
    $response = $this->deleteJson("/api/items/{$item->id}");

    // Assert: Validate response and ensure database record is deleted
    $response->assertStatus(204);
    $this->assertDatabaseMissing('items', ['id' => $item->id]);
});
