
 import React, { useCallback, useEffect, useMemo, useState } from 'react';
 
 import {
   AlertTriangle,
   Bell,
   Globe,
   Save,
   Settings as SettingsIcon,
   Shield,
   Wrench,
 } from 'lucide-react';
 import { supabase } from '../../lib/supabase';
 import { useFlash } from '../../components/Flash';
 import { useAdminAuth } from '../hooks/useAdminAuth';
 import Select from '../components/Select';
 
 type SiteSettingsRow = {
   id: string;
   school_name: string;
   public_site_url: string;
   contact_email: string;
   timezone: string;
   locale: string;
   announcements_enabled: boolean;
   announcement_text: string;
   maintenance_mode: boolean;
   maintenance_message: string;
   allow_public_registration: boolean;
   features: Record<string, unknown>;
   social_links: Record<string, unknown>;
   seo: Record<string, unknown>;
   created_at: string;
   updated_at: string;
 };
 
 const DEFAULT_SETTINGS: Omit<SiteSettingsRow, 'created_at' | 'updated_at'> = {
   id: 'default',
   school_name: 'Divya Ratna English Secondary School',
   public_site_url: 'https://example.com',
   contact_email: 'info@example.com',
   timezone: 'Asia/Kathmandu',
   locale: 'en-US',
   announcements_enabled: false,
   announcement_text: '',
   maintenance_mode: false,
   maintenance_message: 'We are currently undergoing scheduled maintenance. Please check back soon.',
   allow_public_registration: true,
   features: {
     show_notices: true,
     show_events: true,
     show_gallery: true,
     show_news: true,
     show_testimonials: true,
     show_achievements: true,
   },
   social_links: {
     facebook: '',
     twitter: '',
     instagram: '',
     youtube: '',
     linkedin: '',
     tiktok: '',
     whatsapp: '',
     telegram: '',
     website: '',
   },
   seo: {
     default_title: 'Divya Ratna English Secondary School',
     default_description: 'Official website',
     og_image_url: '',
   },
 };
 
 function toBool(v: unknown, fallback: boolean) {
   return typeof v === 'boolean' ? v : fallback;
 }
 
 function toString(v: unknown, fallback: string) {
   return typeof v === 'string' ? v : fallback;
 }
 
 function toRecord(v: unknown, fallback: Record<string, unknown>) {
   return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : fallback;
 }
 
 function normalizeRow(row: Partial<SiteSettingsRow> | null | undefined): Omit<SiteSettingsRow, 'created_at' | 'updated_at'> {
   const base = row || {};
   return {
     ...DEFAULT_SETTINGS,
     id: toString(base.id, 'default'),
     school_name: toString(base.school_name, DEFAULT_SETTINGS.school_name),
     public_site_url: toString(base.public_site_url, DEFAULT_SETTINGS.public_site_url),
     contact_email: toString(base.contact_email, DEFAULT_SETTINGS.contact_email),
     timezone: toString(base.timezone, DEFAULT_SETTINGS.timezone),
     locale: toString(base.locale, DEFAULT_SETTINGS.locale),
     announcements_enabled: toBool(base.announcements_enabled, DEFAULT_SETTINGS.announcements_enabled),
     announcement_text: toString(base.announcement_text, DEFAULT_SETTINGS.announcement_text),
     maintenance_mode: toBool(base.maintenance_mode, DEFAULT_SETTINGS.maintenance_mode),
     maintenance_message: toString(base.maintenance_message, DEFAULT_SETTINGS.maintenance_message),
     allow_public_registration: toBool(base.allow_public_registration, DEFAULT_SETTINGS.allow_public_registration),
     features: { ...DEFAULT_SETTINGS.features, ...toRecord(base.features, DEFAULT_SETTINGS.features) },
     social_links: { ...DEFAULT_SETTINGS.social_links, ...toRecord(base.social_links, DEFAULT_SETTINGS.social_links) },
     seo: { ...DEFAULT_SETTINGS.seo, ...toRecord(base.seo, DEFAULT_SETTINGS.seo) },
   };
 }
 
 const Settings: React.FC = () => {
   const { success, error, info } = useFlash();
   const { user, hasRole } = useAdminAuth();
 
   const canDanger = hasRole('superadmin');
 
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);
   const [form, setForm] = useState<Omit<SiteSettingsRow, 'created_at' | 'updated_at'>>(() => ({ ...DEFAULT_SETTINGS }));
   const [initial, setInitial] = useState<Omit<SiteSettingsRow, 'created_at' | 'updated_at'>>(() => ({ ...DEFAULT_SETTINGS }));
 
   const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
 
   const validate = () => {
     if (!form.school_name.trim()) return 'School name is required.';
     if (!form.contact_email.trim() || !form.contact_email.includes('@')) return 'A valid contact email is required.';
     if (!form.public_site_url.trim()) return 'Public site URL is required.';
     return null;
   };

   const load = useCallback(async () => {
     setLoading(true);
     try {
       const res = await supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle();
       if (res.error) throw res.error;

       const normalized = normalizeRow((res.data as Partial<SiteSettingsRow>) || null);

       if (!res.data) {
         const up = await supabase.from('site_settings').upsert(normalized).select('*').eq('id', 'default').maybeSingle();
         if (up.error) throw up.error;
         const again = normalizeRow((up.data as Partial<SiteSettingsRow>) || null);
         setForm(again);
         setInitial(again);
       } else {
         setForm(normalized);
         setInitial(normalized);
       }

       setLastLoadedAt(new Date().toLocaleString());
     } catch (e) {
       const msg = (e as { message?: string })?.message || 'Failed to load settings.';
       error(msg);
     } finally {
       setLoading(false);
     }
   }, [error]);

   useEffect(() => {
     load();
   }, [load]);

   const save = async () => {
     const v = validate();
     if (v) {
       error(v);
       return;
     }
 
     setSaving(true);
     try {
       const payload = normalizeRow(form);
       const res = await supabase
         .from('site_settings')
         .upsert(payload)
         .select('*')
         .eq('id', 'default')
         .maybeSingle();
       if (res.error) throw res.error;
       const normalized = normalizeRow((res.data as Partial<SiteSettingsRow>) || null);
       setForm(normalized);
       setInitial(normalized);
       success('Settings saved');
     } catch (e) {
       const msg = (e as { message?: string })?.message || 'Failed to save settings.';
       error(msg);
     } finally {
       setSaving(false);
     }
   };
 
   const resetToDefaults = async () => {
     if (!canDanger) {
       error('Only superadmin can reset settings.');
       return;
     }
     if (!window.confirm('Reset all site settings to defaults? This overwrites the current configuration.')) return;
     setSaving(true);
     try {
       const res = await supabase
         .from('site_settings')
         .upsert({ ...DEFAULT_SETTINGS })
         .select('*')
         .eq('id', 'default')
         .maybeSingle();
       if (res.error) throw res.error;
       const normalized = normalizeRow((res.data as Partial<SiteSettingsRow>) || null);
       setForm(normalized);
       setInitial(normalized);
       success('Settings reset to defaults');
     } catch (e) {
       const msg = (e as { message?: string })?.message || 'Failed to reset settings.';
       error(msg);
     } finally {
       setSaving(false);
     }
   };
 
   const setFeature = (key: string, value: boolean) => {
     setForm((s) => ({
       ...s,
       features: { ...s.features, [key]: value },
     }));
   };
 
   const setSocial = (key: string, value: string) => {
     setForm((s) => ({
       ...s,
       social_links: { ...s.social_links, [key]: value },
     }));
   };
 
   const setSeo = (key: string, value: string) => {
     setForm((s) => ({
       ...s,
       seo: { ...s.seo, [key]: value },
     }));
   };
 
   const copyPublicUrl = async () => {
     try {
       await navigator.clipboard.writeText(form.public_site_url);
       info('Copied public site URL');
     } catch {
       error('Could not copy to clipboard');
     }
   };
 
   return (
     <div className="space-y-6">
       <div className="bg-white rounded shadow p-6">
         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
           <div className="flex items-center gap-2">
             <SettingsIcon className="h-5 w-5 text-maroon-700" />
             <div>
               <h1 className="text-lg font-semibold text-maroon-800">Settings</h1>
               <div className="text-xs text-gray-500">
                 {user ? `Signed in as ${user.name} (${user.role})` : 'Admin'}
                 {lastLoadedAt ? ` • Loaded ${lastLoadedAt}` : ''}
               </div>
             </div>
           </div>
 
           <div className="flex items-center gap-2">
             <button
               onClick={load}
               disabled={loading || saving}
               className="text-sm border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded disabled:opacity-60"
             >
               Refresh
             </button>
             <button
               onClick={() => {
                 if (!dirty) return;
                 if (!window.confirm('Discard unsaved changes?')) return;
                 setForm(initial);
                 info('Changes discarded');
               }}
               disabled={!dirty || loading || saving}
               className="text-sm border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded disabled:opacity-60"
             >
               Discard
             </button>
             <button
               onClick={save}
               disabled={loading || saving || !dirty}
               className="inline-flex items-center gap-2 text-sm bg-maroon-700 hover:bg-maroon-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 disabled:opacity-60"
             >
               <Save className="h-4 w-4" />
               {saving ? 'Saving…' : 'Save changes'}
             </button>
           </div>
         </div>
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white rounded shadow p-6">
           <div className="flex items-center gap-2 mb-4">
             <Globe className="h-5 w-5 text-maroon-700" />
             <h2 className="text-lg font-semibold text-maroon-800">General</h2>
           </div>
 
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="sm:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">School name</label>
               <input
                 value={form.school_name}
                 onChange={(e) => setForm((s) => ({ ...s, school_name: e.target.value }))}
                 disabled={loading || saving}
                 className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 disabled:bg-gray-50"
               />
             </div>
 
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Contact email</label>
               <input
                 type="email"
                 value={form.contact_email}
                 onChange={(e) => setForm((s) => ({ ...s, contact_email: e.target.value }))}
                 disabled={loading || saving}
                 className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 disabled:bg-gray-50"
               />
             </div>
 
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Public site URL</label>
               <div className="flex items-center gap-2">
                 <input
                   value={form.public_site_url}
                   onChange={(e) => setForm((s) => ({ ...s, public_site_url: e.target.value }))}
                   disabled={loading || saving}
                   className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 disabled:bg-gray-50"
                 />
                 <button
                   onClick={copyPublicUrl}
                   disabled={loading || saving}
                   className="text-sm border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded disabled:opacity-60"
                 >
                   Copy
                 </button>
               </div>
             </div>
 
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
               <Select
                 value={form.timezone}
                 onChange={(e) => setForm((s) => ({ ...s, timezone: e.target.value }))}
                 disabled={loading || saving}
                 className="w-full"
               >
                 <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                 <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                 <option value="UTC">UTC</option>
               </Select>
             </div>
 
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Locale</label>
               <Select
                 value={form.locale}
                 onChange={(e) => setForm((s) => ({ ...s, locale: e.target.value }))}
                 disabled={loading || saving}
                 className="w-full"
               >
                 <option value="en-US">English (US)</option>
                 <option value="en-GB">English (UK)</option>
                 <option value="ne-NP">Nepali</option>
               </Select>
             </div>
 
             <label className="sm:col-span-2 flex items-center justify-between border rounded p-3 text-sm">
               <div>
                 <div className="font-medium text-gray-800">Allow public registration</div>
                 <div className="text-xs text-gray-500">Enable new user sign-ups (if your UI supports it)</div>
               </div>
               <input
                 type="checkbox"
                 className="h-4 w-4 accent-maroon-700"
                 checked={form.allow_public_registration}
                 onChange={(e) => setForm((s) => ({ ...s, allow_public_registration: e.target.checked }))}
                 disabled={loading || saving}
               />
             </label>
           </div>
         </div>
 
         <div className="bg-white rounded shadow p-6">
           <div className="flex items-center gap-2 mb-4">
             <Bell className="h-5 w-5 text-maroon-700" />
             <h2 className="text-lg font-semibold text-maroon-800">Announcement bar</h2>
           </div>
 
           <div className="space-y-4">
             <label className="flex items-center justify-between border rounded p-3 text-sm">
               <div>
                 <div className="font-medium text-gray-800">Enable announcement</div>
                 <div className="text-xs text-gray-500">Show a site-wide message (top banner)</div>
               </div>
               <input
                 type="checkbox"
                 className="h-4 w-4 accent-maroon-700"
                 checked={form.announcements_enabled}
                 onChange={(e) => setForm((s) => ({ ...s, announcements_enabled: e.target.checked }))}
                 disabled={loading || saving}
               />
             </label>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Announcement text</label>
               <textarea
                 value={form.announcement_text}
                 onChange={(e) => setForm((s) => ({ ...s, announcement_text: e.target.value }))}
                 disabled={loading || saving}
                 rows={4}
                 className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 disabled:bg-gray-50"
               />
             </div>
           </div>
         </div>
 
         <div className="bg-white rounded shadow p-6">
           <div className="flex items-center gap-2 mb-4">
             <Shield className="h-5 w-5 text-maroon-700" />
             <h2 className="text-lg font-semibold text-maroon-800">Maintenance mode</h2>
           </div>
 
           <div className="space-y-4">
             <label className="flex items-center justify-between border rounded p-3 text-sm">
               <div>
                 <div className="font-medium text-gray-800">Enable maintenance mode</div>
                 <div className="text-xs text-gray-500">Use this when doing deployments or urgent fixes</div>
               </div>
               <input
                 type="checkbox"
                 className="h-4 w-4 accent-maroon-700"
                 checked={form.maintenance_mode}
                 onChange={(e) => setForm((s) => ({ ...s, maintenance_mode: e.target.checked }))}
                 disabled={loading || saving}
               />
             </label>
 
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance message</label>
               <textarea
                 value={form.maintenance_message}
                 onChange={(e) => setForm((s) => ({ ...s, maintenance_message: e.target.value }))}
                 disabled={loading || saving}
                 rows={4}
                 className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 disabled:bg-gray-50"
               />
             </div>
           </div>
         </div>
 
         <div className="bg-white rounded shadow p-6">
           <div className="flex items-center gap-2 mb-4">
             <Wrench className="h-5 w-5 text-maroon-700" />
             <h2 className="text-lg font-semibold text-maroon-800">Feature toggles</h2>
           </div>
 
           <div className="space-y-3">
             {[
               { key: 'show_notices', label: 'Notices', hint: 'Show notice board content' },
               { key: 'show_events', label: 'Events', hint: 'Show events section/pages' },
               { key: 'show_gallery', label: 'Gallery', hint: 'Show photo gallery' },
               { key: 'show_news', label: 'News', hint: 'Show news / press content' },
               { key: 'show_testimonials', label: 'Testimonials', hint: 'Show testimonials section' },
               { key: 'show_achievements', label: 'Achievements', hint: 'Show achievements/activities section' },
             ].map((item) => (
               <label key={item.key} className="flex items-center justify-between border rounded p-3 text-sm">
                 <div>
                   <div className="font-medium text-gray-800">{item.label}</div>
                   <div className="text-xs text-gray-500">{item.hint}</div>
                 </div>
                 <input
                   type="checkbox"
                   className="h-4 w-4 accent-maroon-700"
                   checked={toBool(form.features[item.key], true)}
                   onChange={(e) => setFeature(item.key, e.target.checked)}
                   disabled={loading || saving}
                 />
               </label>
             ))}
           </div>
         </div>
 
         <div className="bg-white rounded shadow p-6">
           <div className="flex items-center gap-2 mb-4">
             <Globe className="h-5 w-5 text-maroon-700" />
             <h2 className="text-lg font-semibold text-maroon-800">SEO defaults</h2>
           </div>
 
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Default title</label>
               <input
                 value={toString(form.seo.default_title, '')}
                 onChange={(e) => setSeo('default_title', e.target.value)}
                 disabled={loading || saving}
                 className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 disabled:bg-gray-50"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Default description</label>
               <textarea
                 value={toString(form.seo.default_description, '')}
                 onChange={(e) => setSeo('default_description', e.target.value)}
                 disabled={loading || saving}
                 rows={3}
                 className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 disabled:bg-gray-50"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">OpenGraph image URL</label>
               <input
                 value={toString(form.seo.og_image_url, '')}
                 onChange={(e) => setSeo('og_image_url', e.target.value)}
                 disabled={loading || saving}
                 className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 disabled:bg-gray-50"
               />
             </div>
           </div>
         </div>
 
         <div className="bg-white rounded shadow p-6">
           <div className="flex items-center gap-2 mb-4">
             <Globe className="h-5 w-5 text-maroon-700" />
             <h2 className="text-lg font-semibold text-maroon-800">Social links</h2>
           </div>
 
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {[
               { key: 'facebook', label: 'Facebook' },
               { key: 'twitter', label: 'X / Twitter' },
               { key: 'instagram', label: 'Instagram' },
               { key: 'youtube', label: 'YouTube' },
               { key: 'linkedin', label: 'LinkedIn' },
               { key: 'tiktok', label: 'TikTok' },
               { key: 'whatsapp', label: 'WhatsApp' },
               { key: 'telegram', label: 'Telegram' },
               { key: 'website', label: 'Website' },
             ].map((item) => (
               <div key={item.key}>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
                 <input
                   value={toString(form.social_links[item.key], '')}
                   onChange={(e) => setSocial(item.key, e.target.value)}
                   disabled={loading || saving}
                   className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 disabled:bg-gray-50"
                 />
               </div>
             ))}
           </div>
         </div>
 
         <div className="bg-white rounded border border-red-200 shadow p-6 lg:col-span-2">
           <div className="flex items-center gap-2 mb-4 text-red-700">
             <AlertTriangle className="h-5 w-5" />
             <h2 className="text-lg font-semibold">Danger Zone</h2>
           </div>
 
           <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
             <div>
               <div className="text-sm font-medium text-gray-900">Reset settings to defaults</div>
               <div className="text-xs text-gray-600">Superadmin only. This overwrites the current configuration.</div>
             </div>
             <button
               onClick={resetToDefaults}
               disabled={!canDanger || loading || saving}
               className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60"
             >
               Reset to defaults
             </button>
           </div>
         </div>
       </div>
 
       {loading && (
         <div className="text-sm text-gray-600">Loading settings…</div>
       )}
     </div>
   );
 };
 
 export default Settings;
