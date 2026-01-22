import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { ThemeMode, UserProfile } from '../types';

interface ApplicationHistoryProps {
  theme: ThemeMode;
  userProfile: UserProfile;
}

const ApplicationHistory: React.FC<ApplicationHistoryProps> = ({ theme, userProfile }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, interviewing: 0, offers: 0 });

  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  const cardClass = isDark 
    ? 'bg-slate-900 border-slate-800 text-slate-100' 
    : isGradient 
      ? 'bg-white/40 backdrop-blur-md border-white/30 text-slate-900' 
      : 'bg-white border-slate-200 text-slate-900';

  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const textTitle = isDark ? 'text-white' : 'text-slate-900';

  useEffect(() => {
    fetchHistory();
  }, [userProfile]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        ai_score,
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
      // Calculate Stats
      const statsCount = data.reduce((acc: any, curr: any) => {
        acc.total++;
        if (curr.status === 'Interview') acc.interviewing++;
        if (curr.status === 'Offer') acc.offers++;
        return acc;
      }, { total: 0, interviewing: 0, offers: 0 });
      setStats(statsCount);
    }
    setLoading(false);
  };

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary mb-4"></i>
        <p className={textMuted}>Loading your career history...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className={`text-center py-12 border-2 border-dashed rounded-xl ${isDark ? 'border-slate-800' : 'border-slate-300'}`}>
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-slate-800">
          <i className="fa-solid fa-clipboard-question text-2xl opacity-50"></i>
        </div>
        <h4 className={`font-bold mb-1 ${textTitle}`}>No applications yet</h4>
        <p className={textMuted}>Your journey starts here. Apply to your first job today!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border text-center ${cardClass}`}>
          <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
          <div className={`text-xs uppercase font-semibold ${textMuted}`}>Applied</div>
        </div>
        <div className={`p-4 rounded-xl border text-center ${cardClass}`}>
          <div className="text-2xl font-bold text-purple-500">{stats.interviewing}</div>
          <div className={`text-xs uppercase font-semibold ${textMuted}`}>Interviews</div>
        </div>
        <div className={`p-4 rounded-xl border text-center ${cardClass}`}>
          <div className="text-2xl font-bold text-green-500">{stats.offers}</div>
          <div className={`text-xs uppercase font-semibold ${textMuted}`}>Offers</div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className={`group p-5 rounded-xl border transition-all hover:shadow-md ${cardClass}`}>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {app.jobs?.company.charAt(0)}
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${textTitle} group-hover:text-primary transition-colors`}>
                    {app.jobs?.title || 'Unknown Role'}
                  </h4>
                  <p className={`text-sm ${textMuted}`}>
                    {app.jobs?.company || 'Unknown Company'} • {app.jobs?.location || 'Location N/A'}
                  </p>
                  <p className={`text-xs mt-1 ${textMuted}`}>
                    <i className="fa-regular fa-clock mr-1"></i>
                    Applied: {new Date(app.applied_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                 <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center uppercase tracking-wider ${getStatusColor(app.status)}`}>
                  {app.status === 'Applied' && <i className="fa-solid fa-paper-plane mr-2"></i>}
                  {app.status === 'Screening' && <i className="fa-solid fa-magnifying-glass mr-2"></i>}
                  {app.status === 'Interview' && <i className="fa-solid fa-video mr-2"></i>}
                  {app.status === 'Offer' && <i className="fa-solid fa-trophy mr-2"></i>}
                  {app.status === 'Rejected' && <i className="fa-solid fa-circle-xmark mr-2"></i>}
                  {app.status}
                </div>
                
                {app.ai_score > 0 && (
                   <div className="flex items-center gap-2 mt-1">
                     <span className={`text-xs font-semibold ${textMuted}`}>Profile Match:</span>
                     <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                       <div 
                        className={`h-full rounded-full ${app.ai_score >= 80 ? 'bg-green-500' : app.ai_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${app.ai_score}%` }}
                       ></div>
                     </div>
                     <span className={`text-xs font-bold ${app.ai_score >= 80 ? 'text-green-500' : app.ai_score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                       {app.ai_score}%
                     </span>
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationHistory;