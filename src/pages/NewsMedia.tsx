import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Eye, Share2, Search, Filter, ArrowRight, Play, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

const NewsMedia: React.FC = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [mediaGallery, setMediaGallery] = useState<any[]>([]);
  const [pressReleases, setPressReleases] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });
      if (error || !data) { setNewsArticles([]); return; }
      const rows = (data as any[]).map((n: any, idx: number) => ({
        id: n.id,
        title: n.title,
        excerpt: n.excerpt,
        content: n.content || '',
        author: n.author || 'Admin',
        date: n.date,
        category: n.category || 'general',
        image: n.image_url || '',
        views: 0,
        featured: idx < 2,
      }));
      setNewsArticles(rows);
    };
    fetchNews();

    const channel = supabase
      .channel('realtime-news-media')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchNews)
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch {} };
  }, []);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });
      if (error || !data) {
        setMediaGallery([]);
        return;
      }
      const rows = (data as any[]).map((r: any) => {
        const kind = r.media_kind || 'image';
        const thumb = kind === 'video' ? (r.thumbnail_url || '') : (r.image_url || '');
        return {
          id: r.id,
          title: r.title,
          kind,
          category: r.type,
          thumbnail: thumb,
          date: r.updated_at || r.created_at,
          videoUrl: r.video_url || '',
          featured: !!r.featured,
          featuredOrder: typeof r.featured_order === 'number' ? r.featured_order : 0,
        };
      });
      setMediaGallery(rows);
    };

    const fetchPress = async () => {
      const { data, error } = await supabase
        .from('press_releases')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('release_date', { ascending: false });
      if (error || !data) {
        setPressReleases([]);
        return;
      }
      const rows = (data as any[]).map((r: any) => ({
        id: r.id,
        title: r.title,
        date: r.release_date,
        summary: r.summary || '',
        downloadUrl: r.attachment_url || r.external_url || '',
      }));
      setPressReleases(rows);
    };

    fetchGallery();
    fetchPress();

    const ch1 = supabase
      .channel('realtime-news-media-gallery')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_items' }, fetchGallery)
      .subscribe();
    const ch2 = supabase
      .channel('realtime-news-media-press')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'press_releases' }, fetchPress)
      .subscribe();

    return () => {
      try { supabase.removeChannel(ch1); } catch {}
      try { supabase.removeChannel(ch2); } catch {}
    };
  }, []);

  const categories = [
    { id: 'all', label: 'All News', color: 'bg-gray-100 text-gray-800' },
    { id: 'achievements', label: 'Achievements', color: 'bg-green-100 text-green-800' },
    { id: 'facilities', label: 'Facilities', color: 'bg-blue-100 text-blue-800' },
    { id: 'programs', label: 'Programs', color: 'bg-purple-100 text-purple-800' },
    { id: 'recognition', label: 'Recognition', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'events', label: 'Events', color: 'bg-maroon-100 text-maroon-800' }
  ];

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  const filteredNews = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredNews = newsArticles.filter(article => article.featured);

  const mediaPreview = mediaGallery.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-maroon-800 to-maroon-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-light mb-4 tracking-wide">News & Media</h1>
            <p className="text-xl font-light max-w-2xl mx-auto">
              Stay informed with the latest news, events, and media from DRESS community
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'news' 
                  ? 'bg-maroon-700 text-white' 
                  : 'text-gray-600 hover:text-maroon-700'
              }`}
            >
              Latest News
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'media' 
                  ? 'bg-maroon-700 text-white' 
                  : 'text-gray-600 hover:text-maroon-700'
              }`}
            >
              Media Gallery
            </button>
            <button
              onClick={() => setActiveTab('press')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'press' 
                  ? 'bg-maroon-700 text-white' 
                  : 'text-gray-600 hover:text-maroon-700'
              }`}
            >
              Press Releases
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* News Tab */}
          {activeTab === 'news' && (
            <div>
              {/* Featured News */}
              <div className="mb-12">
                <h2 className="text-3xl font-light text-maroon-800 mb-8">Featured Stories</h2>
                <div className="grid lg:grid-cols-2 gap-8">
                  {featuredNews.slice(0, 2).map((article) => (
                    <div key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="relative">
                        <img 
                          src={article.image}
                          alt={article.title}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                            {categories.find(c => c.id === article.category)?.label}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-maroon-800 mb-3 hover:text-maroon-700 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{new Date(article.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span>{article.author}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{article.views} views</span>
                            </div>
                          </div>
                        </div>
                        <button className="flex items-center text-maroon-700 font-semibold hover:text-maroon-800 transition-colors">
                          Read More
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-3xl font-light text-maroon-800">All News</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search news..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* News List */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.map((article) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={article.image}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                          {categories.find(c => c.id === article.category)?.label}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-maroon-800 mb-3 hover:text-maroon-700 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                        <span>{article.views} views</span>
                      </div>
                      <button className="text-maroon-700 font-medium hover:text-maroon-800 transition-colors text-sm">
                        Read More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div>
              <div className="flex items-center justify-between gap-4 mb-8">
                <h2 className="text-3xl font-light text-maroon-800">Media Gallery</h2>
                <a
                  href="/gallery"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-maroon-700 text-white hover:bg-maroon-800 transition-colors"
                >
                  See More
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mediaPreview.map((media) => (
                  <div key={media.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative">
                      <img 
                        src={media.thumbnail}
                        alt={media.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {media.kind === 'video' ? (
                          <a href={media.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                            <Play className="h-12 w-12 text-white" />
                          </a>
                        ) : (
                          <Play className="h-12 w-12 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-maroon-800 mb-2">{media.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{media.date ? new Date(media.date).toLocaleDateString() : ''}</span>
                        <span>{media.category || ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Press Releases Tab */}
          {activeTab === 'press' && (
            <div>
              <h2 className="text-3xl font-light text-maroon-800 mb-8">Press Releases</h2>
              <div className="space-y-6">
                {pressReleases.map((release) => (
                  <div key={release.id} className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between">
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="text-xl font-semibold text-maroon-800 mb-3">{release.title}</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">{release.summary}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(release.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <a
                          href={release.downloadUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-maroon-700 text-white rounded-lg hover:bg-maroon-800 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </a>
                        <button className="flex items-center px-4 py-2 border border-maroon-700 text-maroon-700 rounded-lg hover:bg-maroon-50 transition-colors">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-maroon-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-4">Stay Informed</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest news and updates from DRESS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-maroon-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsMedia;