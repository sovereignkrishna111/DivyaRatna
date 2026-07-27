import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Users, FileText, Calendar, BookOpen, Bell, Settings, UserCog, Palette, X, Image as ImageIcon, Briefcase, HelpCircle, Handshake, HeartHandshake, Cake, MessageSquareQuote, Mail } from 'lucide-react';
import { AdminLogoIcon } from './AdminLogo';

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/teachers', label: 'Teachers', icon: Users },
  { to: '/admin/staff', label: 'Staff', icon: UserCog },
  { to: '/admin/birthdays', label: 'Birthdays', icon: Cake },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/academics', label: 'Academics', icon: BookOpen },
  { to: '/admin/services', label: 'Services', icon: Handshake },
  { to: '/admin/community', label: 'Community', icon: HeartHandshake },
  { to: '/admin/bulletins', label: 'Bulletins', icon: Bell },
  { to: '/admin/home-hero', label: 'Home Hero', icon: ImageIcon },
  { to: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { to: '/admin/press-releases', label: 'Press Releases', icon: FileText },
  { to: '/admin/careers', label: 'Careers', icon: Briefcase },
  { to: '/admin/admissions', label: 'Admissions', icon: AdminLogoIcon },
  { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { to: '/admin/contact', label: 'Contact', icon: Mail },
  { to: '/admin/theme-media', label: 'Theme & Media', icon: Palette },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 flex-shrink-0">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-white/70">Divya Ratna</div>
          <h1 className="text-lg font-semibold tracking-wide text-white truncate">Admin Console</h1>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 -mr-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg focus:outline-none"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl mb-1.5 transition-colors ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-gold-400 transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
