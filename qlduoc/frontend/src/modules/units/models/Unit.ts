export interface Unit {
    id?: string;
    account_id?: string | null;
    name: string;
    code: string;
    base_unit_id?: string | null;
    conversion_factor: number;
    is_base_unit: boolean;
    description?: string | null;
    active: boolean;
    created_at?: string;
    updated_at?: string;

    // Relationships
    baseUnit?: Unit;
    derivedUnits?: Unit[];
}
