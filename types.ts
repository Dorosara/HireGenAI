export enum UserRole {
  GUEST = 'GUEST',
  SEEKER = 'SEEKER',
  EMPLOYER = 'EMPLOYER',
  COLLEGE = 'COLLEGE'
}

export type ThemeMode = 'light' | 'dark' | 'gradient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  postedAt: string;
  requirements: string[];
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Rejected' | 'Offer';
  aiScore: number;
  resumeUrl?: string;
  appliedAt: string;
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