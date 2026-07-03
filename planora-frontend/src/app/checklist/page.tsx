'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePlan } from '@/services/weddingPlan';
import { 
  getChecklist, 
  createTask, 
  updateTask, 
  deleteTask 
} from '@/services/checklist';
import type { ChecklistTask, TaskStatus, TaskPriority } from '@/types/checklist';
import { formatDate, toInputDateFormat } from '@/utils/date';
import { 
  ListTodo, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle, 
  Check, 
  Loader2, 
  ArrowLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Circle,
  HelpCircle
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import Link from 'next/link';

export default function Checklist() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Data Loading States
    const [planId, setPlanId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weddingDate, setWeddingDate] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter & Sort States
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'DUE_DATE_ASC' | 'DUE_DATE_DESC' | 'PRIORITY_DESC'>('DUE_DATE_ASC');

  // Form States (for Add/Edit Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Active Plan and Tasks
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        setIsLoading(true);
                const activePlan = await getActivePlan();
        if (activePlan) {
          setPlanId(activePlan.id);
          setWeddingDate(activePlan.weddingDate);
          const checklist = await getChecklist(activePlan.id);
          setTasks(checklist);
        } else {
          // If no active plan, redirect back to dashboard
          router.replace('/');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu checklist:', err);
        setErrorMessage('Không thể tải danh sách công việc. Vui lòng thử lại!');
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

    // Quick toggle status: TODO <=> DONE
  const handleQuickToggleStatus = async (task: ChecklistTask) => {
    const nextStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';

    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái nhanh:', err);
      setErrorMessage('Không thể cập nhật trạng thái công việc');
    }
  };

  // Add or Edit Submission
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setErrorMessage('Tiêu đề công việc không được để trống!');
      return;
    }
    if (!planId) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingTaskId !== null) {
        // Edit flow
        const updated = await updateTask(editingTaskId, {
          title: taskTitle,
          description: taskDesc,
          dueDate: taskDueDate || undefined,
          priority: taskPriority
        });
        setTasks(prev => prev.map(t => t.id === editingTaskId ? updated : t));
        setSuccessMessage('Cập nhật công việc thành công!');
      } else {
        // Add flow
        const created = await createTask(planId, {
          title: taskTitle,
          description: taskDesc,
          dueDate: taskDueDate || undefined,
          priority: taskPriority
        });
        setTasks(prev => [...prev, created]);
        setSuccessMessage('Thêm công việc thành công!');
      }

      // Close modal and reset form
      setTimeout(() => {
        handleCloseModal();
      }, 1000);

    } catch (err) {
      console.error('Lỗi khi lưu công việc:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Lưu công việc thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete flow
  const handleDeleteTask = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;

    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setSuccessMessage('Xóa công việc thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi xóa công việc:', err);
      setErrorMessage('Không thể xóa công việc này');
    }
  };

  // Open modal for editing
  const handleOpenEdit = (task: ChecklistTask) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskDueDate(toInputDateFormat(task.dueDate));
    setTaskPriority(task.priority);
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleOpenAdd = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate('');
    setTaskPriority('MEDIUM');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate('');
    setTaskPriority('MEDIUM');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

    // Get task section grouping based on due date and wedding date
  const getTaskSection = (task: ChecklistTask, weddingDateStr: string | null): string => {
    if (!task.dueDate || !weddingDateStr) {
      return 'Chưa có thời hạn';
    }
    try {
      const weddingDateObj = new Date(weddingDateStr);
      const dueDateObj = new Date(task.dueDate);
      
      const diffTime = weddingDateObj.getTime() - dueDateObj.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      const diffMonths = diffDays / 30.4;
      
      if (diffDays < 0) {
        return 'Sau ngày cưới';
      }
      if (diffMonths >= 6) {
        return 'Trước cưới 6+ tháng';
      }
      if (diffMonths >= 3) {
        return 'Trước cưới 3 - 6 tháng';
      }
      if (diffMonths >= 1) {
        return 'Trước cưới 1 - 3 tháng';
      }
      return 'Trong vòng 1 tháng';
    } catch (e) {
      return 'Chưa có thời hạn';
    }
  };

  // Filter & Sort Logic
  const filteredTasks = tasks
    .filter(t => statusFilter === 'ALL' || t.status === statusFilter)
    .filter(t => priorityFilter === 'ALL' || t.priority === priorityFilter)
    .sort((a, b) => {
      if (sortBy === 'DUE_DATE_ASC') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'DUE_DATE_DESC') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortBy === 'PRIORITY_DESC') {
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return 0;
    });

  // Calculate Progress Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const checklistPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format Status Label for UI display
  const getStatusText = (status: TaskStatus) => {
    if (status === 'TODO') return 'Cần làm';
    if (status === 'IN_PROGRESS') return 'Đang tiến hành';
    return 'Đã hoàn thành';
  };

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col relative w-full overflow-hidden">
      <DashboardHeader logout={logout} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-10 py-12 flex flex-col justify-start">
        
        {/* Header Breadcrumbs */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
          </Link>
        </div>

        {/* Page Title & Main Stats */}
        <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-hairline pb-6 mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
              <ListTodo className="w-7 h-7 text-primary" />
              Checklist Nhiệm Vụ
            </h1>
            <p className="text-xs text-muted-text">
              Quản lý và cập nhật tiến độ công việc chuẩn bị cho lễ cưới.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary-active transition-all shadow-sm font-display uppercase tracking-wider self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-cream" />
            Thêm công việc
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
            <span className="text-sm text-muted-text font-display">Đang tải danh sách công việc...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Stat Progress Banner */}
            <div className="p-6 bg-white border border-hairline rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest block">Tổng tiến độ</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-primary font-display">{checklistPercent}%</span>
                  <span className="text-xs text-muted-text">hoàn thành</span>
                </div>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <div className="w-full h-2.5 bg-canvas border border-hairline rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${checklistPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-text font-medium">
                  <span>Tổng nhiệm vụ: {totalTasks}</span>
                  <span>Đã xong: {completedTasks}</span>
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 bg-white border border-hairline rounded-lg shadow-sm flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5 border border-hairline rounded-sm bg-canvas px-2.5 py-1">
                  <Filter className="w-3.5 h-3.5 text-muted-text" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text border-r border-hairline pr-2 mr-1">Trạng thái</span>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
                    className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="TODO">Cần làm</option>
                    <option value="IN_PROGRESS">Đang tiến hành</option>
                    <option value="DONE">Hoàn thành</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-1.5 border border-hairline rounded-sm bg-canvas px-2.5 py-1">
                  <Filter className="w-3.5 h-3.5 text-muted-text" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text border-r border-hairline pr-2 mr-1">Độ ưu tiên</span>
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
                    className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                  </select>
                </div>
              </div>

              {/* Sorting Selection */}
              <div className="flex items-center gap-1.5 border border-hairline rounded-sm bg-canvas px-2.5 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text border-r border-hairline pr-2 mr-1">Sắp xếp</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'DUE_DATE_ASC' | 'DUE_DATE_DESC' | 'PRIORITY_DESC')}
                  className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="DUE_DATE_ASC">Hạn chót tăng dần</option>
                  <option value="DUE_DATE_DESC">Hạn chót giảm dần</option>
                  <option value="PRIORITY_DESC">Độ ưu tiên giảm dần</option>
                </select>
              </div>
            </div>

                        {/* Grouped Task Card List */}
            <div className="space-y-6">
              {filteredTasks.length > 0 ? (() => {
                const sectionOrder = [
                  'Trước cưới 6+ tháng',
                  'Trước cưới 3 - 6 tháng',
                  'Trước cưới 1 - 3 tháng',
                  'Trong vòng 1 tháng',
                  'Sau ngày cưới',
                  'Chưa có thời hạn'
                ];
                const groupedTasks: Record<string, ChecklistTask[]> = {};
                sectionOrder.forEach(sec => { groupedTasks[sec] = []; });
                filteredTasks.forEach(task => {
                  const sec = getTaskSection(task, weddingDate);
                  if (!groupedTasks[sec]) { groupedTasks[sec] = []; }
                  groupedTasks[sec].push(task);
                });
                return sectionOrder.map(section => {
                  const sectionTasks = groupedTasks[section];
                  if (!sectionTasks || sectionTasks.length === 0) return null;
                  return (
                    <div key={section} className="space-y-3">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-wider pl-1 mt-6 first:mt-0 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {section} ({sectionTasks.length})
                      </h3>
                      <div className="space-y-3">
                        {sectionTasks.map(task => {
                          const isDone = task.status === 'DONE';
                          let priorityStyles = 'border-light-grey text-light-grey bg-light-grey/5';
                          if (task.priority === 'HIGH') priorityStyles = 'border-red-200 text-red-600 bg-red-50';
                          else if (task.priority === 'MEDIUM') priorityStyles = 'border-primary/20 text-primary bg-primary/5';
                          return (
                            <div
                              key={task.id}
                              className={`p-4 bg-white border rounded-lg shadow-sm flex items-start justify-between gap-4 transition-all hover:border-border-strong ${
                                isDone ? 'border-hairline bg-canvas/30 opacity-75' : 'border-hairline'
                              }`}
                            >
                              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleQuickToggleStatus(task)}
                                  className="mt-0.5 text-muted-text hover:text-primary transition-colors flex-shrink-0 focus:ring-2 focus:ring-primary focus:outline-none rounded-full"
                                  title={isDone ? 'Nhấp để đánh dấu chưa làm' : 'Nhấp để hoàn thành'}
                                  aria-label={`Đánh dấu công việc ${task.title} là ${isDone ? 'chưa hoàn thành' : 'đã hoàn thành'}`}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-5.5 h-5.5 text-success fill-success/10" />
                                  ) : (
                                    <Circle className="w-5.5 h-5.5 text-border-strong hover:border-primary" />
                                  )}
                                </button>
                                <div className="space-y-1 min-w-0">
                                  <h3 className={`text-sm font-semibold transition-all ${
                                    isDone ? 'line-through text-muted-text font-normal font-sans' : 'text-ink'
                                  }`}>
                                    {task.title}
                                  </h3>
                                  {task.description && (
                                    <p className="text-xs text-muted-text leading-relaxed break-words">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-3 pt-1.5">
                                    <span className="flex items-center gap-1 text-[10px] font-medium text-muted-text font-mono">
                                      <Calendar className="w-3 h-3 text-muted-text" /> Hạn: {formatDate(task.dueDate)}
                                    </span>
                                    <span className="text-hairline text-xs">•</span>
                                    <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase rounded-sm ${priorityStyles}`}>
                                      {task.priority === 'HIGH' ? 'Cao' : task.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                                    </span>
                                    <span className="text-hairline text-xs">•</span>
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm border ${
                                      isDone
                                        ? 'bg-success/5 border-success/20 text-success'
                                        : 'bg-canvas border-hairline text-muted-text'
                                    }`}>
                                      {getStatusText(task.status)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleOpenEdit(task)}
                                  className="p-2 text-muted-text hover:text-primary hover:bg-canvas rounded-sm transition-all"
                                  title="Sửa công việc"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-2 text-muted-text hover:text-red-500 hover:bg-red-50 rounded-sm transition-all"
                                  title="Xóa công việc"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })() : (
                <div className="py-16 text-center bg-white border border-hairline rounded-lg shadow-sm text-muted-text flex flex-col items-center gap-2">
                  <ListTodo className="w-10 h-10 text-hairline" />
                  <span className="text-xs font-semibold">Không tìm thấy công việc nào phù hợp với bộ lọc.</span>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-lg w-full max-w-md p-6 shadow-xl animate-scale-up space-y-5">
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <h3 className="text-md font-semibold text-ink font-display">
                {editingTaskId !== null ? 'Cập nhật công việc' : 'Thêm công việc mới'}
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

            <form onSubmit={handleSubmitTask} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="modal-title" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Tiêu đề công việc
                </label>
                                <input
                  type="text"
                  id="modal-title"
                  required
                  autoFocus
                  placeholder="Ví dụ: Đặt cọc địa điểm tiệc cưới"
                  className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
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
                  placeholder="Ví dụ: Liên hệ nhà hàng tiệc cưới, đặt cọc 30% để giữ chỗ..."
                  className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink resize-none"
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                />
              </div>

              {/* Grid: Due Date & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="modal-due" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                    Hạn chót hoàn thành
                  </label>
                  <input
                    type="date"
                    id="modal-due"
                    className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="modal-priority" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                    Mức độ ưu tiên
                  </label>
                  <select
                    id="modal-priority"
                    className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink cursor-pointer"
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                  </select>
                </div>
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
                  ) : editingTaskId !== null ? (
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
