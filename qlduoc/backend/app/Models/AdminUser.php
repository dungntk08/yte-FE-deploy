<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class AdminUser extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'AdminUsers';
    protected $primaryKey = 'Id';

    protected $fillable = [
        'Username',
        'PasswordHash',
        'FullName',
    ];

    protected $hidden = [
        'PasswordHash',
    ];

    public function getAuthPassword()
    {
        return $this->PasswordHash;
    }
}
