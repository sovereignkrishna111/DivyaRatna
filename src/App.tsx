import { Suspense, lazy, useEffect, useState } from 'react';
import { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { prefetchCriticalData } from './services/dataPrefetch';
import LoadingScreen from './components/LoadingScreen';
import WelcomePopup from './components/WelcomePopup';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import NoticeBoardSection from './components/NoticeBoardSection';
import BirthdayCelebrationsSection from './components/BirthdayCelebrationsSection';
import AboutSection from './components/AboutSection';
import HomeImageAlbumSection from './components/HomeImageAlbumSection';
import HomeCtaSection from './components/HomeCtaSection';
import ProgramsSection from './components/ProgramsSection';
import ExploreSection from './components/ExploreSection';
import TestimonialsSection from './components/TestimonialsSection';
import NewsSection from './components/NewsSection';
import AchievementsActivitiesSection from './components/AchievementsActivitiesSection';
import Footer from './components/Footer';
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Academics = lazy(() => import('./pages/Academics'));
const Services = lazy(() => import('./pages/Services'));
const Community = lazy(() => import('./pages/Community'));
const Bulletins = lazy(() => import('./pages/Bulletins'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Mission = lazy(() => import('./pages/Mission'));
const Accreditation = lazy(() => import('./pages/Accreditation'));
const StrategicFramework = lazy(() => import('./pages/StrategicFramework'));
const Governance = lazy(() => import('./pages/Governance'));
const Faculty = lazy(() => import('./pages/Faculty'));
const Facilities = lazy(() => import('./pages/Facilities'));
const SchoolProfile = lazy(() => import('./pages/SchoolProfile'));
const Admission = lazy(() => import('./pages/Admission'));
const Calendar = lazy(() => import('./pages/Calendar'));
const NewsMedia = lazy(() => import('./pages/NewsMedia'));
const WorkAtDRESS = lazy(() => import('./pages/WorkAtDRESS'));
const Contact = lazy(() => import('./pages/Contact'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AdminShell = lazy(() => import('./admin/AdminShell'));
import { AdminProviders, RequireAdminAuth } from './admin';
import { UserAuthProvider } from './auth/UserAuthProvider';
const AdminLogin = lazy(() => import('./admin/pages/Login'));
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'));
const AdminStudents = lazy(() => import('./admin/pages/Students'));
const AdminTeachers = lazy(() => import('./admin/pages/Teachers'));
const AdminParents = lazy(() => import('./admin/pages/Parents'));
const AdminStaff = lazy(() => import('./admin/pages/Staff'));
const AdminEvents = lazy(() => import('./admin/pages/Events'));
const AdminAcademics = lazy(() => import('./admin/pages/Academics'));
const AdminBulletins = lazy(() => import('./admin/pages/Bulletins'));
const AdminGallery = lazy(() => import('./admin/pages/Gallery'));
const AdminPressReleases = lazy(() => import('./admin/pages/PressReleases'));
const AdminSettings = lazy(() => import('./admin/pages/Settings'));
const AdminThemeAndMediaManager = lazy(() => import('./admin/pages/ThemeAndMediaManager'));
const AdminHomeHero = lazy(() => import('./admin/pages/HomeHero'));
const AdminCareers = lazy(() => import('./admin/pages/Careers'));
const AdminFaqs = lazy(() => import('./admin/pages/Faqs'));
const AdminAdmissions = lazy(() => import('./admin/pages/Admissions'));
const AdminServices = lazy(() => import('./admin/pages/Services'));
const AdminCommunity = lazy(() => import('./admin/pages/Community'));
const AdminBirthdays = lazy(() => import('./admin/pages/Birthdays'));
const AdminTestimonials = lazy(() => import('./admin/pages/Testimonials'));
const AdminContact = lazy(() => import('./admin/pages/Contact'));
import { FlashProvider } from './components/Flash';
import BackToTopButton from './components/BackToTopButton';

function HomePage() {
  return (
    <>
      <HeroSection />
      <NoticeBoardSection />
      <BirthdayCelebrationsSection />
      <AboutSection />
      <HomeImageAlbumSection />
      <ExploreSection />
      <ProgramsSection />
      <TestimonialsSection />
      <AchievementsActivitiesSection />
      <HomeCtaSection />
      <NewsSection />
    </>
  );
}

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, [location.pathname, location.hash]);

  return null;
}

function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div key={`${location.pathname}${location.search}${location.hash}`} className="page-transition">
      {children}
    </div>
  );
}

function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    if (showLoading) return;

    // Prefetch critical data in background
    prefetchCriticalData().catch(() => {
      // Silently handle prefetch failures
    });

    // Prefetch component code
    const prefetch = () => {
      void import('./pages/AboutUs');
      void import('./pages/Gallery');
      void import('./pages/Bulletins');
      void import('./pages/Contact');
      void import('./pages/NewsMedia');
      void import('./admin/pages/Login');
    };

    if ('requestIdleCallback' in window) {
      const id = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(prefetch);
      return () => {
        (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
      };
    }

    const t = setTimeout(prefetch, 800);
    return () => clearTimeout(t);
  }, [showLoading]);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    if (!localStorage.getItem('welcomePopupShown')) {
      setTimeout(() => setShowWelcomePopup(true), 1000);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcomePopup(false);
    localStorage.setItem('welcomePopupShown', 'true');
  };

  return (
    <Router>
      <ScrollToHash />
      <div className="App">
        {showLoading && (
          <LoadingScreen onLoadingComplete={handleLoadingComplete} />
        )}
        <Suspense
          fallback={
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-maroon-200 border-t-maroon-700" />
            </div>
          }
        >
          <Routes>
              <Route path="/admin/login" element={
                <AdminProviders>
                  <FlashProvider>
                    <AdminLogin />
                  </FlashProvider>
                </AdminProviders>
              } />

              <Route path="/admin/*" element={
                <AdminProviders>
                  <FlashProvider>
                    <RequireAdminAuth>
                      <AdminShell />
                    </RequireAdminAuth>
                  </FlashProvider>
                </AdminProviders>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="parents" element={<AdminParents />} />
                <Route path="birthdays" element={<AdminBirthdays />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="academics" element={<AdminAcademics />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="community" element={<AdminCommunity />} />
                <Route path="bulletins" element={<AdminBulletins />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="press-releases" element={<AdminPressReleases />} />
                <Route path="careers" element={<AdminCareers />} />
                <Route path="admissions" element={<AdminAdmissions />} />
                <Route path="faqs" element={<AdminFaqs />} />
                <Route path="contact" element={<AdminContact />} />
                <Route path="home-hero" element={<AdminHomeHero />} />
                <Route path="theme-media" element={<AdminThemeAndMediaManager />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="/*" element={
                <UserAuthProvider>
                  <FlashProvider>
                    <Navigation />
                    <main>
                      <PageTransition>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/about" element={<AboutUs />} />
                          <Route path="/academics" element={<Academics />} />
                          <Route path="/services" element={<Services />} />
                          <Route path="/community" element={<Community />} />
                          <Route path="/gallery" element={<Gallery />} />
                          <Route path="/bulletins" element={<Bulletins />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/mission" element={<Mission />} />
                          <Route path="/accreditation" element={<Accreditation />} />
                          <Route path="/strategic-framework" element={<StrategicFramework />} />
                          <Route path="/governance" element={<Governance />} />
                          <Route path="/faculty" element={<Faculty />} />
                          <Route path="/facilities" element={<Facilities />} />
                          <Route path="/school-profile" element={<SchoolProfile />} />
                          {/* Top navigation pages */}
                          <Route path="/admission" element={<Admission />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/news-media" element={<NewsMedia />} />
                          <Route path="/work-at-dress" element={<WorkAtDRESS />} />
                          <Route path="/contact" element={<Contact />} />
                          {/* Additional routes for sub-pages */}
                          <Route path="/academics/elementary" element={<Academics />} />
                          <Route path="/academics/middle" element={<Academics />} />
                          <Route path="/academics/high" element={<Academics />} />
                          <Route path="/academics/activities" element={<Academics />} />
                          <Route path="/academics/curriculum" element={<Academics />} />
                          <Route path="/services/activities" element={<Services />} />
                          <Route path="/services/student" element={<Services />} />
                          <Route path="/services/nutrition" element={<Services />} />
                          <Route path="/services/transportation" element={<Services />} />
                          <Route path="/services/health" element={<Services />} />
                          <Route path="/services/air-quality" element={<Services />} />
                          <Route path="/services/protection" element={<Services />} />
                          <Route path="/services/security" element={<Services />} />
                          <Route path="/community/parents" element={<Community />} />
                          <Route path="/community/alumni" element={<Community />} />
                          <Route path="/community/voices" element={<Community />} />
                          <Route path="/community/recent" element={<Community />} />
                          <Route path="/community/calendar" element={<Community />} />
                          <Route path="/bulletins/notices" element={<Bulletins />} />
                          <Route path="/bulletins/notice" element={<Bulletins />} />
                          <Route path="/bulletins/events" element={<Bulletins />} />
                          <Route path="/bulletins/event" element={<Bulletins />} />
                          <Route path="/bulletins/news" element={<Bulletins />} />
                          <Route path="/bulletins/achievements" element={<Bulletins />} />
                          <Route path="/bulletins/routine" element={<Bulletins />} />
                          <Route path="/bulletins/results" element={<Bulletins />} />
                        </Routes>
                      </PageTransition>
                    </main>
                    <BackToTopButton />
                    <Footer />
                  </FlashProvider>
                </UserAuthProvider>
              } />
            </Routes>
        </Suspense>

        <WelcomePopup 
          isOpen={showWelcomePopup} 
          onClose={handleWelcomeClose} 
        />
      </div>
    </Router>
  );
}

export default App;