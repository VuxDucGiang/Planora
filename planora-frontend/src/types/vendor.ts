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
  primaryCategoryName?: string;
  priceFrom?: number;
  priceTo?: number;
  imageUrl?: string;
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

export interface ReviewResponse {
  id: number;
  customerId?: number;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
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
  primaryCategoryName?: string;
  priceFrom?: number;
  priceTo?: number;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  portfolios: PortfolioResponse[];
  packages: PackageResponse[];
  reviews?: ReviewResponse[];
}

export interface VendorCompareResponse {
  vendors: VendorDetailResponse[];
  totalCompared: number;
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
