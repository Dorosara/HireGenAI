import React, { useState, useEffect } from 'react';
import { generateJobDescription, analyzeCandidateMatch } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { Candidate, ThemeMode, Job } from '../types';

interface EmployerPanelProps {
  theme: ThemeMode;
}

const EmployerPanel: React.FC<EmployerPanelProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState<'post' | 'manage'>('post');
  
  // Job Posting State
  const [jobData, setJobData] = useState({ title: '', company: '', requirements: '' });
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [loadingJD, setLoadingJD] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // Management State
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  
  // AI Ranking State
  const [ranking, setRanking] = useState(false);

  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  // Styles
  const cardClass = isDark 
    ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl' 
    : isGradient 
      ? 'bg-white/80 backdrop-blur-md border-white/40 text-slate-900' 
      : 'bg-white border-slate-200 text-slate-900';
  
  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-slate-700'
    : isGradient
      ? 'bg-white/60 border-white/50 text-slate-900 placeholder-slate-600'
      : 'border-slate-200';

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;
  const textTitle = isDark ? 'text-white' : 'text-slate-800';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  // Fetch Employer's Jobs on Mount
  useEffect(() => {
    fetchMyJobs();
  }, [activeTab]);

  // Fetch Applicants when a job is selected
  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchMyJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', user.id)
      .order('posted_at', { ascending: false });

    if (!error && data) {
      setMyJobs(data);
      if (data.length > 0 && !selectedJobId) {
        setSelectedJobId(data[0].id);
      }
    }
  };

  const fetchApplicants = async (jobId: string) => {
    setLoadingApplicants(true);
    // Fetch application + User Profile
    // Note: In a real app we'd also join the 'resumes' table. 
    // For this demo, we'll try to fetch the latest resume for the user separately or assume raw_text is passed.
    
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        user_profiles ( full_name, email, avatar_url )
      `)
      .eq('job_id', jobId);

    if (!error && data) {
      // For each applicant, try to fetch their latest resume text for AI analysis
      const appsWithResumes = await Promise.all(data.map(async (app: any) => {
        const { data: resumeData } = await supabase
          .from('resumes')
          .select('raw_text, summary')
          .eq('user_id', app.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        return {
          ...app,
          resumeText: resumeData?.raw_text || resumeData?.summary || "No resume text available.",
          candidateName: app.user_profiles?.full_name || 'Unknown',
          candidateEmail: app.user_profiles?.email || 'No Email',
          avatarUrl: app.user_profiles?.avatar_url
        };
      }));
      
      setApplicants(appsWithResumes);
    }
    setLoadingApplicants(false);
  };

  const handleGenerateJD = async () => {
    setLoadingJD(true);
    const desc = await generateJobDescription(jobData.title, jobData.company, jobData.requirements);
    setGeneratedDesc(desc);
    setLoadingJD(false);
  };

  const handlePublish = async () => {
    if (!jobData.title || !generatedDesc) return;
    setPublishing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to post a job.");
        setPublishing(false);
        return;
      }

      const reqArray = jobData.requirements.split(',').map(s => s.trim()).filter(Boolean);

      const { error } = await supabase.from('jobs').insert({
        title: jobData.title,
        company: jobData.company,
        description: generatedDesc,
        requirements: reqArray,
        location: 'Remote / India', 
        salary: '₹12L - ₹24L', 
        type: 'Full-time',
        employer_id: user.id
      });

      if (error) throw error;
      alert("Job Posted Successfully!");
      setJobData({ title: '', company: '', requirements: '' });
      setGeneratedDesc('');
      fetchMyJobs(); // Refresh list
      setActiveTab('manage'); // Switch to manage view

    } catch (err: any) {
      console.error(err);
      alert("Failed to post job: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleRankCandidates = async () => {
    setRanking(true);
    const selectedJob = myJobs.find(j => j.id === selectedJobId);
    if (!selectedJob) return;

    // Analyze each applicant
    const updatedApplicants = await Promise.all(
      applicants.map(async (app) => {
        // Skip if already analyzed to save API tokens
        if (app.ai_analysis && typeof app.ai_analysis !== 'string') return app;

        const analysis = await analyzeCandidateMatch(
          app.resumeText, 
          selectedJob.description + " " + (selectedJob.requirements?.join(", ") || "")
        );
        
        // Update DB with score
        await supabase
          .from('applications')
          .update({ 
             ai_score: analysis.score,
             ai_analysis: JSON.stringify(analysis) // Store as string for simplicity in this demo schema
          })
          .eq('id', app.id);

        return { ...app, ai_analysis: analysis, ai_score: analysis.score };
      })
    );

    // Sort by score
    const sorted = updatedApplicants.sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));
    setApplicants(sorted);
    setRanking(false);
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', appId);
      
    if (!error) {
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    }
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
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'manage' ? 'text-primary border-b-2 border-primary' : textMuted}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Jobs & Applicants
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
              <div className="mt-4 animate-fade-in">
                <label className={labelClass}>Generated Description</label>
                <textarea 
                  className={`w-full p-2 border rounded-md h-64 text-sm font-mono outline-none ${inputClass}`}
                  value={generatedDesc}
                  onChange={(e) => setGeneratedDesc(e.target.value)}
                />
                <button 
                  onClick={handlePublish}
                  disabled={publishing}
                  className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  {publishing ? (
                    <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Processing Payment & Posting...</span>
                  ) : (
                    <span><i className="fa-solid fa-check-circle mr-2"></i> Publish Job Now (₹999)</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Job List Sidebar */}
          <div className="lg:col-span-1 space-y-4">
             <h3 className={`font-bold ${textTitle}`}>Your Active Jobs</h3>
             {myJobs.length === 0 ? (
               <p className={`text-sm ${textMuted}`}>No jobs posted yet.</p>
             ) : (
               myJobs.map(job => (
                 <div 
                   key={job.id}
                   onClick={() => setSelectedJobId(job.id)}
                   className={`p-4 rounded-lg cursor-pointer border transition-all ${selectedJobId === job.id ? 'border-primary bg-primary/5 shadow-md' : `${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-primary/50'}`}`}
                 >
                   <h4 className={`font-semibold text-sm ${textTitle}`}>{job.title}</h4>
                   <p className={`text-xs ${textMuted} mt-1`}>{new Date(job.postedAt || Date.now()).toLocaleDateString()}</p>
                 </div>
               ))
             )}
          </div>

          {/* Applicant List Area */}
          <div className="lg:col-span-3">
             <div className="flex justify-between items-center mb-6">
               <h3 className={`font-bold text-xl ${textTitle}`}>
                 Applicants for {myJobs.find(j => j.id === selectedJobId)?.title || 'Selected Job'}
               </h3>
               <button 
                onClick={handleRankCandidates}
                disabled={ranking || applicants.length === 0}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg disabled:opacity-50"
              >
                {ranking ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i> AI Rank All</>}
              </button>
             </div>

             {loadingApplicants ? (
               <div className="text-center py-12"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary"></i></div>
             ) : applicants.length === 0 ? (
               <div className={`text-center py-12 border rounded-xl border-dashed ${isDark ? 'border-slate-800' : 'border-slate-300'}`}>
                 <p className={textMuted}>No applications received for this job yet.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {applicants.map((app, idx) => {
                   // Parse analysis if it's a string (from DB) or object (from state)
                   const analysis = typeof app.ai_analysis === 'string' ? JSON.parse(app.ai_analysis) : app.ai_analysis;
                   
                   return (
                    <div key={app.id} className={`p-6 rounded-xl border transition-all ${cardClass} ${analysis?.score >= 80 ? 'border-l-4 border-l-green-500' : ''}`}>
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-start gap-4">
                           <img src={app.avatarUrl || `https://ui-avatars.com/api/?name=${app.candidateName}`} className="w-12 h-12 rounded-full" alt="avatar" />
                           <div>
                             <h4 className={`font-bold text-lg ${textTitle}`}>
                               {app.candidateName} 
                               {idx === 0 && analysis?.score >= 80 && <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full"><i className="fa-solid fa-crown mr-1"></i>Top Match</span>}
                             </h4>
                             <p className={`text-sm ${textMuted}`}>{app.candidateEmail}</p>
                             <div className="flex gap-2 mt-2">
                               {['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'].map(status => (
                                 <button
                                  key={status}
                                  onClick={(e) => { e.stopPropagation(); updateStatus(app.id, status); }}
                                  className={`text-xs px-2 py-1 rounded border ${app.status === status ? 'bg-primary text-white border-primary' : `${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}`}
                                 >
                                   {status}
                                 </button>
                               ))}
                             </div>
                           </div>
                        </div>

                        {analysis ? (
                           <div className="text-right min-w-[120px]">
                             <div className="text-xs font-bold text-slate-500 uppercase">Match Score</div>
                             <div className={`text-3xl font-extrabold ${analysis.score >= 80 ? 'text-green-500' : analysis.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                               {analysis.score}%
                             </div>
                           </div>
                        ) : (
                          <div className="flex items-center text-sm text-slate-500 italic">
                            <i className="fa-regular fa-clock mr-2"></i> Pending AI Scan
                          </div>
                        )}
                      </div>

                      {analysis && (
                        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                           <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                             <strong className="text-primary"><i className="fa-solid fa-robot mr-1"></i> AI Insight:</strong> {analysis.reasoning}
                           </p>
                        </div>
                      )}
                    </div>
                   );
                 })}
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerPanel;