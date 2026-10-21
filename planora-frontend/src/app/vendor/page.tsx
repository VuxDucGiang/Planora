'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vendor/profile');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FFFBF5]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5D0F12] border-t-transparent shadow-sm"></div>
        <p className="text-xs font-medium text-stone-500 font-serif italic">
          Đang chuyển hướng tới Hồ sơ Nhà cung cấp...
        </p>
      </div>
    </div>
  );
}

