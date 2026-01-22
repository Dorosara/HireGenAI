import React, { useState } from 'react';
import { simulateJobScraping } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { ThemeMode } from '../types';

interface AdminPanelProps {
  theme: ThemeMode;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ theme }) => {
  const [platform, setPlatform] = useState('Naukri.com');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [scrapedCount, setScrapedCount] = useState(0);

  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  const cardClass = isDark 
    ? 'bg-slate-900 border-slate-800 text-slate-100' 
    : isGradient 
      ? 'bg-white/80 backdrop-blur-md border-white/40 text-slate-900' 
      : 'bg-white border-slate-200 text-slate-900';
  
  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-white'
    : 'bg-white border-slate-300 text-slate-900';

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleImport = async () => {
    if (!keyword) return;
    setLoading(true);
    setLogs([]);
    setScrapedCount(0);

    try {
      addLog(`Initializing AI Scraper Agent...`);
      addLog(`Connecting to ${platform} via Virtual Browser...`);
      
      // 1. Generate Data via Gemini
      const jobs = await simulateJobScraping(platform, keyword, 5);
      addLog(`Successfully parsed ${jobs.length} jobs from ${platform}.`);

      // 2. Insert into Supabase
      addLog(`Syncing with HireGen Database...`);
      
      const { error } = await supabase.from('jobs').insert(jobs.map((job: any) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
        description: job.description,
        requirements: job.requirements,
        employer_id: null // System imported
      })));

      if (error) throw error;

      addLog(`Done! Added ${jobs.length} new jobs to the live board.`);
      setScrapedCount(jobs.length);

    } catch (err) {
      console.error(err);
      addLog(`Error: Failed to import jobs.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
        <i className="fa-solid fa-shield-halved mr-2 text-red-500"></i>
        Admin Control Center
      </h2>

      <div className={`p-6 rounded-xl border shadow-lg mb-8 ${cardClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            <i className="fa-solid fa-cloud-arrow-down mr-2 text-primary"></i>
            External Job Aggregator
          </h3>
          <span className="text-xs font-mono bg-green-500/10 text-green-600 px-2 py-1 rounded">Status: ONLINE</span>
        </div>
        
        <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Use the AI Agent to scrape and sync job postings from external portals directly into the HireGen database.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Target Portal</label>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${inputClass}`}
            >
              <option>Naukri.com</option>
              <option>LinkedIn Jobs</option>
              <option>Indeed India</option>
              <option>Monster.com</option>
              <option>TimesJobs</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Job Role Keyword</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. React Developer, Data Scientist, HR Manager"
                className={`flex-1 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${inputClass}`}
              />
              <button 
                onClick={handleImport}
                disabled={loading || !keyword}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 transition-all"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Start Import'}
              </button>
            </div>
          </div>
        </div>

        {/* Console Log Window */}
        <div className="bg-black rounded-lg p-4 font-mono text-sm h-48 overflow-y-auto border border-slate-700 shadow-inner">
          {logs.length === 0 ? (
            <span className="text-slate-600">Waiting for command...</span>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-green-400 border-l-2 border-green-800 pl-2 mb-1 animate-fade-in">
                {log}
              </div>
            ))
          )}
          {loading && (
             <div className="text-yellow-400 mt-2">
               <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
               Processing...
             </div>
          )}
        </div>

        {scrapedCount > 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center text-green-600">
            <i className="fa-solid fa-check-circle text-xl mr-3"></i>
            <div>
              <strong>Import Successful!</strong>
              <p className="text-sm">Added {scrapedCount} new jobs. Check the Job Board to see them.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border ${cardClass} opacity-70`}>
          <h3 className="font-bold mb-2">Platform Stats</h3>
          <div className="space-y-2">
             <div className="flex justify-between">
               <span>Total Jobs</span>
               <span className="font-mono">Syncing...</span>
             </div>
             <div className="flex justify-between">
               <span>Active Scrapers</span>
               <span className="font-mono">1 Idle</span>
             </div>
          </div>
        </div>
        <div className={`p-6 rounded-xl border ${cardClass} opacity-70`}>
          <h3 className="font-bold mb-2">API Usage</h3>
          <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '45%'}}></div>
          </div>
          <p className="text-xs mt-2 text-right">45% of Daily Quota</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;