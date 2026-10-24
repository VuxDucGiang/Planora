export interface InquiryMessage {
  id: number;
  inquiryId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  message: string;
  createdAt: string;
}

export type InquiryStatus = 'PENDING' | 'RESPONDED' | 'CLOSED';

export interface InquirySummary {
  id: number;
  weddingPlanId?: number;
  customerId: number;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  customerEmail: string;
  vendorId: number;
  vendorName: string;
  vendorAvatar?: string;
  title?: string;
  latestMessage?: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;

  // Wedding plan context
  weddingDate?: string;
  guestCount?: number;
  budget?: number;
  location?: string;
}

export interface InquiryDetail extends InquirySummary {
  messages: InquiryMessage[];
}

export interface CreateInquiryRequest {
  vendorId: number;
  weddingPlanId?: number;
  title?: string;
  message: string;
}

