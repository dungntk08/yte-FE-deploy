export interface Product {
    Id: number;
    Code: string;
    Name: string;
    ProductTypeId: number;
    UnitId?: number;
    Manufacturer?: string;
    CountryOfOrigin?: string;
    PackingRule?: string;
    IsActive?: boolean;

    unit?: {
        Name: string;
    };
    UnitName?: string;

    // Relations (flattened or nested depending on needs, but let's keep it nested for now if backend returns nested)
    // However, frontend often needs flat structure for tables. 
    // Let's add optional fields from relations for ease of use if we map them in service
    medicine?: {
        ActiveIngredientName?: string;
        Content?: string;
        RegistrationNumber?: string;
        PharmacyType?: string;
        PharmacyName?: string;
        ActiveIngredientCode?: string;
        UsageRoute?: string;
        Dosage?: string;
        PharmacyCategory?: string;
        GroupClassification?: string;
        PharmacyGroup?: string;
        ServiceGroupInsurance?: string;
        MaterialCode?: string;
        HealthMinistryDecision?: string;
        Usage?: string;
        PrescriptionUnit?: string;
        ProductCodeDecision130?: string;
        Program?: string;
        FundingSource?: string;
        InsurancePaymentRate?: number;
    };
    bids?: ProductBid[];
    supply?: {
        ModelCode?: string;
        DeclarationNumber?: string;
        SupplyGroup?: string;
        GroupCode?: string;
        GroupName?: string;
        TechnicalStandard?: string;
    };
    vaccine?: {
        TargetDisease?: string;
        StorageCondition?: string;
    };
    chemical?: {
        ReferenceCode?: string;
        ChemicalFormula?: string;
        Concentration?: string;
        RegistrationNumber?: string;
        Standard?: string;
    };

    CreatedAt?: string;
    UpdatedAt?: string;
}

export interface ProductBid {
    Id: number;
    ProductId: number;
    DecisionNumber?: string;
    PackageCode?: string;
    GroupCode?: string;
    BidPrice?: number;
    Quantity?: number;
    RemainingQuantity?: number;
    WinningDate?: string;
    ApprovalOrder?: string;
    InsuranceName?: string;
    ActiveIngredientCode?: string;
    IsPriority?: boolean;
}

export interface ProductResponse {
    data: Product[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}
