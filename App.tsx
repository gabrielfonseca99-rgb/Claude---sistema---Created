import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ProjectsSidebar } from './components/ProjectsSidebar';
import { DemandModal } from './components/DemandModal';

// Tab pages
import { HomePage } from './components/tabs/HomePage';
import { KanbanBoard } from './components/tabs/KanbanBoard';
import { StoriesGenerator } from './components/tabs/StoriesGenerator';
import { BrandManager } from './components/tabs/BrandManager';
import { ReelsGenerator } from './components/tabs/ReelsGenerator';
import { IntegrationsPanel } from './components/tabs/IntegrationsPanel';
import { LogsPanel } from './components/tabs/LogsPanel';
import { AnalyticsDashboard } from './components/tabs/AnalyticsDashboard';
import { EditorialCalendar } from './components/tabs/EditorialCalendar';
import { AutomationsPanel } from './components/tabs/AutomationsPanel';

// ==========================================
// METRICS CAPSULES (shown on non-painel tabs)
// ==========================================
const MetricsCapsules: React.FC = () => {
  const { activeTab, cards, canAccessBrand, setActiveTab, isDarkMode } = useApp();

  if (activeTab === 'painel') return null;

  const capsules = [
    {
      label: 'Novas Demandas',
      stage: 'a_fazer',
      emoji: '✍️',
      tagText: 'Produzir',
      colors: { bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50', text: 'text-amber-600', tagBg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50', tagText: 'text-amber-600' },
      colAnchor: 'kanban-col-a_fazer',
    },
    {
      label: 'Em Aprovação',
      stage: 'em_aprovacao',
      emoji: '⏳',
      tagText: 'Avaliando',
      colors: { bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50', text: 'text-blue-600', tagBg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50', tagText: 'text-blue-600' },
      colAnchor: 'kanban-col-em_aprovacao',
    },
    {
      label: 'Alterações',
      stage: 'alteracoes',
      emoji: '🎨',
      tagText: 'Ajustes',
      colors: { bg: isDarkMode ? 'bg-pink-500/10' : 'bg-pink-50', text: 'text-pink-600', tagBg: isDarkMode ? 'bg-pink-500/10' : 'bg-pink-50', tagText: 'text-pink-600' },
      colAnchor: 'kanban-col-alteracoes',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="metrics-capsules">
      {capsules.map(cap => {
        const count = cards.filter(c => c.stage === cap.stage && canAccessBrand(c.brandId)).length;
        return (
          <div
            key={cap.stage}
            className={`rounded-2xl p-4 border shadow-sm flex items-center justify-between gap-3 hover:border-indigo-150 transition cursor-help ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'
            }`}
            onClick={() => {
              setActiveTab('painel');
              setTimeout(() => {
                document.getElementById(cap.colAnchor)?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${cap.colors.bg} ${cap.colors.text} flex items-center justify-center font-bold text-xs shrink-0`}>
                {cap.emoji}
              </div>
              <div className="text-left">
                <div className={`text-[10px] font-bold uppercase tracking-wide ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{cap.label}</div>
                <div className={`text-xs font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>{count} demandas</div>
              </div>
            </div>
            <div className={`text-[9px] ${cap.colors.tagText} ${cap.colors.tagBg} px-1.5 py-0.5 rounded-full font-mono uppercase font-bold`}>
              {cap.tagText}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// TAB CONTENT ROUTER
// ==========================================
const TabContent: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
    case 'home':
      return <HomePage />;
    case 'painel':
      return <KanbanBoard />;
    case 'templates':
      return <StoriesGenerator />;
    case 'brands':
      return <BrandManager />;
    case 'generator':
      return <ReelsGenerator />;
    case 'integrations':
      return <IntegrationsPanel />;
    case 'logs':
      return <LogsPanel />;
    case 'analytics':
      return <AnalyticsDashboard />;
    case 'calendar':
      return <EditorialCalendar />;
    case 'automations':
      return <AutomationsPanel />;
    default:
      return <HomePage />;
  }
};

// ==========================================
// ERROR BOUNDARY
// ==========================================
class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CreaFlow Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (this.props.fallback || (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center max-w-sm">
            <p className="text-sm text-red-400 font-bold mb-2">Erro ao renderizar</p>
            <p className="text-xs text-zinc-400 mb-4">Algo deu errado ao abrir este painel.</p>
            <button onClick={() => this.setState({ hasError: false })} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg">
              Tentar novamente
            </button>
          </div>
        </div>
      ));
    }
    return this.props.children;
  }
}

// ==========================================
// DEMAND MODAL BRIDGE (adapts context → props)
// ==========================================
const DemandModalBridge: React.FC = () => {
  const {
    isDemandModalOpen, setIsDemandModalOpen,
    editingCard, setEditingCard,
    brands, kanbanColumns, currentUser, comments,
    handleSaveDemand, handleAddComment, projects, isDarkMode,
  } = useApp();

  const handleSaveAndClose = (cardData: Partial<import('./types').DemandCard>) => {
    handleSaveDemand(cardData);
    setIsDemandModalOpen(false);
    setEditingCard(null);
  };

  return (
    <ErrorBoundary>
      <DemandModal
        isOpen={isDemandModalOpen}
        onClose={() => { setIsDemandModalOpen(false); setEditingCard(null); }}
        brands={brands}
        kanbanColumns={kanbanColumns}
        editingCard={editingCard}
        onSaveDemand={handleSaveAndClose}
        currentUser={currentUser}
        comments={comments}
        onAddComment={handleAddComment}
        projects={projects}
        isDarkMode={isDarkMode}
      />
    </ErrorBoundary>
  );
};

// ==========================================
// MAIN LAYOUT
// ==========================================
const AppLayout: React.FC = () => {
  const { isDarkMode, activeTab } = useApp();

  return (
    <>
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-[#0c0e14] text-zinc-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Left Navigation */}
      <Sidebar />

      {/* Projects Sidebar (only on painel tab) */}
      <ProjectsSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0" id="main-content-flow">
        <TopBar />

        {/* Workspace Container */}
        <div
          className={`flex-1 p-4 md:p-8 grid grid-cols-1 gap-8 ${
            activeTab === 'painel' ? 'xl:grid-cols-12 max-w-none' : 'xl:grid-cols-12 max-w-7xl'
          } w-full mx-auto overflow-y-auto`}
          id="workspace-container"
        >
          <div className="space-y-8 flex flex-col min-w-0 xl:col-span-12" id="main-content-stream">
            {/* Metrics Capsules */}
            <MetricsCapsules />

            {/* Tab Content */}
            <div
              className={`${
                activeTab === 'painel'
                  ? 'bg-transparent border-none p-0 shadow-none'
                  : isDarkMode
                    ? 'bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-sm'
                    : 'bg-white rounded-3xl p-6 border border-slate-200/50 shadow-sm'
              } flex-1 flex flex-col min-h-[500px]`}
              id="tab-window-content"
            >
              <TabContent />
            </div>
          </div>
        </div>
      </div>

    </div>
    {/* Demand Modal — rendered OUTSIDE the overflow-hidden flex container */}
    <DemandModalBridge />
    </>
  );
};

// ==========================================
// APP ROOT
// ==========================================
function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;
