'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Coins,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Sparkles,
  Tag,
  AlertCircle,
  Check,
  Package as PackageIcon,
  HelpCircle,
} from 'lucide-react';
import {
  getMyVendorServices,
  createVendorService,
  updateVendorService,
  deleteVendorService,
  addVendorPackage,
  updateVendorPackage,
  deleteVendorPackage,
  getServiceCategories,
} from '@/services/vendorService';
import type {
  VendorServiceDetailResponse,
  PackageResponse,
} from '@/types/vendor';

export default function VendorServicesPage() {
  // Main Data States
  const [services, setServices] = useState<VendorServiceDetailResponse[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal Service State (Create / Edit)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceCategoryId, setServiceCategoryId] = useState<number>(1);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [priceFrom, setPriceFrom] = useState<string>('');
  const [priceTo, setPriceTo] = useState<string>('');
  const [serviceActive, setServiceActive] = useState(true);
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  // Modal Package State (Create / Edit)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [targetServiceIdForPackage, setTargetServiceIdForPackage] = useState<number | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [packageName, setPackageName] = useState('');
  const [packageDesc, setPackageDesc] = useState('');
  const [packagePrice, setPackagePrice] = useState<string>('');
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);

  // Load Initial Data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [servicesData, categoriesData] = await Promise.all([
        getMyVendorServices(),
        getServiceCategories(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !serviceCategoryId) {
        setServiceCategoryId(categoriesData[0].id);
      }
    } catch (err: unknown) {
      console.error('Lỗi khi tải dữ liệu dịch vụ:', err);
      setErrorMessage('Không thể tải danh sách dịch vụ. Vui lòng tải lại trang.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const formatVND = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Open Create Service Modal
  const openCreateServiceModal = () => {
    setEditingServiceId(null);
    setServiceName('');
    setServiceDesc('');
    setPriceFrom('');
    setPriceTo('');
    setServiceActive(true);
    if (categories.length > 0) setServiceCategoryId(categories[0].id);
    setIsServiceModalOpen(true);
  };

  // Open Edit Service Modal
  const openEditServiceModal = (s: VendorServiceDetailResponse) => {
    setEditingServiceId(s.id);
    setServiceCategoryId(s.categoryId);
    setServiceName(s.serviceName);
    setServiceDesc(s.description || '');
    setPriceFrom(s.priceFrom ? s.priceFrom.toString() : '');
    setPriceTo(s.priceTo ? s.priceTo.toString() : '');
    setServiceActive(s.active);
    setIsServiceModalOpen(true);
  };

  // Save Service (Create / Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      setErrorMessage('Vui lòng nhập tên dịch vụ!');
      return;
    }

    try {
      setIsSubmittingService(true);
      setErrorMessage(null);

      const payload = {
        categoryId: serviceCategoryId,
        serviceName: serviceName.trim(),
        description: serviceDesc.trim() || undefined,
        priceFrom: priceFrom ? parseFloat(priceFrom) : undefined,
        priceTo: priceTo ? parseFloat(priceTo) : undefined,
        active: serviceActive,
      };

      if (editingServiceId) {
        const updated = await updateVendorService(editingServiceId, payload);
        setServices((prev) =>
          prev.map((s) => (s.id === editingServiceId ? { ...updated, packages: s.packages } : s))
        );
        showSuccess('Cập nhật dịch vụ thành công!');
      } else {
        const created = await createVendorService(payload);
        setServices((prev) => [created, ...prev]);
        showSuccess('Tạo mới dịch vụ thành công!');
      }

      setIsServiceModalOpen(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi khi lưu dịch vụ');
    } finally {
      setIsSubmittingService(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này cùng toàn bộ các gói báo giá liên quan?')) return;

    try {
      await deleteVendorService(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      showSuccess('Đã xóa dịch vụ thành công!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa dịch vụ');
    }
  };

  // Open Add Package Modal
  const openAddPackageModal = (serviceId: number) => {
    setTargetServiceIdForPackage(serviceId);
    setEditingPackageId(null);
    setPackageName('');
    setPackageDesc('');
    setPackagePrice('');
    setIsPackageModalOpen(true);
  };

  // Open Edit Package Modal
  const openEditPackageModal = (serviceId: number, pkg: PackageResponse) => {
    setTargetServiceIdForPackage(serviceId);
    setEditingPackageId(pkg.id);
    setPackageName(pkg.packageName);
    setPackageDesc(pkg.description || '');
    setPackagePrice(pkg.price ? pkg.price.toString() : '');
    setIsPackageModalOpen(true);
  };

  // Save Package (Create / Update)
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetServiceIdForPackage) return;
    if (!packageName.trim() || !packagePrice) {
      setErrorMessage('Vui lòng nhập tên gói và giá niêm yết!');
      return;
    }

    try {
      setIsSubmittingPackage(true);
      setErrorMessage(null);

      const payload = {
        packageName: packageName.trim(),
        price: parseFloat(packagePrice),
        description: packageDesc.trim() || undefined,
      };

      if (editingPackageId) {
        const updated = await updateVendorPackage(
          targetServiceIdForPackage,
          editingPackageId,
          payload
        );
        setServices((prev) =>
          prev.map((s) => {
            if (s.id !== targetServiceIdForPackage) return s;
            return {
              ...s,
              packages: s.packages.map((p) => (p.id === editingPackageId ? updated : p)),
            };
          })
        );
        showSuccess('Cập nhật gói dịch vụ thành công!');
      } else {
        const created = await addVendorPackage(targetServiceIdForPackage, payload);
        setServices((prev) =>
          prev.map((s) => {
            if (s.id !== targetServiceIdForPackage) return s;
            return {
              ...s,
              packages: [...s.packages, created],
            };
          })
        );
        showSuccess('Thêm gói dịch vụ mới thành công!');
      }

      setIsPackageModalOpen(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi khi lưu gói dịch vụ');
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  // Delete Package
  const handleDeletePackage = async (serviceId: number, packageId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) return;

    try {
      await deleteVendorPackage(serviceId, packageId);
      setServices((prev) =>
        prev.map((s) => {
          if (s.id !== serviceId) return s;
          return {
            ...s,
            packages: s.packages.filter((p) => p.id !== packageId),
          };
        })
      );
      showSuccess('Đã xóa gói dịch vụ thành công!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa gói dịch vụ');
    }
  };

  const totalPackages = services.reduce((acc, s) => acc + (s.packages?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm font-serif italic text-stone-500">
            Đang tải danh mục dịch vụ & bảng giá...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-widest bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Giai đoạn 2: Dịch Vụ & Bảng Giá
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#5D0F12] mt-2"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              Quản Lý Dịch Vụ & Bảng Báo Giá
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-serif italic">
              Thiết lập các dịch vụ thế mạnh và gói combo tiệc cưới chi tiết để cặp đôi dễ dàng tham khảo và gửi yêu cầu tư vấn.
            </p>

            {/* Quick KPI Counters */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-700 mt-4 pt-4 border-t border-[#EADCC9]/50">
              <span className="flex items-center gap-1.5 font-semibold">
                <Briefcase className="w-4 h-4 text-[#5D0F12]" />
                {services.length} Dịch vụ
              </span>
              <span className="text-stone-300">|</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <PackageIcon className="w-4 h-4 text-[#D4B896]" />
                {totalPackages} Gói báo giá chi tiết
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateServiceModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Dịch Vụ Mới</span>
          </button>
        </div>
      </section>

      {/* Services List Section */}
      <section className="space-y-6">
        {services.length === 0 ? (
          <div className="p-12 text-center rounded-[1.75rem] border-2 border-dashed border-[#EADCC9] bg-[#FAF8F5]/60 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-stone-400 border border-[#EADCC9] shadow-xs">
              <Briefcase className="w-6 h-6 text-[#5D0F12]" />
            </div>
            <p className="text-sm font-semibold text-stone-800">Chưa có dịch vụ nào được thiết lập</p>
            <p className="text-xs text-stone-500 max-w-md">
              Bắt đầu tạo dịch vụ đầu tiên (ví dụ: Chụp ảnh cưới, Trang trí tiệc, Váy cưới...) để hiển thị trên Marketplace của Planora.
            </p>
            <button
              type="button"
              onClick={openCreateServiceModal}
              className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#5D0F12] text-xs font-bold uppercase tracking-wider text-[#FFFBF5] shadow-sm hover:bg-[#4A0C0E] transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo dịch vụ ngay</span>
            </button>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden transition hover:border-[#D4B896]"
            >
              {/* Service Header Bar */}
              <div className="p-6 sm:p-7 border-b border-[#EADCC9]/60 bg-gradient-to-r from-[#FAF8F5]/80 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-wider bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {service.categoryName || 'Dịch vụ cưới'}
                    </span>
                    {service.active ? (
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Đang ẩn
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-xl font-bold uppercase tracking-wide text-neutral-900"
                    style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                  >
                    {service.serviceName}
                  </h3>

                  {service.description && (
                    <p className="text-xs text-stone-600 font-serif italic max-w-2xl">
                      {service.description}
                    </p>
                  )}

                  <div className="text-xs text-stone-700 font-semibold pt-1">
                    <span className="text-stone-500 font-normal">Khoảng giá ước tính: </span>
                    <span className="text-[#5D0F12] font-bold">
                      {formatVND(service.priceFrom)}
                      {service.priceTo ? ` — ${formatVND(service.priceTo)}` : ''}
                    </span>
                  </div>
                </div>

                {/* Service Header Action Buttons */}
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => openAddPackageModal(service.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#D4B896] hover:bg-white text-xs font-bold uppercase tracking-wider text-stone-800 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#5D0F12]" />
                    <span>Thêm gói</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditServiceModal(service)}
                    className="p-2 rounded-full border border-[#EADCC9] bg-white text-stone-700 hover:text-[#5D0F12] hover:bg-[#FAF8F5] transition cursor-pointer"
                    title="Chỉnh sửa dịch vụ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 rounded-full border border-[#EADCC9] bg-white text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Xóa dịch vụ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Nested Packages Grid */}
              <div className="p-6 sm:p-7 bg-[#FFFBF5]/40">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#5D0F12]" />
                    <span>Các Gói Báo Giá Chi Tiết ({service.packages?.length || 0})</span>
                  </h4>
                  {service.packages?.length === 0 && (
                    <span className="text-[11px] text-stone-400 italic font-serif">
                      Chưa có gói cụ thể. Dâu rể thích chọn các gói có sẵn quyền lợi rõ ràng.
                    </span>
                  )}
                </div>

                {service.packages && service.packages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {service.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="rounded-2xl border border-[#EADCC9] bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h5
                              className="text-base font-bold text-neutral-900 uppercase tracking-wide"
                              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                            >
                              {pkg.packageName}
                            </h5>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => openEditPackageModal(service.id, pkg)}
                                className="p-1 rounded text-stone-400 hover:text-[#5D0F12] transition"
                                title="Sửa gói"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePackage(service.id, pkg.id)}
                                className="p-1 rounded text-stone-400 hover:text-rose-600 transition"
                                title="Xóa gói"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-lg font-bold text-[#5D0F12]">
                            {formatVND(pkg.price)}
                          </div>

                          {pkg.description && (
                            <p className="text-xs text-stone-600 leading-relaxed font-serif whitespace-pre-line border-t border-[#EADCC9]/50 pt-2">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-xl border border-dashed border-[#EADCC9] bg-white/70">
                    <p className="text-xs text-stone-600">
                      Chưa có gói báo giá nào cho dịch vụ này.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAddPackageModal(service.id)}
                      className="mt-2 text-xs font-bold text-[#5D0F12] hover:underline uppercase tracking-wider inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm gói giá đầu tiên</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Modal 1: Tạo / Chỉnh sửa Dịch vụ */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-[1.75rem] border border-[#EADCC9] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF8F5] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3
                className="text-xl font-bold uppercase tracking-wide text-[#5D0F12]"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                {editingServiceId ? 'Chỉnh Sửa Dịch Vụ' : 'Tạo Dịch Vụ Mới'}
              </h3>
              <p className="text-xs text-stone-500 mt-1 font-serif italic">
                Dịch vụ sẽ hiển thị theo danh mục tương ứng trên bộ lọc Marketplace.
              </p>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              {/* Category Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Danh mục dịch vụ <span className="text-rose-600">*</span>
                </label>
                <select
                  value={serviceCategoryId}
                  onChange={(e) => setServiceCategoryId(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition cursor-pointer"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Tên dịch vụ <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ví dụ: Chụp ảnh phóng sự cưới trọn gói..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  required
                />
              </div>

              {/* Price From & Price To */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Giá từ (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    placeholder="10000000"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Đến mức (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)}
                    placeholder="35000000"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Mô tả dịch vụ
                </label>
                <textarea
                  rows={3}
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  placeholder="Mô tả phong cách, quy trình làm việc và cam kết chất lượng..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm transition font-serif leading-relaxed"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={serviceActive}
                  onChange={(e) => setServiceActive(e.target.checked)}
                  className="w-4 h-4 text-[#5D0F12] rounded border-[#EADCC9] focus:ring-[#5D0F12] cursor-pointer"
                />
                <label htmlFor="activeToggle" className="text-xs font-medium text-stone-700 cursor-pointer">
                  Kích hoạt dịch vụ này ngay (hiển thị công khai với khách hàng)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#D4B896] text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-[#FAF8F5] transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingService}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingService ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu Dịch Vụ</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Thêm / Sửa Gói Dịch Vụ */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-[1.75rem] border border-[#EADCC9] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPackageModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF8F5] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3
                className="text-xl font-bold uppercase tracking-wide text-[#5D0F12]"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                {editingPackageId ? 'Chỉnh Sửa Gói Báo Giá' : 'Thêm Gói Báo Giá Mới'}
              </h3>
              <p className="text-xs text-stone-500 mt-1 font-serif italic">
                Cung cấp chi tiết các quyền lợi cụ thể trong gói để dâu rể dễ dàng quyết định.
              </p>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              {/* Package Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Tên gói dịch vụ <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Ví dụ: Gói Tiêu Chuẩn Silver, Gói VIP Luxury..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Giá niêm yết (VNĐ) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={packagePrice}
                  onChange={(e) => setPackagePrice(e.target.value)}
                  placeholder="15000000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm font-medium transition"
                  required
                />
              </div>

              {/* Package Description / Inclusions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Quyền lợi & Danh mục bao gồm trong gói
                </label>
                <textarea
                  rows={4}
                  value={packageDesc}
                  onChange={(e) => setPackageDesc(e.target.value)}
                  placeholder="• 02 Váy cưới thiết kế riêng&#10;• 01 Bộ vest chú rể cao cấp&#10;• Trang điểm và làm tóc suốt buổi chụp&#10;• Album ảnh 30x40 kèm toàn bộ file gốc"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5D0F12]/30 text-sm transition font-serif leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#D4B896] text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-[#FAF8F5] transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPackage}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingPackage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu Gói Dịch Vụ</span>
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

