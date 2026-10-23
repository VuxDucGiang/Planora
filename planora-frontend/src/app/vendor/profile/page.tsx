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
  Images,
  FolderPlus,
  Edit2,
  Eye,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getVendorProfile,
  updateVendorProfile,
  updateVendorAvatar,
  uploadImage,
  getAvailableWeddingStyles,
  getVendorCollections,
  createVendorCollection,
  updateVendorCollection,
  deleteVendorCollection,
  addCollectionImage,
  deleteCollectionImage,
} from '@/services/vendorProfile';
import type {
  VendorProfileResponse,
  CollectionResponse,
  CollectionImageResponse,
} from '@/types/vendor';

export default function VendorProfilePage() {
  // Main Data States
  const [profile, setProfile] = useState<VendorProfileResponse | null>(null);
  const [availableStyles, setAvailableStyles] = useState<{ id: number; name: string }[]>([]);
  const [collections, setCollections] = useState<CollectionResponse[]>([]);

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
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const modalAvatarInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // MULTI-ALBUM COLLECTION STATES
  // ==========================================

  // Active Collection for Detail / Image Manager Modal
  const [activeCollection, setActiveCollection] = useState<CollectionResponse | null>(null);

  // Create Collection Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColCoverUrl, setNewColCoverUrl] = useState('');
  const [isUploadingColCover, setIsUploadingColCover] = useState(false);
  const [isSubmittingCol, setIsSubmittingCol] = useState(false);
  const colCoverInputRef = useRef<HTMLInputElement>(null);

  // Edit Collection Modal State
  const [editingCollection, setEditingCollection] = useState<CollectionResponse | null>(null);
  const [editColTitle, setEditColTitle] = useState('');
  const [editColDesc, setEditColDesc] = useState('');
  const [isSubmittingEditCol, setIsSubmittingEditCol] = useState(false);

  // Add Image to Active Collection State
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgTitle, setNewImgTitle] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingImage, setIsSubmittingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Preview
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [profileData, stylesData, collectionsData] = await Promise.all([
          getVendorProfile(),
          getAvailableWeddingStyles(),
          getVendorCollections().catch(() => []),
        ]);

        setProfile(profileData);
        setAvailableStyles(stylesData);
        setCollections(collectionsData || profileData.collections || []);

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

  // Handle direct avatar change via input & auto save
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setErrorMessage(null);
      const res = await uploadImage(file, 'vendors/avatars');
      const updated = await updateVendorAvatar(res.url);
      setAvatarUrl(res.url);
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Tải ảnh đại diện thất bại');
    } finally {
      setIsUploadingAvatar(false);
    }
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
      setErrorMessage(err instanceof Error ? err.message : 'Tải ảnh lên Cloudinary thất bại');
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

  // ==========================================
  // COLLECTION ACTIONS
  // ==========================================

  // Upload Cover Image for new collection
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingColCover(true);
      setErrorMessage(null);
      const res = await uploadImage(file, 'vendors/portfolios');
      setNewColCoverUrl(res.url);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Tải ảnh bìa thất bại');
    } finally {
      setIsUploadingColCover(false);
    }
  };

  // Create Collection Submit
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) {
      alert('Vui lòng nhập tên bộ sưu tập!');
      return;
    }

    try {
      setIsSubmittingCol(true);
      const created = await createVendorCollection({
        title: newColTitle.trim(),
        description: newColDesc.trim() || undefined,
        coverImageUrl: newColCoverUrl.trim() || undefined,
      });

      setCollections((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewColTitle('');
      setNewColDesc('');
      setNewColCoverUrl('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi tạo bộ sưu tập');
    } finally {
      setIsSubmittingCol(false);
    }
  };

  // Open Edit Collection
  const openEditCollection = (col: CollectionResponse) => {
    setEditingCollection(col);
    setEditColTitle(col.title);
    setEditColDesc(col.description || '');
  };

  // Update Collection Submit
  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection || !editColTitle.trim()) return;

    try {
      setIsSubmittingEditCol(true);
      const updated = await updateVendorCollection(editingCollection.id, {
        title: editColTitle.trim(),
        description: editColDesc.trim() || undefined,
      });

      setCollections((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, title: updated.title, description: updated.description } : c))
      );

      if (activeCollection && activeCollection.id === updated.id) {
        setActiveCollection((prev) => (prev ? { ...prev, title: updated.title, description: updated.description } : null));
      }

      setEditingCollection(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật bộ sưu tập');
    } finally {
      setIsSubmittingEditCol(false);
    }
  };

  // Delete Entire Collection (Cascade)
  const handleDeleteCollection = async (col: CollectionResponse) => {
    const imagesCount = col.imagesCount || col.images?.length || 0;
    const confirmMessage = `Bạn có chắc chắn muốn xóa bộ sưu tập "${col.title}"?\nToàn bộ ${imagesCount} hình ảnh bên trong bộ sưu tập này sẽ bị xóa hoàn toàn!`;

    if (!confirm(confirmMessage)) return;

    try {
      await deleteVendorCollection(col.id);
      setCollections((prev) => prev.filter((c) => c.id !== col.id));
      if (activeCollection && activeCollection.id === col.id) {
        setActiveCollection(null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa bộ sưu tập');
    }
  };

  // Upload Image for Active Collection
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setErrorMessage(null);
      const res = await uploadImage(file, 'vendors/portfolios');
      setNewImgUrl(res.url);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Tải ảnh thất bại');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Add Image to Collection
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCollection || !newImgUrl.trim()) {
      alert('Vui lòng tải ảnh lên trước khi lưu!');
      return;
    }

    try {
      setIsSubmittingImage(true);
      const addedImg = await addCollectionImage(activeCollection.id, {
        imageUrl: newImgUrl.trim(),
        title: newImgTitle.trim() || undefined,
      });

      // Update activeCollection images
      const updatedImages = [addedImg, ...(activeCollection.images || [])];
      const updatedCover = activeCollection.coverImageUrl || addedImg.imageUrl;
      const updatedCount = (activeCollection.imagesCount || 0) + 1;

      const updatedCol: CollectionResponse = {
        ...activeCollection,
        images: updatedImages,
        imagesCount: updatedCount,
        coverImageUrl: updatedCover,
      };

      setActiveCollection(updatedCol);
      setCollections((prev) =>
        prev.map((c) => (c.id === updatedCol.id ? updatedCol : c))
      );

      // Reset
      setNewImgUrl('');
      setNewImgTitle('');
      setIsAddImageOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi thêm ảnh vào bộ sưu tập');
    } finally {
      setIsSubmittingImage(false);
    }
  };

  // Delete single Image from Collection
  const handleDeleteImage = async (collectionId: number, imageId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hình ảnh này khỏi bộ sưu tập?')) return;

    try {
      await deleteCollectionImage(collectionId, imageId);

      if (activeCollection && activeCollection.id === collectionId) {
        const remainingImages = (activeCollection.images || []).filter((img) => img.id !== imageId);
        const newCover = remainingImages.length > 0 ? remainingImages[0].imageUrl : undefined;
        const updatedCount = Math.max(0, (activeCollection.imagesCount || 1) - 1);

        const updatedCol: CollectionResponse = {
          ...activeCollection,
          images: remainingImages,
          imagesCount: updatedCount,
          coverImageUrl: newCover,
        };

        setActiveCollection(updatedCol);
        setCollections((prev) =>
          prev.map((c) => (c.id === updatedCol.id ? updatedCol : c))
        );
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa ảnh');
    }
  };

  const totalAllImages = collections.reduce((acc, c) => acc + (c.imagesCount || c.images?.length || 0), 0);

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
            {/* Avatar with Cloudinary Upload Overlay & Badge */}
            <div className="relative group">
              <div
                onClick={handleOpenAvatarModal}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#FAF8F5] border-2 border-[#D4B896] shadow-md flex items-center justify-center shrink-0 cursor-pointer"
                title="Nhấp để chỉnh sửa ảnh đại diện"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                title="Chỉnh sửa ảnh đại diện qua Cloudinary"
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

              {/* Prominent Camera Badge Button (Always visible on bottom-right) */}
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

        {/* Sidebar Settings: Styles & Quick Stats */}
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

          <div className="rounded-[1.75rem] border border-[#EADCC9] bg-[#FAF8F5] p-6 space-y-3">
            <h3
              className="text-sm font-bold uppercase tracking-wide text-[#5D0F12]"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              Chỉ Số Bộ Sưu Tập
            </h3>
            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex justify-between py-1 border-b border-[#EADCC9]/50">
                <span className="text-stone-500">Số lượng bộ sưu tập:</span>
                <span className="font-semibold text-neutral-900">{collections.length} album</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EADCC9]/50">
                <span className="text-stone-500">Tổng số hình ảnh:</span>
                <span className="font-semibold text-[#5D0F12]">{totalAllImages} tác phẩm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EADCC9]/50">
                <span className="text-stone-500">Đánh giá trung bình:</span>
                <span className="font-semibold text-amber-600">
                  ⭐ {profile?.ratingAverage ? profile.ratingAverage.toFixed(1) : '5.0'} / 5.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ============================================================== */}
      {/* SECTION 3: MULTI-ALBUM PORTFOLIO SHOWCASE                      */}
      {/* ============================================================== */}
      <section
        id="portfolios"
        className="rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADCC9]/60 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EADCC9] shadow-2xs mb-2">
              <Images className="w-3.5 h-3.5 text-[#5D0F12]" />
              <span className="font-serif tracking-widest text-[11px] font-bold uppercase text-[#5D0F12]">
                Albums & Showcase Gallery
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-neutral-900"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              3. Bộ Sưu Tập Tác Phẩm
            </h2>
            <p className="text-xs text-stone-500 italic mt-1 font-serif">
              Tạo nhiều bộ sưu tập theo từng concept cưới, mỗi bộ sưu tập chứa nhiều hình ảnh tác phẩm chân thực.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition cursor-pointer self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Tạo Bộ Sưu Tập Mới</span>
          </button>
        </div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#EADCC9] bg-[#FAF8F5]/60 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-stone-400 border border-[#EADCC9] shadow-xs">
              <Images className="w-6 h-6 text-[#5D0F12]" />
            </div>
            <p className="text-sm font-semibold text-stone-700">Chưa có bộ sưu tập tác phẩm nào</p>
            <p className="text-xs text-stone-500 max-w-sm">
              Hãy tạo bộ sưu tập đầu tiên (ví dụ: &quot;Tiệc cưới ngoài trời&quot;, &quot;Concept Vintage&quot;...) và tải ảnh các hôn lễ đã thực hiện lên để dâu rể chiêm ngưỡng.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-[#D4B896] bg-white text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-[#FAF8F5] transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#5D0F12]" />
              <span>Tạo bộ sưu tập đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => {
              const count = col.imagesCount || col.images?.length || 0;
              const cover = col.coverImageUrl || (col.images && col.images.length > 0 ? col.images[0].imageUrl : null);

              return (
                <div
                  key={col.id}
                  className="group rounded-2xl overflow-hidden border border-[#EADCC9] bg-[#FAF8F5] hover:bg-white shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Album Cover */}
                  <div
                    onClick={() => setActiveCollection(col)}
                    className="relative aspect-16/10 w-full overflow-hidden bg-stone-100 cursor-pointer"
                  >
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={col.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#FAF8F5] text-stone-400">
                        <ImageIcon className="w-10 h-10 stroke-1" />
                        <span className="text-xs font-serif italic">Chưa có hình ảnh</span>
                      </div>
                    )}

                    {/* Image count pill */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{count} ảnh</span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-xs text-white font-semibold flex items-center gap-1.5">
                        <Eye className="w-4 h-4" /> Nhấp để xem và quản lý ảnh
                      </span>
                    </div>
                  </div>

                  {/* Album Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3
                        className="text-base font-bold text-neutral-900 group-hover:text-[#5D0F12] transition line-clamp-1"
                        style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                      >
                        {col.title}
                      </h3>
                      {col.description && (
                        <p className="text-xs text-stone-500 font-serif italic line-clamp-2 mt-1">
                          {col.description}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-[#EADCC9]/50 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveCollection(col)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5D0F12] hover:underline cursor-pointer"
                      >
                        <span>Quản lý ảnh ({count})</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditCollection(col)}
                          className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-600 hover:text-neutral-900 transition"
                          title="Sửa tên / mô tả bộ sưu tập"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollection(col)}
                          className="p-1.5 rounded-full hover:bg-rose-100 text-stone-400 hover:text-rose-700 transition"
                          title="Xóa hẳn bộ sưu tập này (xóa luôn tất cả ảnh bên trong)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* MODAL 1: VIEW & MANAGE IMAGES IN ACTIVE COLLECTION             */}
      {/* ============================================================== */}
      {activeCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-[#EADCC9] shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 relative my-8">
            <button
              onClick={() => {
                setActiveCollection(null);
                setIsAddImageOpen(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF8F5] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADCC9]/70 pb-4 pr-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5D0F12] bg-[#5D0F12]/10 px-2.5 py-0.5 rounded-full">
                  Bộ Sưu Tập Tác Phẩm
                </span>
                <h3
                  className="text-2xl font-bold uppercase tracking-wide text-neutral-900 mt-1"
                  style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                >
                  {activeCollection.title}
                </h3>
                {activeCollection.description && (
                  <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                    {activeCollection.description}
                  </p>
                )}
                <p className="text-[11px] text-stone-400 mt-1">
                  Đang có {activeCollection.images?.length || 0} hình ảnh trong album
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddImageOpen(!isAddImageOpen)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-sm transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddImageOpen ? 'Đóng form tải' : 'Thêm ảnh mới'}</span>
              </button>
            </div>

            {/* Form Tải Ảnh Mới vào Album */}
            {isAddImageOpen && (
              <form onSubmit={handleAddImage} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EADCC9] space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5D0F12]">
                  Tải Ảnh Mới Lên Bộ Sưu Tập Này
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {newImgUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-[#EADCC9] aspect-16/10 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={newImgUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewImgUrl('')}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="cursor-pointer border-2 border-dashed border-[#D4B896] hover:border-[#5D0F12] rounded-xl p-5 text-center bg-white hover:bg-[#FAF8F5] transition flex flex-col items-center justify-center gap-2 aspect-16/10"
                      >
                        {isUploadingImage ? (
                          <Loader2 className="w-7 h-7 animate-spin text-[#5D0F12]" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-[#5D0F12]" />
                            <span className="text-xs font-semibold text-stone-800">
                              Chọn ảnh để tải lên Cloudinary
                            </span>
                            <span className="text-[10px] text-stone-400">JPG, PNG, WEBP (tối đa 10MB)</span>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                  </div>

                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Tiêu đề / Chú thích ảnh (tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={newImgTitle}
                        onChange={(e) => setNewImgTitle(e.target.value)}
                        placeholder="Ví dụ: Bàn tiệc hoa hồng, Cô dâu chú rể..."
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EADCC9] bg-white text-xs font-medium focus:ring-2 focus:ring-[#5D0F12]/30 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddImageOpen(false);
                          setNewImgUrl('');
                        }}
                        className="px-4 py-2 rounded-full border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={!newImgUrl || isSubmittingImage}
                        className="px-5 py-2 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingImage ? 'Đang lưu...' : 'Lưu ảnh vào album'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Images Grid */}
            {(!activeCollection.images || activeCollection.images.length === 0) ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#EADCC9] bg-[#FAF8F5]/60 flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-stone-400" />
                <p className="text-xs font-semibold text-stone-700">Bộ sưu tập này chưa có hình ảnh nào</p>
                <button
                  type="button"
                  onClick={() => setIsAddImageOpen(true)}
                  className="mt-1 text-xs text-[#5D0F12] font-bold hover:underline"
                >
                  + Tải ảnh đầu tiên ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {activeCollection.images.map((img: CollectionImageResponse) => (
                  <div
                    key={img.id}
                    className="group relative rounded-xl overflow-hidden border border-[#EADCC9] aspect-square bg-[#FAF8F5] shadow-2xs hover:shadow-md transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.imageUrl}
                      alt={img.title || 'Ảnh bộ sưu tập'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 text-white">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(activeCollection.id, img.id)}
                          className="p-1.5 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white transition"
                          title="Xóa ảnh này khỏi bộ sưu tập"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div
                        onClick={() => setPreviewImageUrl(img.imageUrl)}
                        className="cursor-pointer"
                      >
                        {img.title && <p className="text-[11px] font-semibold truncate">{img.title}</p>}
                        <span className="text-[10px] text-white/80 inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Phóng to
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: TẠO BỘ SƯU TẬP MỚI                                   */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] border border-[#EADCC9] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF8F5] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3
                className="text-xl font-bold uppercase tracking-wide text-[#5D0F12]"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                Tạo Bộ Sưu Tập Mới
              </h3>
              <p className="text-xs text-stone-500 mt-1 font-serif italic">
                Tạo một album riêng biệt để dâu rể dễ dàng theo dõi theo từng chủ đề hoặc đám cưới thực tế.
              </p>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Tên bộ sưu tập <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  placeholder="Ví dụ: Lễ Cưới Sân Vườn Vintage tại Đà Lạt..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Mô tả concept / bối cảnh
                </label>
                <textarea
                  rows={3}
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="Mô tả ngắn về tông màu chủ đạo, số lượng khách hoặc cảm hứng thiết kế..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Ảnh bìa đại diện album (tùy chọn)
                </label>
                {newColCoverUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#EADCC9] aspect-16/9 bg-[#FAF8F5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={newColCoverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewColCoverUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => colCoverInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-[#D4B896] hover:border-[#5D0F12] rounded-xl p-4 text-center bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition flex flex-col items-center justify-center gap-1.5"
                  >
                    {isUploadingColCover ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#5D0F12]" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-[#5D0F12]" />
                        <span className="text-xs font-semibold text-stone-700">Tải ảnh bìa lên Cloudinary</span>
                        <span className="text-[10px] text-stone-400">Nếu để trống, ảnh đầu tiên được thêm sẽ làm bìa</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={colCoverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileChange}
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#EADCC9]/50">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#D4B896] text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-[#FAF8F5] transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newColTitle.trim() || isSubmittingCol}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingCol ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <span>Tạo Bộ Sưu Tập</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: SỬA THÔNG TIN BỘ SƯU TẬP                              */}
      {/* ============================================================== */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] border border-[#EADCC9] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => setEditingCollection(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF8F5] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3
                className="text-xl font-bold uppercase tracking-wide text-[#5D0F12]"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                Chỉnh Sửa Bộ Sưu Tập
              </h3>
            </div>

            <form onSubmit={handleUpdateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Tên bộ sưu tập <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={editColTitle}
                  onChange={(e) => setEditColTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Mô tả concept
                </label>
                <textarea
                  rows={3}
                  value={editColDesc}
                  onChange={(e) => setEditColDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#EADCC9]/50">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="px-5 py-2.5 rounded-full border border-[#D4B896] text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-[#FAF8F5] transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!editColTitle.trim() || isSubmittingEditCol}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingEditCol ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: CHỈNH SỬA ẢNH ĐẠI DIỆN CLOUDINARY                     */}
      {/* ============================================================== */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] border border-[#EADCC9] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF8F5] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EADCC9] shadow-2xs mb-2">
                <Camera className="w-3.5 h-3.5 text-[#5D0F12]" />
                <span className="font-serif tracking-widest text-[10px] font-bold uppercase text-[#5D0F12]">
                  Cloudinary Avatar Uploader
                </span>
              </div>
              <h3
                className="text-xl font-bold uppercase tracking-wide text-neutral-900"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                Ảnh Đại Diện Thương Hiệu
              </h3>
              <p className="text-xs text-stone-500 mt-1 font-serif italic">
                Tải ảnh đại diện sắc nét lên Cloudinary để hiển thị nổi bật trên Marketplace và trong các cuộc hội thoại.
              </p>
            </div>

            {/* Avatar Circular Preview */}
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-[#FAF8F5] border-4 border-[#D4B896] shadow-lg flex items-center justify-center relative">
                {tempAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tempAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-12 h-12 text-[#5D0F12]" />
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FFFBF5]" />
                  </div>
                )}
              </div>
              {tempAvatarUrl && (
                <button
                  type="button"
                  onClick={() => setTempAvatarUrl('')}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer"
                >
                  Xóa ảnh này (đặt về mặc định)
                </button>
              )}
            </div>

            {/* Cloudinary Upload Box */}
            <div>
              <div
                onClick={() => modalAvatarInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-[#D4B896] hover:border-[#5D0F12] rounded-2xl p-5 text-center bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition flex flex-col items-center justify-center gap-2"
              >
                {isUploadingAvatar ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-7 h-7 animate-spin text-[#5D0F12]" />
                    <span className="text-xs font-semibold text-stone-800">Đang tối ưu & tải ảnh lên Cloudinary...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-[#5D0F12]" />
                    <span className="text-xs font-semibold text-stone-800">
                      Nhấn để chọn ảnh từ máy tính
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Hỗ trợ JPG, PNG, WEBP (tự động tối ưu qua Cloudinary)
                    </span>
                  </>
                )}
              </div>

              <input
                ref={modalAvatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleModalAvatarFileChange}
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-[#EADCC9]/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-stone-300 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAvatarModal}
                disabled={isSavingAvatar || isUploadingAvatar}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition disabled:opacity-50 cursor-pointer"
              >
                {isSavingAvatar ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu Ảnh Đại Diện</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* LIGHTBOX PREVIEW MODAL                                         */}
      {/* ============================================================== */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageUrl}
              alt="Phóng to ảnh tác phẩm"
              className="w-full h-full object-contain max-h-[85vh]"
            />
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
