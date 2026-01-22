import React, { useState } from 'react';
import { generateJobDescription, analyzeCandidateMatch } from '../services/geminiService';
import { MOCK_CANDIDATES_DATA, MOCK_JOBS } from '../constants';
import { Candidate, ThemeMode } from '../types';

interface EmployerPanelProps {
  theme: ThemeMode;
}

const EmployerPanel: React.FC<EmployerPanelProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState<'post' | 'candidates'>('post');
  const [jobData, setJobData] = useState({ title: '', company: '', requirements: '' });
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [loadingJD, setLoadingJD] = useState(false);
  
  // Ranking State
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES_DATA);
  const [ranking, setRanking] = useState(false);
  const [ranked, setRanked] = useState(false);

  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  // Styles - Main cards are Slate 900
  const cardClass = isDark 
    ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl' 
    : isGradient 
      ? 'bg-white/80 backdrop-blur-md border-white/40 text-slate-900' 
      : 'bg-white border-slate-200 text-slate-900';
  
  // Inputs are Slate 950 (inset)
  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-slate-700'
    : isGradient
      ? 'bg-white/60 border-white/50 text-slate-900 placeholder-slate-600'
      : 'border-slate-200';

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;
  const textTitle = isDark ? 'text-white' : 'text-slate-800';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  const REFERENCE_JOB = MOCK_JOBS[0];

  const handleGenerateJD = async () => {
    setLoadingJD(true);
    const desc = await generateJobDescription(jobData.title, jobData.company, jobData.requirements);
    setGeneratedDesc(desc);
    setLoadingJD(false);
  };

  const handleRankCandidates = async () => {
    setRanking(true);
    
    // We will analyze each candidate against the reference job description
    const updatedCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        const analysis = await analyzeCandidateMatch(
          candidate.resumeText, 
          REFERENCE_JOB.description + " " + REFERENCE_JOB.requirements.join(", ")
        );
        return { ...candidate, analysis };
      })
    );

    // Sort by score descending
    const sorted = updatedCandidates.sort((a, b) => 
      (b.analysis?.score || 0) - (a.analysis?.score || 0)
    );

    setCandidates(sorted);
    setRanked(true);
    setRanking(false);
  };

  return (
    <div className="w-full">
      <div className={`flex border-b mb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'post' ? 'text-primary border-b-2 border-primary' : textMuted}`}
          onClick={() => setActiveTab('post')}
        >
          Post a Job
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'candidates' ? 'text-primary border-b-2 border-primary' : textMuted}`}
          onClick={() => setActiveTab('candidates')}
        >
          Candidate Ranking (AI)
        </button>
      </div>

      {activeTab === 'post' ? (
        <div className={`p-6 rounded-xl border shadow-sm max-w-3xl ${cardClass}`}>
          <h2 className={`text-xl font-bold mb-4 ${textTitle}`}>Create New Job Posting</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Job Title</label>
              <input 
                type="text" 
                className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-primary ${inputClass}`} 
                placeholder="e.g. Senior Backend Engineer"
                value={jobData.title}
                onChange={e => setJobData({...jobData, title: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Company Name</label>
              <input 
                type="text" 
                className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-primary ${inputClass}`}
                value={jobData.company}
                onChange={e => setJobData({...jobData, company: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Key Requirements (comma separated)</label>
              <input 
                type="text" 
                className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-primary ${inputClass}`}
                placeholder="Python, Django, AWS, 5+ years exp"
                value={jobData.requirements}
                onChange={e => setJobData({...jobData, requirements: e.target.value})}
              />
            </div>
            
            <button
              onClick={handleGenerateJD}
              disabled={loadingJD || !jobData.title}
              className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {loadingJD ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magic mr-2"></i>}
              Auto-Write Description with AI
            </button>

            {generatedDesc && (
              <div className="mt-4">
                <label className={labelClass}>Generated Description</label>
                <textarea 
                  className={`w-full p-2 border rounded-md h-64 text-sm font-mono outline-none ${inputClass}`}
                  value={generatedDesc}
                  onChange={(e) => setGeneratedDesc(e.target.value)}
                />
                <button className="mt-2 w-full bg-primary text-white py-2 rounded-lg font-bold">
                  Publish Job (₹999)
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`flex justify-between items-center p-4 rounded-lg border ${isDark ? 'bg-blue-950/20 border-blue-900' : 'bg-blue-50 border-blue-100'}`}>
            <div>
              <h3 className={`font-bold ${textTitle}`}>Job: {REFERENCE_JOB.title}</h3>
              <p className={`text-sm ${textMuted}`}>{REFERENCE_JOB.company}</p>
            </div>
            <button 
              onClick={handleRankCandidates}
              disabled={ranking}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {ranking ? (
                <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Scoring...</span>
              ) : (
                <span><i className="fa-solid fa-ranking-star mr-2"></i> Rank Candidates with AI</span>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {candidates.map((c, index) => (
              <div key={c.id} className={`p-5 rounded-xl border transition-all ${cardClass} ${ranked ? 'border-l-4' : ''} ${ranked && (c.analysis?.score || 0) >= 80 ? 'border-l-green-500 shadow-md' : ranked && (c.analysis?.score || 0) >= 50 ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="relative">
                       <div className={`h-14 w-14 rounded-full flex items-center justify-center font-bold text-xl ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                         {c.name.charAt(0)}
                       </div>
                       {ranked && index === 0 && (
                         <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-1 shadow-sm">
                           <i className="fa-solid fa-crown text-xs"></i>
                         </div>
                       )}
                     </div>
                     <div>
                       <h3 className={`font-bold text-lg ${textTitle}`}>{c.name}</h3>
                       <p className={`text-sm ${textMuted}`}>{c.role} • {c.email}</p>
                     </div>
                  </div>
                  
                  {c.analysis ? (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`text-xs uppercase tracking-wide font-semibold ${textMuted}`}>AI Match Score</div>
                        <div className={`text-2xl font-extrabold ${
                          c.analysis.score >= 80 ? 'text-green-500' : 
                          c.analysis.score >= 50 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {c.analysis.score}%
                        </div>
                      </div>
                      <div className={`hidden md:block w-px h-10 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                    </div>
                  ) : (
                    <div className={`${textMuted} text-sm italic`}>
                      Pending AI Analysis...
                    </div>
                  )}
                </div>

                {c.analysis && (
                  <div className={`mt-4 pt-4 border-t grid md:grid-cols-2 gap-4 text-sm animate-fade-in ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
                      <span className={`font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <i className="fa-solid fa-robot text-primary mr-1"></i> AI Reasoning:
                      </span>
                      <p className={`${textMuted}`}>{c.analysis.reasoning}</p>
                    </div>
                    {c.analysis.missingKeywords.length > 0 && (
                      <div className={`p-3 rounded-lg border ${isDark ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
                        <span className="font-semibold text-red-500 block mb-1">
                          <i className="fa-solid fa-triangle-exclamation mr-1"></i> Missing Keywords:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {c.analysis.missingKeywords.map(k => (
                            <span key={k} className={`px-2 py-0.5 rounded text-xs border ${isDark ? 'bg-slate-950 text-red-400 border-red-900' : 'bg-white text-red-600 border-red-200'}`}>
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerPanel;