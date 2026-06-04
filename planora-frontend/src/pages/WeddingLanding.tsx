import React, { useState } from 'react';
import { Heart, Calendar, Users, Sparkles, ChevronRight, Star, ArrowDown } from 'lucide-react';

export const WeddingLanding: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const services = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Lập kế hoạch toàn diện',
      description: 'Từ hôn lễ đến tiệc cưới, chúng tôi xử lý mọi chi tiết từ A đến Z.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Quản lý khách mời',
      description: 'Theo dõi RSVP, quản lý danh sách chỗ ngồi và liên lạc với khách.'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Thiết kế & trang trí',
      description: 'Tạo không gian đám cưới mơ ước của bạn với các ý tưởng sáng tạo.'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Điều phối ngày trọng',
      description: 'Đội ngũ chuyên nghiệp của chúng tôi sẽ đảm bảo mọi điều diễn ra hoàn hảo.'
    }
  ];

  const testimonials = [
    {
      name: 'Anh Linh & Chị Hương',
      date: 'Tháng 9, 2025',
      quote: 'Planora đã biến giấc mơ đám cưới của chúng tôi thành hiện thực. Từng chi tiết đều hoàn hảo!'
    },
    {
      name: 'Anh Minh & Chị Tuyết',
      date: 'Tháng 8, 2025',
      quote: 'Dịch vụ tuyệt vời! Họ rất chuyên nghiệp, chu đáo và dễ gần. Chúng tôi vô cùng hài lòng.'
    },
    {
      name: 'Anh Đức & Chị Lan',
      date: 'Tháng 7, 2025',
      quote: 'Cảm ơn Planora vì đã biến ngày đặc biệt của chúng tôi thành một kỷ niệm đáng nhớ.'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col overflow-x-hidden">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-hairline">
        <nav className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-burgundy flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-cream" />
            </div>
            <span className="text-lg font-bold font-display text-burgundy">Planora</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-body-text hover:text-burgundy transition-editorial">Dịch vụ</a>
            <a href="#gallery" className="text-sm text-body-text hover:text-burgundy transition-editorial">Thư viện</a>
            <a href="#testimonials" className="text-sm text-body-text hover:text-burgundy transition-editorial">Đánh giá</a>
            <a href="#contact" className="text-sm text-body-text hover:text-burgundy transition-editorial">Liên hệ</a>
          </div>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-cream bg-burgundy hover:bg-maroon transition-editorial">
            Đặt lịch hẹn
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-cream border border-champagne">
              <Star className="w-4 h-4 text-burgundy" />
              <span className="text-xs font-medium text-burgundy">PLANORA TEAM</span>
            </div>
            <div>
              <h1 className="text-6xl md:text-7xl font-display font-bold text-gold leading-tight mb-2">
                PLANORA
              </h1>
              <p className="text-3xl md:text-4xl font-serif italic text-burgundy">
                Wedding platform
              </p>
            </div>
            <p className="text-lg text-body-text leading-relaxed text-pretty pt-4">
              Planora giúp bạn lập kế hoạch đám cưới mơ ước một cách dễ dàng. Từ lựa chọn địa điểm đến quản lý khách mời, chúng tôi sẽ hỗ trợ bạn từng bước.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-6 py-3 rounded-lg text-white bg-burgundy hover:bg-maroon transition-editorial font-medium text-sm flex items-center justify-center gap-2">
                Bắt đầu lập kế hoạch
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="px-6 py-3 rounded-lg text-burgundy border border-burgundy bg-transparent hover:bg-cream transition-editorial font-medium text-sm">
                Xem bộ sưu tập
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="/wedding-hero.png" 
              alt="Cặp đôi vui vẻ ngày cưới" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-burgundy/40 to-transparent" />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-5 h-5 text-burgundy" />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-surface-soft">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-burgundy mb-4 text-balance">
              Dịch vụ toàn diện
            </h2>
            <p className="text-lg text-body-text max-w-2xl mx-auto">
              Chúng tôi cung cấp mọi thứ bạn cần để tổ chức một đám cưới hoàn hảo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div 
                key={idx} 
                className="p-8 rounded-lg bg-canvas border border-hairline hover:border-burgundy hover:shadow-lg transition-editorial group"
              >
                <div className="text-burgundy mb-4 group-hover:scale-110 transition-editorial">
                  {service.icon}
                </div>
                <h3 className="font-display font-semibold text-burgundy mb-2 text-balance">{service.title}</h3>
                <p className="text-sm text-muted-text leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-burgundy mb-4 text-balance">
              Thư viện cảm hứng
            </h2>
            <p className="text-lg text-body-text max-w-2xl mx-auto">
              Khám phá những đám cưới đã tổ chức
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer">
              <img 
                src="/wedding-planning.png" 
                alt="Chi tiết lập kế hoạch đám cưới" 
                className="w-full h-full object-cover group-hover:scale-105 transition-editorial duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-deep-burgundy/60 flex items-end p-8">
                <h3 className="text-gold font-display font-semibold text-xl">Lập kế hoạch chi tiết</h3>
              </div>
            </div>
            <div className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer">
              <img 
                src="/wedding-venue.png" 
                alt="Địa điểm cưới được trang trí" 
                className="w-full h-full object-cover group-hover:scale-105 transition-editorial duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-deep-burgundy/60 flex items-end p-8">
                <h3 className="text-gold font-display font-semibold text-xl">Trang trí địa điểm</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-surface-soft">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-burgundy mb-4 text-balance">
              Những câu chuyện từ các cặp đôi
            </h2>
            <p className="text-lg text-body-text max-w-2xl mx-auto">
              Nghe từ những cặp đôi đã trải nghiệm dịch vụ Planora
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx} 
                className="p-8 rounded-lg bg-canvas border border-hairline hover:border-burgundy transition-editorial"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-body-text mb-6 leading-relaxed italic font-serif">"{testimonial.quote}"</p>
                <div className="border-t border-hairline pt-4">
                  <p className="font-semibold text-burgundy text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-text">{testimonial.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-burgundy to-maroon text-cream">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gold text-balance">
            Bắt đầu hành trình cưới của bạn
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Hãy để Planora biến giấc mơ đám cưới của bạn thành hiện thực
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg bg-cream/20 border border-cream/40 text-cream placeholder-cream/60 focus:outline-none focus:border-cream/80 transition-editorial"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-gold text-burgundy font-semibold hover:bg-champagne transition-editorial whitespace-nowrap"
            >
              Đăng ký
            </button>
          </form>

          {submitted && (
            <p className="mt-4 text-sm opacity-90">✓ Cảm ơn! Chúng tôi sẽ sớm liên hệ với bạn.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-champagne py-12 border-t border-surface-strong">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display font-semibold mb-4 text-gold">Planora</h3>
              <p className="text-sm opacity-70">Biến giấc mơ đám cưới thành hiện thực.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-gold">Dịch vụ</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><a href="#" className="hover:text-champagne transition-editorial">Lập kế hoạch</a></li>
                <li><a href="#" className="hover:text-champagne transition-editorial">Thiết kế</a></li>
                <li><a href="#" className="hover:text-champagne transition-editorial">Quản lý khách</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-gold">Công ty</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><a href="#" className="hover:text-champagne transition-editorial">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-champagne transition-editorial">Blog</a></li>
                <li><a href="#" className="hover:text-champagne transition-editorial">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-gold">Pháp lý</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><a href="#" className="hover:text-champagne transition-editorial">Chính sách riêng tư</a></li>
                <li><a href="#" className="hover:text-champagne transition-editorial">Điều khoản sử dụng</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm opacity-70">
            <p>© 2026 Planora Wedding Planner. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
