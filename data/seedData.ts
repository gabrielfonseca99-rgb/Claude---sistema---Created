import { Brand, UserProfile, ProjectItem, DemandCard, ChangeLog, NotificationItem, KanbanColumn, SavedTemplate, AutomationRule } from '../types';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'gcr',
    name: 'Grupo Gcr',
    tagline: 'Holding & Gestão de Incorporações',
    primaryColor: '#2563EB',
    secondaryColor: '#3B82F6',
    backgroundColor: '#0F172A',
    textColor: '#F8FAFC',
    colorTokens: [
      { name: 'Azul Institucional', hex: '#2563EB', usage: 'CTA principal, destaques' },
      { name: 'Azul Claro', hex: '#3B82F6', usage: 'Backgrounds secundários, ícones' },
      { name: 'Azul Escuro', hex: '#0F172A', usage: 'Fundo principal, headers' },
      { name: 'Branco Gelo', hex: '#F8FAFC', usage: 'Texto sobre fundos escuros' },
      { name: 'Cinza Neutro', hex: '#64748B', usage: 'Texto auxiliar, legendas' },
    ],
    fontFamily: 'system-ui, -apple-system',
    fontStyle: 'sans',
    typographyTokens: [
      { role: 'heading', fontFamily: 'system-ui', fontSize: '28px', fontWeight: '700', lineHeight: '1.2' },
      { role: 'subheading', fontFamily: 'system-ui', fontSize: '18px', fontWeight: '600', lineHeight: '1.4' },
      { role: 'body', fontFamily: 'system-ui', fontSize: '14px', fontWeight: '400', lineHeight: '1.6' },
      { role: 'caption', fontFamily: 'system-ui', fontSize: '11px', fontWeight: '500', lineHeight: '1.4', letterSpacing: '0.05em' },
      { role: 'cta', fontFamily: 'system-ui', fontSize: '14px', fontWeight: '700', lineHeight: '1', letterSpacing: '0.02em' },
    ],
    logoPlaceholder: '◆ G C R集團',
    logoUsageNotes: 'Sempre usar versão monocromática sobre fundos escuros. Zona de exclusão mínima: 2x a altura do símbolo.',
    voiceGuidelines: 'Tom corporativo, institucional, focado em segurança de ativos e robustez no mercado.',
    voiceExamples: [
      { do: 'Investir com segurança é o alicerce do crescimento patrimonial.', dont: 'Ganhe dinheiro fácil investindo conosco!', context: 'Post sobre investimentos' },
      { do: 'Resultados sólidos exigem planejamento meticuloso.', dont: 'Somos os melhores do mercado!', context: 'Institucional' },
    ],
    checklist: [
      { id: 'gcr-c1', rule: 'Usar apenas cores da paleta institucional', category: 'visual', severity: 'erro', enabled: true },
      { id: 'gcr-c2', rule: 'Não usar emojis em posts do LinkedIn', category: 'texto', severity: 'aviso', enabled: true },
      { id: 'gcr-c3', rule: 'Tom sempre na 1ª pessoa do plural (nós)', category: 'tom', severity: 'erro', enabled: true },
      { id: 'gcr-c4', rule: 'Logo com zona de exclusão mínima respeitada', category: 'logo', severity: 'erro', enabled: true },
      { id: 'gcr-c5', rule: 'Imagens devem ter tratamento em tons frios', category: 'visual', severity: 'sugestao', enabled: true },
    ],
    hashtagRules: 'Máximo 5 hashtags. Sempre incluir #GrupoGCR #Incorporações. Nunca usar hashtags genéricas como #sucesso.',
    captionStyle: 'Parágrafos curtos (2-3 linhas). Abertura com dado ou pergunta. CTA ao final.',
  },
  {
    id: 'copicont',
    name: 'Gioppo&Conti',
    tagline: 'Inteligência Contábil e Fiscal',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    backgroundColor: '#030712',
    textColor: '#F9FAFB',
    colorTokens: [
      { name: 'Verde Contábil', hex: '#059669', usage: 'CTA, ícones de destaque' },
      { name: 'Verde Claro', hex: '#10B981', usage: 'Badges, indicadores positivos' },
      { name: 'Preto Profundo', hex: '#030712', usage: 'Fundo principal' },
      { name: 'Branco Puro', hex: '#F9FAFB', usage: 'Texto principal' },
      { name: 'Cinza Técnico', hex: '#9CA3AF', usage: 'Dados secundários' },
    ],
    fontFamily: 'monospace',
    fontStyle: 'mono',
    typographyTokens: [
      { role: 'heading', fontFamily: 'monospace', fontSize: '24px', fontWeight: '700', lineHeight: '1.3' },
      { role: 'body', fontFamily: 'monospace', fontSize: '13px', fontWeight: '400', lineHeight: '1.7' },
      { role: 'caption', fontFamily: 'monospace', fontSize: '10px', fontWeight: '600', lineHeight: '1.4', letterSpacing: '0.08em' },
      { role: 'cta', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', lineHeight: '1' },
    ],
    logoPlaceholder: '⬡ Gioppo&Conti',
    logoUsageNotes: 'Usar versão horizontal em headers. Versão ícone (hexágono) para avatares e favicons.',
    voiceGuidelines: 'Tom analítico, altamente profissional, transparente, exalando precisão mecânica e conformidade.',
    voiceExamples: [
      { do: 'A análise tributária revela uma economia potencial de 12% sobre o faturamento bruto.', dont: 'Economize uma fortuna nos seus impostos!', context: 'Post sobre planejamento tributário' },
      { do: 'Conformidade fiscal não é custo — é investimento estratégico.', dont: 'Impostos são complicados, mas a gente resolve.', context: 'Institucional' },
    ],
    checklist: [
      { id: 'cop-c1', rule: 'Valores numéricos sempre formatados (R$ X.XXX,XX)', category: 'texto', severity: 'erro', enabled: true },
      { id: 'cop-c2', rule: 'Fontes monospace obrigatórias em dados', category: 'visual', severity: 'erro', enabled: true },
      { id: 'cop-c3', rule: 'Nunca usar linguagem informal ou gírias', category: 'tom', severity: 'erro', enabled: true },
      { id: 'cop-c4', rule: 'Citar base legal quando mencionar normas', category: 'texto', severity: 'aviso', enabled: true },
    ],
    hashtagRules: 'Máximo 4 hashtags técnicas. Sempre #GioppoConti #ContabilidadeInteligente.',
    captionStyle: 'Estrutura: Contexto → Dado → Insight → CTA. Máximo 6 linhas.',
  },
  {
    id: 'tavares',
    name: 'Tavares&Schalch',
    tagline: 'Advocacia e Assessoria Jurídica',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    backgroundColor: '#1E1B4B',
    textColor: '#FEF3C7',
    colorTokens: [
      { name: 'Dourado Jurídico', hex: '#D97706', usage: 'Destaques, CTA' },
      { name: 'Âmbar Claro', hex: '#F59E0B', usage: 'Ícones, badges' },
      { name: 'Azul Noturno', hex: '#1E1B4B', usage: 'Fundos principais' },
      { name: 'Creme Clássico', hex: '#FEF3C7', usage: 'Texto sobre escuro' },
      { name: 'Bronze', hex: '#92400E', usage: 'Acentos, bordas' },
    ],
    fontFamily: 'Georgia, serif',
    fontStyle: 'serif',
    typographyTokens: [
      { role: 'heading', fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '700', lineHeight: '1.25' },
      { role: 'body', fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: '400', lineHeight: '1.7' },
      { role: 'caption', fontFamily: 'Georgia, serif', fontSize: '11px', fontWeight: '400', lineHeight: '1.5', letterSpacing: '0.03em' },
      { role: 'cta', fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: '700', lineHeight: '1' },
    ],
    logoPlaceholder: '⚜ Tavares & Schalch',
    logoUsageNotes: 'Sempre em dourado sobre fundo azul noturno. Nunca inverter cores. Versão monocromática em documentos oficiais.',
    voiceGuidelines: 'Tom formal, refinado, tradicionalista, alta segurança jurídica e sofisticação linguística.',
    voiceExamples: [
      { do: 'A jurisprudência consolidada reafirma a proteção patrimonial como direito fundamental.', dont: 'Proteja seus bens antes que seja tarde!', context: 'Post sobre blindagem patrimonial' },
      { do: 'Excelência jurídica construída sobre décadas de atuação.', dont: 'O melhor escritório de advocacia da cidade!', context: 'Institucional' },
    ],
    checklist: [
      { id: 'tav-c1', rule: 'Não usar termos jurídicos sem explicação acessível', category: 'texto', severity: 'aviso', enabled: true },
      { id: 'tav-c2', rule: 'Tom sempre formal — nunca usar "você" isolado', category: 'tom', severity: 'erro', enabled: true },
      { id: 'tav-c3', rule: 'Tipografia serifada obrigatória em todo material', category: 'visual', severity: 'erro', enabled: true },
      { id: 'tav-c4', rule: 'Paleta dourado+azul noturno sem exceção', category: 'visual', severity: 'erro', enabled: true },
      { id: 'tav-c5', rule: 'Logo com flor de lis sempre visível', category: 'logo', severity: 'erro', enabled: true },
    ],
    hashtagRules: 'Máximo 3 hashtags. #TavaresSchalch obrigatória. Evitar hashtags populares.',
    captionStyle: 'Linguagem elevada. Abertura com citação ou princípio jurídico. Parágrafo único ou dois curtos.',
  },
  {
    id: 'lcr',
    name: 'LCR Direito aéreo',
    tagline: 'Especialistas Regulatórios de Aviação',
    primaryColor: '#8B5CF6',
    secondaryColor: '#A78BFA',
    backgroundColor: '#111827',
    textColor: '#F5F3FF',
    colorTokens: [
      { name: 'Violeta Aéreo', hex: '#8B5CF6', usage: 'CTA, destaques' },
      { name: 'Lilás Suave', hex: '#A78BFA', usage: 'Ícones, gráficos' },
      { name: 'Grafite Escuro', hex: '#111827', usage: 'Fundo principal' },
      { name: 'Branco Lavanda', hex: '#F5F3FF', usage: 'Texto principal' },
      { name: 'Índigo Técnico', hex: '#6366F1', usage: 'Links, referências' },
    ],
    fontFamily: 'monospace',
    fontStyle: 'display',
    typographyTokens: [
      { role: 'heading', fontFamily: 'monospace', fontSize: '22px', fontWeight: '800', lineHeight: '1.2', letterSpacing: '0.05em' },
      { role: 'body', fontFamily: 'monospace', fontSize: '13px', fontWeight: '400', lineHeight: '1.6' },
      { role: 'caption', fontFamily: 'monospace', fontSize: '10px', fontWeight: '600', lineHeight: '1.3', letterSpacing: '0.1em' },
      { role: 'cta', fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', lineHeight: '1', letterSpacing: '0.06em' },
    ],
    logoPlaceholder: '✈ LCR DIREITO AÉREO',
    logoUsageNotes: 'Ícone de aviação sempre à esquerda. Texto em caixa alta. Versão compacta "LCR" para ícones.',
    voiceGuidelines: 'Tom técnico regulatório, especialista, focado nas resoluções da ANAC, DECEA e segurança internacional.',
    voiceExamples: [
      { do: 'A Resolução ANAC nº 494/2019 estabelece requisitos específicos para operação de RPAS acima de 25kg.', dont: 'Voar drones pode dar multa, cuidado!', context: 'Post sobre regulação de drones' },
      { do: 'Compliance aeronáutico é um requisito, não uma opção.', dont: 'A gente cuida da burocracia pra você voar tranquilo.', context: 'Institucional' },
    ],
    checklist: [
      { id: 'lcr-c1', rule: 'Citar número exato de resoluções ANAC/DECEA', category: 'texto', severity: 'erro', enabled: true },
      { id: 'lcr-c2', rule: 'Tipografia display/monospace obrigatória', category: 'visual', severity: 'erro', enabled: true },
      { id: 'lcr-c3', rule: 'Terminologia técnica aeronáutica precisa', category: 'tom', severity: 'erro', enabled: true },
      { id: 'lcr-c4', rule: 'Imagens com tratamento em tons violeta', category: 'visual', severity: 'sugestao', enabled: true },
    ],
    hashtagRules: 'Máximo 5. Sempre #LCRDireitoAereo #ANAC. Incluir regulação específica quando aplicável.',
    captionStyle: 'Abertura técnica direta. Referência legal no corpo. CTA para consultoria.',
  },
  {
    id: 'lopes',
    name: 'Lopes Mundi',
    tagline: 'Conexões Imobiliárias Globais',
    primaryColor: '#EF4444',
    secondaryColor: '#F87171',
    backgroundColor: '#180808',
    textColor: '#FFF5F5',
    colorTokens: [
      { name: 'Vermelho Premium', hex: '#EF4444', usage: 'CTA, destaques urgentes' },
      { name: 'Coral Vibrante', hex: '#F87171', usage: 'Ícones, badges' },
      { name: 'Preto Mogno', hex: '#180808', usage: 'Fundo principal' },
      { name: 'Branco Rosado', hex: '#FFF5F5', usage: 'Texto principal' },
      { name: 'Dourado Luxo', hex: '#D4A574', usage: 'Acentos premium' },
    ],
    fontFamily: 'system-ui, -apple-system',
    fontStyle: 'sans',
    typographyTokens: [
      { role: 'heading', fontFamily: 'system-ui', fontSize: '30px', fontWeight: '800', lineHeight: '1.15' },
      { role: 'body', fontFamily: 'system-ui', fontSize: '14px', fontWeight: '400', lineHeight: '1.6' },
      { role: 'caption', fontFamily: 'system-ui', fontSize: '11px', fontWeight: '500', lineHeight: '1.4' },
      { role: 'cta', fontFamily: 'system-ui', fontSize: '15px', fontWeight: '800', lineHeight: '1', letterSpacing: '0.03em' },
    ],
    logoPlaceholder: '❂ Lopes Mundi',
    logoUsageNotes: 'Logo sempre em vermelho sobre fundo escuro ou branco sobre fundo vermelho. Nunca em tamanho menor que 24px.',
    voiceGuidelines: 'Tom ambicioso, inspirador, cosmopolita, persuasão focada em investimentos premium e transações ágeis.',
    voiceExamples: [
      { do: 'Seu próximo endereço pode estar em Lisboa, Dubai ou São Paulo — nós conectamos você ao mundo.', dont: 'Compre apartamento barato no exterior!', context: 'Post sobre investimentos internacionais' },
      { do: 'Oportunidades globais para quem pensa grande.', dont: 'O melhor imóvel da região!', context: 'Institucional' },
    ],
    checklist: [
      { id: 'lop-c1', rule: 'Sempre mencionar localização geográfica', category: 'texto', severity: 'aviso', enabled: true },
      { id: 'lop-c2', rule: 'Imagens de alta qualidade (min 1080p)', category: 'visual', severity: 'erro', enabled: true },
      { id: 'lop-c3', rule: 'Tom aspiracional, nunca desesperado ou urgente', category: 'tom', severity: 'erro', enabled: true },
      { id: 'lop-c4', rule: 'Valores em moeda local + USD quando internacional', category: 'texto', severity: 'aviso', enabled: true },
    ],
    hashtagRules: 'Máximo 6. Sempre #LopesMundi #ImóveisGlobais. Hashtags da cidade em foco.',
    captionStyle: 'Abertura aspiracional. Destaque de localização e lifestyle. CTA com exclusividade.',
  }
];

export const INITIAL_TEMPLATES: SavedTemplate[] = [];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Notificar cliente ao enviar para aprovação',
    enabled: true,
    trigger: { event: 'stage_change', condition: { targetStage: 'em_aprovacao' } },
    actions: [{ type: 'notify', params: { target: 'cliente', message: 'Nova demanda aguardando sua aprovação.' } }],
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'auto-2',
    name: 'Upload ao Drive quando aprovado',
    enabled: true,
    trigger: { event: 'approval', condition: { status: 'aprovado' } },
    actions: [{ type: 'upload_drive', params: { folder: 'auto' } }],
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'auto-3',
    name: 'Atribuir designer ao criar card',
    enabled: false,
    trigger: { event: 'card_created' },
    actions: [{ type: 'assign_user', params: { userId: 'usr-3', role: 'designer' } }],
    createdAt: '2026-06-02T14:00:00Z',
  },
];

export const USERS: UserProfile[] = [
  { id: 'usr-1', name: 'Gabriel Fonseca (Admin)', email: 'gabrielfonseca99@gmail.com', role: 'admin', avatarColor: 'bg-indigo-600', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr-2', name: 'Ana Clara (Social Media)', email: 'anaclara@grupo.com', role: 'criativo', avatarColor: 'bg-rose-500', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr-3', name: 'Thiago Silva (Designer)', email: 'thiago.designer@grupo.com', role: 'criativo', avatarColor: 'bg-emerald-500', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr-4', name: 'Dr. Tavares (Cliente/Gestor)', email: 'tavares@tavares.adv.br', role: 'cliente', brandScope: 'tavares', avatarColor: 'bg-amber-600', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' }
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  { id: 'f-ui-ux', name: 'UI & UX Design', type: 'folder', isExpanded: true },
  { id: 'f-prod-des', name: 'Products Designs', type: 'folder', parentId: 'f-ui-ux', isExpanded: true },
  { id: 'p-course', name: 'Course Dashboard', type: 'project', parentId: 'f-prod-des' },
  { id: 'p-kds', name: 'KDS Dashboard', type: 'project', parentId: 'f-prod-des' },
  { id: 'p-drapora', name: 'Drapora Projects', type: 'project', parentId: 'f-ui-ux' },
  { id: 'p-design-sys', name: 'Design Systems', type: 'project' },
  { id: 'p-web-apps', name: 'Web Apps', type: 'project' }
];

export const INITIAL_COLUMNS: KanbanColumn[] = [
  { id: 'a_fazer', title: 'A Fazer', subtitle: 'Demandas novas a iniciar' },
  { id: 'em_aprovacao', title: 'em aprovação', subtitle: 'Aguardando validação' },
  { id: 'alteracoes', title: 'Alterações', subtitle: 'Ajustes solicitados' },
  { id: 'concluido', title: 'Concluído', subtitle: 'Trabalho finalizado' }
];

export const INITIAL_CARDS: DemandCard[] = [
  {
    id: 'card-1',
    brandId: 'tavares',
    title: 'Análise de Riscos Contratuais em M&A',
    theme: 'Esclarecer a importância da Due Diligence no fechamento de grandes fusões corporativas brasileiras.',
    copyText: 'No mundo corporativo, uma fusão sem Due Diligence rigorosa é um salto no escuro. Nossos especialistas mapeiam passivos tributários, trabalhistas e contratuais para assegurar que a transição de cotas ocorra de forma impecável. Projeta-se o valor real, eliminando surpresas pós-fechamento. Siga o perfil jurídico que protege as maiores holding do país. #AdvocaciaCorporativa #FusõesEAquisições #DireitoEmpresarial',
    artUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
    stage: 'em_aprovacao',
    approvalStatus: 'pendente',
    createdBy: 'Ana Clara (Social Media)',
    assignedTo: ['Thiago Silva (Designer)'],
    createdAt: '2026-06-08T14:30:00Z',
    updatedAt: '2026-06-10T11:20:00Z',
    projectId: 'p-course'
  },
  {
    id: 'card-2',
    brandId: 'lcr',
    title: 'Aeronaves de Pilotagem Remota (Drones) e ANAC',
    theme: 'Explicação didática sobre os limites impostos pela portaria da ANAC para voos comerciais.',
    copyText: 'Você quer trabalhar comercialmente com drones no espaço aéreo brasileiro? Existem regras estritas da ANAC e DECEA sobre peso máximo, homologação e distância segura de aglomerações. O descumprimento pode render apreensão e multas pesadas. Entenda os trâmites regulatórios necessários com nossa assessoria aero-comercial.',
    artUrl: '',
    stage: 'alteracoes',
    approvalStatus: 'pendente',
    createdBy: 'Ana Clara (Social Media)',
    createdAt: '2026-06-09T09:15:00Z',
    updatedAt: '2026-06-09T18:30:00Z',
    projectId: 'p-kds'
  },
  {
    id: 'card-3',
    brandId: 'gcr',
    title: 'Lançamento de Incorporação Residencial Q3',
    theme: 'Apresentar a nova tese de investimentos imobiliários com foco em preservação ambiental ativa.',
    copyText: 'Briefing inicial sob aprovação. Focado no novo bairro sustentável planejado.',
    artUrl: '',
    stage: 'a_fazer',
    approvalStatus: 'pendente',
    createdBy: 'Ana Clara (Social Media)',
    createdAt: '2026-06-10T15:00:00Z',
    updatedAt: '2026-06-10T15:00:00Z',
    projectId: 'p-drapora'
  },
  {
    id: 'card-4',
    brandId: 'copicont',
    title: 'Guia do Planejamento Tributário Anual',
    theme: 'Tabela explicativa resumindo a transição Simples Nacional para Lucro Presumido no meio do ano fiscal.',
    copyText: 'Transição estratégica de enquadramento tributário para redução imediata de impostos correntes. Análise exaustiva efetuada por nossa inteligência fiscal Gioppo&Conti.',
    artUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    stage: 'concluido',
    approvalStatus: 'aprovado',
    createdBy: 'Ana Clara (Social Media)',
    assignedTo: ['Thiago Silva (Designer)'],
    createdAt: '2026-06-05T10:00:00Z',
    updatedAt: '2026-06-07T16:45:00Z',
    projectId: 'p-course'
  }
];

export const INITIAL_LOGS: ChangeLog[] = [
  { id: 'log-1', cardId: 'card-1', userName: 'Ana Clara', action: 'Cadastrou a proposta inicial e redigiu a copy jurídica.', timestamp: '2026-06-08 14:32' },
  { id: 'log-2', cardId: 'card-1', userName: 'Thiago Silva', action: 'Desenhou o layout e anexou o arquivo de artes.', timestamp: '2026-06-10 11:15' },
  { id: 'log-3', cardId: 'card-1', userName: 'Thiago Silva', action: 'Enviou o card para aprovação final de gerentes.', timestamp: '2026-06-10 11:20' },
  { id: 'log-4', cardId: 'card-4', userName: 'Dr. Tavares', action: 'Aprovou formalmente a campanha de conformidade fiscal.', timestamp: '2026-06-07 16:45' }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1', userId: 'usr-1', senderName: 'Ana Clara', avatarText: '🎴',
    message: 'mencionou você no card do Tavares e Schalch pedindo validação técnica.',
    targetCardTitle: 'Análise de Riscos Contratuais em M&A', timeAgo: '5 min atrás', type: 'mention', read: false
  },
  {
    id: 'notif-2', userId: 'usr-1', senderName: 'Thiago Silva', avatarText: '🎨',
    message: 'concluiu o design do card de campanha residencial e mudou para faturamento.',
    targetCardTitle: 'Lançamento de Incorporação Residencial Q3', timeAgo: '42 min atrás', type: 'demand', read: false
  },
  {
    id: 'notif-3', userId: 'usr-1', senderName: 'Dr. Tavares', avatarText: '⚖',
    message: 'reprovou o roteiro tributário e solicitou alteração imediata da ementa.',
    targetCardTitle: 'Guia do Planejamento Tributário Anual', timeAgo: '2 horas atrás', type: 'mention', read: true
  },
  {
    id: 'notif-4', userId: 'usr-2', senderName: 'Gabriel Fonseca', avatarText: '👑',
    message: 'criou nova demanda com briefing cru e marcou você para redigir a copy final.',
    targetCardTitle: 'Lançamento de Incorporação Residencial Q3', timeAgo: '12 min atrás', type: 'demand', read: false
  },
  {
    id: 'notif-5', userId: 'usr-2', senderName: 'Dr. Tavares', avatarText: '⚖',
    message: 'solicitou uma nova demanda de post sobre blindagem patrimonial familiar.',
    targetCardTitle: 'Nova Ementa de M&A Familiar', timeAgo: '1 hora atrás', type: 'demand', read: false
  },
  {
    id: 'notif-6', userId: 'usr-3', senderName: 'Ana Clara', avatarText: '✍️',
    message: 'marcou você para criar o design com as novas fontes da LCR Direito Aéreo.',
    targetCardTitle: 'Aeronaves de Pilotagem Remota (Drones) e ANAC', timeAgo: '15 min atrás', type: 'mention', read: false
  },
  {
    id: 'notif-7', userId: 'usr-3', senderName: 'Gabriel Fonseca', avatarText: '👑',
    message: 'solicitou nova capa de Reels urgente utilizando o gerador de IA local.',
    targetCardTitle: 'Lançamento de Incorporação Residencial Q3', timeAgo: '3 horas atrás', type: 'demand', read: true
  },
  {
    id: 'notif-8', userId: 'usr-4', senderName: 'Ana Clara', avatarText: '✍️',
    message: 'mencionou você para avaliar a proposta de copy jurídica no card.',
    targetCardTitle: 'Análise de Riscos Contratuais em M&A', timeAgo: '8 min atrás', type: 'mention', read: false
  },
  {
    id: 'notif-9', userId: 'usr-4', senderName: 'Gabriel Fonseca', avatarText: '👑',
    message: 'adicionou um novo dossiê de especificações técnicas para Tavares e Schalch.',
    targetCardTitle: 'Dossiê Tavares & Schalch', timeAgo: '4 horas atrás', type: 'system', read: false
  }
];

export const INITIAL_COMMENTS = [
  { id: 'comment-init-1', cardId: 'card-1', author: 'Gabriel Fonseca (Admin)', text: 'Paleta excelente! Precisa apenas alinhar o briefing do Dr. Tavares.', timestamp: '10/06/2026 14:15' },
  { id: 'comment-init-2', cardId: 'card-2', author: 'Ana Clara (Social Media)', text: 'Briefing expandido via Google Docs. Favor validar copy.', timestamp: '10/06/2026 16:30' }
];

export const INITIAL_STATUSES = [
  { name: 'Criação', color: '#6366f1' },
  { name: 'Em Aprovação', color: '#eab308' },
  { name: 'Em Andamento', color: '#10b981' },
  { name: 'Concluído', color: '#3b82f6' }
];

export const INITIAL_PRIORITIES = [
  { name: 'Baixa', color: '#94a3b8' },
  { name: 'Média', color: '#3b82f6' },
  { name: 'Alta', color: '#f97316' },
  { name: 'Urgente', color: '#ef4444' }
];
