import type { 
  WeddingStyle, 
  ServiceCategory, 
  OnboardingRequest, 
  ActivePlanResponse,
  BudgetItemSummary,
  ChecklistTaskSummary,
  TimelineEventSummary,
  ConceptSummary
} from '@/types/weddingPlan';

export function formatVND(amount: number): string {
  return (amount || 0).toLocaleString('vi-VN');
}

export interface LiveInsights {
  estimatedTables: number;
  costPerGuest: number;
  estimatedTableCost: number;
  venueBudget: number;
  contingencyReserve: number;
  tierName: string;
  tierBadge: string;
  priorityCount: number;
  tables: number;
  costPerTable: number;
  banquetEstimated: number;
  contingencyFund: number;
  venueTier: string;
}

export function calculateLiveInsights(
  guestCountOrBudget: number, 
  budgetOrGuestCount?: number, 
  selectedCategoryIds: number[] = [], 
  availableCategories: ServiceCategory[] = []
): LiveInsights {
  let budget = 200000000;
  let guests = 100;

  if (budgetOrGuestCount !== undefined) {
    if (guestCountOrBudget > 1000000) {
      budget = guestCountOrBudget;
      guests = budgetOrGuestCount;
    } else {
      guests = guestCountOrBudget;
      budget = budgetOrGuestCount;
    }
  } else {
    if (guestCountOrBudget > 1000000) {
      budget = guestCountOrBudget;
    } else {
      guests = guestCountOrBudget;
    }
  }

  const safeBudget = Math.max(10000000, budget || 200000000);
  const safeGuests = Math.max(10, guests || 100);

  const estimatedTables = Math.ceil(safeGuests / 10) + 1; // +1 bàn dự phòng
  const costPerGuest = Math.round(safeBudget / safeGuests);
  const venueBudget = Math.round(safeBudget * 0.45);
  const estimatedTableCost = Math.round(venueBudget / estimatedTables);
  const contingencyReserve = Math.round(safeBudget * 0.04);

  let tierName = 'Nhà hàng tiệc cưới tiêu chuẩn ấm cúng';
  let tierBadge = 'Standard Elegance';
  if (estimatedTableCost >= 8000000) {
    tierName = 'Khách sạn / Resort 5 sao cao cấp';
    tierBadge = 'Luxury Ballroom';
  } else if (estimatedTableCost >= 5000000) {
    tierName = 'Trung tâm tiệc cưới 4 sao sang trọng';
    tierBadge = 'Premium Boutique';
  } else if (estimatedTableCost < 3500000) {
    tierName = 'Tiệc cưới gia đình ấm cúng & tiết kiệm';
    tierBadge = 'Cozy Minimalist';
  }

  return {
    estimatedTables,
    costPerGuest,
    estimatedTableCost,
    venueBudget,
    contingencyReserve,
    tierName,
    tierBadge,
    priorityCount: selectedCategoryIds.length,
    tables: estimatedTables,
    costPerTable: estimatedTableCost,
    banquetEstimated: venueBudget,
    contingencyFund: contingencyReserve,
    venueTier: tierName
  };
}

export interface SmartBlueprintConfig {
  totalBudget?: number;
  budget?: number;
  guestCount?: number;
  weddingDate?: string;
  location?: string;
  priorityCategoryIds?: number[];
  selectedStyles?: WeddingStyle[];
  styleIds?: number[];
  title?: string;
}

export function generateSmartBlueprint(
  requestOrConfig: OnboardingRequest | SmartBlueprintConfig,
  availableStyles: WeddingStyle[] = [],
  availableCategories: ServiceCategory[] = []
): ActivePlanResponse {
  const totalBudget = ('budget' in requestOrConfig && requestOrConfig.budget) 
    ? requestOrConfig.budget 
    : ('totalBudget' in requestOrConfig && requestOrConfig.totalBudget)
    ? requestOrConfig.totalBudget
    : 200000000;
  const guests = requestOrConfig.guestCount || 100;
  const weddingDateStr = requestOrConfig.weddingDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0];
  const priorityCategoryIds = requestOrConfig.priorityCategoryIds || [];
  
  const allStyles = availableStyles.length > 0 
    ? availableStyles 
    : ('selectedStyles' in requestOrConfig && requestOrConfig.selectedStyles) 
    ? (requestOrConfig.selectedStyles as WeddingStyle[])
    : [];

  const insights = calculateLiveInsights(totalBudget, guests, priorityCategoryIds, availableCategories);

  // Selected Category keywords
  const priorityCategoryNames = availableCategories
    .filter(c => priorityCategoryIds.includes(c.id))
    .map(c => c.name.toLowerCase());

  // 10 Vietnamese Wedding Budget Categories
  interface AllocationCategory {
    name: string;
    baseWeight: number;
    matchKeyword: string;
    description: string;
  }

  const rawCategories: AllocationCategory[] = [
    { name: 'Venue & Catering (Bàn tiệc & Sảnh cưới)', baseWeight: 0.45, matchKeyword: 'venue', description: `Dự kiến ~${formatVND(insights.estimatedTableCost)} ₫/bàn (${insights.estimatedTables} bàn gồm 1 bàn dự phòng)` },
    { name: 'Trang trí tiệc cưới & Hoa tươi', baseWeight: 0.12, matchKeyword: 'decor', description: 'Cổng hoa, bàn gallery đón khách, lối đi sân khấu & hoa tươi bàn tiệc' },
    { name: 'Chụp ảnh cưới & Phóng sự cưới', baseWeight: 0.10, matchKeyword: 'photo', description: 'Album Pre-wedding ngoại cảnh + 2 thợ chụp & 1 thợ quay phóng sự ngày cưới' },
    { name: 'Trang phục cưới (Váy tiệc, Áo dài & Vest)', baseWeight: 0.08, matchKeyword: 'dress', description: '2 váy cưới chính, 2 áo dài lễ gia tiên & 1 bộ vest chú rể may đo' },
    { name: 'Nghi lễ Gia tiên, Tráp ăn hỏi & Xe hoa', baseWeight: 0.06, matchKeyword: 'ceremony', description: 'Mâm quả tráp lễ truyền thống 5-7 tráp, xe hoa mui trần & xe 16 chỗ gia đình' },
    { name: 'Nhẫn cưới & Trang sức cưới hồi môn', baseWeight: 0.05, matchKeyword: 'jewelry', description: 'Cặp nhẫn cưới kim cương/vàng 18k trao tay và tiền công chế tác trang sức' },
    { name: 'Trang điểm cô dâu & Mẹ hai bên (Makeup)', baseWeight: 0.04, matchKeyword: 'makeup', description: 'Makeup cô dâu lễ sáng + dặm tiệc tối + makeup làm tóc cho 2 mẹ' },
    { name: 'Âm thanh ánh sáng, MC & Ban nhạc', baseWeight: 0.04, matchKeyword: 'entertainment', description: 'MC song ngữ/chuyên nghiệp, hệ thống âm thanh ánh sáng & hòa tấu đón khách' },
    { name: 'Thiệp cưới in ấn & Quà cảm ơn quan khách', baseWeight: 0.02, matchKeyword: 'invitation', description: 'Thiệp cưới mỹ thuật dập nổi + thiệp online kèm quà lưu niệm nhỏ cho khách' },
    { name: 'Quỹ dự phòng an toàn phát sinh', baseWeight: 0.04, matchKeyword: 'contingency', description: 'Quỹ dự phòng 4% phòng ngừa phát sinh bàn tiệc khẩn cấp hoặc chi phí nhỏ' }
  ];

  // Calculate adjusted weights based on user priority selections
  let adjustedWeights = rawCategories.map(cat => {
    const isPriority = priorityCategoryNames.some(p => cat.name.toLowerCase().includes(p) || cat.matchKeyword.includes(p));
    return {
      ...cat,
      isPriority,
      weight: cat.baseWeight + (isPriority ? 0.03 : 0)
    };
  });

  const sumW = adjustedWeights.reduce((sum, c) => sum + c.weight, 0);
  const budgetItems: BudgetItemSummary[] = adjustedWeights.map(cat => {
    const normWeight = cat.weight / sumW;
    const estimatedCost = Math.round(totalBudget * normWeight);
    return {
      categoryName: cat.name,
      estimatedCost,
      actualCost: 0,
      percentage: Math.round(normWeight * 1000) / 10,
      isPriority: cat.isPriority,
      note: cat.isPriority ? `⭐ Hạng mục ưu tiên (+25% định mức chất lượng cao) — ${cat.description}` : cat.description
    };
  });

  // Calculate Tasks with non-negative relative dates
  const today = new Date();
  const weddingDateObj = new Date(weddingDateStr || Date.now() + 180 * 86400000);
  const diffDays = Math.max(30, Math.ceil((weddingDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  function addDays(ratio: number): string {
    const target = new Date(today.getTime() + Math.max(1, Math.round(diffDays * ratio)) * 86400000);
    return target.toISOString().split('T')[0];
  }

  const checklistTasks: ChecklistTaskSummary[] = [
    // Phase 1
    { id: 1, title: 'Thống nhất tổng ngân sách & Danh sách khách sơ bộ', description: 'Họp gia đình 2 bên chốt ngân sách và danh sách khách mời dự kiến.', dueDate: addDays(0.05), priority: 'HIGH', status: 'DONE', phase: 'Giai đoạn 1: Nền Tảng' },
    { id: 2, title: 'Khảo sát và đặt cọc Trung tâm tiệc cưới (Venue)', description: 'Tham quan sảnh tiệc, chốt ngày giờ và ký hợp đồng giữ sảnh trước khi hết chỗ.', dueDate: addDays(0.12), priority: 'HIGH', status: 'IN_PROGRESS', phase: 'Giai đoạn 1: Nền Tảng' },
    { id: 3, title: 'Xem ngày giờ hoàng đạo cho Lễ Dạm Ngõ & Lễ Ăn Hỏi', description: 'Tham khảo ngày lành tháng tốt cùng phụ mẫu để chuẩn bị các nghi lễ cổ truyền.', dueDate: addDays(0.18), priority: 'MEDIUM', status: 'TODO', phase: 'Giai đoạn 1: Nền Tảng' },
    // Phase 2
    { id: 4, title: 'Chọn Studio & Chụp ảnh cưới Pre-wedding', description: 'Chụp album ảnh cưới để kịp hoàn thiện ảnh cổng và video phóng sự chiếu sảnh.', dueDate: addDays(0.25), priority: 'HIGH', status: 'TODO', phase: 'Giai đoạn 2: Định Hình Ekip' },
    { id: 5, title: 'Đặt lịch Chuyên gia Makeup Artist cho Cô Dâu & 2 Mẹ', description: 'Thử phong cách trang điểm cô dâu và đặt lịch cho cả lễ gia tiên sáng và tiệc tối.', dueDate: addDays(0.30), priority: 'HIGH', status: 'TODO', phase: 'Giai đoạn 2: Định Hình Ekip' },
    { id: 6, title: 'Chọn đơn vị thiết kế Concept Trang trí tiệc (Decor & Floral)', description: 'Thống nhất phong cách hoa tươi, bàn gallery, cổng hoa vòm và lối đi sân khấu.', dueDate: addDays(0.38), priority: 'MEDIUM', status: 'TODO', phase: 'Giai đoạn 2: Định Hình Ekip' },
    { id: 7, title: 'Thử và đặt thuê/may Váy cưới chính, Áo dài & Vest', description: 'Chọn trang phục cưới tôn dáng, sang trọng và hài hoà với concept ngày cưới.', dueDate: addDays(0.44), priority: 'MEDIUM', status: 'TODO', phase: 'Giai đoạn 2: Định Hình Ekip' },
    // Phase 3
    { id: 8, title: 'Đặt Mâm quả ăn hỏi (Tráp lễ 5-7-9 tráp) & Đội bê tráp', description: 'Chuẩn bị lễ vật chu đáo theo phong tục truyền thống và đồng phục bưng quả nam nữ.', dueDate: addDays(0.50), priority: 'HIGH', status: 'TODO', phase: 'Giai đoạn 3: Nghi Lễ Cổ Truyền' },
    { id: 9, title: 'Chọn và mua Nhẫn cưới & Bộ trang sức hồi môn', description: 'Chọn cặp nhẫn cưới trao tay ý nghĩa và hoàn tất trang sức vàng cưới trao lễ gia tiên.', dueDate: addDays(0.56), priority: 'HIGH', status: 'TODO', phase: 'Giai đoạn 3: Nghi Lễ Cổ Truyền' },
    { id: 10, title: 'Chốt danh sách khách mời chi tiết và phân loại sơ đồ bàn', description: 'Phân loại khách họ hàng, bạn bè, đồng nghiệp để phân chia vị trí ngồi thuận tiện.', dueDate: addDays(0.62), priority: 'MEDIUM', status: 'TODO', phase: 'Giai đoạn 3: Nghi Lễ Cổ Truyền' },
    { id: 11, title: 'Thiết kế, in ấn Thiệp cưới giấy & Tạo Thiệp cưới Online', description: 'In thiệp chỉn chu và kích hoạt trang web thiệp cưới số gửi bạn bè phương xa.', dueDate: addDays(0.68), priority: 'MEDIUM', status: 'TODO', phase: 'Giai đoạn 3: Nghi Lễ Cổ Truyền' },
    // Phase 4
    { id: 12, title: 'Gửi thiệp mời tới quan khách và khảo sát xác nhận (RSVP)', description: 'Gửi thiệp trước ít nhất 3-4 tuần để khách sắp xếp lịch và chốt số bàn chuẩn xác.', dueDate: addDays(0.74), priority: 'HIGH', status: 'TODO', phase: 'Giai đoạn 4: Nước Rút' },
    { id: 13, title: 'Thử món & Chốt thực đơn tiệc cưới chính thức với nhà hàng', description: 'Nếm thử thực đơn, điều chỉnh khẩu vị và chốt gói đồ uống bia rượu tiệc chiêu đãi.', dueDate: addDays(0.78), priority: 'HIGH', status: 'TODO', phase: 'Giai đoạn 4: Nước Rút' },
    { id: 14, title: 'Đặt xe hoa đón dâu & Xe đưa đón họ hàng hai bên', description: 'Xác nhận tuyến đường di chuyển, thời gian đón dâu và tài xế đưa rước đoàn gia đình.', dueDate: addDays(0.82), priority: 'MEDIUM', status: 'TODO', phase: 'Giai đoạn 4: Nước Rút' },
    { id: 15, title: 'Thống nhất kịch bản MC, âm thanh ánh sáng & bài hát nghi lễ', description: 'Duyệt kịch bản tuyên bố lý do, video phóng sự, cắt bánh, rót rượu và bài hát First Dance.', dueDate: addDays(0.85), priority: 'MEDIUM', status: 'TODO', phase: 'Giai đoạn 4: Nước Rút' },
    // Phase 5
    { id: 16, title: 'Thử váy cưới & vest lần cuối sau khi chỉnh sửa số đo', description: 'Đảm bảo trang phục vừa vặn hoàn hảo, thoải mái di chuyển trong suốt ngày cưới.', dueDate: addDays(0.90), priority: 'HIGH', status: 'TODO', phase: 'Giai đoạn 5: Tuần Lễ Đám Cưới' },
    { id: 17, title: 'Chuẩn bị phong bao lì xì trao duyên đội bê tráp & tiền tip ekip', description: 'Đổi tiền mới cho phong bao lì xì duyên và chuẩn bị quỹ chi tiêu nhanh trong ngày.', dueDate: addDays(0.94), priority: 'MEDIUM', status: 'TODO', phase: 'Giai đoạn 5: Tuần Lễ Đám Cưới' },
    { id: 18, title: 'Họp điều phối người nhà quản lý tiệc, thùng tiền mừng & đón khách', description: 'Phân rõ trách nhiệm người đón khách, người giữ thùng mừng cưới và người kiểm đếm số bàn.', dueDate: addDays(0.97), priority: 'HIGH', status: 'TODO', phase: 'Giai đoạn 5: Tuần Lễ Đám Cưới' },
    // Phase 6
    { id: 19, title: 'Kiểm tra hoa tươi cầm tay, hoa cài áo và sính lễ xuất phát', description: 'Nhận hoa tươi sáng sớm và kiểm tra đầy đủ nhẫn cưới, lễ vật trước giờ khởi hành.', dueDate: weddingDateStr, priority: 'HIGH', status: 'TODO', phase: 'Giai đoạn 6: D-Day & Hậu Kỳ' },
    { id: 20, title: 'Thanh toán các khoản chi phí còn lại & Gửi thư cảm ơn quan khách', description: 'Quyết toán hợp đồng sảnh tiệc, cảm ơn đội ngũ hỗ trợ và đăng lời tri ân sau tiệc.', dueDate: addDays(1.02), priority: 'MEDIUM', status: 'TODO', phase: 'Giai đoạn 6: D-Day & Hậu Kỳ' }
  ];

  // Timeline Events (Sáng Lễ Gia Tiên + Tối Tiệc Cưới)
  const timelineEvents: TimelineEventSummary[] = [
    { id: 1, title: 'Trang điểm & Làm tóc cô dâu tại tư gia', description: 'Ekip Makeup Artist có mặt tại nhà gái để trang điểm, làm tóc cô dâu và 2 mẹ.', eventDate: `${weddingDateStr} 06:30`, startTime: '06:30', location: 'Nhà Gái', session: 'MORNING' },
    { id: 2, title: 'Nhà trai xuất phát sang nhà gái', description: 'Đoàn nhà trai gồm trưởng đoàn, chú rể, ba mẹ và đội bê tráp mang sính lễ lên xe hoa xuất phát.', eventDate: `${weddingDateStr} 08:30`, startTime: '08:30', location: 'Nhà Trai', session: 'MORNING' },
    { id: 3, title: 'Lễ Trao tráp & Trao duyên đội bê tráp', description: 'Đội bê tráp nam nữ làm thủ tục trao mâm quả và lì xì trao duyên trước cửa nhà gái.', eventDate: `${weddingDateStr} 09:00`, startTime: '09:00', location: 'Nhà Gái', session: 'MORNING' },
    { id: 4, title: 'Lễ Gia Tiên & Lời dặn dò phụ mẫu tại nhà gái', description: 'Thắp hương báo cáo tổ tiên, ba mẹ trao của hồi môn và dặn dò hai con trước khi xuất giá.', eventDate: `${weddingDateStr} 09:30`, startTime: '09:30', location: 'Nhà Gái', session: 'MORNING' },
    { id: 5, title: 'Rước dâu về nhà trai & Bữa cơm thân mật', description: 'Đón cô dâu về nhà chồng, làm lễ gia tiên nhà trai và dùng bữa cơm ấm cúng cùng họ hàng nội tộc.', eventDate: `${weddingDateStr} 11:00`, startTime: '11:00', location: 'Nhà Trai', session: 'MORNING' },
    { id: 6, title: 'Cô dâu chú rể có mặt tại Sảnh Tiệc cưới & Tổng duyệt', description: 'Dặm lại makeup, thay váy cưới chính, chụp ảnh kỷ niệm tại sảnh trước khi đón khách và thử mic MC.', eventDate: `${weddingDateStr} 16:30`, startTime: '16:30', location: 'Sảnh Tiệc', session: 'EVENING' },
    { id: 7, title: 'Đón khách & Chụp ảnh tại Backdrop Photobooth', description: 'Đón tiếp quan khách, chụp ảnh kỷ niệm tại photobooth và phục vụ tiệc trà Canape nhẹ.', eventDate: `${weddingDateStr} 17:30`, startTime: '17:30', location: 'Photobooth Sảnh', session: 'EVENING' },
    { id: 8, title: 'Khai tiệc & Cử hành Hôn Lễ chính thức', description: 'Chiếu phóng sự cưới, cô dâu chú rể bước vào lễ đường, cắt bánh, rót rượu giao bôi và khai tiệc ăn mừng.', eventDate: `${weddingDateStr} 19:00`, startTime: '19:00', location: 'Sân Khấu Chính', session: 'EVENING' },
    { id: 9, title: 'Cô dâu chú rể chúc rượu từng bàn tiệc', description: 'Hai bên gia đình và đôi uyên ương đến từng bàn tiệc gửi lời cảm ơn và nâng ly cùng khách mời.', eventDate: `${weddingDateStr} 19:45`, startTime: '19:45', location: 'Bàn Tiệc', session: 'EVENING' },
    { id: 10, title: 'Tiết mục giao lưu văn nghệ, Tung hoa & Tiễn khách', description: 'Tiết mục tung hoa cưới, nhảy First Dance, chụp hình lưu niệm tiễn khách và thanh toán bàn tiệc.', eventDate: `${weddingDateStr} 20:45`, startTime: '20:45', location: 'Sảnh Tiệc', session: 'EVENING' }
  ];

  // Concepts based on chosen styles
  const conceptSuggestions: ConceptSummary[] = (allStyles.length > 0 ? allStyles : [
    { id: 1, name: 'Modern Rustic', description: 'Phong cách cưới mộc mạc tinh tế' }
  ]).map(style => {
    let colorPalette = ['#5D0F12', '#D4AF37', '#FFFBF5', '#2C0600'];
    let floralTheme = 'Hoa hồng Ohara, Cẩm tú cầu trắng, Lá bạc khuynh diệp';
    let vibe = 'Sang trọng, ấm cúng và ngập tràn cảm xúc tự nhiên';
    let decorNote = 'Điểm nhấn tại Cổng hoa vòm lối vào, Bàn Gallery nến thơm và Khung Photobooth lãng mạn.';

    if (style.name.toLowerCase().includes('rustic') || style.name.toLowerCase().includes('garden')) {
      colorPalette = ['#5B7065', '#A4B494', '#E8ECE9', '#D8B168'];
      floralTheme = 'Hoa hồng trắng, Hoa baby, Lá khuynh diệp & Gỗ thông tự nhiên';
      vibe = 'Gần gũi thiên nhiên, thanh lịch và tươi mát';
      decorNote = 'Phối cảnh gỗ mộc, đèn đom đóm fairy light và hoa dại đồng nội.';
    } else if (style.name.toLowerCase().includes('minimalist')) {
      colorPalette = ['#2C3E50', '#BDC3C7', '#F8F9F9', '#E5E7E9'];
      floralTheme = 'Hoa Tulip trắng, Lan hồ điệp đơn sắc, Cành mận thanh mảnh';
      vibe = 'Hiện đại, tối giản và đường nét kiến trúc tinh tế';
      decorNote = 'Không gian thoáng đạt, bố cục hình khối gọn gàng và ánh sáng trắng tinh khiết.';
    }

    return {
      conceptName: `Concept ${style.name} Grand Elegance`,
      description: `Bản thiết kế không gian tiệc cưới trọn gói lấy cảm hứng từ phong cách ${style.name}, tối ưu cho quy mô ${guests} khách mời tại ${requestOrConfig.location || 'trung tâm tiệc cưới'}.`,
      estimatedBudget: Math.round(totalBudget * 0.15),
      colorPalette,
      floralTheme,
      vibe,
      decorNote
    };
  });

  return {
    id: 9999,
    title: requestOrConfig.title || 'Kế hoạch đám cưới của tôi',
    weddingDate: weddingDateStr,
    location: requestOrConfig.location || '',
    guestCount: guests,
    budget: totalBudget,
    status: 'PLANNING',
    budgetItems,
    conceptSuggestions,
    checklistStats: {
      totalTasks: checklistTasks.length,
      completedTasks: 1
    },
    checklistTasks,
    timelineEvents,
    budgetAnalytics: {
      costPerGuest: insights.costPerGuest,
      estimatedTables: insights.estimatedTables,
      tableCostEstimated: insights.estimatedTableCost,
      contingencyBuffer: insights.contingencyReserve,
      totalAllocated: totalBudget
    }
  };
}
