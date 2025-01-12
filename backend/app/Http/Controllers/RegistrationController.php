<?php

namespace App\Http\Controllers;

use App\Models\Token;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

use SimpleSoftwareIO\QrCode\Facades\QrCode;


class RegistrationController extends Controller
{
    public function generateRegistrationQRCode()
    {
        $uniqueToken = Str::uuid(); // Or any unique identifier

        // Optionally save the token in a database
        // Token::create(['token' => $uniqueToken]);

        $qrCode = QrCode::size(300)->generate($uniqueToken);

        return response()->json(['qr_code' => $qrCode]);
    }

    public function register(Request $request, $token)
    {
        // Validate the token (e.g., check the database)
        $isValidToken = Token::where('token', $token)->exists();

        if (!$isValidToken) {
            return response()->json(['message' => 'Invalid token'], 400);
        }

        // Proceed with registration (e.g., show a form or create the user)
        return response()->json(['message' => 'Token valid, proceed with registration']);
    }
}
