import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Job, ThemeMode } from '../types';

interface JobBoardProps {
  theme: ThemeMode;
}

// Helper for relative time (e.g., "2 days ago")
const timeAgo = (dateString: string) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
};

const JobBoard: React.FC<JobBoardProps> = ({ theme }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  // Fetch Jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Query Supabase 'jobs' table
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('posted_at', { ascending: false });

        if (error) throw error;

        if (data) {
          // Map Supabase data to our Job interface
          const mappedJobs: Job[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            company: item.company,
            location: item.location,
            salary: item.salary || 'Not disclosed',
            type: item.type || 'Full-time',
            description: item.description,
            // Format date relative
            postedAt: timeAgo(item.posted_at), 
            requirements: item.requirements || []
          }));
          setJobs(mappedJobs);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Dynamic Styles
  const cardClass = isDark 
    ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 shadow-md' 
    : isGradient 
      ? 'bg-white/80 backdrop-blur-md border-white/40 text-slate-900' 
      : 'bg-white border-slate-100 text-slate-900';

  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-slate-700'
    : isGradient
      ? 'bg-white/60 border-white/50 text-slate-900 placeholder-slate-600 focus:bg-white'
      : 'bg-white border-slate-200 text-slate-900';

  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const textTitle = isDark ? 'text-slate-100' : 'text-slate-800';

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.requirements?.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleApply = async (id: string) => {
    setApplying(id);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please log in to apply.");
        setApplying(null);
        return;
      }

      // Check for existing application
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        alert("You have already applied for this position.");
        setApplying(null);
        return;
      }

      // Insert Application
      const { error } = await supabase.from('applications').insert({
        job_id: id,
        user_id: user.id,
        status: 'Applied',
        ai_score: Math.floor(Math.random() * 30) + 70, // Simulated AI Score
        ai_analysis: JSON.stringify({ reasoning: 'Application received via Quick Apply. Pending recruiter review.' })
      });

      if (error) throw error;

      alert("Application successfully sent! Check your dashboard for status updates.");

    } catch (err: any) {
      console.error(err);
      alert("Failed to apply: " + err.message);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search jobs by title, skill, or company..."
            className={`w-full p-4 pl-12 rounded-xl border shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg transition-all ${inputClass}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className={`fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 ${textMuted}`}></i>
        </div>
      </div>

      {loading ? (
        <div className={`text-center py-12 ${textMuted}`}>
          <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4"></i>
          <p>Finding the best jobs for you...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-all ${cardClass}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-xl font-bold ${textTitle}`}>{job.title}</h3>
                    <p className={`${textMuted} font-medium mb-2`}>{job.company} • {job.location}</p>
                    <div className="flex gap-2 mb-3">
                      <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded text-xs font-semibold">{job.type}</span>
                      <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded text-xs font-semibold">{job.salary}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {job.company.charAt(0)}
                  </div>
                </div>
                
                <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mb-4 line-clamp-2`}>{job.description}</p>
                
                {/* Requirements Tags */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.requirements.slice(0, 4).map((req, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {req}
                      </span>
                    ))}
                    {job.requirements.length > 4 && (
                      <span className={`text-xs px-2 py-1 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        +{job.requirements.length - 4} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className={`flex justify-between items-center border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <span className={`text-xs ${textMuted}`}>Posted: {job.postedAt}</span>
                  <button 
                    onClick={() => handleApply(job.id)}
                    disabled={!!applying}
                    className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 shadow-lg shadow-blue-500/20"
                  >
                    {applying === job.id ? (
                      <span><i className="fa-solid fa-paper-plane fa-fade mr-2"></i> Sending...</span>
                    ) : (
                      'Quick Apply'
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-16 border-2 border-dashed rounded-xl ${isDark ? 'border-slate-800' : 'border-slate-300'}`}>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-slate-800">
                <i className="fa-regular fa-folder-open text-2xl opacity-50"></i>
              </div>
              <h3 className={`text-lg font-bold mb-1 ${textTitle}`}>No jobs found</h3>
              <p className={textMuted}>Try adjusting your search terms or check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobBoard;