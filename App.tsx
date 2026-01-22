import React, { useState } from 'react';
import { UserRole, PricingPlan, ThemeMode } from './types';
import { PRICING_PLANS } from './constants';
import JobBoard from './components/JobBoard';
import ResumeBuilder from './components/ResumeBuilder';
import EmployerPanel from './components/EmployerPanel';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'LANDING' | 'DASHBOARD' | 'AUTH'>('LANDING');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [theme, setTheme] = useState<ThemeMode>('light');
  
  // Custom Gradient Colors State
  const [gradientColors, setGradientColors] = useState({ start: '#4f46e5', end: '#ec4899' });

  // Computed Theme Classes
  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  // We only use bg-slate-X classes for light/dark. Gradient uses inline style.
  const baseBackgroundClass = isDark 
    ? 'bg-slate-950 text-slate-100' 
    : 'bg-slate-50 text-slate-900';
  
  const appClassName = isGradient ? 'text-slate-900 animate-gradient' : baseBackgroundClass;

  const navbarClass = isDark
    ? 'bg-slate-950/90 backdrop-blur-md border-slate-800 shadow-md'
    : isGradient
      ? 'bg-white/40 backdrop-blur-xl border-white/20 shadow-sm'
      : 'bg-white/80 backdrop-blur-md border-slate-200';

  // Deep dark mode cards
  const cardClass = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl shadow-black/20'
    : isGradient
      ? 'bg-white/60 backdrop-blur-md border-white/40 shadow-lg text-slate-900'
      : 'bg-white border-slate-200 text-slate-900';
      
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setCurrentView('DASHBOARD');
  };

  const Navbar = () => (
    <nav className={`${navbarClass} sticky top-0 z-50 border-b transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => { setCurrentView('LANDING'); setUserRole(UserRole.GUEST); }}
          >
            <div className={`p-2 rounded-lg mr-2 shadow-lg ${isGradient ? 'bg-white/20 text-slate-900' : 'bg-primary text-white shadow-blue-500/30'}`}>
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <span className={`font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>HireGen AI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Custom Gradient Controls */}
            {isGradient && (
              <div className="hidden md:flex items-center gap-2 mr-2 bg-white/30 p-1.5 rounded-full border border-white/20">
                <span className="text-xs font-semibold text-slate-700 ml-2">Colors:</span>
                <input 
                  type="color" 
                  value={gradientColors.start}
                  onChange={(e) => setGradientColors(p => ({ ...p, start: e.target.value }))}
                  className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                  title="Gradient Start Color"
                />
                <input 
                  type="color" 
                  value={gradientColors.end}
                  onChange={(e) => setGradientColors(p => ({ ...p, end: e.target.value }))}
                  className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                  title="Gradient End Color"
                />
              </div>
            )}

            {/* Theme Toggles */}
            <div className={`flex items-center p-1 rounded-full border ${isDark ? 'bg-slate-900 border-slate-700' : isGradient ? 'bg-white/30 border-white/30' : 'bg-slate-100 border-slate-200'} mr-4`}>
              <button 
                onClick={() => setTheme('light')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === 'light' ? 'bg-white shadow-sm text-yellow-500' : 'text-slate-400 hover:text-slate-600'}`}
                title="Light Mode"
              >
                <i className="fa-solid fa-sun"></i>
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Night Mode"
              >
                <i className="fa-solid fa-moon"></i>
              </button>
              <button 
                onClick={() => setTheme('gradient')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === 'gradient' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Gradient Mode"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </button>
            </div>

            {userRole === UserRole.GUEST ? (
              <>
                <button onClick={() => setCurrentView('LANDING')} className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-primary'} font-medium hidden sm:block`}>Features</button>
                <button onClick={() => setCurrentView('LANDING')} className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-primary'} font-medium hidden sm:block`}>Pricing</button>
                <button 
                  onClick={() => { setAuthMode('LOGIN'); setCurrentView('AUTH'); }} 
                  className={`font-medium ${isGradient ? 'text-slate-900 hover:text-slate-700' : 'text-primary hover:text-blue-600'}`}
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setAuthMode('SIGNUP'); setCurrentView('AUTH'); }}
                  className={`${isGradient ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-primary text-white hover:bg-blue-600'} px-4 py-2 rounded-full font-medium transition-all shadow-lg`}
                >
                  Get Started
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className={`text-sm ${textMuted} hidden md:block`}>
                  Welcome, {userRole === UserRole.SEEKER ? 'Job Seeker' : 'Recruiter'}
                </span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
                   <div className={`h-full w-full rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                     <i className={`fa-solid fa-user ${isDark ? 'text-slate-300' : 'text-slate-600'} text-xs`}></i>
                   </div>
                </div>
                <button 
                  onClick={() => { setUserRole(UserRole.GUEST); setCurrentView('LANDING'); }}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Sign Out
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
      {/* Hero Section */}
      <div className={`relative overflow-hidden pt-16 pb-32 transition-colors duration-500 ${isGradient ? 'bg-transparent' : isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className={`inline-block py-1 px-3 rounded-full text-sm font-semibold mb-6 ${isDark ? 'bg-blue-950/40 text-blue-300 border border-blue-900/50' : 'bg-blue-100 text-blue-700'}`}>
              🚀 #1 AI Job Portal in India
            </span>
            <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Get Hired 10x Faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">AI Automation</span>
            </h1>
            <p className={`text-xl mb-10 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Stop manually applying. Let our AI build your resume, match you with top companies, and auto-apply to thousands of jobs instantly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => { setAuthMode('SIGNUP'); setCurrentView('AUTH'); }}
                className={`${isGradient ? 'bg-slate-900 hover:bg-slate-800' : 'bg-primary hover:bg-blue-600'} text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-transform transform hover:-translate-y-1`}
              >
                Find a Job
              </button>
              <button 
                onClick={() => { setAuthMode('SIGNUP'); setCurrentView('AUTH'); }}
                className={`${isDark || isGradient ? 'bg-white/10 text-slate-100 border-white/20 hover:bg-white/20' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'} border px-8 py-4 rounded-full text-lg font-bold shadow-sm transition-transform transform hover:-translate-y-1`}
              >
                Hire Talent
              </button>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Shapes - Hide in Gradient Mode to avoid clash */}
        {!isGradient && (
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div className={`py-24 transition-colors ${isGradient ? 'bg-transparent' : isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Transparent Pricing for Everyone</h2>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Choose the plan that fits your career or hiring goals.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_PLANS.filter(p => p.target === 'SEEKER').map(plan => (
              <div key={plan.id} className={`relative p-8 rounded-2xl border transition-all ${
                plan.recommended 
                  ? 'border-primary shadow-2xl scale-105 z-10' 
                  : isDark ? 'border-slate-800' : isGradient ? 'border-white/30' : 'border-slate-200'
                } ${cardClass}`}>
                
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase py-1 px-3 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className={`text-4xl font-extrabold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.price}</div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className={`flex items-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <i className="fa-solid fa-check text-green-500 mr-3"></i>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold transition-colors ${
                  plan.recommended 
                    ? 'bg-primary text-white hover:bg-blue-700' 
                    : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AuthPage = () => (
    <div className={`min-h-[calc(100vh-64px)] flex items-center justify-center px-4 ${isGradient ? 'bg-transparent' : ''}`}>
      <div className={`p-8 rounded-2xl shadow-xl max-w-md w-full border ${cardClass}`}>
        <h2 className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {authMode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className={`text-center mb-8 ${textMuted}`}>
          Access the #1 AI hiring platform.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => handleLogin(UserRole.SEEKER)}
            className={`w-full p-4 border rounded-xl flex items-center transition-all group ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-blue-50 hover:border-primary'}`}
          >
            <div className={`p-3 rounded-lg mr-4 ${isDark ? 'bg-slate-800' : 'bg-blue-100'}`}>
              <i className="fa-solid fa-user text-primary"></i>
            </div>
            <div className="text-left">
              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>I am a Job Seeker</div>
              <div className={`text-xs ${textMuted}`}>Looking for my dream job</div>
            </div>
          </button>

          <button 
            onClick={() => handleLogin(UserRole.EMPLOYER)}
            className={`w-full p-4 border rounded-xl flex items-center transition-all group ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-purple-50 hover:border-purple-500'}`}
          >
            <div className={`p-3 rounded-lg mr-4 ${isDark ? 'bg-slate-800' : 'bg-purple-100'}`}>
              <i className="fa-solid fa-building text-purple-600"></i>
            </div>
            <div className="text-left">
              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>I am an Employer</div>
              <div className={`text-xs ${textMuted}`}>Hiring top talent</div>
            </div>
          </button>
        </div>
        
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

  const SeekerDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="space-y-6">
           <div className={`p-6 rounded-xl border shadow-sm ${cardClass}`}>
             <div className="text-center mb-4">
               <img src="https://picsum.photos/100/100" className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-primary" alt="Profile" />
               <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Rahul Sharma</h3>
               <p className={`${textMuted} text-sm`}>Full Stack Developer</p>
             </div>
             <div className="space-y-2 text-sm">
               <div className="flex justify-between">
                 <span className={textMuted}>Profile Strength</span>
                 <span className="text-green-500 font-bold">85%</span>
               </div>
               <div className={`w-full rounded-full h-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                 <div className="bg-green-500 h-2 rounded-full w-[85%]"></div>
               </div>
             </div>
           </div>

           <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-xl text-white shadow-lg">
             <h3 className="font-bold text-lg mb-2"><i className="fa-solid fa-robot mr-2"></i> Auto-Apply Bot</h3>
             <p className="text-blue-100 text-sm mb-4">Your AI bot applied to 12 jobs while you were sleeping.</p>
             <button className="w-full bg-white text-primary py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-50">View Activity Log</button>
           </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
           <div className={`rounded-xl shadow-sm border overflow-hidden ${cardClass}`}>
             <div className={`flex border-b ${isDark ? 'border-slate-800' : isGradient ? 'border-white/30' : 'border-slate-200'}`}>
               <button className="flex-1 py-4 text-center font-bold text-primary border-b-2 border-primary">Find Jobs</button>
               <button className={`flex-1 py-4 text-center font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>My Resume</button>
               <button className={`flex-1 py-4 text-center font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>Applications</button>
             </div>
             <div className={`p-6 ${isDark ? 'bg-slate-950/50' : isGradient ? 'bg-transparent' : 'bg-slate-50'}`}>
               <JobBoard theme={theme} />
             </div>
           </div>

           {/* AI Resume Builder Preview Section */}
           <div className={`rounded-xl shadow-sm border p-6 ${cardClass}`}>
             <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Resume Optimizer</h2>
             <ResumeBuilder theme={theme} />
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`min-h-screen font-sans transition-all duration-700 ease-in-out ${appClassName}`}
      style={isGradient ? {
        backgroundImage: `linear-gradient(-45deg, ${gradientColors.start}, ${gradientColors.end}, #2563eb)`,
      } : {}}
    >
      <Navbar />
      {currentView === 'LANDING' && <LandingPage />}
      {currentView === 'AUTH' && <AuthPage />}
      {currentView === 'DASHBOARD' && (
        userRole === UserRole.SEEKER ? <SeekerDashboard /> : 
        <div className="max-w-7xl mx-auto px-4 py-8">
          <EmployerPanel theme={theme} />
        </div>
      )}
    </div>
  );
};

export default App;