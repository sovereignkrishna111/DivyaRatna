import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useFlash } from '../components/Flash';

const AdminShell: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useFlash();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
      
      // Close sidebar when switching to mobile view
      if (!isMobileView) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    success('Successfully logged out');
    navigate('/admin/login');
  };

  return (
    <div 
      style={{
        background: 'linear-gradient(to bottom right, #f3f4f6, #ffffff, var(--color-primary-50))',
      }}
      className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden"
    >
      {/* Sidebar with overlay */}
      <div 
        className={`fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <div 
          className="relative z-10 h-full w-72 text-white shadow-2xl"
          style={{
            backgroundColor: 'var(--color-primary-900)',
          }}
        >
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col h-screen w-full min-w-0 transition-all duration-300">
        <Topbar
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName={user?.name || 'Admin'}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden focus:outline-none p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile bottom navigation for small screens */}
        {isMobile && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-20">
            <div className="flex justify-around py-2 px-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 focus:outline-none transition-colors"
                style={{
                  '--hover-color': 'var(--color-primary-700)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-700)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(75, 85, 99)'}
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-600 focus:outline-none transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-700)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(75, 85, 99)'}
                aria-label="Logout"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShell;
