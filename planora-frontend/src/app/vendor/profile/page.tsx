'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  Camera,
  MapPin,
  Phone,
  Mail,
  Award,
  Star,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getVendorProfile,
  updateVendorProfile,
  uploadImage,
  addVendorPortfolio,
  deleteVendorPortfolio,
  getAvailableWeddingStyles,
} from '@/services/vendorProfile';
import type { VendorProfileResponse, PortfolioResponse } from '@/types/vendor';

export default function VendorProfilePage() {
  // Main Data States
  const [profile, setProfile] = useState<VendorProfileResponse | null>(null);
  const [availableStyles, setAvailableStyles] = useState<{ id: number; name: string }[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioResponse[]>([]);

  // Form Edit States
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedStyleIds, setSelectedStyleIds] = useState<number[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload Avatar State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Add Portfolio Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [portfolioImageUrl, setPortfolioImageUrl] = useState('');
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [isSubmittingPortfolio, setIsSubmittingPortfolio] = useState(false);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [profileData, stylesData] = await Promise.all([
          getVendorProfile(),
          getAvailableWeddingStyles(),
        ]);

        setProfile(profileData);
        setAvailableStyles(stylesData);
        setPortfolios(profileData.portfolios || []);

        // Populate form
        setBusinessName(profileData.businessName || '');
        setDescription(profileData.description || '');
        setExperienceYears(profileData.experienceYears || 0);
        setCity(profileData.city || '');
        setDistrict(profileData.district || '');
        setPhone(profileData.phone || '');
        setAvatarUrl(profileData.avatarUrl || '');
        setSelectedStyleIds(profileData.styleIds || []);
      } catch (err: unknown) {
        console.error('Lỗi khi tải hồ sơ vendor:', err);
        setErrorMessage('Không thể tải thông tin hồ sơ. Vui lòng tải lại trang.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle Avatar Upload via Cloudinary
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setErrorMessage(null);
      const res = await uploadImage(file, 'vendors/avatars');
      setAvatarUrl(res.url);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Tải ảnh đại diện thất bại');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Portfolio Image Upload via Cloudinary
  const handlePortfolioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPortfolio(true);
      setErrorMessage(null);
      const res = await uploadImage(file, 'vendors/portfolios');
      setPortfolioImageUrl(res.url);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Tải ảnh tác phẩm thất bại');
    } finally {
      setIsUploadingPortfolio(false);
    }
  };

  // Toggle wedding styles
  const handleToggleStyle = (styleId: number) => {
    setSelectedStyleIds((prev) =>
      prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId]
    );
  };

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMessage('Vui lòng nhập tên thương hiệu cưới của bạn!');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const updated = await updateVendorProfile({
        businessName: businessName.trim(),
        description: description.trim(),
        experienceYears,
        city: city.trim(),
        district: district.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim(),
        styleIds: selectedStyleIds,
      });

      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi khi lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit new portfolio item
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioImageUrl.trim()) {
      setErrorMessage('Vui lòng tải ảnh tác phẩm lên trước khi thêm!');
      return;
    }

    try {
      setIsSubmittingPortfolio(true);
      const newPortfolio = await addVendorPortfolio({
        imageUrl: portfolioImageUrl.trim(),
        title: portfolioTitle.trim() || undefined,
        description: portfolioDesc.trim() || undefined,
      });

      setPortfolios((prev) => [newPortfolio, ...prev]);
      setIsAddModalOpen(false);
      setPortfolioTitle('');
      setPortfolioDesc('');
      setPortfolioImageUrl('');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi khi thêm tác phẩm');
    } finally {
      setIsSubmittingPortfolio(false);
    }
  };

  // Delete portfolio item
  const handleDeletePortfolio = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tác phẩm này khỏi bộ sưu tập?')) return;

    try {
      await deleteVendorPortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa tác phẩm');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm font-serif italic text-stone-500">
            Đang tải dữ liệu hồ sơ thương hiệu...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Top Notification Alerts */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Hồ sơ thương hiệu đã được cập nhật thành công lên Marketplace!</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hero Profile Banner Header */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FAF8F5] to-[#F5EFE6] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar with Cloudinary Upload Overlay */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#FAF8F5] border-2 border-[#D4B896] shadow-md flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-10 h-10 text-[#5D0F12]" />
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Tải ảnh đại diện qua Cloudinary"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Đổi ảnh</span>
                  </>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-widest bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Đối tác Planora
                </span>
                {profile?.verified && (
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Check className="w-3 h-3" /> Đã xác thực
                  </span>
                )}
              </div>

              <h1
                className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#5D0F12] mt-2"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                {businessName || 'Tên Thương Hiệu Cưới'}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-stone-600 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {city || 'Chưa cập nhật địa điểm'}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-stone-400" />
                  {experienceYears} năm kinh nghiệm
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {profile?.ratingAverage || 5.0} ({profile?.totalReviews || 0} đánh giá)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {profile?.id && (
              <a
                href={`/marketplace/${profile.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#D4B896] bg-white text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-[#FAF8F5] transition shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5D0F12]" />
                <span>Xem trên Marketplace</span>
              </a>
            )}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Info Form & Style Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Business Details (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          <form
            onSubmit={handleSaveProfile}
            className="rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6"
          >
            <div>
              <h2
                className="text-lg font-bold uppercase tracking-wide text-neutral-900 border-b border-[#EADCC9]/60 pb-3"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                1. Thông Tin Doanh Nghiệp & Liên Hệ
              </h2>
              <p className="text-xs text-stone-500 italic mt-1 font-serif">
                Các thông tin hiển thị trực tiếp với các cặp dâu rể khi họ tìm kiếm nhà cung cấp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Tên Thương Hiệu Cưới <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ví dụ: Planora Palace, Lalaland Bridal..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Số năm kinh nghiệm
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Hotline / Số điện thoại liên hệ
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Tỉnh / Thành phố hoạt động
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh, Đà Lạt..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Quận / Huyện / Khu vực
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Ví dụ: Hoàn Kiếm, Quận 1..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Giới thiệu câu chuyện thương hiệu & Năng lực
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Chia sẻ về phong cách, triết lý làm nghề và điểm khác biệt mà bạn mang tới cho ngày trọng đại của các cặp đôi..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm transition font-serif leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Lưu thông tin</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Wedding Styles & Verification (Span 1) */}
        <div className="space-y-6">
          {/* Wedding Styles Selection */}
          <div className="rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 space-y-4">
            <div>
              <h2
                className="text-lg font-bold uppercase tracking-wide text-neutral-900"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                2. Phong Cách Cưới Thế Mạnh
              </h2>
              <p className="text-xs text-stone-500 italic mt-1 font-serif">
                Chọn phong cách giúp thuật toán AI Matching ghép nối đúng cặp đôi đang tìm kiếm.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {availableStyles.map((style) => {
                const isSelected = selectedStyleIds.includes(style.id);
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleToggleStyle(style.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#5D0F12] text-[#FFFBF5] shadow-xs'
                        : 'bg-[#FAF8F5] border border-[#EADCC9] text-stone-700 hover:border-[#D4B896]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{style.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="rounded-[1.75rem] border border-[#EADCC9] bg-[#FAF8F5] p-6 space-y-3">
            <h3
              className="text-sm font-bold uppercase tracking-wide text-[#5D0F12]"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              Chỉ Số Hiện Tại
            </h3>
            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex justify-between py-1 border-b border-[#EADCC9]/50">
                <span className="text-stone-500">Trạng thái xác thực:</span>
                <span className="font-semibold text-emerald-700">
                  {profile?.verified ? 'Đã xác thực' : 'Đang duyệt hồ sơ'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EADCC9]/50">
                <span className="text-stone-500">Đánh giá trung bình:</span>
                <span className="font-semibold text-amber-600">
                  ⭐ {profile?.ratingAverage || 5.0} / 5.0
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EADCC9]/50">
                <span className="text-stone-500">Số lượng ảnh Portfolio:</span>
                <span className="font-semibold text-neutral-900">{portfolios.length} tác phẩm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Portfolio Showcase Gallery with Cloudinary */}
      <section
        id="portfolios"
        className="rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADCC9]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2
                className="text-xl font-bold uppercase tracking-wide text-neutral-900"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                3. Bộ Sưu Tập Tác Phẩm (Portfolio Showcase)
              </h2>
              <span className="text-xs bg-[#5D0F12]/10 text-[#5D0F12] font-semibold px-2 py-0.5 rounded-full">
                {portfolios.length} ảnh
              </span>
            </div>
            <p className="text-xs text-stone-500 italic mt-1 font-serif">
              Hình ảnh thực tế từ các hôn lễ đã thực hiện được tải trực tiếp lên Cloudinary chất lượng cao.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm ảnh mới</span>
          </button>
        </div>

        {/* Gallery Grid */}
        {portfolios.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#EADCC9] bg-[#FAF8F5]/60 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-stone-400 border border-[#EADCC9] shadow-xs">
              <Camera className="w-6 h-6 text-[#5D0F12]" />
            </div>
            <p className="text-sm font-semibold text-stone-700">Chưa có tác phẩm nào trong bộ sưu tập</p>
            <p className="text-xs text-stone-500 max-w-sm">
              Hãy tải lên những bức ảnh đẹp nhất để dâu rể có cái nhìn rõ nét và tin tưởng chọn bạn cho ngày cưới của họ.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D4B896] bg-white text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-[#FAF8F5] transition"
            >
              <Upload className="w-3.5 h-3.5 text-[#5D0F12]" />
              <span>Tải ảnh lên ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {portfolios.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-[#EADCC9] bg-[#FAF8F5] shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-stone-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title || 'Portfolio item'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <span className="text-[11px] text-white font-medium truncate max-w-[80%]">
                      {item.title || 'Tác phẩm tiệc cưới'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition"
                      title="Xóa tác phẩm này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {item.title && (
                  <div className="p-3">
                    <p className="text-xs font-semibold text-stone-800 truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{item.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal: Thêm tác phẩm mới vào Portfolio */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-[1.75rem] border border-[#EADCC9] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF8F5] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3
                className="text-xl font-bold uppercase tracking-wide text-[#5D0F12]"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                Thêm Tác Phẩm Vào Bộ Sưu Tập
              </h3>
              <p className="text-xs text-stone-500 mt-1 font-serif italic">
                Ảnh sẽ được tối ưu và tải trực tiếp lên Cloudinary.
              </p>
            </div>

            <form onSubmit={handleAddPortfolio} className="space-y-4">
              {/* Image Uploader & Preview Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Hình ảnh tác phẩm <span className="text-rose-600">*</span>
                </label>

                {portfolioImageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#EADCC9] aspect-16/9 bg-[#FAF8F5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={portfolioImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPortfolioImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                      title="Chọn ảnh khác"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => portfolioInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-[#D4B896] hover:border-[#5D0F12] rounded-2xl p-6 text-center bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition flex flex-col items-center justify-center gap-2"
                  >
                    {isUploadingPortfolio ? (
                      <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-[#5D0F12]" />
                        <span className="text-xs font-semibold text-stone-800">
                          Nhấn vào đây để tải ảnh lên Cloudinary
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Hỗ trợ JPG, PNG, WEBP tối đa 10MB
                        </span>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePortfolioFileChange}
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Tiêu đề tác phẩm / Concept
                </label>
                <input
                  type="text"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  placeholder="Ví dụ: Lễ cưới ngoài trời tại Đà Lạt..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Mô tả ngắn gọn
                </label>
                <input
                  type="text"
                  value={portfolioDesc}
                  onChange={(e) => setPortfolioDesc(e.target.value)}
                  placeholder="Ví dụ: Tone màu trắng kem thanh lịch, tiệc cưới 200 khách..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#D4B896] text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-[#FAF8F5] transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!portfolioImageUrl || isSubmittingPortfolio}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingPortfolio ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu tác phẩm</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

