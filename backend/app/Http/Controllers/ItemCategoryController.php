<?php

namespace App\Http\Controllers;

use App\Http\Requests\ItemCategory\StoreRequest;
use App\Http\Requests\ItemCategory\UpdateRequest;
use App\Models\ItemCategory;

class ItemCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function dropDown()
    {
        return ItemCategory::where("status", true)->get();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return ItemCategory::paginate(request("per_page", 15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        return ItemCategory::create($request->validated());
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, ItemCategory $itemCategory)
    {
        $itemCategory->update($request->validated());

        return $itemCategory;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ItemCategory $itemCategory)
    {
        $itemCategory->delete();

        return response()->noContent();
    }
}
