<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    // Display a listing of the resource
    public function index()
    {
        // Menu::truncate();
        return Menu::first(); // Retrieve all menus
    }

    // Store a newly created resource in storage
    public function store(Request $request)
    {
        $menu = Menu::updateOrCreate(
            // Condition to check if the record exists
            ['id' => $request->id], // Example: matching by ID (or use another unique field)
            // Values to update or create
            ['json' => $request->json]
        );

        return response()->json($menu->json, 200); // Return the updated or created record
    }
}
