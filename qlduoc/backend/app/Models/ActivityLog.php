<?php

namespace App\Models;

class ActivityLog extends BaseModel
{
    protected $table = 'ActivityLogs';
    protected $primaryKey = 'Id';
    public $timestamps = false; // We use CreatedAt only

    protected $fillable = [
        'SubjectType',
        'SubjectId',
        'Action',
        'Description',
        'CauserId',
        'Properties',
        'CreatedAt'
    ];

    protected $casts = [
        'Properties' => 'array',
        'CreatedAt' => 'datetime'
    ];

    public function causer()
    {
        return $this->belongsTo(AppUser::class, 'CauserId', 'Id');
    }
}
