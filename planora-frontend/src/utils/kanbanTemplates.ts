import { KanbanCategory, TaskTemplate } from '@/types/kanban';

export const KANBAN_CATEGORIES: KanbanCategory[] = [
  {
    id: 'catering',
    name: 'Đặt tiệc',
    icon: '💒',
    colorBg: 'bg-rose-50',
    colorText: 'text-rose-800',
    colorBorder: 'border-rose-200',
  },
  {
    id: 'dress',
    name: 'Váy cưới',
    icon: '👰',
    colorBg: 'bg-pink-50',
    colorText: 'text-pink-800',
    colorBorder: 'border-pink-200',
  },
  {
    id: 'suit',
    name: 'Trang phục chú rể',
    icon: '🤵',
    colorBg: 'bg-slate-50',
    colorText: 'text-slate-800',
    colorBorder: 'border-slate-200',
  },
  {
    id: 'decoration',
    name: 'Trang trí',
    icon: '💐',
    colorBg: 'bg-emerald-50',
    colorText: 'text-emerald-800',
    colorBorder: 'border-emerald-200',
  },
  {
    id: 'photography',
    name: 'Chụp ảnh',
    icon: '📸',
    colorBg: 'bg-indigo-50',
    colorText: 'text-indigo-800',
    colorBorder: 'border-indigo-200',
  },
  {
    id: 'invitation',
    name: 'Thiệp cưới',
    icon: '💌',
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-800',
    colorBorder: 'border-amber-200',
  },
  {
    id: 'guests',
    name: 'Khách mời',
    icon: '👥',
    colorBg: 'bg-blue-50',
    colorText: 'text-blue-800',
    colorBorder: 'border-blue-200',
  },
  {
    id: 'sound_mc',
    name: 'Âm thanh & MC',
    icon: '🎵',
    colorBg: 'bg-purple-50',
    colorText: 'text-purple-800',
    colorBorder: 'border-purple-200',
  },
  {
    id: 'car',
    name: 'Xe cưới',
    icon: '🚗',
    colorBg: 'bg-teal-50',
    colorText: 'text-teal-800',
    colorBorder: 'border-teal-200',
  },
  {
    id: 'makeup',
    name: 'Makeup',
    icon: '💄',
    colorBg: 'bg-fuchsia-50',
    colorText: 'text-fuchsia-800',
    colorBorder: 'border-fuchsia-200',
  },
  {
    id: 'rings',
    name: 'Nhẫn cưới',
    icon: '💍',
    colorBg: 'bg-yellow-50',
    colorText: 'text-yellow-800',
    colorBorder: 'border-yellow-200',
  },
  {
    id: 'day_of_prep',
    name: 'Chuẩn bị ngày cưới',
    icon: '📋',
    colorBg: 'bg-orange-50',
    colorText: 'text-orange-800',
    colorBorder: 'border-orange-200',
  },
];

export const CATEGORY_MAP: Record<string, KanbanCategory> = KANBAN_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {} as Record<string, KanbanCategory>);

export function getCategoryById(categoryId?: string): KanbanCategory {
  if (!categoryId) return KANBAN_CATEGORIES[11]; // default day_of_prep
  return CATEGORY_MAP[categoryId] || KANBAN_CATEGORIES[11];
}

// Auto-detect category from task title or description
export function detectCategoryFromText(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('nhà hàng') || lower.includes('tiệc') || lower.includes('thực đơn') || lower.includes('món ăn') || lower.includes('bàn tiệc')) {
    return 'catering';
  }
  if (lower.includes('váy') || lower.includes('soiree') || lower.includes('cô dâu')) {
    return 'dress';
  }
  if (lower.includes('vest') || lower.includes('chú rể') || lower.includes('suit') || lower.includes('cà vạt')) {
    return 'suit';
  }
  if (lower.includes('trang trí') || lower.includes('hoa') || lower.includes('backdrop') || lower.includes('gallery') || lower.includes('sân khấu')) {
    return 'decoration';
  }
  if (lower.includes('ảnh') || lower.includes('chụp') || lower.includes('album') || lower.includes('phóng sự') || lower.includes('studio') || lower.includes('video')) {
    return 'photography';
  }
  if (lower.includes('thiệp') || lower.includes('in thiệp') || lower.includes('gửi thiệp')) {
    return 'invitation';
  }
  if (lower.includes('khách') || lower.includes('rsvp') || lower.includes('chỗ ngồi') || lower.includes('danh sách khách')) {
    return 'guests';
  }
  if (lower.includes('mc') || lower.includes('âm thanh') || lower.includes('ánh sáng') || lower.includes('bài hát') || lower.includes('nhạc')) {
    return 'sound_mc';
  }
  if (lower.includes('xe') || lower.includes('rước dâu') || lower.includes('xe hoa')) {
    return 'car';
  }
  if (lower.includes('makeup') || lower.includes('trang điểm') || lower.includes('làm tóc')) {
    return 'makeup';
  }
  if (lower.includes('nhẫn') || lower.includes('trang sức') || lower.includes('vàng cưới')) {
    return 'rings';
  }
  return 'day_of_prep';
}

// Rich predefined template library for Wedding Planning
export const DEFAULT_TASK_TEMPLATES: TaskTemplate[] = [
  // 1. Đặt tiệc
  {
    title: 'Tìm kiếm & khảo sát nhà hàng tiệc cưới',
    category: 'catering',
    priority: 'HIGH',
    description: 'Lập danh sách 3-5 trung tâm tiệc cưới phù hợp phong cách Quiet Luxury và kiểm tra lịch trống.',
    subtasks: ['Lập danh sách 3 trung tâm tiệc cưới tiềm năng', 'Kiểm tra lịch trống ngày cưới chính thức', 'Ghi chú mức giá trung bình mỗi bàn'],
    daysBeforeWedding: 180,
  },
  {
    title: 'Khảo sát sảnh tiệc & thử hệ thống âm thanh ánh sáng',
    category: 'catering',
    priority: 'HIGH',
    description: 'Đến trực tiếp sảnh tiệc kiểm tra không gian, phòng thay đồ và lối đi cô dâu.',
    subtasks: ['Kiểm tra sức chứa thực tế và cột chắn', 'Xem phòng thay đồ của cô dâu chú rể', 'Thử màn hình LED và âm thanh'],
    daysBeforeWedding: 160,
  },
  {
    title: 'So sánh các gói tiệc & ưu đãi khuyến mãi',
    category: 'catering',
    priority: 'MEDIUM',
    description: 'So sánh chi tiết các gói thực đơn, ưu đãi bàn dự phòng và phụ phí đồ uống.',
    subtasks: ['So sánh gói ưu đãi bia và nước ngọt', 'Thương lượng chính sách bàn dự phòng', 'Kiểm tra phí dịch vụ và VAT'],
    daysBeforeWedding: 150,
  },
  {
    title: 'Đặt cọc giữ sảnh nhà hàng tiệc cưới',
    category: 'catering',
    priority: 'HIGH',
    description: 'Ký hợp đồng chính thức và hoàn tất đặt cọc đợt 1 để giữ sảnh tiệc.',
    subtasks: ['Đọc kỹ các điều khoản hủy và đổi ngày', 'Chuyển khoản đặt cọc đợt 1', 'Lưu biên lai và hợp đồng có chữ ký'],
    daysBeforeWedding: 140,
  },
  {
    title: 'Thử món ăn tiệc cưới (Food Tasting)',
    category: 'catering',
    priority: 'MEDIUM',
    description: 'Tham gia buổi thử món cùng gia đình để thẩm định chất lượng và khẩu vị.',
    subtasks: ['Thử set menu 6 món đã chọn', 'Góp ý điều chỉnh gia vị cho bếp trưởng', 'Chốt thực đơn chính thức sau buổi thử'],
    daysBeforeWedding: 60,
  },
  {
    title: 'Xác nhận số lượng bàn tiệc & sơ đồ đón tiếp',
    category: 'catering',
    priority: 'HIGH',
    description: 'Tổng hợp phản hồi RSVP và chốt số lượng bàn chính thức + bàn dự phòng với nhà hàng.',
    subtasks: ['Chốt số bàn khách thực tế', 'Đăng ký số lượng bàn chay (nếu có)', 'Gửi sơ đồ phân bổ bàn tiệc cho quản lý sảnh'],
    daysBeforeWedding: 15,
  },
  {
    title: 'Xác nhận thực đơn & đồ uống cuối cùng',
    category: 'catering',
    priority: 'HIGH',
    description: 'Kiểm tra lần cuối về số lượng đồ uống, thời gian bắt đầu lên món và quản lý sảnh.',
    subtasks: ['Chốt số lượng thùng bia và nước ngọt', 'Xác định thời gian khui rượu champagne', 'Lưu số điện thoại quản lý sảnh trực tiếp'],
    daysBeforeWedding: 5,
  },

  // 2. Váy cưới
  {
    title: 'Tìm studio váy cưới & chọn phong cách',
    category: 'dress',
    priority: 'HIGH',
    description: 'Tham khảo các bộ sưu tập váy cưới cao cấp và đặt lịch hẹn thử đồ.',
    subtasks: ['Lưu lại 5 mẫu váy yêu thích', 'Đặt lịch hẹn thử váy tại 2 showroom uy tín', 'Xác định ngân sách tối đa cho váy cưới'],
    daysBeforeWedding: 150,
  },
  {
    title: 'Thử váy cưới lần 1 (Chọn dáng váy chính)',
    category: 'dress',
    priority: 'HIGH',
    description: 'Thử trực tiếp các dáng váy chữ A, đuôi cá, ballgown để tìm form dáng tôn nét đẹp nhất.',
    subtasks: ['Thử 4-5 dáng váy khác nhau', 'Chụp ảnh các góc nghiêng và phía sau', 'Tham khảo ý kiến người đồng hành'],
    daysBeforeWedding: 120,
  },
  {
    title: 'Chọn váy cưới chính làm lễ & váy đi bàn',
    category: 'dress',
    priority: 'HIGH',
    description: 'Chốt 1 váy lộng lẫy cho phần nghi lễ và 1 váy nhẹ nhàng thanh thoát khi chúc rượu.',
    subtasks: ['Chọn váy chính làm lễ', 'Chọn váy dạ hội đi bàn tiếp khách', 'Chọn khăn voan cài đầu và phụ kiện tóc'],
    daysBeforeWedding: 90,
  },
  {
    title: 'Đặt cọc & ký hợp đồng thuê/may váy',
    category: 'dress',
    priority: 'MEDIUM',
    description: 'Ký kết hợp đồng giữ váy cưới, ghi nhận chính sách bảo quản và cọc trang phục.',
    subtasks: ['Kiểm tra hiện trạng váy trước khi ký hợp đồng', 'Thanh toán cọc giữ mẫu váy', 'Ghi rõ ngày nhận váy và ngày hoàn trả'],
    daysBeforeWedding: 80,
  },
  {
    title: 'Thử váy lần 2 & chỉnh sửa theo số đo chuẩn',
    category: 'dress',
    priority: 'HIGH',
    description: 'Thử lại cùng giày cưới đã chuẩn bị để căn chỉnh chiều dài tùng váy và vòng eo.',
    subtasks: ['Mang giày cưới đi cùng để thử độ dài', 'Chỉnh sửa vòng eo và cúp ngực vừa vặn', 'Thử di chuyển và xoay người'],
    daysBeforeWedding: 20,
  },
  {
    title: 'Nhận váy cưới & phụ kiện hoàn chỉnh',
    category: 'dress',
    priority: 'HIGH',
    description: 'Kiểm tra tình trạng váy sạch sẽ, phẳng phiu và mang về treo thẳng trước ngày cưới.',
    subtasks: ['Kiểm tra khóa kéo và đường may lần cuối', 'Nhận voan cài đầu và tùng váy', 'Treo váy ở nơi khô ráo, thoáng mát'],
    daysBeforeWedding: 2,
  },

  // 3. Trang phục chú rể
  {
    title: 'Tìm tiệm may / thuê vest cưới chú rể',
    category: 'suit',
    priority: 'MEDIUM',
    description: 'Chọn thương hiệu âu phục uy tín với phom dáng chuẩn mực phong cách Quiet Luxury.',
    subtasks: ['Tham khảo màu sắc vest hòa hợp với váy cô dâu', 'Đặt lịch đo may hoặc thử vest', 'Chọn chất liệu vải thoáng mát'],
    daysBeforeWedding: 120,
  },
  {
    title: 'Lấy số đo & chọn kiểu dáng vest cưới',
    category: 'suit',
    priority: 'HIGH',
    description: 'Lấy số đo chi tiết cho vest 2 mảnh hoặc 3 mảnh và chọn ve áo, khuy áo.',
    subtasks: ['Chọn màu vest (đen tuyền, xanh navy, hoặc xám than)', 'Lấy số đo chi tiết', 'Chọn áo sơ mi trắng cổ bẻ chuẩn'],
    daysBeforeWedding: 90,
  },
  {
    title: 'Thử vest cưới & phụ kiện đi kèm',
    category: 'suit',
    priority: 'MEDIUM',
    description: 'Thử form vest hoàn thiện, chọn cà vạt/nơ, khăn cài túi áo và thắt lưng da.',
    subtasks: ['Kiểm tra độ dài ống quần và tay áo vest', 'Chọn nơ cổ hoặc cà vạt lụa cao cấp', 'Chọn giày tây đen bóng sang trọng'],
    daysBeforeWedding: 30,
  },
  {
    title: 'Nhận âu phục chú rể hoàn chỉnh',
    category: 'suit',
    priority: 'MEDIUM',
    description: 'Nhận trang phục đã là ủi chỉn chu sẵn sàng cho ngày trọng đại.',
    subtasks: ['Kiểm tra nút áo và đường chỉ', 'Nhận đầy đủ phụ kiện thắt lưng, nơ', 'Treo phẳng cùng vest cô dâu'],
    daysBeforeWedding: 3,
  },

  // 4. Trang trí
  {
    title: 'Chọn concept & màu chủ đạo tiệc cưới (Theme & Palette)',
    category: 'decoration',
    priority: 'HIGH',
    description: 'Xác định bảng màu chủ đạo (Champagne Cream, Đỏ Burgundy, Xanh Sage) và phong cách bài trí.',
    subtasks: ['Tạo moodboard cảm hứng đám cưới', 'Chốt bảng màu chủ đạo', 'Thống nhất phong cách Quiet Luxury'],
    daysBeforeWedding: 120,
  },
  {
    title: 'Chọn backdrop chụp ảnh & sân khấu chính',
    category: 'decoration',
    priority: 'HIGH',
    description: 'Lựa chọn kích thước và thiết kế cho backdrop check-in đón khách và lễ đường sân khấu.',
    subtasks: ['Chọn thiết kế backdrop hoa tươi', 'Lựa chọn kiểu chữ tên cô dâu chú rể', 'Thống nhất kích thước phù hợp với sảnh'],
    daysBeforeWedding: 90,
  },
  {
    title: 'Chọn hoa cưới & hoa cầm tay cô dâu',
    category: 'decoration',
    priority: 'MEDIUM',
    description: 'Chọn loại hoa tươi nhập khẩu mang ý nghĩa tình yêu thanh khiết và hoa cài áo chú rể.',
    subtasks: ['Chọn hoa cầm tay cô dâu (hoa linh lan, tulip, hoặc mẫu đơn)', 'Đặt hoa cài áo cho chú rể và hai bố', 'Chốt hoa bàn tiệc'],
    daysBeforeWedding: 45,
  },
  {
    title: 'Thiết kế bàn Gallery & sổ ký tên kỷ niệm',
    category: 'decoration',
    priority: 'MEDIUM',
    description: 'Chuẩn bị khung ảnh cưới nhỏ, nến thơm, hộp đựng tiền mừng và sổ ký tên lưu niệm.',
    subtasks: ['In 6-8 ảnh cưới nhỏ để bàn gallery', 'Chuẩn bị thùng tiền mừng cưới nghệ thuật', 'Mua bút ký tên và sổ lưu bút cao cấp'],
    daysBeforeWedding: 30,
  },
  {
    title: 'Duyệt thiết kế 3D & phối cảnh toàn bộ không gian',
    category: 'decoration',
    priority: 'HIGH',
    description: 'Xem bản dựng 3D chi tiết của đơn vị wedding planner và xác nhận phương án thi công.',
    subtasks: ['Kiểm tra phối cảnh lối đi sân khấu', 'Duyệt ánh sáng nghệ thuật bàn tiệc', 'Ký duyệt bản vẽ trang trí cuối cùng'],
    daysBeforeWedding: 20,
  },
  {
    title: 'Xác nhận thời gian setup với đơn vị trang trí & nhà hàng',
    category: 'decoration',
    priority: 'HIGH',
    description: 'Điều phối thời gian đơn vị thi công vào sảnh tiệc để setup hoa và ánh sáng đúng tiến độ.',
    subtasks: ['Xác nhận giờ sảnh mở cửa đón đội thi công', 'Cung cấp số liên hệ quản lý thi công', 'Lên lịch kiểm tra hoàn thiện trước giờ đón khách 2 tiếng'],
    daysBeforeWedding: 5,
  },

  // 5. Chụp ảnh
  {
    title: 'Chọn studio chụp ảnh cưới & phóng sự cưới',
    category: 'photography',
    priority: 'HIGH',
    description: 'Lựa chọn nhiếp ảnh gia có gu màu ảnh trong trẻo, tự nhiên và chuyên nghiệp.',
    subtasks: ['Xem portfolio 3 nhiếp ảnh gia hàng đầu', 'Hỏi gói chụp pre-wedding và phóng sự ngày cưới', 'Ký hợp đồng dịch vụ'],
    daysBeforeWedding: 150,
  },
  {
    title: 'Thực hiện buổi chụp ảnh Pre-Wedding',
    category: 'photography',
    priority: 'HIGH',
    description: 'Thực hiện bộ ảnh cưới ngoại cảnh hoặc tại phim trường theo concept thanh lịch.',
    subtasks: ['Chuẩn bị trang phục và giày chụp', 'Giữ gìn sức khỏe và làn da tươi tắn', 'Chụp theo danh sách góc ảnh mong muốn'],
    daysBeforeWedding: 90,
  },
  {
    title: 'Chọn ảnh làm Album cưới & ảnh cổng lớn',
    category: 'photography',
    priority: 'MEDIUM',
    description: 'Chọn lọc những bức ảnh đẹp nhất để chỉnh sửa màu và in ấn album photobook.',
    subtasks: ['Chọn 40 bức ảnh tiêu biểu cho album', 'Chọn 1 bức ảnh đẹp nhất in ảnh cổng kích thước lớn', 'Ghi chú yêu cầu chỉnh sửa hậu kỳ'],
    daysBeforeWedding: 50,
  },
  {
    title: 'Nhận album ảnh & ảnh cổng hoàn thiện',
    category: 'photography',
    priority: 'MEDIUM',
    description: 'Kiểm tra chất lượng màu in, độ sắc nét và khung ảnh cổng đón khách.',
    subtasks: ['Kiểm tra độ nét và màu da trong album', 'Nhận khung ảnh cổng và chân đỡ gỗ', 'Lưu trữ file ảnh gốc độ phân giải cao'],
    daysBeforeWedding: 15,
  },

  // 6. Thiệp cưới
  {
    title: 'Chọn mẫu thiệp cưới & chất liệu giấy',
    category: 'invitation',
    priority: 'MEDIUM',
    description: 'Lựa chọn mẫu thiệp in ép kim, dập nổi hoặc giấy mỹ thuật phong cách Quiet Luxury.',
    subtasks: ['Xem mẫu thiệp giấy mỹ thuật cao cấp', 'Chọn kiểu chữ calligraphy trang nhã', 'Quyết định làm thiệp cưới online (e-invitation)'],
    daysBeforeWedding: 90,
  },
  {
    title: 'Soạn thảo & rà soát nội dung thiệp cưới',
    category: 'invitation',
    priority: 'HIGH',
    description: 'Kiểm tra kỹ lưỡng tên phụ huynh hai bên, địa chỉ chính xác và bản đồ hướng dẫn.',
    subtasks: ['Kiểm tra chính tả tên bố mẹ hai bên', 'Kiểm tra ngày giờ dương lịch và âm lịch', 'Đính kèm mã QR sơ đồ đường đi'],
    daysBeforeWedding: 75,
  },
  {
    title: 'In ấn & nhận toàn bộ thiệp cưới',
    category: 'invitation',
    priority: 'HIGH',
    description: 'Đặt in số lượng thiệp dự trù thêm 10% và nhận hàng đóng gói hoàn chỉnh.',
    subtasks: ['Duyệt mẫu in thử (Proofread)', 'In số lượng thực tế + 10% dự phòng', 'Nhận thiệp và kiểm đếm đủ số lượng'],
    daysBeforeWedding: 60,
  },
  {
    title: 'Viết thiệp cưới & gửi thiệp tận tay khách quý',
    category: 'invitation',
    priority: 'HIGH',
    description: 'Nắn nót viết thiệp và gửi đến người thân, bạn bè trước lễ cưới ít nhất 3-4 tuần.',
    subtasks: ['Lên lịch hẹn gửi thiệp trực tiếp', 'Gửi thiệp qua bưu điện cho khách ở xa', 'Gửi thiệp điện tử cho bạn bè thân thiết'],
    daysBeforeWedding: 30,
  },

  // 7. Khách mời
  {
    title: 'Lập danh sách khách mời dự kiến',
    category: 'guests',
    priority: 'HIGH',
    description: 'Gia đình hai bên ngồi lại lập danh sách khách mời tổng thể và ước tính số bàn tiệc.',
    subtasks: ['Danh sách khách họ hàng nhà trai', 'Danh sách khách họ hàng nhà gái', 'Danh sách bạn bè và đồng nghiệp cô dâu chú rể'],
    daysBeforeWedding: 120,
  },
  {
    title: 'Theo dõi phản hồi & xác nhận tham dự (RSVP)',
    category: 'guests',
    priority: 'HIGH',
    description: 'Liên hệ xác nhận lại những khách mời đã nhận thiệp để chốt danh sách tham dự chính xác.',
    subtasks: ['Nhắn tin hoặc gọi điện hỏi thăm nhẹ nhàng', 'Đánh dấu ai chắc chắn tham dự / vắng mặt', 'Tính toán tổng số lượng khách thực tế'],
    daysBeforeWedding: 15,
  },
  {
    title: 'Sắp xếp sơ đồ chỗ ngồi bàn tiệc hợp lý',
    category: 'guests',
    priority: 'HIGH',
    description: 'Sắp xếp nhóm bạn thân, gia đình ngồi gần sân khấu, đồng nghiệp ngồi cùng bàn ấm cúng.',
    subtasks: ['Phân bàn VIP cho gia đình hai bên', 'Xếp bàn bạn học đại học và đồng nghiệp', 'Chuẩn bị bảng tên đặt trên bàn tiệc'],
    daysBeforeWedding: 7,
  },

  // 8. Âm thanh & MC
  {
    title: 'Chọn MC dẫn chương trình tiệc cưới',
    category: 'sound_mc',
    priority: 'MEDIUM',
    description: 'Chọn người dẫn chương trình có chất giọng ấm áp, thanh lịch, tinh tế.',
    subtasks: ['Xem video mẫu dẫn tiệc cưới của MC', 'Thống nhất phong cách trang trọng, ấm cúng', 'Ký hợp đồng và đặt lịch MC'],
    daysBeforeWedding: 60,
  },
  {
    title: 'Lên kịch bản nghi lễ lễ cưới & âm nhạc',
    category: 'sound_mc',
    priority: 'MEDIUM',
    description: 'Thống nhất trình tự: đón khách, chiếu phóng sự, tuyên bố, rót rượu, cắt bánh và phát biểu.',
    subtasks: ['Chọn bài hát đón cô dâu tiến vào lễ đường', 'Chọn bài hát cắt bánh và nâng ly chúc mừng', 'Gửi kịch bản timeline chi tiết cho MC'],
    daysBeforeWedding: 20,
  },

  // 9. Xe cưới
  {
    title: 'Chọn loại xe hoa rước dâu & xe chở hai họ',
    category: 'car',
    priority: 'MEDIUM',
    description: 'Thuê xe hoa đón dâu sang trọng và xe 16-29 chỗ phục vụ đoàn nhà trai, nhà gái.',
    subtasks: ['Chọn màu xe hoa (trắng tinh khôi hoặc đen quyền quý)', 'Đặt xe chở quan khách hai họ', 'Lên lộ trình di chuyển và thời gian đón rước'],
    daysBeforeWedding: 60,
  },
  {
    title: 'Xác nhận trang trí hoa tươi xe cưới',
    category: 'car',
    priority: 'MEDIUM',
    description: 'Chốt mẫu hoa tươi trang trí trên nắp capo xe và dải nơ tay nắm cửa.',
    subtasks: ['Chọn mẫu hoa tươi capo xe rước dâu', 'Chốt thời gian giao xe sáng sớm', 'Lưu số điện thoại bác tài xế'],
    daysBeforeWedding: 5,
  },

  // 10. Makeup
  {
    title: 'Chọn chuyên gia trang điểm & làm tóc cô dâu',
    category: 'makeup',
    priority: 'HIGH',
    description: 'Tìm kiếm chuyên gia makeup có phong cách tự nhiên, trong suốt và tôn nét quý phái.',
    subtasks: ['Xem hình ảnh cô dâu thực tế của chuyên gia', 'Hỏi giá gói makeup ngày đón dâu và tiệc tối', 'Đặt lịch giữ chuyên gia trang điểm'],
    daysBeforeWedding: 90,
  },
  {
    title: 'Trang điểm thử (Makeup Trial) & chốt layout',
    category: 'makeup',
    priority: 'MEDIUM',
    description: 'Thử layout makeup và kiểu tóc để kiểm tra độ bền nền và mức độ hài hòa gương mặt.',
    subtasks: ['Thử kiểu tóc búi thấp hoặc uốn xoăn sóng', 'Chụp ảnh dưới ánh sáng tự nhiên và đèn vàng', 'Góp ý màu son và độ đậm nhạt'],
    daysBeforeWedding: 30,
  },

  // 11. Nhẫn cưới
  {
    title: 'Khảo sát thương hiệu & chọn mẫu nhẫn cưới',
    category: 'rings',
    priority: 'HIGH',
    description: 'Chọn đôi nhẫn cưới tượng trưng cho tình yêu vĩnh cửu, thiết kế tinh xảo và tiện đeo hàng ngày.',
    subtasks: ['Khảo sát 2-3 tiệm kim hoàn danh tiếng', 'Thử size nhẫn vừa vặn ngón áp út', 'Chọn chất liệu vàng trắng hoặc vàng hồng'],
    daysBeforeWedding: 90,
  },
  {
    title: 'Đặt may nhẫn cưới & khắc tên kỷ niệm',
    category: 'rings',
    priority: 'MEDIUM',
    description: 'Khắc tên hai bạn và ngày kỷ niệm ngày cưới vào lòng trong của nhẫn.',
    subtasks: ['Chốt ngày lấy nhẫn', 'Xác nhận nội dung khắc laser', 'Nhận giấy kiểm định kim cương và bảo hành trọn đời'],
    daysBeforeWedding: 60,
  },

  // 12. Chuẩn bị ngày cưới
  {
    title: 'Phân công nhiệm vụ cụ thể cho người thân & bạn bè',
    category: 'day_of_prep',
    priority: 'HIGH',
    description: 'Phân công rõ ràng người giữ thùng tiền, người hướng dẫn khách, người kiểm tra âm thanh.',
    subtasks: ['Chỉ định 1 người đáng tin cậy trông coi hòm tiền', 'Phân công 2 bạn đón khách và trao quà cảm ơn', 'Gửi kịch bản bỏ túi cho các thành viên hỗ trợ'],
    daysBeforeWedding: 10,
  },
  {
    title: 'Chuẩn bị phong bao lì xì cho đội bưng quả & phù dâu',
    category: 'day_of_prep',
    priority: 'MEDIUM',
    description: 'Chuẩn bị sẵn các phong bao lì xì đỏ may mắn cho đội ngũ bưng quả hai nhà.',
    subtasks: ['Đổi tiền mới cho vào bao lì xì', 'Chuẩn bị đủ số lượng bao lì xì cho hai nhà', 'Giao cho người phụ trách phát vào sáng đón dâu'],
    daysBeforeWedding: 5,
  },
  {
    title: 'Kiểm tra tổng thể toàn bộ khâu chuẩn bị (Final Check)',
    category: 'day_of_prep',
    priority: 'HIGH',
    description: 'Rà soát lại toàn bộ checklist 1 ngày trước cưới, thư giãn tinh thần và ngủ thật ngon.',
    subtasks: ['Kiểm tra nhẫn cưới, trang sức, giày cưới', 'Kiểm tra pin điện thoại và sạc dự phòng', 'Nghỉ ngơi sớm để có diện mạo rạng rỡ nhất'],
    daysBeforeWedding: 1,
  },
];

// Helper to calculate realistic due date from wedding date or default
export function calculateDueDate(daysBeforeWedding: number, weddingDateStr?: string | null): string {
  let baseDate: Date;
  if (weddingDateStr) {
    try {
      baseDate = new Date(weddingDateStr);
      if (isNaN(baseDate.getTime())) {
        baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 180); // 6 months from now
      }
    } catch {
      baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 180);
    }
  } else {
    baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 180);
  }

  const targetDate = new Date(baseDate);
  targetDate.setDate(targetDate.getDate() - daysBeforeWedding);
  
  // Don't set due date in the past if possible, or minimum today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const finalDate = targetDate.getTime() < today.getTime() ? today : targetDate;
  return finalDate.toISOString().split('T')[0];
}

// Next task suggestion logic
export function getSuggestedNextTasks(completedTaskTitle: string, currentCategory: string): { title: string; category: string }[] {
  const lower = completedTaskTitle.toLowerCase();

  if (lower.includes('khảo sát nhà hàng') || lower.includes('tìm kiếm nhà hàng')) {
    return [
      { title: 'Đặt cọc giữ sảnh nhà hàng tiệc cưới', category: 'catering' },
      { title: 'So sánh các gói tiệc & ưu đãi khuyến mãi', category: 'catering' },
      { title: 'Thử món ăn tiệc cưới (Food Tasting)', category: 'catering' },
    ];
  }
  if (lower.includes('đặt nhà hàng') || lower.includes('đặt cọc')) {
    return [
      { title: 'Thử món ăn tiệc cưới (Food Tasting)', category: 'catering' },
      { title: 'Xác nhận số lượng bàn tiệc & sơ đồ đón tiếp', category: 'catering' },
      { title: 'Chọn concept & màu chủ đạo tiệc cưới (Theme & Palette)', category: 'decoration' },
    ];
  }
  if (lower.includes('thử váy') || lower.includes('studio váy')) {
    return [
      { title: 'Chọn váy cưới chính làm lễ & váy đi bàn', category: 'dress' },
      { title: 'Đặt cọc & ký hợp đồng thuê/may váy', category: 'dress' },
      { title: 'Tìm tiệm may / thuê vest cưới chú rể', category: 'suit' },
    ];
  }
  if (lower.includes('thiệp')) {
    return [
      { title: 'Soạn thảo & rà soát nội dung thiệp cưới', category: 'invitation' },
      { title: 'Viết thiệp cưới & gửi thiệp tận tay khách quý', category: 'invitation' },
      { title: 'Theo dõi phản hồi & xác nhận tham dự (RSVP)', category: 'guests' },
    ];
  }
  if (lower.includes('khách mời')) {
    return [
      { title: 'Theo dõi phản hồi & xác nhận tham dự (RSVP)', category: 'guests' },
      { title: 'Sắp xếp sơ đồ chỗ ngồi bàn tiệc hợp lý', category: 'guests' },
      { title: 'Xác nhận số lượng bàn tiệc & sơ đồ đón tiếp', category: 'catering' },
    ];
  }
  if (lower.includes('chụp ảnh') || lower.includes('pre-wedding')) {
    return [
      { title: 'Chọn ảnh làm Album cưới & ảnh cổng lớn', category: 'photography' },
      { title: 'Nhận album ảnh & ảnh cổng hoàn thiện', category: 'photography' },
      { title: 'Thiết kế bàn Gallery & sổ ký tên kỷ niệm', category: 'decoration' },
    ];
  }

  // Fallback: pick templates in the same category
  const sameCat = DEFAULT_TASK_TEMPLATES.filter(t => t.category === currentCategory && !t.title.toLowerCase().includes(lower));
  if (sameCat.length > 0) {
    return sameCat.slice(0, 3).map(t => ({ title: t.title, category: t.category }));
  }

  return [
    { title: 'Xác nhận số lượng bàn tiệc & sơ đồ đón tiếp', category: 'catering' },
    { title: 'Sắp xếp sơ đồ chỗ ngồi bàn tiệc hợp lý', category: 'guests' },
    { title: 'Kiểm tra tổng thể toàn bộ khâu chuẩn bị (Final Check)', category: 'day_of_prep' },
  ];
}
