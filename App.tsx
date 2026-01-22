import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { authService } from './services/authService';
import { UserRole, ThemeMode, UserProfile } from './types';
import { PRICING_PLANS } from './constants';
import JobBoard from './components/JobBoard';
import ResumeBuilder from './components/ResumeBuilder';
import EmployerPanel from './components/EmployerPanel';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  // Navigation & UI State
  const [currentView, setCurrentView] = useState<'LANDING' | 'DASHBOARD' | 'AUTH'>('LANDING');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [gradientColors, setGradientColors] = useState({ start: '#4f46e5', end: '#ec4899' });

  // Auth State
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.SEEKER);
  const [errorMsg, setErrorMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Computed Theme Classes
  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';
  
  const appClassName = isGradient ? 'text-slate-900 animate-gradient' : isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const navbarClass = isDark ? 'bg-slate-950/90 backdrop-blur-md border-slate-800 shadow-md' : isGradient ? 'bg-white/40 backdrop-blur-xl border-white/20 shadow-sm' : 'bg-white/80 backdrop-blur-md border-slate-200';
  const cardClass = isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl shadow-black/20' : isGradient ? 'bg-white/60 backdrop-blur-md border-white/40 shadow-lg text-slate-900' : 'bg-white border-slate-200 text-slate-900';
  const inputClass = isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-primary' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  // 1. Initialize Auth Listener
  useEffect(() => {
    const checkUser = async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch full profile from DB
        const profile = await authService.getUserProfile(session.user.id);
        if (profile) {
          setUserProfile(profile);
          setCurrentView('DASHBOARD');
        }
      }
      setLoading(false);
    };

    checkUser();

    // Listen for changes (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setCurrentView('LANDING');
      } else if (session?.user && !userProfile) {
         const profile = await authService.getUserProfile(session.user.id);
         setUserProfile(profile);
         setCurrentView('DASHBOARD');
      }
    });

    return () => subscription.unsubscribe();
  }, [userProfile]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setAuthLoading(true);

    try {
      if (authMode === 'SIGNUP') {
        await authService.signUp(email, password, selectedRole, fullName);
        alert('Account created! You are now logged in.');
      } else {
        await authService.signIn(email, password);
      }
      // Listener above will handle redirection
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
  };

  const Navbar = () => (
    <nav className={`${navbarClass} sticky top-0 z-50 border-b transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => { if (!userProfile) setCurrentView('LANDING'); }}
          >
            <div className={`p-2 rounded-lg mr-2 shadow-lg ${isGradient ? 'bg-white/20 text-slate-900' : 'bg-primary text-white shadow-blue-500/30'}`}>
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <span className={`font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>HireGen AI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme & Color Controls */}
            {isGradient && (
              <div className="hidden md:flex items-center gap-2 mr-2 bg-white/30 p-1.5 rounded-full border border-white/20">
                <input type="color" value={gradientColors.start} onChange={(e) => setGradientColors(p => ({ ...p, start: e.target.value }))} className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-0 p-0" />
                <input type="color" value={gradientColors.end} onChange={(e) => setGradientColors(p => ({ ...p, end: e.target.value }))} className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-0 p-0" />
              </div>
            )}
            <div className={`flex items-center p-1 rounded-full border ${isDark ? 'bg-slate-900 border-slate-700' : isGradient ? 'bg-white/30 border-white/30' : 'bg-slate-100 border-slate-200'} mr-4`}>
              {['light', 'dark', 'gradient'].map((m) => (
                <button 
                  key={m}
                  onClick={() => setTheme(m as ThemeMode)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === m ? (m === 'light' ? 'bg-white shadow-sm text-yellow-500' : m === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white') : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <i className={`fa-solid ${m === 'light' ? 'fa-sun' : m === 'dark' ? 'fa-moon' : 'fa-wand-magic-sparkles'}`}></i>
                </button>
              ))}
            </div>

            {!userProfile ? (
              <>
                <button onClick={() => { setAuthMode('LOGIN'); setCurrentView('AUTH'); }} className={`font-medium ${isGradient ? 'text-slate-900' : 'text-primary'}`}>Log In</button>
                <button 
                  onClick={() => { setAuthMode('SIGNUP'); setCurrentView('AUTH'); }}
                  className={`${isGradient ? 'bg-slate-900 text-white' : 'bg-primary text-white'} px-4 py-2 rounded-full font-medium shadow-lg hover:opacity-90 transition-all`}
                >
                  Get Started
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className={`text-sm ${textMuted} hidden md:block font-medium`}>
                  {userProfile.full_name} ({userProfile.role})
                </span>
                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-primary">
                   <img src={userProfile.avatar_url || `https://ui-avatars.com/api/?name=${userProfile.full_name}`} alt="Profile" className="h-full w-full object-cover" />
                </div>
                <button onClick={handleSignOut} className="text-sm text-red-500 hover:text-red-600 font-medium">
                  <i className="fa-solid fa-right-from-bracket mr-1"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const LandingPage = () => (
    <div className="animate-fade-in">
      <div className={`relative overflow-hidden pt-16 pb-32 transition-colors duration-500 ${isGradient ? 'bg-transparent' : isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl mx-auto">
            <span className={`inline-block py-1 px-3 rounded-full text-sm font-semibold mb-6 ${isDark ? 'bg-blue-950/40 text-blue-300 border border-blue-900/50' : 'bg-blue-100 text-blue-700'}`}>🚀 #1 AI Job Portal in India</span>
            <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Get Hired 10x Faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">AI Automation</span>
            </h1>
            <p className={`text-xl mb-10 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Stop manually applying. Let our AI build your resume and match you with top companies.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => { setAuthMode('SIGNUP'); setCurrentView('AUTH'); }} className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-transform hover:-translate-y-1">Find a Job</button>
              <button onClick={() => { setAuthMode('SIGNUP'); setCurrentView('AUTH'); }} className={`${isDark ? 'text-white border-white/20 hover:bg-white/10' : 'text-slate-800 border-slate-200 bg-white hover:bg-slate-50'} border px-8 py-4 rounded-full text-lg font-bold shadow-sm transition-transform hover:-translate-y-1`}>Hire Talent</button>
            </div>
        </div>
      </div>
      
      {/* Pricing Preview */}
      <div className={`py-20 ${isGradient ? 'bg-transparent' : isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_PLANS.filter(p => p.target === 'SEEKER').map(plan => (
              <div key={plan.id} className={`p-8 rounded-2xl border ${cardClass} ${plan.recommended ? 'border-primary shadow-2xl scale-105 z-10' : ''}`}>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className={`text-4xl font-extrabold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.price}</div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className={`flex items-center ${textMuted}`}><i className="fa-solid fa-check text-green-500 mr-3"></i>{feat}</li>
                  ))}
                </ul>
                <button onClick={() => { setAuthMode('SIGNUP'); setCurrentView('AUTH'); }} className={`w-full py-3 rounded-xl font-bold ${plan.recommended ? 'bg-primary text-white' : isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'}`}>Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AuthPage = () => (
    <div className={`min-h-[calc(100vh-64px)] flex items-center justify-center px-4`}>
      <div className={`p-8 rounded-2xl shadow-xl max-w-md w-full border ${cardClass}`}>
        <h2 className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {authMode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className={`text-center mb-6 ${textMuted}`}>
          {authMode === 'LOGIN' ? 'Sign in to access your dashboard' : 'Join thousands of professionals'}
        </p>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-4">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>{errorMsg}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authMode === 'SIGNUP' && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${inputClass}`} placeholder="John Doe" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <button type="button" onClick={() => setSelectedRole(UserRole.SEEKER)} className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${selectedRole === UserRole.SEEKER ? 'border-primary bg-primary/10 text-primary' : `${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-white text-slate-600'}`}`}>
                   <i className="fa-solid fa-user"></i> Job Seeker
                 </button>
                 <button type="button" onClick={() => setSelectedRole(UserRole.EMPLOYER)} className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${selectedRole === UserRole.EMPLOYER ? 'border-purple-500 bg-purple-500/10 text-purple-500' : `${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-white text-slate-600'}`}`}>
                   <i className="fa-solid fa-building"></i> Employer
                 </button>
              </div>
            </>
          )}

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${inputClass}`} placeholder="you@example.com" />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${inputClass}`} placeholder="••••••••" minLength={6} />
          </div>

          <button 
            type="submit" 
            disabled={authLoading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg ${authLoading ? 'bg-slate-500' : 'bg-primary hover:bg-blue-600'}`}
          >
            {authLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (authMode === 'LOGIN' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <div className={`mt-6 text-center text-sm ${textMuted}`}>
          {authMode === 'LOGIN' ? (
            <p>Don't have an account? <button onClick={() => setAuthMode('SIGNUP')} className="text-primary font-bold hover:underline">Sign up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setAuthMode('LOGIN')} className="text-primary font-bold hover:underline">Log in</button></p>
          )}
        </div>
      </div>
    </div>
  );

  const SeekerDashboard = () => {
    const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
    const [applications, setApplications] = useState<any[]>([]);
    const [loadingApps, setLoadingApps] = useState(false);

    // Fetch applications when tab is active
    useEffect(() => {
      if (activeTab === 'applications' && userProfile) {
        const fetchApps = async () => {
          setLoadingApps(true);
          const { data, error } = await supabase
            .from('applications')
            .select(`
              id,
              status,
              applied_at,
              jobs (
                title,
                company,
                location,
                type
              )
            `)
            .eq('user_id', userProfile.id)
            .order('applied_at', { ascending: false });

          if (!error && data) {
            setApplications(data);
          }
          setLoadingApps(false);
        };
        fetchApps();
      }
    }, [activeTab]);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Applied': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        case 'Screening': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        case 'Interview': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
        case 'Offer': return 'text-green-500 bg-green-500/10 border-green-500/20';
        case 'Rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
        default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border shadow-sm ${cardClass}`}>
              <div className="text-center mb-4">
                <img src={userProfile?.avatar_url} className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-primary object-cover" alt="Profile" />
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{userProfile?.full_name}</h3>
                <p className={`${textMuted} text-sm`}>{userProfile?.email}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={textMuted}>Profile Strength</span>
                  <span className="text-green-500 font-bold">15%</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div className="bg-green-500 h-2 rounded-full w-[15%]"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <div className={`rounded-xl shadow-sm border overflow-hidden ${cardClass}`}>
              <div className={`flex border-b ${isDark ? 'border-slate-800' : isGradient ? 'border-white/30' : 'border-slate-200'}`}>
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className={`flex-1 py-4 text-center font-bold transition-all ${activeTab === 'jobs' ? 'text-primary border-b-2 border-primary' : `${textMuted} hover:text-slate-600`}`}
                >
                  Find Jobs
                </button>
                <button 
                  onClick={() => setActiveTab('applications')}
                  className={`flex-1 py-4 text-center font-bold transition-all ${activeTab === 'applications' ? 'text-primary border-b-2 border-primary' : `${textMuted} hover:text-slate-600`}`}
                >
                  My Applications
                </button>
              </div>
              
              <div className={`p-6 ${isDark ? 'bg-slate-950/50' : isGradient ? 'bg-transparent' : 'bg-slate-50'}`}>
                {activeTab === 'jobs' ? (
                  <JobBoard theme={theme} />
                ) : (
                  <div className="space-y-4">
                    {loadingApps ? (
                      <div className="text-center py-12">
                        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary"></i>
                      </div>
                    ) : applications.length > 0 ? (
                      applications.map((app) => (
                        <div key={app.id} className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <div>
                            <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{app.jobs?.title}</h4>
                            <p className={`text-sm ${textMuted}`}>{app.jobs?.company} • {app.jobs?.location}</p>
                            <p className={`text-xs ${textMuted} mt-1`}>Applied on: {new Date(app.applied_at).toLocaleDateString()}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center justify-center ${getStatusColor(app.status)}`}>
                            {app.status === 'Applied' && <i className="fa-solid fa-paper-plane mr-2"></i>}
                            {app.status === 'Screening' && <i className="fa-solid fa-magnifying-glass mr-2"></i>}
                            {app.status === 'Interview' && <i className="fa-solid fa-video mr-2"></i>}
                            {app.status === 'Offer' && <i className="fa-solid fa-trophy mr-2"></i>}
                            {app.status === 'Rejected' && <i className="fa-solid fa-circle-xmark mr-2"></i>}
                            {app.status}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={`text-center py-12 ${textMuted}`}>
                        <i className="fa-solid fa-clipboard-list text-4xl mb-4 opacity-50"></i>
                        <p>You haven't applied to any jobs yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className={`rounded-xl shadow-sm border p-6 ${cardClass}`}>
              <ResumeBuilder theme={theme} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary"></i></div>;
  }

  return (
    <div 
      className={`min-h-screen font-sans transition-all duration-700 ease-in-out ${appClassName}`}
      style={isGradient ? { backgroundImage: `linear-gradient(-45deg, ${gradientColors.start}, ${gradientColors.end}, #2563eb)` } : {}}
    >
      <Navbar />
      {currentView === 'LANDING' && <LandingPage />}
      {currentView === 'AUTH' && <AuthPage />}
      {currentView === 'DASHBOARD' && userProfile && (
        userProfile.role === UserRole.SEEKER ? <SeekerDashboard /> : 
        userProfile.role === UserRole.EMPLOYER ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <EmployerPanel theme={theme} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <AdminPanel theme={theme} />
          </div>
        )
      )}
    </div>
  );
};

export default App;