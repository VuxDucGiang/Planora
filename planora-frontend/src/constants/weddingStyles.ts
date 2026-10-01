export interface StyleGalleryImage {
  url: string;
  caption: string;
}

export interface StylePaletteColor {
  name: string;
  hex: string;
}

export interface WeddingStyleDetail {
  id: number;
  matchKey: string;
  name: string;
  tag: string;
  vietnameseTitle: string;
  coverImage: string;
  description: string;
  vibe: string;
  palette: StylePaletteColor[];
  gallery: StyleGalleryImage[];
}

export const WEDDING_STYLES_CATALOG: WeddingStyleDetail[] = [
  {
    id: 2,
    matchKey: 'minimalist',
    name: 'Minimalist',
    tag: 'Minimal',
    vietnameseTitle: 'Tối giản & Thanh lịch',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800',
    description: 'Phong cách tối giản chú trọng vẻ đẹp tự nhiên, đường nét thanh thoát, bảng màu trung tính và không gian thoáng đãng.',
    vibe: 'Tinh tế, nhẹ nhàng, hoa tươi cành đơn và ánh sáng tự nhiên',
    palette: [
      { name: 'Warm Cream', hex: '#FFFBF5' },
      { name: 'Sage Green', hex: '#8F9E8B' },
      { name: 'Champagne', hex: '#E8D5A8' },
      { name: 'Soft Charcoal', hex: '#2C2C2C' }
    ],
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200',
        caption: 'Cổng hoa vòm thanh lịch với hoa trắng và lá xanh tự nhiên'
      },
      {
        url: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?q=80&w=1200',
        caption: 'Bàn tiệc tinh giản với nến cốc thuỷ tinh và menu ép kim'
      },
      {
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200',
        caption: 'Váy cưới lụa satin mượt mà và hoa cầm tay cành đơn'
      },
      {
        url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1200',
        caption: 'Không gian tiệc cưới mở ngập tràn ánh sáng ban ngày'
      }
    ]
  },
  {
    id: 3,
    matchKey: 'luxury',
    name: 'Luxury',
    tag: 'Royal',
    vietnameseTitle: 'Hoàng gia & Sang trọng',
    coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800',
    description: 'Phong cách hoàng gia lộng lẫy với kiến trúc tân cổ điển, đèn chùm pha lê, hoa tươi nhập khẩu và các chi tiết mạ vàng quý phái.',
    vibe: 'Nguy nga, tráng lệ, váy cưới ren bồng bềnh và tiệc tối quý tộc',
    palette: [
      { name: 'Burgundy Wine', hex: '#5D0F12' },
      { name: 'Imperial Gold', hex: '#C9A96E' },
      { name: 'Ivory Lace', hex: '#FDFBF7' },
      { name: 'Velvet Black', hex: '#1A1A1A' }
    ],
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200',
        caption: 'Cầu thang tân cổ điển với khăn voan dài phong cách hoàng tộc'
      },
      {
        url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200',
        caption: 'Sảnh tiệc lộng lẫy với đèn chùm pha lê và hoa tươi cao cấp'
      },
      {
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200',
        caption: 'Ánh nến lung linh và bộ dao nĩa dát vàng sang trọng'
      },
      {
        url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200',
        caption: 'Kiến trúc lâu đài châu Âu cổ kính và quý phái'
      }
    ]
  },
  {
    id: 4,
    matchKey: 'garden',
    name: 'Garden Wedding',
    tag: 'Garden',
    vietnameseTitle: 'Sân vườn ngoài trời',
    coverImage: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800',
    description: 'Hôn lễ giữa thiên nhiên xanh mát, cây lá tự nhiên, dây đèn fairy light ấm cúng và hoa cỏ đồng nội lãng mạn.',
    vibe: 'Thân mật, trong lành, hoa dại mộc mạc và gió chiều êm dịu',
    palette: [
      { name: 'Forest Green', hex: '#2E4F38' },
      { name: 'Blush Pink', hex: '#E8B4B8' },
      { name: 'Warm Oak', hex: '#A47551' },
      { name: 'Vanilla Cream', hex: '#FFF8EE' }
    ],
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=1200',
        caption: 'Khoảnh khắc trao lời thề ngập tràn ánh nắng và cỏ hoa'
      },
      {
        url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=1200',
        caption: 'Bàn tiệc gỗ dài ngoài trời dưới tán cây và đèn giăng lãng mạn'
      },
      {
        url: 'https://images.unsplash.com/photo-1507504038482-7621c37c2f0f?q=80&w=1200',
        caption: 'Cổng hoa tròn hoang dã kết hợp hoa hồng pastel và cành lá'
      },
      {
        url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=1200',
        caption: 'Tiệc cocktail chiều ngoài bãi cỏ sân vườn thân mật'
      }
    ]
  },
  {
    id: 5,
    matchKey: 'beach',
    name: 'Beach Wedding',
    tag: 'Beach',
    vietnameseTitle: 'Bãi biển & Hoàng hôn',
    coverImage: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?q=80&w=800',
    description: 'Hôn lễ bên bờ cát trắng, tiếng sóng biển vỗ rì rào, gió chiều hoàng hôn và phong cách bohemian phóng khoáng.',
    vibe: 'Phóng khoáng, tự do, cỏ lau pampas và hoàng hôn biển rực rỡ',
    palette: [
      { name: 'Ocean Blue', hex: '#4A7C9B' },
      { name: 'Sunset Peach', hex: '#F4A261' },
      { name: 'Sand Beige', hex: '#E2D4C3' },
      { name: 'Pure White', hex: '#FFFFFF' }
    ],
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?q=80&w=1200',
        caption: 'Hôn lễ lãng mạn bên bờ cát trắng và ánh hoàng hôn buông xuống biển'
      },
      {
        url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200',
        caption: 'Cổng cưới bằng gỗ lũa và cỏ lau mềm mại trước sóng đại dương'
      },
      {
        url: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?q=80&w=1200',
        caption: 'Tiệc tối bên bờ biển với ánh nến lung linh và tiếng sóng'
      },
      {
        url: 'https://images.unsplash.com/photo-1561542320-9a18cd340469?q=80&w=1200',
        caption: 'Bàn đón khách phong cách resort ven biển thoáng đãng'
      }
    ]
  },
  {
    id: 1,
    matchKey: 'traditional',
    name: 'Traditional',
    tag: 'Traditional',
    vietnameseTitle: 'Truyền thống Á Đông',
    coverImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800',
    description: 'Đậm đà bản sắc văn hoá với áo dài truyền thống, nghi thức lễ gia tiên trang trọng, hoa sen và sắc đỏ son may mắn.',
    vibe: 'Ấm cúng, thiêng liêng, nét đẹp di sản và gắn kết gia đình',
    palette: [
      { name: 'Crimson Red', hex: '#9B1B1B' },
      { name: 'Gold Silk', hex: '#D4AF37' },
      { name: 'Lotus Pink', hex: '#E8A598' },
      { name: 'Warm Cream', hex: '#FAF5ED' }
    ],
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200',
        caption: 'Nghi thức dâng trà và trang phục cưới truyền thống may mắn'
      },
      {
        url: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?q=80&w=1200',
        caption: 'Bàn lễ gia tiên trang trọng với hoa sen trắng và lư đồng cổ kính'
      },
      {
        url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200',
        caption: 'Không gian hoài niệm với đèn lồng đỏ và kiến trúc mái ngói rêu phong'
      },
      {
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200',
        caption: 'Nét đẹp giao thoa giữa truyền thống và sự tinh tế hiện đại'
      }
    ]
  }
];
