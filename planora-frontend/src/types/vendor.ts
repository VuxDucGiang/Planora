export interface VendorResponse {
  id: number;
  businessName: string;
  description: string;
  experienceYears: number;
  city: string;
  district: string;
  verified: boolean;
  ratingAverage: number;
  totalReviews: number;
  styles: string[];
}

export interface PortfolioResponse {
  id: number;
  imageUrl: string;
  title: string;
  description?: string;
}

export interface PackageResponse {
  id: number;
  packageName: string;
  description?: string;
  price: number;
}

export interface VendorDetailResponse {
  id: number;
  businessName: string;
  description: string;
  experienceYears: number;
  city: string;
  district: string;
  verified: boolean;
  ratingAverage: number;
  totalReviews: number;
  styles: string[];
  portfolios: PortfolioResponse[];
  packages: PackageResponse[];
}

export interface VendorMatchResponse {
  id: number;
  vendor: VendorResponse;
  matchingScore: number;
  reason: string;
}

export interface VendorFilters {
  query?: string;
  categoryId?: number;
  city?: string;
  styleId?: number;
  priceFrom?: number;
  priceTo?: number;
  page?: number;
  size?: number;
}
