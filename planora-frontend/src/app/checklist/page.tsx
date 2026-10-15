'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePlan } from '@/services/weddingPlan';
import { 
  getChecklist, 
  createTask, 
  updateTask, 
  deleteTask 
} from '@/services/checklist';
import type { ChecklistTask } from '@/types/checklist';
import type { KanbanTask, KanbanStatus, TaskPriority, KanbanSubtask } from '@/types/kanban';
import { 
  KANBAN_CATEGORIES, 
  CATEGORY_MAP, 
  getCategoryById, 
  detectCategoryFromText, 
  DEFAULT_TASK_TEMPLATES, 
  calculateDueDate, 
  getSuggestedNextTasks 
} from '@/utils/kanbanTemplates';
import { toInputDateFormat } from '@/utils/date';
import { 
  ListTodo, 
  Plus, 
  Trash2, 
  Calendar, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  User, 
  CheckSquare, 
  Square, 
  Link as LinkIcon, 
  Search, 
  ArrowUpDown, 
  X, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight, 
  MoreHorizontal, 
  SlidersHorizontal,
  Flame,
  ArrowRight,
  GripVertical
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardFooter from '@/components/layout/DashboardFooter';
import type { ActivePlanResponse } from '@/types/weddingPlan';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlan } from '@/contexts/PlanContext';

// Column configurations
const COLUMNS: { id: KanbanStatus; title: string; subtitle: string; icon: string; headerColor: string; bgTint: string }[] = [
  {
    id: 'TODO',
    title: 'CHƯA LÀM',
    subtitle: 'Nhiệm vụ cần bắt đầu',
    icon: '⏳',
    headerColor: 'border-amber-400 text-amber-900',
    bgTint: 'bg-amber-50/20',
  },
  {
    id: 'IN_PROGRESS',
    title: 'ĐANG THỰC HIỆN',
    subtitle: 'Đang triển khai chi tiết',
    icon: '⚡',
    headerColor: 'border-blue-500 text-blue-900',
    bgTint: 'bg-blue-50/20',
  },
  {
    id: 'REVIEW',
    title: 'CHỜ XÁC NHẬN',
    subtitle: 'Chờ duyệt / cọc / phản hồi',
    icon: '👀',
    headerColor: 'border-purple-500 text-purple-900',
    bgTint: 'bg-purple-50/20',
  },
  {
    id: 'DONE',
    title: 'HOÀN THÀNH',
    subtitle: 'Đã hoàn tất trọn vẹn',
    icon: '✨',
    headerColor: 'border-emerald-500 text-emerald-900',
    bgTint: 'bg-emerald-50/20',
  },
];

interface TaskMetadata {
  category: string;
  assignee: string;
  subtasks: KanbanSubtask[];
  notes: string;
  dependencyTaskId: number | null;
  kanbanStatus: KanbanStatus;
}

export default function Checklist() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, formatDateDisplay } = useLanguage();
  const router = useRouter();

  // Plan & Countdown from PlanContext
  const { plan, daysLeft, isLoadingPlan } = usePlan();
  const planId = plan?.id ?? null;
  const weddingDate = plan?.weddingDate ?? null;

  // Loading & Notification States
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Kanban Tasks Master State
  const [tasks, setTasks] = useState<KanbanTask[]>([]);

  // Drag and drop states
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [deadlineFilter, setDeadlineFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_SOON' | 'THIS_MONTH'>('ALL');
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
  const [sortBy, setSortBy] = useState<'DUE_DATE_ASC' | 'DUE_DATE_DESC' | 'PRIORITY_DESC' | 'PRIORITY_ASC' | 'CREATED_DESC'>('DUE_DATE_ASC');

  // Side Panel (Task Detail) States
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormTitle, setAddFormTitle] = useState('');
  const [addFormCategory, setAddFormCategory] = useState('catering');
  const [addFormDesc, setAddFormDesc] = useState('');
  const [addFormPriority, setAddFormPriority] = useState<TaskPriority>('MEDIUM');
  const [addFormDueDate, setAddFormDueDate] = useState('');
  const [addFormAssignee, setAddFormAssignee] = useState('Cô dâu & Chú rể');
  const [addFormNotes, setAddFormNotes] = useState('');
  const [addFormDependency, setAddFormDependency] = useState<number | null>(null);
  const [addFormSubtasks, setAddFormSubtasks] = useState<string[]>([]);
  const [addFormSubtaskInput, setAddFormSubtaskInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto Task Generation Modal State
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState(false);
  const [selectedTemplateCategories, setSelectedTemplateCategories] = useState<string[]>(KANBAN_CATEGORIES.map(c => c.id));
  const [isGenerating, setIsGenerating] = useState(false);

  // Next Task Suggestion Notification State
  const [suggestionData, setSuggestionData] = useState<{
    completedTitle: string;
    suggestions: { title: string; category: string }[];
  } | null>(null);

  // Storage Key for this plan's metadata
  const getStorageKey = (id: number) => `planora_kanban_meta_${id}`;

  // Helper to load metadata from localStorage
  const loadLocalMeta = (id: number): Record<number, TaskMetadata> => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(getStorageKey(id));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  // Helper to save metadata to localStorage
  const saveLocalMeta = (id: number, metaMap: Record<number, TaskMetadata>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(getStorageKey(id), JSON.stringify(metaMap));
    } catch (e) {
      console.warn('Could not save metadata to localStorage', e);
    }
  };

  // Auth Redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Tasks directly with planId
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
        const backendTasks = await getChecklist(planId!);
        const metaMap = loadLocalMeta(planId!);

        const enrichedTasks: KanbanTask[] = backendTasks.map(bt => {
          const meta = metaMap[bt.id];
          let status: KanbanStatus = 'TODO';
          if (meta?.kanbanStatus) {
            status = meta.kanbanStatus;
          } else if (bt.status === 'DONE') {
            status = 'DONE';
          } else if (bt.status === 'IN_PROGRESS') {
            status = 'IN_PROGRESS';
          } else {
            status = 'TODO';
          }

          return {
            id: bt.id,
            weddingPlanId: bt.weddingPlanId,
            title: bt.title,
            description: bt.description,
            dueDate: bt.dueDate || '',
            status,
            priority: (bt.priority as TaskPriority) || 'MEDIUM',
            category: meta?.category || detectCategoryFromText(bt.title),
            assignee: meta?.assignee || 'Cô dâu & Chú rể',
            subtasks: meta?.subtasks || [],
            notes: meta?.notes || '',
            dependencyTaskId: meta?.dependencyTaskId !== undefined ? meta.dependencyTaskId : null,
            createdAt: bt.createdAt || new Date().toISOString(),
          };
        });

        if (isMounted) {
          setTasks(enrichedTasks);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu checklist:', err);
        if (isMounted) {
          setErrorMessage(t.checklist.errorLoading);
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
  }, [isAuthenticated, planId, isLoadingPlan, plan, router, t.checklist.errorLoading]);

  // Persist single task change to LocalStorage and Backend
  const persistTaskUpdate = async (updatedTask: KanbanTask) => {
    if (!planId) return;

    // Update state first for instant responsiveness
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    // Update localStorage metadata
    const metaMap = loadLocalMeta(planId);
    metaMap[updatedTask.id] = {
      category: updatedTask.category,
      assignee: updatedTask.assignee,
      subtasks: updatedTask.subtasks,
      notes: updatedTask.notes || '',
      dependencyTaskId: updatedTask.dependencyTaskId ?? null,
      kanbanStatus: updatedTask.status,
    };
    saveLocalMeta(planId, metaMap);

    // Sync to backend (mapping REVIEW to IN_PROGRESS for backend enum compatibility)
    try {
      const backendStatus = updatedTask.status === 'DONE' ? 'DONE' : updatedTask.status === 'IN_PROGRESS' || updatedTask.status === 'REVIEW' ? 'IN_PROGRESS' : 'TODO';
      await updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate || undefined,
        status: backendStatus,
        priority: updatedTask.priority,
      });
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  };

  // Move task to a new Kanban Column
  const handleMoveTask = async (taskId: number, newStatus: KanbanStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const wasNotDone = task.status !== 'DONE';
    const isNowDone = newStatus === 'DONE';

    const updatedTask: KanbanTask = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    await persistTaskUpdate(updatedTask);

    // If task was just completed, trigger Next Task Suggestions!
    if (wasNotDone && isNowDone) {
      const suggestions = getSuggestedNextTasks(task.title, task.category);
      if (suggestions && suggestions.length > 0) {
        setSuggestionData({
          completedTitle: task.title,
          suggestions,
        });
      }
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('text/plain', String(taskId));
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: KanbanStatus) => {
    e.preventDefault();
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, colId: KanbanStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (!taskIdStr) return;
    const taskId = Number(taskIdStr);
    if (!isNaN(taskId)) {
      await handleMoveTask(taskId, colId);
    }
    setDraggedTaskId(null);
  };

  // Toggle Subtask in active task
  const handleToggleSubtask = async (taskId: number, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const updatedTask: KanbanTask = {
      ...task,
      subtasks: updatedSubtasks,
    };

    await persistTaskUpdate(updatedTask);
  };

  // Add new subtask to active task in Side Panel
  const handleAddSubtaskToActive = async () => {
    if (!activeTaskId || !newSubtaskTitle.trim()) return;
    const task = tasks.find(t => t.id === activeTaskId);
    if (!task) return;

    const newSt: KanbanSubtask = {
      id: 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    const updatedTask: KanbanTask = {
      ...task,
      subtasks: [...task.subtasks, newSt],
    };

    await persistTaskUpdate(updatedTask);
    setNewSubtaskTitle('');
  };

  // Remove subtask from active task
  const handleRemoveSubtask = async (taskId: number, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask: KanbanTask = {
      ...task,
      subtasks: task.subtasks.filter(st => st.id !== subtaskId),
    };

    await persistTaskUpdate(updatedTask);
  };

  // Delete task
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm(t.checklist.confirmDeleteTask)) return;
    if (!planId) return;

    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Clean metadata
      const metaMap = loadLocalMeta(planId);
      delete metaMap[taskId];
      saveLocalMeta(planId, metaMap);

      if (activeTaskId === taskId) {
        setActiveTaskId(null);
      }
      setSuccessMessage('Đã xóa công việc thành công.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi xóa công việc:', err);
      setErrorMessage('Không thể xóa công việc. Vui lòng thử lại.');
    }
  };

  // Add Task Modal Submit
  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormTitle.trim() || !planId) {
      setErrorMessage(t.checklist.titleRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createTask(planId, {
        title: addFormTitle.trim(),
        description: addFormDesc.trim() || undefined,
        dueDate: addFormDueDate || undefined,
        priority: addFormPriority,
      });

      const subtasks: KanbanSubtask[] = addFormSubtasks.map((st, idx) => ({
        id: 'st_init_' + idx + '_' + Date.now(),
        title: st,
        completed: false,
      }));

      const newKanbanTask: KanbanTask = {
        id: created.id,
        weddingPlanId: created.weddingPlanId,
        title: created.title,
        description: created.description,
        dueDate: created.dueDate || addFormDueDate || '',
        status: 'TODO',
        priority: addFormPriority,
        category: addFormCategory,
        assignee: addFormAssignee || 'Cô dâu & Chú rể',
        subtasks,
        notes: addFormNotes.trim(),
        dependencyTaskId: addFormDependency,
        createdAt: new Date().toISOString(),
      };

      setTasks(prev => [newKanbanTask, ...prev]);

      // Save local meta
      const metaMap = loadLocalMeta(planId);
      metaMap[created.id] = {
        category: addFormCategory,
        assignee: addFormAssignee,
        subtasks,
        notes: addFormNotes.trim(),
        dependencyTaskId: addFormDependency,
        kanbanStatus: 'TODO',
      };
      saveLocalMeta(planId, metaMap);

      setSuccessMessage('Thêm công việc mới thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseAddModal();
    } catch (err) {
      console.error('Lỗi khi tạo công việc mới:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Tạo công việc thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddFormTitle('');
    setAddFormDesc('');
    setAddFormDueDate('');
    setAddFormCategory('catering');
    setAddFormPriority('MEDIUM');
    setAddFormAssignee('Cô dâu & Chú rể');
    setAddFormNotes('');
    setAddFormDependency(null);
    setAddFormSubtasks([]);
    setAddFormSubtaskInput('');
  };

  // Quick Add Suggested Tasks to Kanban
  const handleAddSuggestedTask = async (title: string, category: string) => {
    if (!planId) return;

    try {
      const defaultDate = calculateDueDate(14, weddingDate);
      const created = await createTask(planId, {
        title,
        description: `Gợi ý từ hệ thống dựa trên tiến độ ngày cưới.`,
        dueDate: defaultDate,
        priority: 'MEDIUM',
      });

      const newTask: KanbanTask = {
        id: created.id,
        weddingPlanId: created.weddingPlanId,
        title: created.title,
        description: created.description,
        dueDate: defaultDate,
        status: 'TODO',
        priority: 'MEDIUM',
        category,
        assignee: 'Cô dâu & Chú rể',
        subtasks: [
          { id: 'st_1', title: 'Thu thập báo giá & thông tin chi tiết', completed: false },
          { id: 'st_2', title: 'Thống nhất phương án thực hiện', completed: false },
        ],
        notes: '',
        dependencyTaskId: null,
        createdAt: new Date().toISOString(),
      };

      setTasks(prev => [newTask, ...prev]);

      const metaMap = loadLocalMeta(planId);
      metaMap[created.id] = {
        category,
        assignee: 'Cô dâu & Chú rể',
        subtasks: newTask.subtasks,
        notes: '',
        dependencyTaskId: null,
        kanbanStatus: 'TODO',
      };
      saveLocalMeta(planId, metaMap);

      // Remove from suggestion list
      if (suggestionData) {
        const remaining = suggestionData.suggestions.filter(s => s.title !== title);
        if (remaining.length === 0) {
          setSuggestionData(null);
        } else {
          setSuggestionData({ ...suggestionData, suggestions: remaining });
        }
      }
    } catch (err) {
      console.error('Lỗi khi thêm task gợi ý:', err);
    }
  };

  const handleAddAllSuggestions = async () => {
    if (!suggestionData || !planId) return;
    for (const item of suggestionData.suggestions) {
      await handleAddSuggestedTask(item.title, item.category);
    }
    setSuggestionData(null);
    setSuccessMessage('Đã thêm tất cả các nhiệm vụ gợi ý vào cột CHƯA LÀM!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Generate Sample Tasks Batch
  const handleExecuteAutoGenerate = async () => {
    if (!planId) return;
    setIsGenerating(true);

    try {
      const templatesToGenerate = DEFAULT_TASK_TEMPLATES.filter(tpl => 
        selectedTemplateCategories.includes(tpl.category)
      );

      const newTasksAdded: KanbanTask[] = [];
      const metaMap = loadLocalMeta(planId);

      for (const tpl of templatesToGenerate) {
        // Calculate tailored deadline based on wedding date
        const calculatedDate = calculateDueDate(tpl.daysBeforeWedding, weddingDate);

        try {
          const created = await createTask(planId, {
            title: tpl.title,
            description: tpl.description,
            dueDate: calculatedDate,
            priority: tpl.priority,
          });

          const subtasks: KanbanSubtask[] = (tpl.subtasks || []).map((stText, idx) => ({
            id: 'st_' + idx + '_' + Date.now() + Math.random().toString(36).substr(2, 3),
            title: stText,
            completed: false,
          }));

          const kTask: KanbanTask = {
            id: created.id,
            weddingPlanId: created.weddingPlanId,
            title: created.title,
            description: created.description,
            dueDate: calculatedDate,
            status: 'TODO',
            priority: tpl.priority,
            category: tpl.category,
            assignee: 'Cô dâu & Chú rể',
            subtasks,
            notes: '',
            dependencyTaskId: null,
            createdAt: new Date().toISOString(),
          };

          metaMap[created.id] = {
            category: tpl.category,
            assignee: 'Cô dâu & Chú rể',
            subtasks,
            notes: '',
            dependencyTaskId: null,
            kanbanStatus: 'TODO',
          };

          newTasksAdded.push(kTask);
        } catch (e) {
          console.warn('Skipping task generation failure:', e);
        }
      }

      saveLocalMeta(planId, metaMap);
      setTasks(prev => [...newTasksAdded, ...prev]);

      setIsAutoGenerateModalOpen(false);
      setSuccessMessage(`Đã tự động khởi tạo ${newTasksAdded.length} nhiệm vụ mẫu theo lộ trình ngày cưới!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Lỗi khi tự sinh task:', err);
      setErrorMessage('Không thể khởi tạo nhiệm vụ mẫu. Vui lòng thử lại!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate Urgency & Deadline Status
  const getDeadlineStatus = (dueDateStr: string, isDone: boolean): { status: 'OVERDUE' | 'DUE_SOON' | 'PLENTY' | 'NO_DATE'; text: string; badgeClass: string } => {
    if (isDone) {
      return { status: 'PLENTY', text: 'Đã hoàn thành', badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    if (!dueDateStr) {
      return { status: 'NO_DATE', text: 'Chưa có hạn', badgeClass: 'text-gray-500 bg-gray-50 border-gray-200' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'OVERDUE',
        text: `Quá hạn ${Math.abs(diffDays)} ngày`,
        badgeClass: 'text-red-700 bg-red-100/90 border-red-300 font-bold animate-pulse',
      };
    }
    if (diffDays === 0) {
      return {
        status: 'DUE_SOON',
        text: 'Hạn hôm nay',
        badgeClass: 'text-amber-800 bg-amber-100 border-amber-300 font-bold',
      };
    }
    if (diffDays <= 7) {
      return {
        status: 'DUE_SOON',
        text: `Còn ${diffDays} ngày`,
        badgeClass: 'text-amber-800 bg-amber-50 border-amber-200 font-semibold',
      };
    }

    return {
      status: 'PLENTY',
      text: formatDateDisplay(dueDateStr),
      badgeClass: 'text-slate-600 bg-slate-50 border-slate-200',
    };
  };

  // Filter & Sort Pipeline
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(term);
          const matchDesc = task.description?.toLowerCase().includes(term) ?? false;
          if (!matchTitle && !matchDesc) return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && task.category !== selectedCategory) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
          return false;
        }

        // Assignee filter
        if (assigneeFilter !== 'ALL' && task.assignee !== assigneeFilter) {
          return false;
        }

        // Overdue & Deadline filters
        const isDone = task.status === 'DONE';
        const deadlineInfo = getDeadlineStatus(task.dueDate, isDone);

        if (showOnlyOverdue && deadlineInfo.status !== 'OVERDUE') {
          return false;
        }

        if (deadlineFilter === 'OVERDUE' && deadlineInfo.status !== 'OVERDUE') {
          return false;
        }
        if (deadlineFilter === 'DUE_SOON' && deadlineInfo.status !== 'DUE_SOON') {
          return false;
        }
        if (deadlineFilter === 'THIS_MONTH') {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          const now = new Date();
          if (taskDate.getMonth() !== now.getMonth() || taskDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'DUE_DATE_ASC') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'DUE_DATE_DESC') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (sortBy === 'PRIORITY_DESC') {
          const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'PRIORITY_ASC') {
          const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return weights[a.priority] - weights[b.priority];
        }
        if (sortBy === 'CREATED_DESC') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [tasks, searchTerm, selectedCategory, priorityFilter, assigneeFilter, deadlineFilter, showOnlyOverdue, sortBy]);

  // Tasks grouped by Kanban Column
  const columnsData: Record<KanbanStatus, KanbanTask[]> = useMemo(() => {
    const map: Record<KanbanStatus, KanbanTask[]> = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
    };
    filteredTasks.forEach(task => {
      if (map[task.status]) {
        map[task.status].push(task);
      } else {
        map.TODO.push(task);
      }
    });
    return map;
  }, [filteredTasks]);

  // Overall Statistics for Mini Dashboard
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'DONE').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const review = tasks.filter(t => t.status === 'REVIEW').length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const overdue = tasks.filter(t => {
      if (t.status === 'DONE' || !t.dueDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() < today.getTime();
    }).length;

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      review,
      todo,
      overdue,
      percent,
    };
  }, [tasks]);

  // Unique assignees for filter
  const uniqueAssignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => {
      if (t.assignee) set.add(t.assignee);
    });
    return Array.from(set);
  }, [tasks]);

  // Active Task for Side Panel
  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return tasks.find(t => t.id === activeTaskId) || null;
  }, [activeTaskId, tasks]);

  // Dependent task name resolver
  const getDependentTaskName = (depId?: number | null): { name: string; isDone: boolean } | null => {
    if (!depId) return null;
    const dep = tasks.find(t => t.id === depId);
    if (!dep) return null;
    return { name: dep.title, isDone: dep.status === 'DONE' };
  };

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

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-body-text font-sans flex flex-col w-full selection:bg-primary/10 selection:text-primary">
      {/* Top Info Bar */}
      <div className="sticky top-0 z-40">
        <DashboardHeader logout={logout} plan={plan} daysLeft={daysLeft} />
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 w-full relative">
        <DashboardSidebar hasPlan={!!plan} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFBF5]">
          <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8 py-6 flex flex-col justify-start space-y-6">

            {/* ─── Header: Title & Main Action Buttons ─── */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-4 border-b border-hairline">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Hệ Thống Quản Trị Tiệc Cưới Planora
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink font-display flex items-center gap-2.5">
                  <ListTodo className="w-7 h-7 text-primary" />
                  Checklist Nhiệm Vụ & Kanban Board
                </h1>
                <p className="text-xs sm:text-sm text-muted-text mt-1">
                  Kéo thả công việc giữa các cột, theo dõi tiến độ chi tiết và tối ưu hóa thời gian chuẩn bị ngày cưới.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                {/* Auto Task Generation Button */}
                <button
                  type="button"
                  onClick={() => setIsAutoGenerateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-canvas border border-primary/30 text-primary hover:bg-primary/5 hover:border-primary rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer font-display"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  Tự sinh việc mẫu theo ngày cưới
                </button>

                {/* Primary Add Task Button */}
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-cream hover:bg-primary-active rounded-full text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer font-display uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4 text-cream" />
                  + Thêm công việc
                </button>
              </div>
            </div>

            {/* ─── Notifications ─── */}
            {errorMessage && (
              <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-center justify-between text-xs sm:text-sm animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-between text-xs sm:text-sm animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700 text-sm">✕</button>
              </div>
            )}

            {/* ─── Next Task Smart Suggestion Banner ─── */}
            {suggestionData && (
              <div className="p-4 bg-gradient-to-r from-amber-50/90 via-cream to-rose-50/80 border border-amber-200/80 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    GỢI Ý TỰ ĐỘNG TỪ HỆ THỐNG
                  </div>
                  <p className="text-xs sm:text-sm text-ink">
                    Bạn vừa hoàn thành <strong className="text-primary font-serif">"{suggestionData.completedTitle}"</strong>. 
                    Dưới đây là các bước tiếp theo bạn có thể thực hiện:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {suggestionData.suggestions.map((sg, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddSuggestedTask(sg.title, sg.category)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-100/60 border border-amber-200 rounded-lg text-xs font-medium text-ink transition-colors cursor-pointer shadow-2xs"
                        title="Click để thêm ngay vào cột Chưa làm"
                      >
                        <span className="text-amber-700">+</span> {sg.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleAddAllSuggestions}
                    className="px-3.5 py-1.5 bg-primary text-cream hover:bg-primary-active text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Thêm tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuggestionData(null)}
                    className="p-1.5 text-muted-text hover:text-ink hover:bg-black/5 rounded-md cursor-pointer text-xs"
                    title="Bỏ qua"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── Section 4: Mini Dashboard Progress & Stats ─── */}
            <div className="p-5 sm:p-6 bg-white border border-hairline rounded-2xl shadow-xs space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="p-3 bg-canvas/60 border border-hairline/80 rounded-xl text-center">
                  <span className="text-[11px] font-bold text-muted-text uppercase tracking-wider block">TỔNG NHIỆM VỤ</span>
                  <span className="text-2xl font-bold text-ink font-display">{stats.total}</span>
                </div>
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-center">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">HOÀN THÀNH</span>
                  <span className="text-2xl font-bold text-emerald-700 font-display">{stats.completed}</span>
                </div>
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-center">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">ĐANG LÀM</span>
                  <span className="text-2xl font-bold text-blue-700 font-display">{stats.inProgress}</span>
                </div>
                <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-center">
                  <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">CHỜ XÁC NHẬN</span>
                  <span className="text-2xl font-bold text-purple-700 font-display">{stats.review}</span>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-center">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">CHƯA LÀM</span>
                  <span className="text-2xl font-bold text-amber-700 font-display">{stats.todo}</span>
                </div>
                <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-center">
                  <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">QUÁ HẠN</span>
                  <span className="text-2xl font-bold text-red-600 font-display">{stats.overdue}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs font-medium text-ink">
                  <span className="font-semibold text-primary">
                    Tiến độ hoàn tất: {stats.completed} / {stats.total} nhiệm vụ
                  </span>
                  <span className="font-bold text-primary text-sm font-display">{stats.percent}%</span>
                </div>
                <div className="w-full h-3 bg-canvas border border-hairline/80 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-active rounded-full transition-all duration-500"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ─── Section 2: Category Filter Pills Bar ─── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">
                  Nhóm Công Việc ({KANBAN_CATEGORIES.length})
                </span>
                <span className="text-xs text-muted-text">Click để lọc nhanh theo danh mục</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === 'ALL'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-ink border-hairline hover:bg-canvas'
                  }`}
                >
                  Tất cả ({tasks.length})
                </button>
                {KANBAN_CATEGORIES.map(cat => {
                  const count = tasks.filter(t => t.category === cat.id).length;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-ink border-hairline hover:border-primary/40'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-canvas text-muted-text'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Section 5: Real-time Search & Multi-Filters Toolbar ─── */}
            <div className="p-4 bg-white border border-hairline rounded-2xl shadow-xs flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                {/* Search input */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-4 h-4 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm công việc realtime..."
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-canvas border border-hairline rounded-xl focus:outline-none focus:border-primary text-ink"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-ink text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-1.5 border border-hairline rounded-xl bg-canvas px-3 py-1.5">
                  <span className="text-[11px] font-bold text-muted-text uppercase border-r border-hairline pr-2">Ưu tiên</span>
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
                    className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="HIGH">🔴 Cao</option>
                    <option value="MEDIUM">🟡 Trung bình</option>
                    <option value="LOW">🟢 Thấp</option>
                  </select>
                </div>

                {/* Assignee Filter */}
                {uniqueAssignees.length > 0 && (
                  <div className="flex items-center gap-1.5 border border-hairline rounded-xl bg-canvas px-3 py-1.5">
                    <span className="text-[11px] font-bold text-muted-text uppercase border-r border-hairline pr-2">Phụ trách</span>
                    <select
                      value={assigneeFilter}
                      onChange={e => setAssigneeFilter(e.target.value)}
                      className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer max-w-[120px] truncate"
                    >
                      <option value="ALL">Tất cả</option>
                      {uniqueAssignees.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Deadline Filter */}
                <div className="flex items-center gap-1.5 border border-hairline rounded-xl bg-canvas px-3 py-1.5">
                  <span className="text-[11px] font-bold text-muted-text uppercase border-r border-hairline pr-2">Thời hạn</span>
                  <select
                    value={deadlineFilter}
                    onChange={e => setDeadlineFilter(e.target.value as any)}
                    className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả hạn</option>
                    <option value="OVERDUE">Quá hạn</option>
                    <option value="DUE_SOON">Sắp đến hạn (≤ 7 ngày)</option>
                    <option value="THIS_MONTH">Trong tháng này</option>
                  </select>
                </div>

                {/* Checkbox: Chỉ hiển thị task quá hạn */}
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer select-none bg-canvas px-3 py-2 border border-hairline rounded-xl hover:bg-primary/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={showOnlyOverdue}
                    onChange={e => setShowOnlyOverdue(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-primary focus:ring-primary accent-primary"
                  />
                  <span className={showOnlyOverdue ? 'text-red-700 font-bold' : ''}>Chỉ task quá hạn</span>
                </label>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 border border-hairline rounded-xl bg-canvas px-3 py-1.5 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-text" />
                <span className="text-[11px] font-bold text-muted-text uppercase border-r border-hairline pr-2">Sắp xếp</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="DUE_DATE_ASC">Hạn chót gần nhất</option>
                  <option value="DUE_DATE_DESC">Hạn chót xa nhất</option>
                  <option value="PRIORITY_DESC">Ưu tiên Cao → Thấp</option>
                  <option value="PRIORITY_ASC">Ưu tiên Thấp → Cao</option>
                  <option value="CREATED_DESC">Ngày tạo mới nhất</option>
                </select>
              </div>
            </div>

            {/* ─── Section 1: 4-Column Kanban Board ─── */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-hairline rounded-2xl shadow-xs">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm text-muted-text font-display">Đang tải bảng Kanban nhiệm vụ...</span>
              </div>
            ) : tasks.length === 0 ? (
              /* Empty state offering auto-generation */
              <div className="py-20 text-center bg-white border border-hairline rounded-2xl shadow-xs text-muted-text flex flex-col items-center gap-4 px-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-xl font-bold text-ink font-display">Chưa có nhiệm vụ nào trong kế hoạch</h3>
                  <p className="text-xs sm:text-sm text-muted-text">
                    Khởi tạo danh sách công việc chuẩn bị đám cưới tự động theo ngày cưới hoặc tự thêm công việc thủ công.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAutoGenerateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-cream hover:bg-primary-active rounded-full text-sm font-bold shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Tự sinh 60+ công việc mẫu
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-canvas border border-hairline hover:bg-white text-ink rounded-full text-sm font-semibold cursor-pointer"
                  >
                    + Tạo công việc đầu tiên
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4.5 items-start overflow-x-auto pb-6">
                {COLUMNS.map(col => {
                  const colTasks = columnsData[col.id] || [];
                  const isDragOver = dragOverColumn === col.id;

                  return (
                    <div
                      key={col.id}
                      onDragOver={e => handleDragOver(e, col.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={e => handleDrop(e, col.id)}
                      className={`flex flex-col rounded-2xl border transition-all duration-200 min-w-[280px] bg-[#FAF8F5]/80 ${
                        isDragOver
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md'
                          : 'border-hairline shadow-2xs'
                      }`}
                    >
                      {/* Column Header */}
                      <div className={`p-4 border-b border-hairline rounded-t-2xl bg-white flex items-center justify-between border-t-4 ${col.headerColor}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{col.icon}</span>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-ink tracking-wider uppercase font-display">
                              {col.title}
                            </h3>
                            <span className="text-[10px] text-muted-text block leading-tight">
                              {col.subtitle}
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-canvas border border-hairline text-ink">
                          {colTasks.length}
                        </span>
                      </div>

                      {/* Task Cards Container */}
                      <div className="p-3 space-y-3 min-h-[480px] flex-1">
                        {colTasks.length === 0 ? (
                          <div className="h-40 border-2 border-dashed border-hairline/80 rounded-xl flex flex-col items-center justify-center text-center p-4 text-muted-text/70 select-none">
                            <span className="text-xs italic">Kéo thả nhiệm vụ vào đây</span>
                          </div>
                        ) : (
                          colTasks.map(task => {
                            const cat = getCategoryById(task.category);
                            const isDone = task.status === 'DONE';
                            const deadline = getDeadlineStatus(task.dueDate, isDone);
                            const isOverdue = deadline.status === 'OVERDUE';
                            const depInfo = getDependentTaskName(task.dependencyTaskId);
                            const completedSubtasks = task.subtasks.filter(st => st.completed).length;
                            const totalSubtasks = task.subtasks.length;
                            const isBeingDragged = draggedTaskId === task.id;

                            // Priority styling
                            let priorityBadge = 'bg-slate-50 text-slate-700 border-slate-200';
                            let priorityDot = 'bg-slate-400';
                            let priorityLabel = 'THẤP';
                            if (task.priority === 'HIGH') {
                              priorityBadge = 'bg-red-50 text-red-700 border-red-200';
                              priorityDot = 'bg-red-500';
                              priorityLabel = 'CAO';
                            } else if (task.priority === 'MEDIUM') {
                              priorityBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                              priorityDot = 'bg-amber-500';
                              priorityLabel = 'TRUNG BÌNH';
                            }

                            return (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={e => handleDragStart(e, task.id)}
                                onDragEnd={() => setDraggedTaskId(null)}
                                onClick={() => setActiveTaskId(task.id)}
                                className={`group p-4 bg-white rounded-xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-primary/40 relative select-none ${
                                  isOverdue 
                                    ? 'border-red-300 bg-red-50/15 ring-1 ring-red-200/50' 
                                    : 'border-hairline'
                                } ${isBeingDragged ? 'opacity-40 scale-98 border-dashed border-primary' : ''}`}
                              >
                                {/* Top row: Category tag & Priority */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cat.colorBg} ${cat.colorText} ${cat.colorBorder}`}>
                                    <span>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wider uppercase ${priorityBadge}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${priorityDot}`} />
                                      {priorityLabel}
                                    </span>
                                  </div>
                                </div>

                                {/* Task Title */}
                                <h4 className={`text-sm font-semibold text-ink leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors ${
                                  isDone ? 'line-through text-muted-text font-normal' : ''
                                }`}>
                                  {task.title}
                                </h4>

                                {/* Description excerpt */}
                                {task.description && (
                                  <p className="text-xs text-muted-text line-clamp-2 mb-3 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}

                                {/* Dependency badge (if any) */}
                                {depInfo && (
                                  <div className={`text-[11px] px-2 py-1 rounded-md mb-2 flex items-center gap-1.5 border ${
                                    depInfo.isDone 
                                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                                      : 'bg-amber-50/80 border-amber-200 text-amber-900 font-medium'
                                  }`}>
                                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {depInfo.isDone ? 'Đã xong:' : 'Chờ:'} {depInfo.name}
                                    </span>
                                  </div>
                                )}

                                {/* Subtasks Progress bar */}
                                {totalSubtasks > 0 && (
                                  <div className="mb-2.5 bg-canvas/70 p-2 rounded-lg border border-hairline/60">
                                    <div className="flex justify-between items-center text-[10px] font-medium text-muted-text mb-1">
                                      <span className="flex items-center gap-1">
                                        <CheckSquare className="w-3 h-3 text-primary" />
                                        Các bước
                                      </span>
                                      <span className="font-mono font-bold text-ink">
                                        {completedSubtasks}/{totalSubtasks} ({Math.round((completedSubtasks/totalSubtasks)*100)}%)
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-hairline/50">
                                      <div 
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${(completedSubtasks/totalSubtasks)*100}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Card Footer: Assignee & Deadline Status */}
                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-hairline/60 text-xs">
                                  {/* Assignee */}
                                  <div className="flex items-center gap-1.5 text-muted-text truncate max-w-[120px]" title={task.assignee}>
                                    <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                      {task.assignee.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[11px] truncate font-medium">{task.assignee}</span>
                                  </div>

                                  {/* Deadline Badge */}
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border whitespace-nowrap ${deadline.badgeClass}`}>
                                    {isOverdue ? (
                                      <Flame className="w-3 h-3 text-red-600 flex-shrink-0" />
                                    ) : (
                                      <Calendar className="w-3 h-3 text-muted-text flex-shrink-0" />
                                    )}
                                    <span>{deadline.text}</span>
                                  </span>
                                </div>

                                {/* Quick Move Actions on hover/touch */}
                                <div 
                                  className="mt-2.5 pt-2 border-t border-hairline/40 flex items-center justify-between text-[11px] text-muted-text"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <span className="text-[10px] italic text-muted-text">Chuyển:</span>
                                  <div className="flex gap-1">
                                    {COLUMNS.filter(c => c.id !== task.status).map(c => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => handleMoveTask(task.id, c.id)}
                                        className="px-1.5 py-0.5 rounded bg-canvas hover:bg-primary hover:text-white border border-hairline text-[10px] transition-colors"
                                        title={`Chuyển sang ${c.title}`}
                                      >
                                        {c.icon}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Add quick task at bottom of column */}
                      <div className="p-3 pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddModalOpen(true);
                          }}
                          className="w-full py-2 border border-dashed border-hairline hover:border-primary text-muted-text hover:text-primary rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white/60 hover:bg-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm việc vào {col.title}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ─── Section 7: Task Detail Side Panel (Slide-Over from Right) ─── */}
      {activeTask && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setActiveTaskId(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-hairline flex flex-col justify-between animate-slide-left">
              
              {/* Panel Header */}
              <div className="p-6 border-b border-hairline bg-[#FAF8F5]/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryById(activeTask.category).colorBg} ${getCategoryById(activeTask.category).colorText} ${getCategoryById(activeTask.category).colorBorder}`}>
                    <span>{getCategoryById(activeTask.category).icon}</span>
                    <span>{getCategoryById(activeTask.category).name}</span>
                  </span>
                  <span className="text-xs text-muted-text">• ID #{activeTask.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(activeTask.id)}
                    className="p-2 text-muted-text hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa công việc này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTaskId(null)}
                    className="p-2 text-muted-text hover:text-ink hover:bg-canvas rounded-lg transition-colors cursor-pointer"
                    title="Đóng bảng chi tiết"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Panel Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Title Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                    Tên nhiệm vụ
                  </label>
                  <input
                    type="text"
                    value={activeTask.title}
                    onChange={e => persistTaskUpdate({ ...activeTask, title: e.target.value })}
                    className="w-full text-lg font-bold text-ink font-display p-2.5 bg-canvas/60 border border-hairline rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Status & Priority Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                      Trạng thái Kanban
                    </label>
                    <select
                      value={activeTask.status}
                      onChange={e => handleMoveTask(activeTask.id, e.target.value as KanbanStatus)}
                      className="w-full text-xs font-bold text-ink p-2.5 bg-canvas/60 border border-hairline rounded-xl focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {COLUMNS.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                      Độ ưu tiên
                    </label>
                    <select
                      value={activeTask.priority}
                      onChange={e => persistTaskUpdate({ ...activeTask, priority: e.target.value as TaskPriority })}
                      className="w-full text-xs font-bold text-ink p-2.5 bg-canvas/60 border border-hairline rounded-xl focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="HIGH">🔴 Ưu tiên Cao</option>
                      <option value="MEDIUM">🟡 Ưu tiên Trung bình</option>
                      <option value="LOW">🟢 Ưu tiên Thấp</option>
                    </select>
                  </div>
                </div>

                {/* Category & Assignee Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                      Nhóm công việc
                    </label>
                    <select
                      value={activeTask.category}
                      onChange={e => persistTaskUpdate({ ...activeTask, category: e.target.value })}
                      className="w-full text-xs font-semibold text-ink p-2.5 bg-canvas/60 border border-hairline rounded-xl focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {KANBAN_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                      Người phụ trách
                    </label>
                    <input
                      type="text"
                      value={activeTask.assignee}
                      onChange={e => persistTaskUpdate({ ...activeTask, assignee: e.target.value })}
                      placeholder="VD: Cô dâu, Chú rể..."
                      className="w-full text-xs font-semibold text-ink p-2.5 bg-canvas/60 border border-hairline rounded-xl focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Due Date & Urgency Display */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                    Hạn chót hoàn thành
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={toInputDateFormat(activeTask.dueDate)}
                      onChange={e => persistTaskUpdate({ ...activeTask, dueDate: e.target.value })}
                      className="flex-1 text-xs font-semibold text-ink p-2.5 bg-canvas/60 border border-hairline rounded-xl focus:outline-none focus:border-primary cursor-pointer"
                    />
                    <span className={`px-3 py-2 text-xs font-bold rounded-xl border ${getDeadlineStatus(activeTask.dueDate, activeTask.status === 'DONE').badgeClass}`}>
                      {getDeadlineStatus(activeTask.dueDate, activeTask.status === 'DONE').text}
                    </span>
                  </div>
                </div>

                {/* Task Dependency (Section 9) */}
                <div className="space-y-1.5 p-3.5 bg-canvas/60 border border-hairline rounded-xl">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-primary" />
                    Phụ thuộc vào công việc khác (Dependency)
                  </label>
                  <p className="text-[11px] text-muted-text">
                    Nhiệm vụ này chỉ nên bắt đầu khi công việc được chọn bên dưới đã hoàn tất.
                  </p>
                  <select
                    value={activeTask.dependencyTaskId ?? ''}
                    onChange={e => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      persistTaskUpdate({ ...activeTask, dependencyTaskId: val });
                    }}
                    className="w-full text-xs font-semibold text-ink p-2 bg-white border border-hairline rounded-lg focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">(Không có phụ thuộc - Độc lập)</option>
                    {tasks.filter(t => t.id !== activeTask.id).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.status === 'DONE' ? '✓ ' : '⏳ '} {t.title} ({getCategoryById(t.category).name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtasks Checklist (Section 7) */}
                <div className="space-y-3 pt-2 border-t border-hairline">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-primary" />
                      Danh sách các bước thực hiện ({activeTask.subtasks.filter(s => s.completed).length}/{activeTask.subtasks.length})
                    </label>
                    {activeTask.subtasks.length > 0 && (
                      <span className="text-xs font-mono font-bold text-primary">
                        {Math.round((activeTask.subtasks.filter(s => s.completed).length / activeTask.subtasks.length) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Subtask list */}
                  <div className="space-y-2">
                    {activeTask.subtasks.map(st => (
                      <div 
                        key={st.id} 
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          st.completed 
                            ? 'bg-emerald-50/40 border-emerald-200' 
                            : 'bg-white border-hairline hover:border-hairline/80'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(activeTask.id, st.id)}
                          className="flex items-center gap-2.5 flex-1 text-left cursor-pointer group"
                        >
                          {st.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-text group-hover:text-primary flex-shrink-0" />
                          )}
                          <span className={`text-xs ${st.completed ? 'line-through text-muted-text font-normal' : 'text-ink font-medium'}`}>
                            {st.title}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(activeTask.id, st.id)}
                          className="text-muted-text hover:text-red-500 text-xs p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Subtask Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={e => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtaskToActive();
                        }
                      }}
                      placeholder="+ Thêm bước thực hiện mới (Nhấn Enter)..."
                      className="flex-1 text-xs p-2 bg-canvas/70 border border-hairline rounded-xl focus:outline-none focus:border-primary text-ink"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubtaskToActive}
                      className="px-3 py-2 bg-primary text-cream hover:bg-primary-active rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Description & Notes */}
                <div className="space-y-3 pt-2 border-t border-hairline">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                      Mô tả công việc
                    </label>
                    <textarea
                      rows={2}
                      value={activeTask.description || ''}
                      onChange={e => persistTaskUpdate({ ...activeTask, description: e.target.value })}
                      placeholder="Mô tả tóm tắt nội dung việc cần làm..."
                      className="w-full text-xs text-ink p-2.5 bg-canvas/60 border border-hairline rounded-xl focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                      Ghi chú bổ sung / Liên hệ nhà cung cấp
                    </label>
                    <textarea
                      rows={3}
                      value={activeTask.notes || ''}
                      onChange={e => persistTaskUpdate({ ...activeTask, notes: e.target.value })}
                      placeholder="Lưu ý quan trọng, số điện thoại, giá thỏa thuận, điều khoản cọc..."
                      className="w-full text-xs text-ink p-2.5 bg-canvas/60 border border-hairline rounded-xl focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>

              </div>

              {/* Panel Footer */}
              <div className="p-4 border-t border-hairline bg-[#FAF8F5] flex items-center justify-between">
                <span className="text-xs text-muted-text italic">
                  Đã tự động lưu mọi thay đổi
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTaskId(null)}
                    className="px-5 py-2 bg-primary text-cream hover:bg-primary-active rounded-full text-xs font-bold transition-colors cursor-pointer"
                  >
                    Đóng bảng
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─── Section 6: Add Task Modal / Drawer ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <div>
                <h3 className="text-lg font-bold text-ink font-display flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Thêm Công Việc Mới
                </h3>
                <span className="text-xs text-muted-text">Mặc định nhiệm vụ sẽ được xếp vào cột "CHƯA LÀM"</span>
              </div>
              <button 
                onClick={handleCloseAddModal}
                className="text-muted-text hover:text-ink text-base font-semibold p-1.5 hover:bg-canvas rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTask} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Tên công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="VD: Chọn thực đơn tiệc cưới, Thử váy cưới..."
                  value={addFormTitle}
                  onChange={e => setAddFormTitle(e.target.value)}
                  className="w-full bg-canvas border border-hairline rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-primary text-ink"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Nhóm công việc
                  </label>
                  <select
                    value={addFormCategory}
                    onChange={e => setAddFormCategory(e.target.value)}
                    className="w-full bg-canvas border border-hairline rounded-xl px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {KANBAN_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={addFormPriority}
                    onChange={e => setAddFormPriority(e.target.value as TaskPriority)}
                    className="w-full bg-canvas border border-hairline rounded-xl px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="HIGH">🔴 Cao</option>
                    <option value="MEDIUM">🟡 Trung bình</option>
                    <option value="LOW">🟢 Thấp</option>
                  </select>
                </div>
              </div>

              {/* Deadline & Assignee */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Hạn chót
                  </label>
                  <input
                    type="date"
                    value={addFormDueDate}
                    onChange={e => setAddFormDueDate(e.target.value)}
                    className="w-full bg-canvas border border-hairline rounded-xl px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:border-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Người phụ trách
                  </label>
                  <input
                    type="text"
                    value={addFormAssignee}
                    onChange={e => setAddFormAssignee(e.target.value)}
                    placeholder="VD: Cô dâu, Chú rể..."
                    className="w-full bg-canvas border border-hairline rounded-xl px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú nội dung chính của nhiệm vụ..."
                  value={addFormDesc}
                  onChange={e => setAddFormDesc(e.target.value)}
                  className="w-full bg-canvas border border-hairline rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Subtasks Builder */}
              <div className="space-y-2 p-3 bg-canvas/60 border border-hairline rounded-xl">
                <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Các bước thực hiện (Subtasks)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tên bước thực hiện..."
                    value={addFormSubtaskInput}
                    onChange={e => setAddFormSubtaskInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (addFormSubtaskInput.trim()) {
                          setAddFormSubtasks([...addFormSubtasks, addFormSubtaskInput.trim()]);
                          setAddFormSubtaskInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-white border border-hairline rounded-lg px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (addFormSubtaskInput.trim()) {
                        setAddFormSubtasks([...addFormSubtasks, addFormSubtaskInput.trim()]);
                        setAddFormSubtaskInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-canvas border border-hairline hover:bg-white text-xs font-semibold rounded-lg text-ink"
                  >
                    + Thêm
                  </button>
                </div>

                {addFormSubtasks.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {addFormSubtasks.map((st, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1.5 border border-hairline rounded-lg">
                        <span>• {st}</span>
                        <button
                          type="button"
                          onClick={() => setAddFormSubtasks(addFormSubtasks.filter((_, i) => i !== idx))}
                          className="text-muted-text hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dependency */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                  Phụ thuộc vào nhiệm vụ
                </label>
                <select
                  value={addFormDependency ?? ''}
                  onChange={e => setAddFormDependency(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-canvas border border-hairline rounded-xl px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">(Không có phụ thuộc)</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({getCategoryById(t.category).name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2 border border-hairline hover:bg-canvas rounded-full text-xs font-semibold text-ink cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-cream hover:bg-primary-active rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '+ Tạo công việc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Section 8: Auto Generate Tasks Modal ─── */}
      {isAutoGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-2xl w-full max-w-xl p-6 shadow-2xl animate-scale-up space-y-5">
            <div className="flex justify-between items-start border-b border-hairline pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink font-display">
                    Tự Sinh Công Việc Mẫu Theo Ngày Cưới
                  </h3>
                  <p className="text-xs text-muted-text">
                    Lộ trình chuẩn bị tiệc cưới Quiet Luxury được tính toán deadline thông minh dựa trên ngày cưới của bạn.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAutoGenerateModalOpen(false)}
                className="text-muted-text hover:text-ink text-base p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Wedding Date Context Info */}
            <div className="p-3.5 bg-canvas/70 border border-hairline rounded-xl flex items-center gap-3 text-xs">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span>
                Ngày cưới đã định: <strong className="text-ink font-serif">{weddingDate ? formatDateDisplay(weddingDate) : 'Chưa thiết lập (Dùng mốc 6 tháng tới)'}</strong>. 
                Các đầu việc sẽ tự động lùi ngày chót tương ứng.
              </span>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase text-ink">
                <span>Chọn các nhóm công việc muốn sinh mẫu ({selectedTemplateCategories.length}/12)</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTemplateCategories.length === KANBAN_CATEGORIES.length) {
                      setSelectedTemplateCategories([]);
                    } else {
                      setSelectedTemplateCategories(KANBAN_CATEGORIES.map(c => c.id));
                    }
                  }}
                  className="text-primary hover:underline lowercase font-normal"
                >
                  {selectedTemplateCategories.length === KANBAN_CATEGORIES.length ? 'bỏ chọn tất cả' : 'chọn tất cả'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
                {KANBAN_CATEGORIES.map(cat => {
                  const isChecked = selectedTemplateCategories.includes(cat.id);
                  const countInCat = DEFAULT_TASK_TEMPLATES.filter(t => t.category === cat.id).length;
                  return (
                    <label 
                      key={cat.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors text-xs select-none ${
                        isChecked 
                          ? 'bg-primary/5 border-primary text-primary font-semibold' 
                          : 'bg-canvas/50 border-hairline text-muted-text hover:bg-canvas'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedTemplateCategories([...selectedTemplateCategories, cat.id]);
                          } else {
                            setSelectedTemplateCategories(selectedTemplateCategories.filter(id => id !== cat.id));
                          }
                        }}
                        className="w-3.5 h-3.5 accent-primary rounded text-primary"
                      />
                      <span className="truncate">{cat.icon} {cat.name} ({countInCat})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-hairline">
              <button
                type="button"
                onClick={() => setIsAutoGenerateModalOpen(false)}
                className="px-4 py-2 border border-hairline hover:bg-canvas rounded-full text-xs font-semibold text-ink cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isGenerating || selectedTemplateCategories.length === 0}
                onClick={handleExecuteAutoGenerate}
                className="px-6 py-2.5 bg-primary text-cream hover:bg-primary-active rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tạo danh sách...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Khởi tạo danh sách mẫu ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer unchanged */}
      <DashboardFooter />
    </div>
  );
}
