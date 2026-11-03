'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const VendorAvatarModal = dynamic(() => import('@/components/vendor/VendorAvatarModal'), {
  ssr: false,
});
import {
  Store,
  Camera,
  MapPin,
  Award,
  Star,
  Save,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Images,
  ArrowRight,
} from 'lucide-react';
import {
  getVendorProfile,
  updateVendorProfile,
  updateVendorAvatar,
  uploadImage,
  getAvailableWeddingStyles,
} from '@/services/vendorProfile';
import type { VendorProfileResponse } from '@/types/vendor';

function isOptimizableImage(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const host = new URL(url).hostname;
    return (
      host.includes('images.unsplash.com') ||
      host.includes('res.cloudinary.com') ||
      host.includes('lh3.googleusercontent.com')
    );
  } catch {
    return false;
  }
}

export default function VendorProfilePage() {
  // Main Data States
  const [profile, setProfile] = useState<VendorProfileResponse | null>(null);
  const [availableStyles, setAvailableStyles] = useState<{ id: number; name: string }[]>([]);

  // Form Edit States
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedStyleIds, setSelectedStyleIds] = useState<number[]>([]);

  // UI Feedback States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload Avatar State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

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

  // Open Avatar Modal
  const handleOpenAvatarModal = () => {
    setTempAvatarUrl(avatarUrl);
    setIsAvatarModalOpen(true);
  };

  // Handle avatar file selection inside Modal
  const handleModalAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setErrorMessage(null);
      const res = await uploadImage(file, 'vendors/avatars');
      setTempAvatarUrl(res.url);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Tải ảnh lên thất bại');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save Avatar from Modal
  const handleSaveAvatarModal = async () => {
    try {
      setIsSavingAvatar(true);
      const updated = await updateVendorAvatar(tempAvatarUrl || null);
      setAvatarUrl(tempAvatarUrl);
      setProfile(updated);
      setIsAvatarModalOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Cập nhật ảnh đại diện thất bại');
    } finally {
      setIsSavingAvatar(false);
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
        avatarUrl: avatarUrl.trim() || undefined,
        styleIds: selectedStyleIds,
      });

      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại');
    } finally {
      setIsSaving(false);
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FAF8F5] to-[#F5EFE6] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar with Upload Overlay & Badge */}
            <div className="relative group">
              <div
                onClick={handleOpenAvatarModal}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#FAF8F5] border-2 border-[#D4B896] shadow-md flex items-center justify-center shrink-0 cursor-pointer relative"
                title="Nhấp để chỉnh sửa ảnh đại diện"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={businessName}
                    fill
                    sizes="112px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={!isOptimizableImage(avatarUrl)}
                    priority
                  />
                ) : (
                  <Store className="w-10 h-10 text-[#5D0F12]" />
                )}
              </div>

              {/* Upload Overlay Button on Hover */}
              <button
                type="button"
                onClick={handleOpenAvatarModal}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Chỉnh sửa ảnh đại diện"
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

              {/* Prominent Camera Badge Button */}
              <button
                type="button"
                onClick={handleOpenAvatarModal}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] border-2 border-white shadow-md flex items-center justify-center transition active:scale-95 cursor-pointer z-10"
                title="Chỉnh sửa ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
              </button>
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
                className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-neutral-900 mt-2"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                {businessName || 'Thương hiệu cưới của bạn'}
              </h1>

              {/* Edit Avatar Quick Button */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={handleOpenAvatarModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D4B896] bg-white text-[11px] font-bold uppercase tracking-wider text-stone-700 hover:bg-[#FAF8F5] transition shadow-2xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#5D0F12]" />
                  <span>Đổi ảnh đại diện</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-stone-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5D0F12]" />
                  <span>{city ? `${district ? `${district}, ` : ''}${city}` : 'Chưa cập nhật địa điểm'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#5D0F12]" />
                  <span>{experienceYears} năm kinh nghiệm</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-neutral-900">
                    {profile?.ratingAverage ? profile.ratingAverage.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-stone-400">({profile?.totalReviews || 0} đánh giá)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Profile Form Details */}
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
            <h2
              className="text-xl font-bold uppercase tracking-wide text-neutral-900 border-b border-[#EADCC9]/60 pb-3"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              1. Thông Tin Thương Hiệu
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Tên thương hiệu cưới <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ví dụ: Rosy Floral Studio"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Giới thiệu câu chuyện thương hiệu
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả phong cách, sự tâm huyết và những điểm khác biệt của bạn khi đồng hành cùng các cặp đôi..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Số năm kinh nghiệm
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Tỉnh / Thành phố
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Ví dụ: Quận 1, Ba Đình..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Settings: Styles & Dedicated Portfolio Link */}
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 space-y-4">
            <h3
              className="text-base font-bold uppercase tracking-wide text-neutral-900 border-b border-[#EADCC9]/60 pb-2"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              2. Phong Cách Cưới Phục Vụ
            </h3>
            <p className="text-xs text-stone-500 font-serif italic">
              Chọn các phong cách chủ đạo để thuật toán ghép cặp AI kết nối với cô dâu chú rể phù hợp nhất.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
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
          </section>

          {/* Quick Nav Card to Dedicated Portfolio Page */}
          <div className="rounded-[1.75rem] border border-[#EADCC9] bg-[#FAF8F5] p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Images className="w-5 h-5 text-[#5D0F12]" />
              <h3
                className="text-sm font-bold uppercase tracking-wide text-[#5D0F12]"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                Bộ Sưu Tập & Portfolio
              </h3>
            </div>
            <p className="text-xs text-stone-600 font-serif italic leading-relaxed">
              Các album ảnh tiệc cưới thực tế, phóng sự cưới và concept decor đã được chuyển sang trang quản lý riêng biệt.
            </p>
            <Link
              href="/vendor/portfolio"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-sm transition cursor-pointer"
            >
              <span>Quản Lý Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </form>

      {/* MODAL: CHỈNH SỬA ẢNH ĐẠI DIỆN CLOUDINARY */}
      <VendorAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        tempAvatarUrl={tempAvatarUrl}
        setTempAvatarUrl={setTempAvatarUrl}
        isUploadingAvatar={isUploadingAvatar}
        isSavingAvatar={isSavingAvatar}
        onFileChange={handleModalAvatarFileChange}
        onSave={handleSaveAvatarModal}
      />
    </div>
  );
}
