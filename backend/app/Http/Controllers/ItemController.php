<?php

namespace App\Http\Controllers;

use App\Http\Requests\Item\StoreRequest;
use App\Http\Requests\Item\UpdateRequest;
use App\Models\Item;
use Exception;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Item::with("category")->paginate(request("per_page", 15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        return Item::create($request->validated());
    }

    /**
     * Update the specified resource in storage.
     */
    public function itemUpdate(UpdateRequest $request, $id)
    {
        $payload = $request->validated();

        try {
            $item = Item::findOrFail($id);

            if (request()->hasFile('image')) {

                if ($item->image && File::exists(public_path($item->image))) {
                    File::delete(public_path($item->image));
                }

                $file = request()->file('image');

                $directory = 'images';

                $filename = time() . '_' . $file->getClientOriginalName();

                $path = $directory . '/' . $filename;

                // Move the file to the public directory
                $file->move(public_path($directory), $filename);

                $payload["image"] = $path;
            }

            Item::where("id", $id)->update($payload);

            return Item::where("id", $id)->first();

        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Item $item)
    {
        $item->delete();

        return response()->noContent();
    }
}
