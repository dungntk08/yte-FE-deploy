export interface Warehouse {
    Id: number;
    // Code?: string;
    Name: string;
    Type?: string;
    Department?: string;
    IsPharmacy?: boolean;
    IsActive: boolean;
    HealthPostId: number;
    health_post?: {
        Id: number;
        Name: string;
    };
    CreatedAt?: string;
    UpdatedAt?: string;
}
