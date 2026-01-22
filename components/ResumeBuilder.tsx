import React, { useState } from 'react';
import { generateResumeSummary, optimizeResumeContent } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { AIResumeData, ThemeMode } from '../types';

interface ResumeBuilderProps {
  theme: ThemeMode;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ theme }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    experience: '',
    skills: '',
    targetRole: ''
  });
  const [aiResult, setAiResult] = useState<AIResumeData | null>(null);

  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  // Styles
  const inputClass = isDark
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-900 focus:border-primary'
    : isGradient
      ? 'bg-white/60 border-white/50 text-slate-900 placeholder-slate-600 focus:bg-white'
      : 'bg-white border-slate-300 text-slate-900';
  
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const mockResumeContent = `Experience: ${formData.experience}. Skills: ${formData.skills}`;
      const result = await optimizeResumeContent(mockResumeContent, formData.targetRole);
      setAiResult(result);
      setStep(2);
    } catch (error) {
      alert("Failed to generate AI insights");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResume = async () => {
    if (!aiResult) return;
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to save your resume.");
        return;
      }

      const { error } = await supabase.from('resumes').insert({
        user_id: user.id,
        title: `${formData.targetRole} Resume`,
        summary: aiResult.summary,
        skills: aiResult.skills,
        raw_text: formData.experience // Saving raw input for future reference
      });

      if (error) throw error;
      
      alert("Resume Saved Successfully to your Profile!");
      
    } catch (err: any) {
      console.error(err);
      alert("Error saving resume: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-xl shadow-lg border transition-all ${
      isDark ? 'bg-slate-900 border-slate-800' : isGradient ? 'bg-white/80 backdrop-blur-md border-white/40' : 'bg-white border-slate-200'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <i className="fa-solid fa-wand-magic-sparkles text-primary mr-2"></i>
          AI Resume Builder
        </h2>
        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Step {step} of 2</span>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                name="fullName"
                type="text"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${inputClass}`}
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className={labelClass}>Target Role</label>
              <input
                name="targetRole"
                type="text"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${inputClass}`}
                placeholder="e.g. Product Manager"
                value={formData.targetRole}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Experience Summary (Raw)</label>
            <textarea
              name="experience"
              className={`w-full p-2 border rounded-md h-32 focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${inputClass}`}
              placeholder="Paste your rough work history here..."
              value={formData.experience}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div>
            <label className={labelClass}>Skills</label>
            <input
              name="skills"
              type="text"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${inputClass}`}
              placeholder="React, Node.js, Project Management..."
              value={formData.skills}
              onChange={handleInputChange}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !formData.experience}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              loading || !formData.experience ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg'
            }`}
          >
            {loading ? (
              <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Analyzing with Gemini AI...</span>
            ) : (
              'Generate Professional Resume'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {aiResult && (
            <>
              <div className={`${isDark ? 'bg-blue-950/40 border-blue-900' : 'bg-blue-50 border-blue-100'} p-4 rounded-lg border`}>
                <h3 className="font-semibold text-blue-500 mb-2">AI Professional Summary</h3>
                <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{aiResult.summary}</p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Recommended Keywords (ATS)</h3>
                <div className="flex flex-wrap gap-2">
                  {aiResult.skills.map((skill, i) => (
                    <span key={i} className={`${isDark ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-green-100 text-green-700'} px-3 py-1 rounded-full text-sm font-medium`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Optimized Bullet Points</h3>
                <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {aiResult.optimizedPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4">
                 <button
                  onClick={() => window.print()}
                  className={`flex-1 text-white py-3 rounded-lg transition-colors font-medium shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' : 'bg-slate-800 hover:bg-slate-900'}`}
                >
                  <i className="fa-solid fa-download mr-2"></i> Download PDF
                </button>
                <button
                  onClick={handleSaveResume}
                  disabled={saving}
                  className={`flex-1 text-white py-3 rounded-lg transition-colors font-medium shadow-sm ${saving ? 'bg-primary/50' : 'bg-primary hover:bg-blue-600'}`}
                >
                  {saving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-cloud-arrow-up mr-2"></i> Save to Profile</>}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 border py-3 rounded-lg transition-colors font-medium ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                >
                  Edit Inputs
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;