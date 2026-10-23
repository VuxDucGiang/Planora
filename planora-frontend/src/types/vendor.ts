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
  category?: string;
  priceEst?: string;
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

export interface CollectionImageResponse {
  id: number;
  collectionId: number;
  imageUrl: string;
  title?: string;
  createdAt: string;
}

export interface CollectionResponse {
  id: number;
  vendorId: number;
  title: string;
  description?: string;
  coverImageUrl?: string;
  imagesCount: number;
  images: CollectionImageResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCollectionRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  initialImages?: AddCollectionImageRequest[];
}

export interface UpdateCollectionRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
}

export interface AddCollectionImageRequest {
  imageUrl: string;
  title?: string;
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
  vendorReply?: string;
  repliedAt?: string;
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
  collections?: CollectionResponse[];
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


export interface VendorProfileResponse {
  id: number;
  userId: number;
  email: string;
  businessName: string;
  description?: string;
  experienceYears?: number;
  city?: string;
  district?: string;
  phone?: string;
  avatarUrl?: string;
  verified: boolean;
  ratingAverage: number;
  totalReviews: number;
  styleIds: number[];
  styles: string[];
  portfolios: PortfolioResponse[];
  collections?: CollectionResponse[];
}

export interface UpdateVendorProfileRequest {
  businessName: string;
  description?: string;
  experienceYears?: number;
  city?: string;
  district?: string;
  phone?: string;
  avatarUrl?: string;
  styleIds?: number[];
}

export interface CreatePortfolioRequest {
  imageUrl: string;
  title?: string;
  description?: string;
}

export interface FileUploadResponse {
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
}

export interface VendorServiceDetailResponse {
  id: number;
  vendorId: number;
  categoryId: number;
  categoryName: string;
  serviceName: string;
  description?: string;
  priceFrom?: number;
  priceTo?: number;
  active: boolean;
  packages: PackageResponse[];
}

export interface CreateVendorServiceRequest {
  categoryId: number;
  serviceName: string;
  description?: string;
  priceFrom?: number;
  priceTo?: number;
  active?: boolean;
}

export interface CreatePackageRequest {
  packageName: string;
  description?: string;
  price: number;
}


export interface VendorReviewStatsResponse {
  totalReviews: number;
  ratingAverage: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  reviews: ReviewResponse[];
}

export interface ReplyReviewRequest {
  reply: string;
}

export interface VendorLeadResponse {
  id: number;
  weddingPlanId?: number;
  customerName: string;
  customerAvatar?: string;
  matchingScore: number;
  reason?: string;
  weddingDate?: string;
  guestCount?: number;
  budget?: number;
  location?: string;
}

export interface VendorAnalyticsResponse {
  totalReviews: number;
  ratingAverage: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  totalInquiries: number;
  pendingInquiries: number;
  respondedInquiries: number;
  closedInquiries: number;
  totalShortlists: number;
  activeServicesCount: number;
  totalPackagesCount: number;
  portfolioImagesCount: number;
  potentialLeadsCount: number;
  recentMatchingLeads: VendorLeadResponse[];
}
