import React from 'react';
import PagesList from '../components/content/PagesList';
import MediaManager from '../components/content/MediaManager';

const Content: React.FC = () => {
  const [tab, setTab] = React.useState<'pages' | 'media'>('pages');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Content Management</h1>
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setTab('pages')}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${tab === 'pages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Pages
          </button>
          <button
            onClick={() => setTab('media')}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${tab === 'media' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Media
          </button>
        </nav>
      </div>
      <div>
        {tab === 'pages' ? <PagesList /> : <MediaManager />}
      </div>
    </div>
  );
};

export default Content;
