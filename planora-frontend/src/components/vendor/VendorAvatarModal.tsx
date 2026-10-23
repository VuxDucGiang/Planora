'use client';

import React, { useRef } from 'react';
import { Camera, X, Store, Loader2, Upload } from 'lucide-react';

interface VendorAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempAvatarUrl: string;
  setTempAvatarUrl: (url: string) => void;
  isUploadingAvatar: boolean;
  isSavingAvatar: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export default function VendorAvatarModal({
  isOpen,
  onClose,
  tempAvatarUrl,
  setTempAvatarUrl,
  isUploadingAvatar,
  isSavingAvatar,
  onFileChange,
  onSave,
}: VendorAvatarModalProps) {
  const modalAvatarInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] border border-[#EADCC9] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
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
            onChange={onFileChange}
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#EADCC9]/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-[#D4B896] text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-[#FAF8F5] transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSavingAvatar || isUploadingAvatar}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#5D0F12]/20 transition disabled:opacity-50 cursor-pointer"
          >
            {isSavingAvatar ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FFFBF5]" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu Ảnh Đại Diện</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

