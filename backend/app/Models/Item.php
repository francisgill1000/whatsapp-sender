<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class Item extends Model
{
    use HasFactory;

    protected $guarded = [];

    // protected $casts = [
    //     'status' => 'boolean',
    // ];

    function category()
    {
        return $this->belongsTo(ItemCategory::class, "item_category_id");
    }

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        // Check if the image column is set
        if ($this->image) {
            return asset($this->image); // Generate a full URL to the image
        }

        return null; // Return null if no image is set
    }


    // Handle Base64 image storage
    // public function setImageAttribute($value)
    // {
    //     if (!empty($value) && str_contains($value, 'base64')) {
    //         $imageName = uniqid() . '.png'; // Generate a unique image name
    //         $imagePath = 'images/' . $imageName;
    //         Storage::disk('public')->put($imagePath, base64_decode($value));
    //         $this->attributes['image'] = $imagePath; // Save the path to the database
    //     } else {
    //         $this->attributes['image'] = $value; // Directly store the value if not Base64
    //     }
    // }

    protected static function boot()
    {
        parent::boot();

        // Handle the file upload in the `saving` event
        static::saving(function ($item) {

            if (request()->hasFile('image')) {
                $file = request()->file('image');

                // Define the path where the image will be stored (e.g., public/images)
                $directory = 'images';
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $directory . '/' . $filename;

                // Ensure the directory exists
                if (!File::exists(public_path($directory))) {
                    File::makeDirectory(public_path($directory), 0755, true);
                }

                // Move the file to the public directory
                $file->move(public_path($directory), $filename);

                // Set the `image` attribute to the relative path
                $item->image = $path;
            }
        });

        // static::updating(function ($item) {

        //     if (request()->hasFile('image')) {
        //         $file = request()->file('image');

        //         // Define the path where the image will be stored (e.g., public/images)
        //         $directory = 'images';
        //         $filename = time() . '_' . $file->getClientOriginalName();
        //         $path = $directory . '/' . $filename;

        //         // Ensure the directory exists
        //         if (!File::exists(public_path($directory))) {
        //             File::makeDirectory(public_path($directory), 0755, true);
        //         }

        //         // Move the file to the public directory
        //         $file->move(public_path($directory), $filename);

        //         // Set the `image` attribute to the relative path
        //         $item->image = $path;
        //     }
        // });

        static::deleting(function ($item) {
            if ($item->image && File::exists(public_path($item->image))) {
                File::delete(public_path($item->image));
            }
        });
    }
}
