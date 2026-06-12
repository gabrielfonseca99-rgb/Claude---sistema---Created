// ==========================================
// CORE TYPES
// ==========================================

export interface NotificationItem {
  id: string;
  userId: string;
  senderName: string;
  avatarText: string;
  message: string;
  targetCardTitle?: string;
  timeAgo: string;
  type: 'mention' | 'demand' | 'system';
  read: boolean;
}

// ==========================================
// BRAND & GUIDELINES
// ==========================================

export interface BrandColorToken {
  name: string;
  hex: string;
  usage: string; // ex: "Fundo de cards", "CTA principal"
}

export interface BrandTypographyToken {
  role: string; // "heading" | "subheading" | "body" | "caption" | "cta"
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}

export interface BrandChecklistItem {
  id: string;
  rule: string;
  category: 'texto' | 'visual' | 'tom' | 'logo' | 'layout';
  severity: 'erro' | 'aviso' | 'sugestao';
  enabled: boolean;
}

export interface BrandVoiceExample {
  do: string;
  dont: string;
  context: string;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  // Core colors (legacy compat)
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  // Extended palette
  colorTokens: BrandColorToken[];
  // Typography
  fontFamily: string;
  fontStyle: 'serif' | 'sans' | 'mono' | 'display';
  typographyTokens: BrandTypographyToken[];
  // Logo
  logoPlaceholder: string;
  logoUsageNotes: string;
  // Voice & Tone
  voiceGuidelines: string;
  voiceExamples: BrandVoiceExample[];
  // Compliance Checklist
  checklist: BrandChecklistItem[];
  // Social
  hashtagRules?: string;
  captionStyle?: string;
}

// ==========================================
// USERS
// ==========================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'criativo' | 'cliente';
  brandScope?: string;
  avatarColor: string;
  avatarUrl?: string;
}

// ==========================================
// DEMANDS / CARDS
// ==========================================

export interface CardVersion {
  id: string;
  artUrl: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface TimeEntry {
  stage: string;
  startedAt: string;
  endedAt?: string;
}

export interface DemandCard {
  id: string;
  brandId: string;
  title: string;
  theme: string;
  copyText: string;
  artUrl: string;
  stage: string;
  approvalStatus: 'pendente' | 'aprovado' | 'revisar';
  rejectionReason?: string;
  createdBy: string;
  assignedTo?: string[];
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  dueDate?: string;
  priorityName?: string;
  priorityColor?: string;
  customStatusName?: string;
  customStatusColor?: string;
  notes?: string;
  description?: string;
  figmaUrl?: string;
  docsUrl?: string;
  subtasks?: DemandCard[];
  // Version history
  versions?: CardVersion[];
  // Time tracking
  timeEntries?: TimeEntry[];
  isTimerRunning?: boolean;
  timerStartedAt?: string;
  // Review
  reviewScore?: number;
  reviewIssues?: ReviewIssue[];
}

// ==========================================
// REVIEW (REVISOR IA)
// ==========================================

export interface ReviewIssue {
  id: string;
  type: 'texto' | 'visual' | 'tom' | 'logo' | 'layout';
  severity: 'erro' | 'aviso' | 'sugestao';
  rule: string;
  description: string;
  autoFixable: boolean;
  fixed?: boolean;
}

// ==========================================
// PROJECTS
// ==========================================

export interface ProjectItem {
  id: string;
  name: string;
  type: 'folder' | 'project';
  parentId?: string;
  isExpanded?: boolean;
  description?: string;
  leader?: string;
  brandId?: string;
  color?: string;
  isFavorite?: boolean;
}

// ==========================================
// KANBAN
// ==========================================

export interface KanbanColumn {
  id: string;
  title: string;
  subtitle: string;
}

// ==========================================
// LOGS & COMMENTS
// ==========================================

export interface ChangeLog {
  id: string;
  cardId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface DemandComment {
  id: string;
  cardId: string;
  author: string;
  text: string;
  timestamp: string;
  mentions?: string[];
  attachmentUrl?: string;
  isReply?: boolean;
  parentCommentId?: string;
}

// ==========================================
// TEMPLATES
// ==========================================

export interface SavedTemplate {
  id: string;
  name: string;
  type: 'reels_cover' | 'story';
  brandId: string;
  config: Record<string, any>;
  thumbnailDataUrl?: string;
  createdAt: string;
  usageCount: number;
}

// ==========================================
// AUTOMATIONS
// ==========================================

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    event: 'stage_change' | 'approval' | 'card_created' | 'due_date_near';
    condition?: Record<string, string>;
  };
  actions: {
    type: 'notify' | 'move_stage' | 'upload_drive' | 'assign_user' | 'add_comment';
    params: Record<string, string>;
  }[];
  createdAt: string;
}

// ==========================================
// ANALYTICS
// ==========================================

export interface AnalyticsSnapshot {
  date: string;
  totalCards: number;
  byStage: Record<string, number>;
  byBrand: Record<string, number>;
  approvedCount: number;
  rejectedCount: number;
  avgTimeInStage: Record<string, number>; // hours
}
