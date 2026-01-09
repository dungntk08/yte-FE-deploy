<?php

namespace App\Http\Controllers;

use App\Models\AdminUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = AdminUser::where('Username', $request->username)->first();

        if (! $admin || ! Hash::check($request->password, $admin->PasswordHash)) {
            throw ValidationException::withMessages([
                'username' => ['Tài khoản hoặc mật khẩu không chính xác.'],
            ]);
        }

        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'admin' => $admin,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // Helper to create initial admin
    public function setup(Request $request)
    {
        // Simple protection: only allow if no admins exist
        if (AdminUser::count() > 0) {
            return response()->json(['message' => 'Setup already completed'], 403);
        }

        $request->validate([
            'username' => 'required|string|unique:AdminUsers,Username',
            'password' => 'required|string|min:6',
        ]);

        $admin = AdminUser::create([
            'Username' => $request->username,
            'PasswordHash' => Hash::make($request->password),
            'FullName' => 'Super Administrator',
        ]);

        return response()->json($admin);
    }
}
