'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePlan } from '@/services/weddingPlan';
import { 
  getTimeline, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} from '@/services/timeline';
import type { TimelineEvent } from '@/types/timeline';
import { formatDateTime, toLocalDateTimeFormat } from '@/utils/date';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import Link from 'next/link';

export default function Timeline() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Data Loading States
  const [planId, setPlanId] = useState<number | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form States (for Add/Edit Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDateTime, setEventDateTime] = useState(''); // YYYY-MM-DDTHH:mm
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Active Plan and Timeline Events
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        setIsLoading(true);
        const activePlan = await getActivePlan();
        if (activePlan) {
          setPlanId(activePlan.id);
          const timeline = await getTimeline(activePlan.id);
          setEvents(timeline);
        } else {
          router.replace('/');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu timeline:', err);
        setErrorMessage('Không thể tải dòng thời gian sự kiện. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-slate-400">Đang tải dữ liệu phiên làm việc...</span>
        </div>
      </div>
    );
  }

  // Add or Edit Submission
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      setErrorMessage('Tiêu đề sự kiện không được để trống!');
      return;
    }
    if (!eventDateTime) {
      setErrorMessage('Vui lòng chọn thời gian diễn ra!');
      return;
    }
    if (!planId) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Format local datetime for backend
    const formattedDateTime = toLocalDateTimeFormat(eventDateTime);

    try {
      if (editingEventId !== null) {
        // Edit flow
        const updated = await updateEvent(editingEventId, {
          title: eventTitle,
          description: eventDesc,
          eventDate: formattedDateTime
        });
        setEvents(prev => prev.map(ev => ev.id === editingEventId ? updated : ev));
        setSuccessMessage('Cập nhật mốc sự kiện thành công!');
      } else {
        // Add flow
        const created = await createEvent(planId, {
          title: eventTitle,
          description: eventDesc,
          eventDate: formattedDateTime
        });
        setEvents(prev => [...prev, created]);
        setSuccessMessage('Thêm mốc sự kiện thành công!');
      }

      // Close modal and reset form
      setTimeout(() => {
        handleCloseModal();
      }, 1000);

    } catch (err) {
      console.error('Lỗi khi lưu mốc sự kiện:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Lưu mốc sự kiện thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete flow
  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mốc thời gian này?')) return;

    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(ev => ev.id !== id));
      setSuccessMessage('Xóa mốc thời gian thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi xóa mốc sự kiện:', err);
      setErrorMessage('Không thể xóa mốc thời gian này');
    }
  };

  // Open modal for editing
  const handleOpenEdit = (ev: TimelineEvent) => {
    setEditingEventId(ev.id);
    setEventTitle(ev.title);
    setEventDesc(ev.description || '');
    
    // Convert YYYY-MM-DDTHH:mm:ss to YYYY-MM-DDTHH:mm for input
    const inputDt = ev.eventDate ? ev.eventDate.substring(0, 16) : '';
    setEventDateTime(inputDt);
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleOpenAdd = () => {
    setEditingEventId(null);
    setEventTitle('');
    setEventDesc('');
    setEventDateTime('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEventId(null);
    setEventTitle('');
    setEventDesc('');
    setEventDateTime('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Sort events chronologically by eventDate
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col relative w-full overflow-hidden">
      <DashboardHeader logout={logout} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 sm:px-10 py-12 flex flex-col justify-start">
        
        {/* Header Breadcrumbs */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
          </Link>
        </div>

        {/* Page Title & Controls */}
        <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-hairline pb-6 mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
              <Calendar className="w-7 h-7 text-primary" />
              Dòng Thời Gian Lễ Cưới
            </h1>
            <p className="text-xs text-muted-text">
              Lập lịch trình sự kiện chi tiết diễn ra trước và trong ngày cưới của bạn.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary-active transition-all shadow-sm font-display uppercase tracking-wider self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-cream" />
            Thêm mốc sự kiện
          </button>
        </div>

        {/* Notifications */}
        {errorMessage && !isModalOpen && (
          <div className="p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-start gap-3 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
        {successMessage && !isModalOpen && (
          <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-sm flex items-start gap-3 text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-text font-display">Đang tải dòng thời gian...</span>
          </div>
        ) : (
          /* Vertical Timeline visualization */
          <div className="relative py-8 pl-6 sm:pl-8 border-l border-border-strong space-y-8 max-w-xl mx-auto w-full">
            
            {sortedEvents.length > 0 ? (
              sortedEvents.map((ev, idx) => {
                const dateObj = new Date(ev.eventDate);
                const isPassed = dateObj.getTime() < Date.now();

                return (
                  <div key={ev.id} className="relative animate-fade-in">
                    
                    {/* Timeline Node Dot */}
                    <div className={`absolute -left-[31px] sm:-left-[39px] w-5 h-5 rounded-full border-4 bg-white flex items-center justify-center transition-all ${
                      isPassed 
                        ? 'border-border-strong' 
                        : 'border-primary ring-4 ring-primary/10'
                    }`}>
                      {isPassed ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-light-grey" />
                      ) : (
                        <Heart className="w-2.5 h-2.5 text-primary fill-primary" />
                      )}
                    </div>

                    {/* Timeline Event Card */}
                    <div className="p-5 bg-white border border-hairline rounded-lg shadow-sm space-y-3 relative hover:border-border-strong transition-all">
                      
                      {/* Title & DateTime */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-hairline">
                        <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                          {ev.title}
                        </h3>
                        <span className="flex items-center gap-1 text-[10px] font-semibold font-mono text-primary bg-primary/5 px-2 py-0.5 border border-primary/10 rounded-sm self-start sm:self-auto">
                          <Clock className="w-3 h-3 text-primary" /> {formatDateTime(ev.eventDate)}
                        </span>
                      </div>

                      {/* Description */}
                      {ev.description && (
                        <p className="text-xs text-body-text leading-relaxed">
                          {ev.description}
                        </p>
                      )}

                      {/* Action Menu */}
                      <div className="flex justify-end gap-2 pt-1 border-t border-hairline border-dashed">
                        <button
                          onClick={() => handleOpenEdit(ev)}
                          className="text-[10px] font-semibold text-muted-text hover:text-primary px-2.5 py-1 hover:bg-canvas rounded-sm transition-colors flex items-center gap-1"
                          title="Sửa mốc sự kiện"
                        >
                          <Edit3 className="w-3 h-3" /> Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-[10px] font-semibold text-muted-text hover:text-red-500 px-2.5 py-1 hover:bg-red-50 rounded-sm transition-colors flex items-center gap-1"
                          title="Xóa mốc sự kiện"
                        >
                          <Trash2 className="w-3 h-3" /> Xóa
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center bg-white border border-hairline rounded-lg shadow-sm text-muted-text flex flex-col items-center gap-2 pl-0 -ml-6 sm:-ml-8 w-full">
                <Calendar className="w-10 h-10 text-hairline" />
                <span className="text-xs font-semibold">Dòng thời gian đang trống. Nhấp "Thêm mốc sự kiện" để bắt đầu!</span>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Add / Edit Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-lg w-full max-w-md p-6 shadow-xl animate-scale-up space-y-5">
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <h3 className="text-md font-semibold text-ink font-display">
                {editingEventId !== null ? 'Cập nhật mốc thời gian' : 'Thêm mốc thời gian mới'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-muted-text hover:text-ink text-sm font-semibold p-1 hover:bg-canvas rounded-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Errors */}
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-sm flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-500 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEvent} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="modal-title" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Tiêu đề sự kiện
                </label>
                <input
                  type="text"
                  id="modal-title"
                  required
                  placeholder="Ví dụ: Đón dâu"
                  className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="modal-desc" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Mô tả chi tiết
                </label>
                <textarea
                  id="modal-desc"
                  rows={3}
                  placeholder="Ví dụ: Nhà trai xuất phát lúc 7:30 sáng, chuẩn bị tráp ăn hỏi..."
                  className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink resize-none"
                  value={eventDesc}
                  onChange={e => setEventDesc(e.target.value)}
                />
              </div>

              {/* Event Date-Time (datetime-local picker) */}
              <div className="space-y-1.5">
                <label htmlFor="modal-datetime" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Thời gian diễn ra
                </label>
                <input
                  type="datetime-local"
                  id="modal-datetime"
                  required
                  className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink cursor-pointer"
                  value={eventDateTime}
                  onChange={e => setEventDateTime(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3.5 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-border-strong rounded-sm text-xs font-semibold text-body-text hover:bg-canvas transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary-active transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : editingEventId !== null ? (
                    'Lưu thay đổi'
                  ) : (
                    'Thêm mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}
