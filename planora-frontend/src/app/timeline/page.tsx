'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  Clock,
  Heart
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlan } from '@/contexts/PlanContext';

export default function Timeline() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { plan, daysLeft, isLoadingPlan } = usePlan();
  const { t } = useLanguage();
  const router = useRouter();

  // Data Loading States
  const planId = plan?.id ?? null;
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
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Timeline Events directly using cached planId
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!planId) {
      if (!isLoadingPlan && !plan) {
        router.replace('/');
      }
      return;
    }

    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const timeline = await getTimeline(planId!);
        if (isMounted) {
          setEvents(timeline);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu timeline:', err);
        if (isMounted) {
          setErrorMessage(t.timeline.errorLoading);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, planId, isLoadingPlan, plan, router, t.timeline.errorLoading]);

  // Sort events chronologically by eventDate (Memoized)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  }, [events]);


  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-slate-400">{t.dashboard.loadingSession}</span>
        </div>
      </div>
    );
  }

  // Add or Edit Submission
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      setErrorMessage(t.timeline.titleRequired);
      return;
    }
    if (!eventDateTime) {
      setErrorMessage(t.timeline.dateTimeRequired);
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
        setSuccessMessage(t.timeline.eventUpdatedSuccess);
      } else {
        // Add flow
        const created = await createEvent(planId, {
          title: eventTitle,
          description: eventDesc,
          eventDate: formattedDateTime
        });
        setEvents(prev => [...prev, created]);
        setSuccessMessage(t.timeline.eventAddedSuccess);
      }

      // Close modal and reset form
      setTimeout(() => {
        handleCloseModal();
      }, 1000);

    } catch (err) {
      console.error('Lỗi khi lưu mốc sự kiện:', err);
      setErrorMessage(err instanceof Error ? err.message : t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete flow
  const handleDeleteEvent = async (id: number) => {
    if (!confirm(t.timeline.confirmDeleteEvent)) return;

    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(ev => ev.id !== id));
      setSuccessMessage(t.timeline.eventDeletedSuccess);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi xóa mốc sự kiện:', err);
      setErrorMessage(t.common.error);
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

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col w-full">
      {/* Top Info Bar */}
      <div className="sticky top-0 z-50">
        <DashboardHeader logout={logout} plan={plan} daysLeft={daysLeft} />
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 w-full relative">
        {/* Left Sidebar */}
        <DashboardSidebar hasPlan={!!plan} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFBF5]">
          <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-col justify-start">
        
        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-hairline pb-5 sm:pb-6 mb-6 sm:mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
              <Calendar className="w-6 h-6 sm:w-7 h-7 text-primary" />
              {t.timeline.timelineEvents}
            </h1>
            <p className="text-xs sm:text-sm text-muted-text">
              {t.timeline.timelineSubtitle}
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-primary-active transition-all shadow-sm font-display uppercase tracking-wider self-stretch sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cream" />
            {t.timeline.addEventBtn}
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
            <span className="text-sm text-muted-text font-display">{t.timeline.loadingEvents}</span>
          </div>
        ) : (
          /* Vertical Timeline visualization */
          <div className="relative py-6 sm:py-8 pl-5 sm:pl-8 ml-3 sm:ml-auto border-l-2 border-hairline space-y-6 sm:space-y-8 max-w-3xl sm:mx-auto w-[calc(100%-12px)] sm:w-full">
            
            {sortedEvents.length > 0 ? (
              sortedEvents.map((ev) => {
                const dateObj = new Date(ev.eventDate);
                const isPassed = now > 0 && dateObj.getTime() < now;

                return (
                  <div key={ev.id} className="relative animate-fade-in">
                    
                    {/* Timeline Node Dot */}
                    <div className={`absolute -left-[31px] sm:-left-[43px] w-5 h-5 rounded-full border-4 bg-white flex items-center justify-center transition-all ${
                      isPassed 
                        ? 'border-hairline' 
                        : 'border-primary ring-4 ring-primary/10 shadow-xs'
                    }`}>
                      {isPassed ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-text/50" />
                      ) : (
                        <Heart className="w-2.5 h-2.5 text-primary fill-primary" />
                      )}
                    </div>

                    {/* Timeline Event Card */}
                    <div className="content-visibility-auto p-4 sm:p-5 bg-white border border-hairline rounded-2xl shadow-xs space-y-3 relative hover:border-primary/30 transition-all">
                      
                      {/* Title & DateTime */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5 border-b border-hairline">
                        <h3 className="text-base sm:text-lg font-semibold text-ink flex items-center gap-1.5">
                          {ev.title}
                        </h3>
                        <span className="flex items-center gap-1.5 text-xs font-semibold font-mono text-primary bg-primary/5 px-2.5 py-1 border border-primary/10 rounded-full self-start sm:self-auto">
                          <Clock className="w-3.5 h-3.5 text-primary" /> {formatDateTime(ev.eventDate)}
                        </span>
                      </div>

                      {/* Description */}
                      {ev.description && (
                        <p className="text-xs sm:text-sm text-body-text leading-relaxed">
                          {ev.description}
                        </p>
                      )}

                      {/* Action Menu */}
                      <div className="flex justify-end gap-2 pt-1 border-t border-hairline border-dashed">
                        <button
                          onClick={() => handleOpenEdit(ev)}
                          className="text-xs font-semibold text-muted-text hover:text-primary px-3 py-1.5 hover:bg-canvas rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                          title={t.timeline.editEventTooltip}
                        >
                          <Edit3 className="w-3.5 h-3.5" /> {t.common.edit}
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-xs font-semibold text-muted-text hover:text-red-600 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                          title={t.timeline.deleteEventTooltip}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> {t.common.delete}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center bg-white border border-hairline rounded-2xl shadow-xs text-muted-text flex flex-col items-center gap-2 pl-0 -ml-5 sm:-ml-8 w-full">
                <Calendar className="w-10 h-10 text-hairline" />
                <span className="text-sm font-semibold">{t.timeline.emptyTimelineMsg}</span>
              </div>
            )}
          </div>
        )}

          </main>
        </div>
      </div>

      {/* Add / Edit Milestone Modal / Bottom Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border-t sm:border border-hairline rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl animate-scale-up space-y-5 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <h3 className="text-lg font-bold text-ink font-display">
                {editingEventId !== null ? t.timeline.editMilestone : t.timeline.addMilestone}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full hover:bg-canvas flex items-center justify-center text-muted-text hover:text-ink transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Errors */}
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEvent} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="modal-title" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {t.timeline.eventTitleLabel}
                </label>
                <input
                  type="text"
                  id="modal-title"
                  required
                  placeholder={t.timeline.eventTitlePlaceholder}
                  className="w-full bg-canvas border border-hairline rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-primary text-ink"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="modal-desc" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {t.timeline.eventDescLabel}
                </label>
                <textarea
                  id="modal-desc"
                  rows={3}
                  placeholder={t.timeline.eventDescPlaceholder}
                  className="w-full bg-canvas border border-hairline rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-primary text-ink resize-none"
                  value={eventDesc}
                  onChange={e => setEventDesc(e.target.value)}
                />
              </div>

              {/* Event Date-Time (datetime-local picker) */}
              <div className="space-y-1.5">
                <label htmlFor="modal-datetime" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {t.timeline.eventDateTimeLabel}
                </label>
                <input
                  type="datetime-local"
                  id="modal-datetime"
                  required
                  className="w-full bg-canvas border border-hairline rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-primary text-ink cursor-pointer"
                  value={eventDateTime}
                  onChange={e => setEventDateTime(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-hairline rounded-full text-xs sm:text-sm font-semibold text-muted-text hover:text-ink hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary text-cream rounded-full text-xs sm:text-sm font-bold hover:bg-primary-active transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer min-h-[44px] shadow-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingEventId !== null ? (
                    t.timeline.saveChanges
                  ) : (
                    t.timeline.addNew
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
