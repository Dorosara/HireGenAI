import React, { useState } from 'react';
import { MOCK_JOBS } from '../constants';
import { Job, ThemeMode } from '../types';

interface JobBoardProps {
  theme: ThemeMode;
}

const JobBoard: React.FC<JobBoardProps> = ({ theme }) => {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  // Dynamic Styles - Dark mode uses Slate 900 for cards to pop against 950 backgrounds
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
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (id: string) => {
    setApplying(id);
    setTimeout(() => {
      alert("Application sent! Our AI Auto-Apply bot has also customized your cover letter.");
      setApplying(null);
    }, 1500);
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

      <div className="grid gap-6">
        {filteredJobs.map(job => (
          <div key={job.id} className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-all ${cardClass}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-xl font-bold ${textTitle}`}>{job.title}</h3>
                <p className={`${textMuted} font-medium mb-2`}>{job.company} • {job.location}</p>
                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded text-xs font-semibold">{job.type}</span>
                  <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded text-xs font-semibold">{job.salary}</span>
                </div>
              </div>
              <img src={`https://picsum.photos/seed/${job.id}/50/50`} alt="logo" className="rounded-lg opacity-90" />
            </div>
            
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mb-4 line-clamp-2`}>{job.description}</p>
            
            <div className={`flex justify-between items-center border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <span className={`text-xs ${textMuted}`}>Posted {job.postedAt}</span>
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
        ))}

        {filteredJobs.length === 0 && (
          <div className={`text-center py-12 ${textMuted}`}>
            <i className="fa-regular fa-folder-open text-4xl mb-4"></i>
            <p>No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;