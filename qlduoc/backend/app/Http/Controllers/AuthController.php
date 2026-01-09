<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AppUser;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

use App\Models\HealthPost;
use App\Models\UserScope;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required',
        ]);

        $username = trim($request->username);
        $password = trim($request->password);

        // 1. Authenticate against Legacy Database (sqlsrv_user)
        $legacyUser = null;
        try {
            // Using raw SQL for Open Symmetric Key and Decryption
            // Note: DB::connection('sqlsrv_user') must be configured
            $sql = "
                OPEN SYMMETRIC KEY UserTableKey DECRYPTION BY CERTIFICATE EncryptUserCert;
                SELECT TOP 1 MaNV, HoTen, MaDinhdanh, IDCoSo, ID FROM NguoiDung 
                WHERE MaNV = :username 
                AND CONVERT(NVARCHAR(50), DECRYPTBYKEY(MatKhau)) = :password
                COLLATE Latin1_General_CS_AS;
                CLOSE SYMMETRIC KEY UserTableKey;
            ";

            $results = DB::connection('sqlsrv_user')->select($sql, [
                'username' => $username,
                'password' => $password
            ]);

            if (!empty($results)) {
                $legacyUser = $results[0];
            }
        } catch (\Exception $e) {
            // Log error if needed, but fail gracefully to invalid credentials or server error
            return response()->json([
                'message' => 'Lỗi kết nối xác thực: ' . $e->getMessage()
            ], 500);
        }

        if (!$legacyUser) {
            return response()->json([
                'message' => 'Thông tin đăng nhập không chính xác'
            ], 401);
        }

        // 2. Sync to Local MySQL (AppUser)
        // Check if user exists locally
        $user = AppUser::where('Username', $legacyUser->MaNV)->first();

        if (!$user) {
            // Create user if not exists
            $user = AppUser::create([
                'Username' => $legacyUser->MaNV,
                'FullName' => $legacyUser->HoTen,
                'IdentificationCode' => $legacyUser->MaDinhdanh,
                'PasswordHash' => Hash::make($password), // Store hash locally
                'IsSuperAdmin' => false,
                // Add default role assignment here if needed
            ]);
        } else {
            // Update password hash if needed (keep sync)
            if (!Hash::check($password, $user->PasswordHash)) {
                $user->PasswordHash = Hash::make($password);
                $user->save();
            }
            // Update IdentificationCode if changed
            if ($user->IdentificationCode !== $legacyUser->MaDinhdanh) {
                $user->IdentificationCode = $legacyUser->MaDinhdanh;
                $user->save();
            }
        }

        // 3. Sync HealthPost and UserScope
        if (!empty($legacyUser->IDCoSo)) {
            $healthPostCode = $legacyUser->IDCoSo;
            
            // Check if HealthPost exists
            $healthPost = HealthPost::where('Code', $healthPostCode)->first();
            
            if (!$healthPost) {
                // Fetch info from ThongTinBenhVien
                try {
                    $facilityInfo = DB::connection('sqlsrv_user')->select("SELECT TOP 1 * FROM ThongTinBenhVien WHERE IDCoSo = ?", [$healthPostCode]);
                    
                    if (!empty($facilityInfo)) {
                        $info = $facilityInfo[0];
                        $healthPost = HealthPost::create([
                            'Code' => $healthPostCode,
                            'Name' => $info->TenCoSo ?? $info->TenBV ?? 'Cơ sở ' . $healthPostCode,
                            'Address' => $info->DiaChi ?? null,
                            'MedicalCenterId' => 1, // Hardcoded per requirement
                        ]);
                    }
                } catch (\Exception $e) {
                    // Log error fetching facility info
                    // Proceeding without creating HealthPost if failed
                }
            }

            // Assign UserScope
            if ($healthPost) {
                $scope = UserScope::where('UserId', $user->Id)
                                  ->where('HealthPostId', $healthPost->Id)
                                  ->first();
                
                if (!$scope) {
                    UserScope::create([
                        'UserId' => $user->Id,
                        'HealthPostId' => $healthPost->Id,
                        'RoleId' => 1, // Default role
                        'MedicalCenterId' => 1, // Optional: based on HealthPost's MedicalCenterId
                    ]);
                }
            }
        }

        // 4. Create Token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => [
                'Id' => $user->Id,
                'Username' => $user->Username,
                'FullName' => $user->FullName,
                'IsSuperAdmin' => (bool)$user->IsSuperAdmin,
            ],
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
