<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ItemCategoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return ['user' => $request->user()];
});

Route::post('/login', [AuthController::class, "login"]);

Route::apiResource('/item-categories', ItemCategoryController::class);
Route::get('/item-categories-list', [ItemCategoryController::class, "dropDown"]);

Route::apiResource('/items', ItemController::class);
Route::post('/items-update/{id}', [ItemController::class, "itemUpdate"]);
Route::apiResource('/menus', MenuController::class);

Route::get('/register/{token}', [RegistrationController::class, 'register'])->name('user.register');

Route::get('/generate-registration-qr-code', [RegistrationController::class, 'generateRegistrationQRCode']);


