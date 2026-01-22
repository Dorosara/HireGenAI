import { GoogleGenAI, Type } from "@google/genai";
import { AIResumeData, CandidateAnalysis } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to safely get text
const getText = (response: any) => response.text || "No response generated.";

export const generateResumeSummary = async (experience: string, skills: string): Promise<string> => {
  if (!apiKey) return "AI service unavailable (Missing API Key).";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a professional 3-sentence resume summary for a candidate with the following experience: "${experience}" and skills: "${skills}". Focus on achievements and metrics.`,
    });
    return getText(response);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate summary. Please try again.";
  }
};

export const optimizeResumeContent = async (currentResume: string, targetJobTitle: string): Promise<AIResumeData> => {
  if (!apiKey) {
    return {
      summary: "AI Unavailable",
      skills: ["Manual Entry"],
      optimizedPoints: ["Please add API Key to use AI features."]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as an expert ATS (Applicant Tracking System) optimizer. 
      Review this resume content: "${currentResume}" for the job title: "${targetJobTitle}".
      
      Return a JSON object with:
      1. A strong professional summary.
      2. A list of missing keywords/skills to add.
      3. 3 optimized bullet points improving the original content.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            optimizedPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    
    const text = getText(response);
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "Error generating content.",
      skills: [],
      optimizedPoints: []
    };
  }
};

export const generateJobDescription = async (title: string, company: string, keyRequirements: string): Promise<string> => {
  if (!apiKey) return "AI service unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a compelling, inclusive job description for a "${title}" at "${company}". 
      Key requirements: ${keyRequirements}. 
      Include sections for: About Us, The Role, Requirements, and Why Join Us. Use Markdown formatting.`,
    });
    return getText(response);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate job description.";
  }
};

export const analyzeCandidateMatch = async (resumeText: string, jobDescription: string): Promise<CandidateAnalysis> => {
  if (!apiKey) {
     return {
       score: Math.floor(Math.random() * 40) + 50,
       reasoning: "API Key missing. Simulated Score.",
       missingKeywords: ["API Key"]
     };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are an expert ATS (Applicant Tracking System) and Technical Recruiter.
        Job Description: "${jobDescription.substring(0, 1000)}..."
        Candidate Resume: "${resumeText.substring(0, 1000)}..."
        Analyze the match. 
        1. Assign a score from 0-100.
        2. Provide a 1-sentence reasoning.
        3. List up to 3 missing keywords.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reasoning: { type: Type.STRING },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    const text = getText(response);
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Ranking Error", error);
    return {
      score: 0,
      reasoning: "AI analysis failed.",
      missingKeywords: []
    };
  }
};

/**
 * Simulates a scraper by generating realistic job data based on a platform and keyword.
 */
export const simulateJobScraping = async (platform: string, keyword: string, count: number = 3) => {
  if (!apiKey) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Act as a Web Scraper Agent.
        Generate ${count} highly realistic job postings that would currently be found on "${platform}" for the role "${keyword}" in India.
        Make the companies diverse (mix of MNCs and Startups).
        
        Return a JSON Array of objects with these exact fields:
        - title: Job Title
        - company: Company Name
        - location: City, India
        - salary: Realistic range (e.g., ₹12L - ₹18L)
        - type: 'Full-time' or 'Contract' or 'Remote'
        - description: A short 2-sentence summary.
        - requirements: Array of 4-5 key skills.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });

    const text = getText(response);
    return JSON.parse(text);
  } catch (error) {
    console.error("Scraper Simulation Error:", error);
    throw error;
  }
};