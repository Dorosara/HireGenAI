export enum UserRole {
  GUEST = 'GUEST',
  SEEKER = 'SEEKER',
  EMPLOYER = 'EMPLOYER',
  COLLEGE = 'COLLEGE',
  ADMIN = 'ADMIN'
}

export type ThemeMode = 'light' | 'dark' | 'gradient';

export interface UserProfile {
  id: string; // UUID from auth.users
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  postedAt: string; // Mapped from posted_at
  requirements: string[];
  employer_id?: string;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Rejected' | 'Offer';
  ai_score: number;
  ai_analysis?: string;
  applied_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  skills: string[];
  raw_text?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  end_date?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
  target: 'SEEKER' | 'EMPLOYER' | 'COLLEGE';
}

export interface AIResumeData {
  summary: string;
  skills: string[];
  optimizedPoints: string[];
}

export interface CandidateAnalysis {
  score: number;
  reasoning: string;
  missingKeywords: string[];
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  resumeText: string;
  status: 'New' | 'Reviewing' | 'Rejected' | 'Interview';
  analysis?: CandidateAnalysis;
}