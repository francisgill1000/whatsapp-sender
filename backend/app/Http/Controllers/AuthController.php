<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }


        return response()->json([
            'token' => $user->createToken('myApp')->plainTextToken,
            'user' => $user,
        ], 200);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()], 200);
    }

    public function logout(Request $request)
    {
        return $request->user()->tokens()->delete();
    }
}
