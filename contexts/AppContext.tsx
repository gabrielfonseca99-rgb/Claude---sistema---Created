import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  NotificationItem, Brand, UserProfile, DemandCard, ProjectItem,
  KanbanColumn, ChangeLog, DemandComment, SavedTemplate, AutomationRule
} from '../types';
import {
  INITIAL_BRANDS, USERS, INITIAL_PROJECTS, INITIAL_CARDS,
  INITIAL_LOGS, INITIAL_NOTIFICATIONS, INITIAL_COMMENTS,
  INITIAL_COLUMNS, INITIAL_STATUSES, INITIAL_PRIORITIES,
  INITIAL_TEMPLATES, INITIAL_AUTOMATIONS
} from '../data/seedData';
import { loadFromStorage, saveToStorage, generateId, formatTimestamp, formatCommentDate } from '../utils/helpers';
import { isAutoUploadEnabled, simulateUploadToDrive } from '../services/driveService';

// ==========================================
// CONTEXT TYPES
// ==========================================

export type TabId = 'home' | 'painel' | 'brands' | 'generator' | 'templates' | 'integrations' | 'logs' | 'analytics' | 'calendar' | 'automations';
export type ViewMode = 'kanban' | 'list' | 'calendar';

interface AppContextType {
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;

  // Theme
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;

  // User
  currentUser: UserProfile;
  setCurrentUser: (u: UserProfile) => void;
  allUsers: UserProfile[];

  // Brands
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  handleSaveBrandGuideline: (brandId: string, updatedFields: Partial<Brand>) => void;

  // Cards / Demands
  cards: DemandCard[];
  setCards: React.Dispatch<React.SetStateAction<DemandCard[]>>;
  handleSaveDemand: (cardData: Partial<DemandCard>) => void;
  handleMoveStage: (cardId: string, targetStage: string) => void;
  handleApprovalAction: (cardId: string, action: 'approve' | 'audit_rejection', rejectionComment?: string) => void;
  handleAddSubtask: (parentId: string, subtaskTitle: string) => void;

  // Kanban
  kanbanColumns: KanbanColumn[];
  setKanbanColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
  moveColumnLeft: (idx: number) => void;
  moveColumnRight: (idx: number) => void;
  deleteColumn: (colId: string) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  isKanbanEditMode: boolean;
  setIsKanbanEditMode: (v: boolean) => void;

  // Projects
  projects: ProjectItem[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;

  // Logs
  logs: ChangeLog[];
  registerLog: (cardId: string, action: string) => void;

  // Notifications
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;

  // Comments
  comments: DemandComment[];
  handleAddComment: (cardId: string, text: string) => void;

  // Custom statuses/priorities
  customStatuses: { name: string; color: string }[];
  setCustomStatuses: React.Dispatch<React.SetStateAction<{ name: string; color: string }[]>>;
  customPriorities: { name: string; color: string }[];
  setCustomPriorities: React.Dispatch<React.SetStateAction<{ name: string; color: string }[]>>;

  // Modal state
  isDemandModalOpen: boolean;
  setIsDemandModalOpen: (v: boolean) => void;
  editingCard: DemandCard | null;
  setEditingCard: (c: DemandCard | null) => void;
  selectedClientBrandId: string | null;
  setSelectedClientBrandId: (id: string | null) => void;

  // Layout
  isMainMenuCollapsed: boolean;
  setIsMainMenuCollapsed: (v: boolean) => void;
  isSidebarLocked: boolean;
  setIsSidebarLocked: (v: boolean) => void;

  // Helpers
  canAccessBrand: (brandId: string) => boolean;

  // User filter
  selectedFilterUser: UserProfile | null;
  setSelectedFilterUser: (u: UserProfile | null) => void;

  // Cross-tab brand selectors
  storyBrandId: string;
  setStoryBrandId: (id: string) => void;
  generatorBrandId: string;
  setGeneratorBrandId: (id: string) => void;

  // Templates
  savedTemplates: SavedTemplate[];
  setSavedTemplates: React.Dispatch<React.SetStateAction<SavedTemplate[]>>;

  // Automations
  automations: AutomationRule[];
  setAutomations: React.Dispatch<React.SetStateAction<AutomationRule[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ==========================================
// PROVIDER
// ==========================================

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    localStorage.getItem('creaflow_dark_mode') === 'true'
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('creaflow_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // User
  const [currentUser, setCurrentUser] = useState<UserProfile>(USERS[0]);

  // Brands — apply name overrides on load
  const [brands, setBrands] = useState<Brand[]>(() => {
    const loaded: Brand[] = loadFromStorage('creaflow_brands', INITIAL_BRANDS);
    const nameMap: Record<string, string> = {
      gcr: 'Grupo Gcr', copicont: 'Gioppo&Conti',
      tavares: 'Tavares&Schalch', lcr: 'LCR Direito aéreo', lopes: 'Lopes Mundi'
    };
    return loaded.map(b => nameMap[b.id] ? { ...b, name: nameMap[b.id] } : b);
  });

  // Cards
  const [cards, setCards] = useState<DemandCard[]>(() => loadFromStorage('creaflow_cards', INITIAL_CARDS));

  // Kanban
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(() => loadFromStorage('creaflow_kanban_columns', INITIAL_COLUMNS));
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isKanbanEditMode, setIsKanbanEditMode] = useState(false);

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>(() => loadFromStorage('creaflow_projects', INITIAL_PROJECTS));
  const [activeProjectId, setActiveProjectId] = useState('p-course');

  // Logs
  const [logs, setLogs] = useState<ChangeLog[]>(() => loadFromStorage('creaflow_logs', INITIAL_LOGS));

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('creaflow_notifications', INITIAL_NOTIFICATIONS));

  // Comments
  const [comments, setComments] = useState<DemandComment[]>(() => loadFromStorage('creaflow_comments', INITIAL_COMMENTS));

  // Custom statuses/priorities
  const [customStatuses, setCustomStatuses] = useState<{ name: string; color: string }[]>(() => loadFromStorage('creaflow_custom_statuses', INITIAL_STATUSES));
  const [customPriorities, setCustomPriorities] = useState<{ name: string; color: string }[]>(() => loadFromStorage('creaflow_custom_priorities', INITIAL_PRIORITIES));

  // Modal
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<DemandCard | null>(null);
  const [selectedClientBrandId, setSelectedClientBrandId] = useState<string | null>(null);

  // Layout
  const [isMainMenuCollapsed, setIsMainMenuCollapsed] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);

  // Filters
  const [selectedFilterUser, setSelectedFilterUser] = useState<UserProfile | null>(null);

  // Cross-tab brand selectors
  const [storyBrandId, setStoryBrandId] = useState('gcr');
  const [generatorBrandId, setGeneratorBrandId] = useState('gcr');

  // Templates & Automations
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() => loadFromStorage('creaflow_templates', INITIAL_TEMPLATES));
  const [automations, setAutomations] = useState<AutomationRule[]>(() => loadFromStorage('creaflow_automations', INITIAL_AUTOMATIONS));

  // ==========================================
  // PERSISTENCE EFFECTS
  // ==========================================
  useEffect(() => { saveToStorage('creaflow_brands', brands); }, [brands]);
  useEffect(() => { saveToStorage('creaflow_cards', cards); }, [cards]);
  useEffect(() => { saveToStorage('creaflow_projects', projects); }, [projects]);
  useEffect(() => { saveToStorage('creaflow_logs', logs); }, [logs]);
  useEffect(() => { saveToStorage('creaflow_notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('creaflow_comments', comments); }, [comments]);
  useEffect(() => { saveToStorage('creaflow_custom_statuses', customStatuses); }, [customStatuses]);
  useEffect(() => { saveToStorage('creaflow_custom_priorities', customPriorities); }, [customPriorities]);
  useEffect(() => {
    if (kanbanColumns.length > 0) saveToStorage('creaflow_kanban_columns', kanbanColumns);
  }, [kanbanColumns]);
  useEffect(() => { saveToStorage('creaflow_templates', savedTemplates); }, [savedTemplates]);
  useEffect(() => { saveToStorage('creaflow_automations', automations); }, [automations]);

  // ==========================================
  // ACTIONS
  // ==========================================

  const registerLog = useCallback((cardId: string, action: string) => {
    const newLog: ChangeLog = {
      id: generateId('log'),
      cardId,
      userName: currentUser.name,
      action,
      timestamp: formatTimestamp()
    };
    setLogs(prev => [newLog, ...prev]);
  }, [currentUser.name]);

  const canAccessBrand = useCallback((brandId: string) => {
    if (currentUser.role === 'admin' || currentUser.role === 'criativo') return true;
    return currentUser.brandScope === brandId;
  }, [currentUser]);

  const handleMoveStage = useCallback((cardId: string, targetStage: string) => {
    const matchedCol = kanbanColumns.find(col => col.id === targetStage);
    const colTitle = matchedCol ? matchedCol.title : targetStage;
    const colColor = targetStage === 'a_fazer' ? '#6b7280'
      : targetStage === 'em_aprovacao' ? '#eab308'
      : targetStage === 'alteracoes' ? '#f43f5e'
      : '#10b981';

    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        if (!canAccessBrand(c.brandId)) return c;
        registerLog(cardId, `Alterou o estágio de "${c.stage}" para "${targetStage}".`);
        return {
          ...c,
          stage: targetStage,
          customStatusName: colTitle,
          customStatusColor: colColor,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
  }, [kanbanColumns, canAccessBrand, registerLog]);

  const handleApprovalAction = useCallback((cardId: string, action: 'approve' | 'audit_rejection', rejectionComment?: string) => {
    setCards(prev => {
      const updated = prev.map(c => {
        if (c.id === cardId) {
          if (action === 'approve') {
            registerLog(cardId, 'Aprovou formalmente e finalizou o card de demanda.');

            // Auto-upload to Google Drive if configured
            if (isAutoUploadEnabled(c.brandId) && c.artUrl) {
              simulateUploadToDrive(cardId, c.title, c.brandId, c.artUrl)
                .then(() => registerLog(cardId, 'Asset enviado automaticamente ao Google Drive.'))
                .catch(() => registerLog(cardId, 'Falha ao enviar asset ao Google Drive.'));
            }

            return { ...c, stage: 'finalizado', approvalStatus: 'aprovado' as const, rejectionReason: undefined, updatedAt: new Date().toISOString() };
          } else {
            registerLog(cardId, `Rejeitou a arte/copy com o pedido: "${rejectionComment || ''}"`);
            return { ...c, stage: 'redacao', approvalStatus: 'revisar' as const, rejectionReason: rejectionComment, updatedAt: new Date().toISOString() };
          }
        }
        return c;
      });
      return updated;
    });
  }, [registerLog]);

  const handleSaveDemand = useCallback((cardData: Partial<DemandCard>) => {
    if (cardData.id) {
      // EDIT
      setCards(prev => prev.map(c => {
        if (c.id === cardData.id) {
          registerLog(cardData.id!, `Atualizou os dados da demanda: "${cardData.title || c.title}".`);
          return { ...c, ...cardData, updatedAt: new Date().toISOString() };
        }
        return c;
      }));
    } else {
      // CREATE
      const newCard: DemandCard = {
        id: generateId('card'),
        brandId: cardData.brandId || 'gcr',
        title: cardData.title || 'Nova Demanda',
        theme: cardData.theme || '',
        copyText: 'Rascunho de copy em processamento. Escreva aqui as hashtags e legendas estruturadas.',
        artUrl: '',
        stage: cardData.stage || kanbanColumns[0]?.id || 'a_fazer',
        approvalStatus: 'pendente',
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: activeProjectId !== 'all' ? activeProjectId : undefined,
        dueDate: cardData.dueDate,
        assignedTo: cardData.assignedTo,
        priorityName: cardData.priorityName || 'Média',
        priorityColor: cardData.priorityColor || '#3b82f6',
        description: cardData.description,
        figmaUrl: cardData.figmaUrl,
        subtasks: []
      };
      setCards(prev => [newCard, ...prev]);
      registerLog(newCard.id, `Criou o card de demanda: "${newCard.title}" para a empresa ${newCard.brandId.toUpperCase()}.`);

      // Notify assigned user
      const matchingUser = USERS.find(u => newCard.assignedTo?.includes(u.name));
      if (matchingUser && matchingUser.id !== currentUser.id) {
        setNotifications(prev => [{
          id: generateId('notif'),
          userId: matchingUser.id,
          senderName: currentUser.name,
          avatarText: '👑',
          message: `atribuiu a você a demanda: "${newCard.title}"`,
          targetCardTitle: newCard.title,
          timeAgo: 'Agora mesmo',
          type: 'demand',
          read: false
        }, ...prev]);
      }
    }
    setIsDemandModalOpen(false);
    setEditingCard(null);
  }, [currentUser, kanbanColumns, activeProjectId, registerLog]);

  const handleAddSubtask = useCallback((parentId: string, subtaskTitle: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === parentId) {
        const newSubtask: DemandCard = {
          id: generateId('subtask'),
          brandId: c.brandId,
          title: subtaskTitle,
          theme: '',
          copyText: 'Rascunho de copy em processamento...',
          artUrl: '',
          stage: c.stage,
          approvalStatus: 'pendente',
          createdBy: currentUser.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: c.assignedTo,
          priorityName: 'Média',
          priorityColor: '#3b82f6',
          subtasks: []
        };
        return { ...c, subtasks: [...(c.subtasks || []), newSubtask] };
      }
      return c;
    }));
  }, [currentUser.name]);

  const handleAddComment = useCallback((cardId: string, text: string) => {
    setComments(prev => [...prev, {
      id: generateId('comment'),
      cardId,
      author: currentUser.name,
      text,
      timestamp: formatCommentDate()
    }]);
  }, [currentUser.name]);

  const handleSaveBrandGuideline = useCallback((brandId: string, updatedFields: Partial<Brand>) => {
    setBrands(prev => prev.map(b => b.id === brandId ? { ...b, ...updatedFields } : b));
  }, []);

  const moveColumnLeft = useCallback((idx: number) => {
    if (idx === 0) return;
    setKanbanColumns(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const moveColumnRight = useCallback((idx: number) => {
    setKanbanColumns(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const deleteColumn = useCallback((colId: string) => {
    const hasCards = cards.some(c => c.stage === colId);
    if (hasCards) {
      alert('Não é possível excluir uma coluna que contém demandas ativas.');
      return;
    }
    setKanbanColumns(prev => prev.filter(col => col.id !== colId));
  }, [cards]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value: AppContextType = {
    activeTab, setActiveTab,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isDarkMode, setIsDarkMode,
    currentUser, setCurrentUser, allUsers: USERS,
    brands, setBrands, handleSaveBrandGuideline,
    cards, setCards, handleSaveDemand, handleMoveStage, handleApprovalAction, handleAddSubtask,
    kanbanColumns, setKanbanColumns, moveColumnLeft, moveColumnRight, deleteColumn,
    viewMode, setViewMode, isKanbanEditMode, setIsKanbanEditMode,
    projects, setProjects, activeProjectId, setActiveProjectId,
    logs, registerLog,
    notifications, setNotifications,
    comments, handleAddComment,
    customStatuses, setCustomStatuses, customPriorities, setCustomPriorities,
    isDemandModalOpen, setIsDemandModalOpen, editingCard, setEditingCard,
    selectedClientBrandId, setSelectedClientBrandId,
    isMainMenuCollapsed, setIsMainMenuCollapsed,
    isSidebarLocked, setIsSidebarLocked,
    canAccessBrand,
    selectedFilterUser, setSelectedFilterUser,
    storyBrandId, setStoryBrandId,
    generatorBrandId, setGeneratorBrandId,
    savedTemplates, setSavedTemplates,
    automations, setAutomations
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
