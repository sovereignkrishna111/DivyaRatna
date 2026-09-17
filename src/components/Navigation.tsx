import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useUserAuth } from '../auth/UserAuthProvider';
import { useFlash } from './Flash';
import { useSiteSettings } from '../theme/siteSettings';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { user, logout } = useUserAuth();
  const { success } = useFlash();
  const { getAssetUrl } = useSiteSettings();
  const handleLogout = () => { logout(); success('Successfully logged out'); };
  const initials = useMemo(() => {
    const name = user?.name || '';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }, [user]);

  const navigationItems = [
    {
      title: 'Home',
      path: '/',
      items: []
    },
    {
      title: 'About Us',
      path: '/about',
      items: [
        { label: 'Mission', path: '/mission' },
        { label: 'Accreditation', path: '/accreditation' },
        { label: 'Strategic Framework', path: '/strategic-framework' },
        { label: 'Governance', path: '/governance' },
        { label: 'School Profile', path: '/school-profile' },
        { label: 'Facilities', path: '/facilities' },
        { label: 'Faculty', path: '/faculty' }
      ]
    },
    {
      title: 'Academics',
      path: '/academics',
      items: [
        { label: 'Elementary School', path: '/academics/elementary' },
        { label: 'Middle School', path: '/academics/middle' },
        { label: 'High School', path: '/academics/high' },
        { label: 'Arts, Athletics, Activities', path: '/academics/activities' },
        { label: 'Curriculum', path: '/academics/curriculum' }
      ]
    },
    {
      title: 'Services',
      path: '/services',
      items: [
        { label: 'Arts, Athletics, Activities', path: '/services/activities' },
        { label: 'Student Services', path: '/services/student' },
        { label: 'Food and Nutrition', path: '/services/nutrition' },
        { label: 'Transportation', path: '/services/transportation' },
        { label: 'Health Services', path: '/services/health' },
        { label: 'Air Quality', path: '/services/air-quality' },
        { label: 'Child Protection', path: '/services/protection' },
        { label: 'Safety and Security', path: '/services/security' }
      ]
    },
    {
      title: 'Community',
      path: '/community',
      items: [
        { label: 'Parent Association', path: '/community/parents' },
        { label: 'Alumni', path: '/community/alumni' },
        { label: 'Community Voices', path: '/community/voices' },
        { label: 'Recently at DRESS', path: '/community/recent' },
        { label: 'Calendar', path: '/calendar' }
      ]
    },
    {
      title: 'Gallery',
      path: '/gallery',
      items: []
    },
    {
      title: 'Bulletins',
      path: '/bulletins',
      items: [
        { label: 'Notices', path: '/bulletins/notices' },
        { label: 'Events', path: '/bulletins/events' },
        { label: 'News & Media', path: '/bulletins/news' },
        { label: 'Achievements', path: '/bulletins/achievements' },
        { label: 'Routine', path: '/bulletins/routine' },
        { label: 'Results', path: '/bulletins/results' }
      ]
    },
    {
      title: 'Log In',
      path: '/login',
      items: [
        { label: 'Parent Login', path: '/login?type=parent' },
        { label: 'Staff Login', path: '/login?type=staff' },
        { label: 'Student Login', path: '/login?type=student' }
      ]
    }
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-30 animate-slide-in-down">
      <div className="max-w-7xl mx-auto">
        {/* Top utility bar */}
        <div className="hidden lg:flex justify-end items-center px-6 py-2 text-xs border-b" 
          style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border-default)' }}>
          <div className="flex items-center space-x-6">
            <Link to="/admission" className="link-animate" style={{ color: 'var(--color-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>Admission</Link>
            <Link to="/calendar" className="link-animate" style={{ color: 'var(--color-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>Calendar</Link>
            <Link to="/news-media" className="link-animate" style={{ color: 'var(--color-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>News & Media</Link>
            <Link to="/work-at-dress" className="link-animate" style={{ color: 'var(--color-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>Work at DRESS</Link>
            <Link to="/contact" className="link-animate" style={{ color: 'var(--color-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}>Contact Us</Link>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <>
                <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center mr-3 overflow-hidden">
                  <img
                    src={getAssetUrl(
                      'logo',
                      'https://scontent.fbir7-1.fna.fbcdn.net/v/t39.30808-6/475770350_1106464641280060_8051712028946705424_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=Egcm6c2e9xoQ7kNvwG2YD3R&_nc_oc=AdlIieyPmL3LDpjYcPAwmKY1MyCR8-CtXtwGYQRFgmZKlp9dgP6cLEmoouxXoyX3g4OMvr4Umv947XLrfrVBbPjM&_nc_zt=23&_nc_ht=scontent.fbir7-1.fna&_nc_gid=wT2Id1Gs9KkWEHupOu8ryg&oh=00_AfmHI4rhlZ4rzGI_nZ7eNpCzN2nuwUB579-MFiM6Yk6VGQ&oe=695146C7'
                    )}
                    className="w-full h-full object-cover"
                    alt="Logo"
                  />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 tracking-tight">Divya Ratna</div>
                  <div className="text-xs text-gray-500 -mt-1 font-medium">english secondary school</div>
                </div>
              </>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <div 
                key={item.title}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.title)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  to={item.path}
                  style={{
                    color: location.pathname === item.path ? 'var(--color-primary-800)' : 'var(--color-text-primary)',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = location.pathname === item.path ? 'var(--color-primary-800)' : 'var(--color-text-primary)'}
                  className="flex items-center transition-colors text-sm">
                  {item.title}
                  {item.items.length > 0 && (
                    <ChevronDown 
                      className="h-3 w-3 ml-1 transition-transform duration-150 ease-in-out" 
                      style={{
                        transform: activeDropdown === item.title ? 'rotate(180deg)' : 'rotate(0deg)',
                        willChange: 'transform'
                      }}
                    />
                  )}
                </Link>
                
                {item.items.length > 0 && (
                  <div 
                    className={`absolute top-full left-0 mt-1 w-56 rounded-lg shadow-xl py-1 z-50 origin-top transition-all duration-150 ease-out ${
                      activeDropdown === item.title 
                        ? 'opacity-100 visible scale-y-100 translate-y-0' 
                        : 'opacity-0 invisible scale-y-95 -translate-y-2'
                    }`}
                    style={{
                      backgroundColor: 'var(--color-background-primary)',
                      border: '1px solid var(--color-border-default)',
                      transformOrigin: 'top center',
                      willChange: activeDropdown === item.title ? 'opacity, transform' : 'auto'
                    }}>
                    {item.items.map((subItem) => (
                      <Link
                        key={typeof subItem === 'object' ? subItem.path : String(subItem)}
                        to={typeof subItem === 'object' ? subItem.path : '#'}
                        className="block px-4 py-2.5 text-xs transition-all duration-100 ease-out"
                        style={{
                          color: 'var(--color-text-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
                          e.currentTarget.style.color = 'var(--color-primary-800)';
                          e.currentTarget.style.paddingLeft = '1.25rem';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                          e.currentTarget.style.paddingLeft = '1rem';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                        onClick={() => setActiveDropdown(null)}
                      >
                        {typeof subItem === 'object' ? subItem.label : subItem}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User badge (right) */}
          <div className="hidden lg:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-[4px] flex items-center justify-center text-sm font-semibold" style={{ 
                  color: 'var(--color-primary-800)',
                  backgroundColor: 'rgba(var(--color-primary-800), 0.07)', 
                  border: '1px solid rgba(var(--color-primary-800), 0.15)' 
                }}>
                  {initials}
                </div>
                <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{user.name}</span>
                <button
                  title="Log out"
                  aria-label="Log out"
                  onClick={handleLogout}
                  className="ml-1 transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button and small badge */}
          <div className="lg:hidden flex items-center gap-3">
            {user && (
              <>
                <div className="w-8 h-8 rounded-[4px] flex items-center justify-center text-xs font-semibold" style={{ 
                  color: 'var(--color-primary-800)',
                  backgroundColor: 'rgba(var(--color-primary-800), 0.07)', 
                  border: '1px solid rgba(var(--color-primary-800), 0.15)' 
                }}>
                  {initials}
                </div>
                <button
                  title="Log out"
                  aria-label="Log out"
                  onClick={handleLogout}
                  className="transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className="lg:hidden overflow-hidden transition-all duration-200 ease-out"
        style={{
          maxHeight: isOpen ? '1000px' : '0px',
          opacity: isOpen ? 1 : 0,
          borderTop: isOpen ? '1px solid var(--color-border-default)' : 'none',
          willChange: isOpen ? 'max-height, opacity' : 'auto'
        }}
      >
        <div className="px-4 pt-2 pb-3 space-y-1" style={{ backgroundColor: 'var(--color-background-primary)' }}>
          {navigationItems.map((item) => (
            <div key={item.title} className="space-y-1">
              <div className="flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border-default)' }}>
                <Link
                  to={item.path}
                  style={{
                    color: location.pathname === item.path ? 'var(--color-primary-800)' : 'var(--color-text-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = location.pathname === item.path ? 'var(--color-primary-800)' : 'var(--color-text-primary)'}
                  className="flex-1 text-left px-3 py-3 font-medium text-sm transition-colors"
                  onClick={() => {
                    setActiveDropdown(null);
                    setIsOpen(false);
                  }}
                >
                  {item.title}
                </Link>
                {item.items.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveDropdown(activeDropdown === item.title ? null : item.title);
                    }}
                    className="px-3 py-3 transition-transform duration-150"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      transform: activeDropdown === item.title ? 'rotate(180deg)' : 'rotate(0deg)',
                      willChange: 'transform'
                    }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
              </div>
              {item.items.length > 0 && activeDropdown === item.title && (
                <div className="pl-6 space-y-1 transition-all duration-300" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
                  {item.items.map((subItem) => (
                    <Link
                      key={typeof subItem === 'object' ? subItem.path : String(subItem)}
                      to={typeof subItem === 'object' ? subItem.path : '#'}
                      className="block px-3 py-2 text-xs transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                      onClick={() => {
                        setActiveDropdown(null);
                        setIsOpen(false);
                      }}
                    >
                      {typeof subItem === 'object' ? subItem.label : subItem}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;