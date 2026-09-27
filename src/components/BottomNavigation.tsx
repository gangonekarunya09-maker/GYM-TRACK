import React from 'react';
import { Home, Dumbbell, History, TrendingUp, Layers } from 'lucide-react';

export type NavTab = 'home' | 'workout' | 'history' | 'progress' | 'templates';

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveWorkout: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  hasActiveWorkout,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    {
      id: 'workout' as NavTab,
      label: hasActiveWorkout ? 'Active' : 'Workout',
      icon: Dumbbell,
      isSpecial: hasActiveWorkout,
    },
    { id: 'history' as NavTab, label: 'History', icon: History },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'templates' as NavTab, label: 'Templates', icon: Layers },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e1117]/95 backdrop-blur-md border-t border-[#202531] pb-safe"
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full relative transition-colors duration-150 ${
                isActive ? 'text-[#00f59b]' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {tab.isSpecial && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00f59b] rounded-full animate-pulse ring-2 ring-[#0e1117]" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap ${
                  isActive ? 'text-[#00f59b] font-semibold' : 'text-zinc-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-5 h-0.5 bg-[#00f59b] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
