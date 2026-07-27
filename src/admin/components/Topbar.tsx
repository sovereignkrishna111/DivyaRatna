import React from 'react';
import { Menu } from 'lucide-react';

interface TopbarProps {
  userName?: string;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ 
  userName = 'Admin', 
  onLogout, 
  onMenuClick 
}) => {
  const initials = React.useMemo(() => {
    const parts = (userName || '').trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'AD';
  }, [userName]);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden mr-4 p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-maroon-500"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-gray-500">DRESS</div>
          <div className="font-semibold text-gray-900 text-base sm:text-lg truncate">Admin Panel</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-sm text-gray-700 truncate max-w-[140px] lg:max-w-[220px]">
            {userName}
          </div>
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-maroon-800 bg-maroon-50 border border-maroon-100"
            aria-label={initials}
            title={userName}
          >
            {initials}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={onLogout}
            className="text-sm font-medium bg-maroon-700 hover:bg-maroon-800 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500"
          >
            <span className="hidden sm:inline">Sign out</span>
            <span className="sm:hidden">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
