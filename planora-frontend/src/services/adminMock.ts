import type { 
  AdminSummaryResponse, 
  AdminFunnelResponse, 
  UserActivityItem,
  UserJourneyResponse 
} from '@/types/admin';

export interface MockUserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  role: string;
  weddingTitle?: string;
  budget?: number;
  guestCount?: number;
  style?: string;
}

// 34 tài khoản cặp đôi người dùng thực tế tại Việt Nam
export const MOCK_34_COUPLES: MockUserProfile[] = [
  { id: 101, fullName: 'Bùi Nguyễn Bảo Châu', email: 'buinguyenbaochau1234@gmail.com', phone: '0901234123', createdAt: '2026-10-15T08:30:00Z', role: 'USER', weddingTitle: 'Lễ Cưới Mùa Thu Minimalist', budget: 180000000, guestCount: 250, style: 'Minimalist' },
  { id: 102, fullName: 'Nguyễn Khánh Ly', email: 'khly26974@gmail.com', phone: '0902345671', createdAt: '2026-10-15T09:12:00Z', role: 'USER', weddingTitle: 'Đám Cưới Vườn Thơ Romantic', budget: 220000000, guestCount: 200, style: 'Romantic Garden' },
  { id: 103, fullName: 'Nguyễn Vân Anh', email: 'anhnguyen.081297@gmail.com', phone: '0903456782', createdAt: '2026-10-16T10:00:00Z', role: 'USER', weddingTitle: 'Rustic Pine Sunset', budget: 250000000, guestCount: 180, style: 'Rustic' },
  { id: 104, fullName: 'Bùi Tuấn Anh', email: 'buia81523@gmail.com', phone: '0904567893', createdAt: '2026-10-16T14:20:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Sang Trọng Hoàng Gia', budget: 350000000, guestCount: 300, style: 'Classic Luxury' },
  { id: 105, fullName: 'Lê Sa Cát Ly', email: 'sacalycolau1997@gmail.com', phone: '0905678904', createdAt: '2026-10-17T11:45:00Z', role: 'USER', weddingTitle: 'Hôn Lễ Ấm Cúng Bên Bờ Biển', budget: 160000000, guestCount: 120, style: 'Beachside Modern' },
  { id: 106, fullName: 'Trần Thu Hà', email: 'karotdongthung@gmail.com', phone: '0906789015', createdAt: '2026-10-17T16:10:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Phong Cách Boho Chic', budget: 190000000, guestCount: 150, style: 'Bohemian' },
  { id: 107, fullName: 'Dương Thu Hương', email: 'duongthuhuong554@gmail.com', phone: '0907890126', createdAt: '2026-10-18T08:15:00Z', role: 'USER', weddingTitle: 'Lễ Vu Quy & Tiệc Truyền Thống', budget: 210000000, guestCount: 320, style: 'Traditional Elegance' },
  { id: 108, fullName: 'Đào Mai Anh', email: 'adaomai1447@gmail.com', phone: '0908901237', createdAt: '2026-10-18T13:40:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Dạ Yến Ánh Nến', budget: 280000000, guestCount: 220, style: 'Intimate Candlelight' },
  { id: 109, fullName: 'Lê Thu Thảo', email: 'thuwthao@gmail.com', phone: '0909012348', createdAt: '2026-10-19T09:25:00Z', role: 'USER', weddingTitle: 'Đám Cưới Nhà Kính Glasshouse', budget: 310000000, guestCount: 180, style: 'Botanical Glasshouse' },
  { id: 110, fullName: 'Châu Phương Thảo', email: 'chauthao1003@gmail.com', phone: '0910123459', createdAt: '2026-10-19T15:50:00Z', role: 'USER', weddingTitle: 'Hôn Lễ Phong Cách Indochine', budget: 260000000, guestCount: 240, style: 'Indochine Heritage' },
  { id: 111, fullName: 'Nguyễn Nam An', email: 'namian2803@gmail.com', phone: '0911234560', createdAt: '2026-10-20T10:10:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Đồi Thông Đà Lạt', budget: 240000000, guestCount: 160, style: 'Outdoor Forest' },
  { id: 112, fullName: 'Đặng Nguyên Bách', email: 'dangnguyenbach3171996@gmail.com', phone: '0912345671', createdAt: '2026-10-20T14:35:00Z', role: 'USER', weddingTitle: 'Kế Hoạch Cưới Vintage Hoài Niệm', budget: 200000000, guestCount: 280, style: 'Vintage Classic' },
  { id: 113, fullName: 'Trần Tuấn An', email: 'swat.an1997@gmail.com', phone: '0913456782', createdAt: '2026-10-21T08:50:00Z', role: 'USER', weddingTitle: 'Lễ Cưới Sân Golf Hiện Đại', budget: 400000000, guestCount: 350, style: 'Contemporary Luxury' },
  { id: 114, fullName: 'Đoàn Vân Anh', email: 'dvananh1901@gmail.com', phone: '0914567893', createdAt: '2026-10-21T11:30:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Pastel Mộng Mơ', budget: 175000000, guestCount: 190, style: 'Sweet Pastel' },
  { id: 115, fullName: 'Đinh Dương Thanh Hằng', email: 'dinhduongthanhhang@gmail.com', phone: '0915678904', createdAt: '2026-10-22T09:05:00Z', role: 'USER', weddingTitle: 'Dạ Tiệc Ánh Sao Starry Night', budget: 320000000, guestCount: 260, style: 'Starry Glamour' },
  { id: 116, fullName: 'Nguyễn Thùy Khanh (Wendy)', email: 'wendytk830@gmail.com', phone: '0916789015', createdAt: '2026-10-22T15:20:00Z', role: 'USER', weddingTitle: 'Lễ Cưới Mùa Xuân Hoa Tươi', budget: 230000000, guestCount: 210, style: 'Spring Floral' },
  { id: 117, fullName: 'Đinh Tấn Khoa', email: 'dinhtankhoa1997@gmail.com', phone: '0917890126', createdAt: '2026-10-23T07:45:00Z', role: 'USER', weddingTitle: 'Lễ Thành Hôn Grand Ballroom', budget: 300000000, guestCount: 400, style: 'Grand Ballroom' },
  { id: 118, fullName: 'Phạm Thanh Nga', email: 'thanhngamark@gmail.com', phone: '0918901237', createdAt: '2026-10-23T12:15:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Bến Du Thuyền Marina', budget: 450000000, guestCount: 150, style: 'Yacht Waterfront' },
  { id: 119, fullName: 'Nguyễn Song Khánh', email: 'skhanhnguyen123@gmail.com', phone: '0919012348', createdAt: '2026-10-24T08:40:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Rustic Châu Âu', budget: 210000000, guestCount: 170, style: 'European Rustic' },
  { id: 120, fullName: 'Vũ Hồng Ngọc (Daisy)', email: 'daisypink1412@gmail.com', phone: '0920123459', createdAt: '2026-10-24T16:00:00Z', role: 'USER', weddingTitle: 'Hôn Lễ Vườn Địa Đàng Eden', budget: 270000000, guestCount: 230, style: 'Romantic Garden' },
  { id: 121, fullName: 'Đoàn Quốc Huy', email: 'huydoan22596@gmail.com', phone: '0921234560', createdAt: '2026-10-25T10:30:00Z', role: 'USER', weddingTitle: 'Lễ Sunset Garden Resort', budget: 310000000, guestCount: 200, style: 'Sunset Garden' },
  { id: 122, fullName: 'Võ Nam Khánh', email: 'khanhhehe123@gmail.com', phone: '0922345671', createdAt: '2026-10-25T14:15:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Tối Giản Ấm Cúng', budget: 150000000, guestCount: 130, style: 'Minimalist' },
  { id: 123, fullName: 'Đỗ Khánh Quốc', email: 'dokhanhquoc@dtu.edu.vn', phone: '0925678904', createdAt: '2026-10-26T09:10:00Z', role: 'USER', weddingTitle: 'Hôn Lễ Hiện Đại Tại Khách Sạn 5 Sao', budget: 360000000, guestCount: 300, style: 'Modern Luxury' },
  { id: 124, fullName: 'Đỗ Ngọc Tấn Dũng', email: 'dongoctandung240127@gmail.com', phone: '0926789015', createdAt: '2026-10-26T13:45:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Thảo Cầm Viên Xanh', budget: 240000000, guestCount: 190, style: 'Botanical Garden' },
  { id: 125, fullName: 'Nguyễn Ánh Hồng', email: 'hong0934900134@gmail.com', phone: '0934900134', createdAt: '2026-10-27T08:20:00Z', role: 'USER', weddingTitle: 'Lễ Cưới Hồ Bơi Rooftop', budget: 290000000, guestCount: 160, style: 'Rooftop Poolside' },
  { id: 126, fullName: 'Đỗ Nguyên Khang', email: 'donguyen5757@gmail.com', phone: '0928901237', createdAt: '2026-10-27T15:00:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Phong Cách Retro 90s', budget: 180000000, guestCount: 220, style: 'Retro Nostalgia' },
  { id: 127, fullName: 'Đỗ Trần Yến Nhi', email: 'dotranyennhi289@gmail.com', phone: '0929012348', createdAt: '2026-10-28T09:30:00Z', role: 'USER', weddingTitle: 'Hôn Lễ Lãng Mạn Đà Lạt', budget: 260000000, guestCount: 180, style: 'Romantic Garden' },
  { id: 128, fullName: 'Lý Hồng Sơn', email: 'sonly11061998@gmail.com', phone: '0930123459', createdAt: '2026-10-28T14:10:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Bán Nguyệt Hồ Tây', budget: 200000000, guestCount: 220, style: 'Lakeside Scenic' },
  { id: 129, fullName: 'Trần Nhật Minh (Haku)', email: 'haku08021996@gmail.com', phone: '0931234560', createdAt: '2026-10-29T10:25:00Z', role: 'USER', weddingTitle: 'Dạ Tiệc Ánh Sao Romantic Glow', budget: 350000000, guestCount: 260, style: 'Romantic Glow' },
  { id: 130, fullName: 'Huỳnh Thủy Triều', email: 'hntuuytrieu18@gmail.com', phone: '0932345671', createdAt: '2026-10-29T16:40:00Z', role: 'USER', weddingTitle: 'Hôn Lễ Biển Mỹ Khê Đà Nẵng', budget: 220000000, guestCount: 150, style: 'Beachside Modern' },
  { id: 131, fullName: 'Thái Thục Quyên', email: 'thxcquyen@gmail.com', phone: '0933456782', createdAt: '2026-10-30T08:50:00Z', role: 'USER', weddingTitle: 'Lễ Cưới Sân Vườn Nghệ Thuật', budget: 250000000, guestCount: 210, style: 'Artistic Garden' },
  { id: 132, fullName: 'Hồ Hồng Nhiên', email: 'hohongnhien.08@gmail.com', phone: '0934567893', createdAt: '2026-10-30T13:15:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Tinh Khôi All White', budget: 280000000, guestCount: 240, style: 'All White Elegance' },
  { id: 133, fullName: 'Trịnh Anh Thi', email: 'anhthi8396@gmail.com', phone: '0935678904', createdAt: '2026-10-31T09:00:00Z', role: 'USER', weddingTitle: 'Tiệc Cưới Ngoại Ô Thanh Bình', budget: 190000000, guestCount: 170, style: 'Rustic Countryside' },
  { id: 134, fullName: 'Huỳnh Thanh Trúc', email: 'truc.huynh200183@vnuk.edu.vn', phone: '0939012348', createdAt: '2026-10-31T14:30:00Z', role: 'USER', weddingTitle: 'Lễ Thành Hôn Mùa Đông Ấm Áp', budget: 230000000, guestCount: 200, style: 'Warm Winter' },
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface AdminMockDashboardData {
  summary: AdminSummaryResponse;
  funnel: AdminFunnelResponse;
  activities: UserActivityItem[];
}

/**
 * Sinh dữ liệu mock cho Dashboard quản trị theo yêu cầu:
 * - Khoảng 34 tài khoản đã tạo (Couples)
 * - 0 Vendor đăng ký (chưa có vendor)
 * - Phễu chuyển đổi với các số liệu ngẫu nhiên phù hợp với quy mô ~34 tài khoản
 */
export function generateAdminDashboardMockData(fixedTotalUsers = 34): AdminMockDashboardData {
  const registeredUsers = fixedTotalUsers; // Đúng ~34 tài khoản
  const totalCouples = registeredUsers;
  const totalVendors = 0; // Chưa có vendor đăng ký
  const totalUsers = totalCouples + totalVendors;

  // Phễu hành vi chuyển đổi giảm dần hợp lý theo quy mô 34 tài khoản:
  // 1. Đăng ký tài khoản: 34 (100%)
  // 2. Hoàn thành Onboarding: 25 - 28 (khoảng 73% - 82%)
  const onboardingCompleted = getRandomInt(25, 28);
  
  // 3. Tạo kế hoạch cưới AI: 19 - 22 (khoảng 55% - 65%)
  const planGenerated = getRandomInt(19, 22);

  // 4. Xem hồ sơ nhà cung cấp: 13 - 17 (khoảng 38% - 50%)
  const vendorViewed = getRandomInt(13, 17);

  // 5. Gửi yêu cầu tư vấn / báo giá: 5 - 8 (khoảng 15% - 24%)
  const inquirySent = getRandomInt(5, 8);

  // KPI phụ trợ:
  // - Hoạt động trong 24h (DAU): khoảng 8 - 12 tài khoản
  const dailyActiveUsers = getRandomInt(8, 12);

  // - Tổng số kế hoạch đã tạo: một số cặp đôi có thể bấm tạo lại 1-2 lần
  const totalPlansGenerated = planGenerated + getRandomInt(1, 3);

  // - Tổng số inquiry đã gửi
  const totalInquiriesSent = inquirySent;

  // - Tỷ lệ chuyển đổi tạo Plan: (planGenerated / registeredUsers) * 100
  const planConversionRate = Math.round((planGenerated / registeredUsers) * 1000) / 10;

  const summary: AdminSummaryResponse = {
    totalUsers,
    totalCouples,
    totalVendors,
    dailyActiveUsers,
    totalPlansGenerated,
    totalInquiriesSent,
    planConversionRate,
  };

  const funnel: AdminFunnelResponse = {
    registeredUsers,
    onboardingCompleted,
    planGenerated,
    vendorViewed,
    inquirySent,
  };

  // Tạo danh sách 10-12 hoạt động Live Stream thời gian thực gần đây
  const now = Date.now();
  const mockActivityTemplates: Array<{
    action: string;
    entityType: string;
    getMetadata: (user: MockUserProfile) => Record<string, unknown>;
  }> = [
    {
      action: 'SEND_INQUIRY',
      entityType: 'INQUIRY',
      getMetadata: (u) => ({
        category: 'Trung tâm Tiệc cưới & Hội nghị',
        vendorName: 'White Palace Convention Center',
        budgetEstimated: u.budget ? u.budget * 0.45 : 90000000,
        guestCount: u.guestCount || 200
      })
    },
    {
      action: 'GENERATE_PLAN',
      entityType: 'PLAN',
      getMetadata: (u) => ({
        title: u.weddingTitle || 'Kế hoạch cưới AI',
        budget: u.budget || 200000000,
        style: u.style || 'Minimalist',
        aiLatencyMs: getRandomInt(1400, 2600),
        engine: 'Gemini 2.5 Flash'
      })
    },
    {
      action: 'VIEW_VENDOR',
      entityType: 'VENDOR',
      getMetadata: () => ({
        category: 'Váy Cưới & Trang Điểm Cô Dâu',
        city: 'TP. Hồ Chí Minh',
        source: 'ai_recommendation',
        matchScore: '96%'
      })
    },
    {
      action: 'SAVE_PLAN',
      entityType: 'PLAN',
      getMetadata: (u) => ({
        planTitle: u.weddingTitle || 'Kế hoạch Cưới Tuyệt Tác',
        itemsCount: getRandomInt(12, 18),
        totalEstimated: u.budget || 220000000
      })
    },
    {
      action: 'ONBOARDING_COMPLETED',
      entityType: 'USER',
      getMetadata: (u) => ({
        selectedStyle: u.style || 'Rustic',
        targetDate: '2026-11-20',
        guests: u.guestCount || 200
      })
    },
    {
      action: 'LOGIN',
      entityType: 'USER',
      getMetadata: () => ({
        device: 'Mobile Safari / iOS',
        ip: '113.185.' + getRandomInt(10, 99) + '.' + getRandomInt(10, 250),
        method: 'GOOGLE_OAUTH'
      })
    },
    {
      action: 'REGISTER',
      entityType: 'USER',
      getMetadata: () => ({
        role: 'USER',
        channel: 'Tự nhiên / Organic Search',
        device: 'Chrome / Windows'
      })
    }
  ];

  // Trộn và lấy ngẫu nhiên các người dùng trong 34 tài khoản
  const shuffledUsers = [...MOCK_34_COUPLES].sort(() => Math.random() - 0.5);
  const activities: UserActivityItem[] = [];

  // Mốc thời gian lùi dần từ 4 phút trước đến 36 giờ trước
  const minuteOffsets = [4, 15, 32, 58, 95, 140, 230, 380, 520, 840, 1200, 1680];

  for (let i = 0; i < Math.min(minuteOffsets.length, shuffledUsers.length); i++) {
    const user = shuffledUsers[i];
    const template = mockActivityTemplates[i % mockActivityTemplates.length];
    const actTime = new Date(now - minuteOffsets[i] * 60 * 1000).toISOString();

    activities.push({
      id: 2000 + i + 1,
      userId: user.id,
      userFullName: user.fullName,
      userEmail: user.email,
      action: template.action,
      entityType: template.entityType,
      entityId: String(getRandomInt(1, 10)),
      metadata: template.getMetadata(user),
      createdAt: actTime,
    });
  }

  return {
    summary,
    funnel,
    activities,
  };
}

/**
 * Trả về hành trình người dùng chi tiết khi admin bấm vào "Chi tiết" ở bất kỳ tài khoản nào
 */
export function getMockUserJourney(userId: number): UserJourneyResponse {
  const user = MOCK_34_COUPLES.find((u) => u.id === userId) || {
    id: userId,
    fullName: `Cặp đôi (#${userId})`,
    email: `couple_${userId}@planora.vn`,
    phone: '0901234567',
    role: 'USER',
    createdAt: '2026-10-20T08:00:00Z',
    weddingTitle: 'Kế Hoạch Cưới Hạnh Phúc',
    budget: 200000000,
    guestCount: 200,
    style: 'Modern Minimalist',
  };

  const now = Date.now();
  const activities: UserActivityItem[] = [
    {
      id: 9001,
      userId: user.id,
      userFullName: user.fullName,
      userEmail: user.email,
      action: 'REGISTER',
      entityType: 'USER',
      entityId: String(user.id),
      metadata: { provider: 'LOCAL', role: 'USER' },
      createdAt: new Date(now - 48 * 3600 * 1000).toISOString(),
    },
    {
      id: 9002,
      userId: user.id,
      userFullName: user.fullName,
      userEmail: user.email,
      action: 'ONBOARDING_COMPLETED',
      entityType: 'USER',
      entityId: String(user.id),
      metadata: { targetBudget: user.budget || 200000000, style: user.style || 'Minimalist' },
      createdAt: new Date(now - 47 * 3600 * 1000).toISOString(),
    },
    {
      id: 9003,
      userId: user.id,
      userFullName: user.fullName,
      userEmail: user.email,
      action: 'GENERATE_PLAN',
      entityType: 'PLAN',
      entityId: '1',
      metadata: {
        title: user.weddingTitle || 'Kế hoạch cưới AI',
        budget: user.budget || 200000000,
        guestCount: user.guestCount || 200,
      },
      createdAt: new Date(now - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 9004,
      userId: user.id,
      userFullName: user.fullName,
      userEmail: user.email,
      action: 'VIEW_VENDOR',
      entityType: 'VENDOR',
      entityId: '2',
      metadata: { category: 'Nhiếp ảnh & Phóng sự cưới' },
      createdAt: new Date(now - 5 * 3600 * 1000).toISOString(),
    },
    {
      id: 9005,
      userId: user.id,
      userFullName: user.fullName,
      userEmail: user.email,
      action: 'SEND_INQUIRY',
      entityType: 'INQUIRY',
      entityId: '1',
      metadata: { vendorId: 2, estimatedBudget: 40000000 },
      createdAt: new Date(now - 2 * 3600 * 1000).toISOString(),
    },
  ];

  return {
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    activities,
  };
}

