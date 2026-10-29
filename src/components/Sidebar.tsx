import React from 'react';
import {
  LayoutDashboard,
  Split,
  Activity,
  AlertTriangle,
  GitCompare,
  Sliders,
  Bot,
  Database,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type NavTab =
  | 'overview'
  | 'subgroups'
  | 'drift'
  | 'live'
  | 'incidents'
  | 'models'
  | 'regression'
  | 'simulator'
  | 'assistant'
  | 'integrations';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  openIncidentsCount: number;
  silentFailuresCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  openIncidentsCount,
  silentFailuresCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'live' as NavTab,
      label: 'Live Monitor',
      icon: Activity,
      badge: 'Live',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/80',
    },
    {
      id: 'subgroups' as NavTab,
      label: 'Hidden Failure Radar',
      icon: Split,
      badge: silentFailuresCount > 0 ? `${silentFailuresCount} Critical` : null,
      badgeColor: 'text-rose-400 bg-rose-950/60 border border-rose-800/80',
    },
    {
      id: 'drift' as NavTab,
      label: 'Drift Detection',
      icon: Activity,
      badge: null,
    },
    {
      id: 'incidents' as NavTab,
      label: 'Incident Center',
      icon: AlertTriangle,
      badge: openIncidentsCount > 0 ? `${openIncidentsCount}` : null,
      badgeColor: 'text-amber-400 bg-amber-950/60 border border-amber-800/80',
    },
    {
      id: 'models' as NavTab,
      label: 'Model Registry',
      icon: Layers,
      badge: null,
    },
    {
      id: 'regression' as NavTab,
      label: 'Model Comparison',
      icon: GitCompare,
      badge: null,
    },
    {
      id: 'assistant' as NavTab,
      label: 'Investigation Assistant',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'text-violet-400 bg-violet-950/60 border border-violet-800/80',
    },
    {
      id: 'simulator' as NavTab,
      label: 'What-If Simulator',
      icon: Sliders,
      badge: null,
    },
    {
      id: 'integrations' as NavTab,
      label: 'Data Sources & Audits',
      icon: Database,
      badge: null,
    },
  ];

  const { theme } = useTheme();

  return (
    <aside
      className={`border-r flex flex-col justify-between transition-all duration-200 shrink-0 select-none ${
        theme === 'dark' ? 'border-slate-800 bg-[#0B0F17]' : 'border-slate-200 bg-white'
      } ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Top Nav Items */}
      <div className="py-3 px-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all w-full text-left relative group active:scale-[0.99] ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-slate-800/90 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-900 font-semibold shadow-xs'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-amber-400' : theme === 'dark' ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              />
              {!collapsed && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold shrink-0 shadow-2xs ${
                        item.badgeColor || 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom status & collapse toggle */}
      <div className={`p-2 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} flex flex-col gap-2`}>
        {!collapsed && (
          <div
            className={`px-3 py-2 rounded-md border text-[11px] flex items-center justify-between ${
              theme === 'dark'
                ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Sentinel Engine</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 font-semibold">ACTIVE</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`flex items-center justify-center py-1.5 px-2 rounded-md transition-colors text-xs ${
            theme === 'dark'
              ? 'hover:bg-slate-900 text-slate-500 hover:text-slate-300'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
