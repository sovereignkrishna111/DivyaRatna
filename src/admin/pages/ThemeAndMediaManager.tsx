import React, { useState } from 'react';
import { Palette, Image as ImageIcon } from 'lucide-react';
import ComprehensiveThemeEditor from './ComprehensiveThemeEditor';
import ThemeMedia from './ThemeMedia';

export default function ThemeAndMediaManager() {
  const [activeTab, setActiveTab] = useState<'colors' | 'media'>('colors');

  return (
    <div className="space-y-6 pb-8">
      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'colors'
              ? 'border-maroon-700 text-maroon-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette className="h-4 w-4" />
          Theme Colors
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'media'
              ? 'border-maroon-700 text-maroon-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Media Assets
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'colors' && <ComprehensiveThemeEditor />}
        {activeTab === 'media' && <ThemeMedia />}
      </div>
    </div>
  );
}
