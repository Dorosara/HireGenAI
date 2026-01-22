import React, { useState } from 'react';
import { UserProfile, ThemeMode } from '../types';
import JobBoard from './JobBoard';
import ResumeBuilder from './ResumeBuilder';
import ApplicationHistory from './ApplicationHistory';

interface SeekerDashboardProps {
  userProfile: UserProfile;
  theme: ThemeMode;
}

const SeekerDashboard: React.FC<SeekerDashboardProps> = ({ userProfile, theme }) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');

  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  const cardClass = isDark 
    ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl shadow-black/20' 
    : isGradient 
      ? 'bg-white/60 backdrop-blur-md border-white/40 shadow-lg text-slate-900' 
      : 'bg-white border-slate-200 text-slate-900';
  
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border shadow-sm ${cardClass}`}>
            <div className="text-center mb-4">
              <img 
                src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${userProfile.full_name}`} 
                className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-primary object-cover" 
                alt="Profile" 
              />
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
              <p className={`text-xs mt-2 ${textMuted}`}>Complete your resume to boost visibility.</p>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl border shadow-sm ${cardClass} opacity-80`}>
             <h4 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Recommended Actions</h4>
             <ul className="space-y-2 text-sm">
               <li className="flex items-center gap-2 text-amber-500">
                 <i className="fa-solid fa-triangle-exclamation"></i> Upload Resume
               </li>
               <li className={`flex items-center gap-2 ${textMuted}`}>
                 <i className="fa-solid fa-circle-check text-green-500"></i> Verify Email
               </li>
               <li className={`flex items-center gap-2 ${textMuted}`}>
                 <i className="fa-regular fa-circle"></i> Add Skills
               </li>
             </ul>
          </div>
        </div>
        
        {/* Main Content */}
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
                <ApplicationHistory theme={theme} userProfile={userProfile} />
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

export default SeekerDashboard;