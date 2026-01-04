<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LegacySyncController extends Controller
{
    public function getInvoices(Request $request)
    {
        
        $tungay = trim($request->input('tungay', ''));
        $denngay = trim($request->input('denngay', ''));
        $maphieu = trim($request->input('maphieu', ''));
 
        
        $khoCode = $request->input('health_post_code') ?? $request->input('KhoCode'); 
        $local = $request->input('Local');

        if (empty($khoCode)) $khoCode = 'kho_cs0';
        if ($local === null) $local = 'kho_cs0';

        try {
            // 3. Execute Stored Procedure via SQL Server Connection
            // Syntax for PDO/SQL Server usually requires 'EXEC sp_name ?, ?, ...'
            
            // Parameters for: @status, @KhoCode, @Local, @MaToa, @tungay, @denngay
            // Note: MaToa is (maphieu=="") ? null : maphieu
            
            // Determine Mode: Detail (has maphieu) vs List (no maphieu)
            $isDetail = !empty($maphieu);

            $statusParam = 0;
            $params = [
                'status' => $statusParam,
                'khoCode' => $khoCode,
                'local' => $local,
            ];

            if ($isDetail) {
                // Detail Mode: Use @HoaDonID, Dates are NULL
                // Snippet: @HoaDonID = maphieu, @tungay=null, @denngay=null
                $sql = 'EXEC sp_HoaDon_Load_25 @status = :status, @KhoCode = :khoCode, @Local = :local, @HoaDonID = :hoaDonId, @tungay = :tungay, @denngay = :denngay';
                $params['hoaDonId'] = $maphieu;
                $params['tungay'] = null;
                $params['denngay'] = null;
            } else {
                // List Mode: Use @MaToa, Dates from request
                // Snippet: @MaToa = null (if default), @tungay, @denngay
                $sql = 'EXEC sp_HoaDon_Load_25 @status = :status, @KhoCode = :khoCode, @Local = :local, @MaToa = :maToa, @tungay = :tungay, @denngay = :denngay';
                $params['maToa'] = null; // List mode implies maphieu is empty/null for "All"
                $params['tungay'] = $tungay;
                $params['denngay'] = $denngay;
            }

            // Note: DB::select with named bindings :param
            $results = DB::connection('sqlsrv')->select($sql, $params);

            // 4. Return JSON
            if (empty($results)) {
                return response()->json(['KQ' => 'norow']);
            }

            return response()->json($results);

        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
