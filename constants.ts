import { Job, PricingPlan, UserRole, Candidate } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior React Engineer',
    company: 'TechFlow Solutions',
    location: 'Bangalore, India (Remote)',
    salary: '₹25L - ₹35L',
    type: 'Full-time',
    postedAt: '2 days ago',
    description: 'We are looking for an experienced React developer to lead our frontend team. Must have strong experience in React.js, TypeScript, and Tailwind CSS.',
    requirements: ['React 18+', 'TypeScript', 'Tailwind CSS', 'Node.js Basics']
  },
  {
    id: '2',
    title: 'AI Product Manager',
    company: 'FutureScale AI',
    location: 'Gurugram, India',
    salary: '₹18L - ₹28L',
    type: 'Full-time',
    postedAt: '4 hours ago',
    description: 'Drive the product vision for our generative AI SaaS platform.',
    requirements: ['Product Management', 'LLM Knowledge', 'Agile', 'Data Analysis']
  },
  {
    id: '3',
    title: 'Growth Hacker',
    company: 'StartupX',
    location: 'Mumbai, India',
    salary: '₹12L - ₹20L',
    type: 'Contract',
    postedAt: '1 week ago',
    description: 'Looking for a marketing wizard to scale our user base from 0 to 1M.',
    requirements: ['SEO', 'Paid Ads', 'Content Marketing', 'Analytics']
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    features: ['Basic Job Search', '1 Resume Template', 'Email Alerts'],
    target: 'SEEKER'
  },
  {
    id: 'resume-pro',
    name: 'Resume Pro',
    price: '₹199/mo',
    features: ['AI Resume Builder', 'ATS Optimization', 'Priority Support'],
    recommended: true,
    target: 'SEEKER'
  },
  {
    id: 'career-boost',
    name: 'Career Boost',
    price: '₹999/mo',
    features: ['All Pro Features', 'Featured Profile', 'Direct Recruiter DM'],
    target: 'SEEKER'
  },
  {
    id: 'employer-starter',
    name: 'Hiring Starter',
    price: '₹2,999/mo',
    features: ['5 Active Jobs', 'AI Candidate Matching', 'Basic Analytics'],
    target: 'EMPLOYER'
  },
  {
    id: 'employer-pro',
    name: 'Hiring Pro',
    price: '₹9,999/mo',
    features: ['Unlimited Jobs', 'Auto-Interview Bot', 'WhatsApp Integration'],
    recommended: true,
    target: 'EMPLOYER'
  }
];

export const MOCK_USER = {
  id: 'u1',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  role: UserRole.SEEKER,
  avatar: 'https://picsum.photos/100/100'
};

export const MOCK_CANDIDATES_DATA: Candidate[] = [
  {
    id: 'c1',
    name: 'Amit Verma',
    role: 'Senior Frontend Dev',
    email: 'amit@example.com',
    status: 'New',
    resumeText: "Senior Frontend Developer with 6 years of experience in React.js, Redux, and TypeScript. Built high-scale SaaS dashboards. Proficient in Tailwind CSS and performance optimization. Familiar with Node.js backends."
  },
  {
    id: 'c2',
    name: 'Sarah Jenkins',
    role: 'Web Developer',
    email: 'sarah@example.com',
    status: 'Reviewing',
    resumeText: "Web Developer focused on Vue.js and Angular. 3 years of experience building corporate websites. Specialized in CSS animations and responsive design. Looking to learn React."
  },
  {
    id: 'c3',
    name: 'Raj Patel',
    role: 'Backend Engineer',
    email: 'raj@example.com',
    status: 'New',
    resumeText: "Backend Engineer with expertise in Python, Django, and AWS. Specialized in database optimization and API design. Minimal frontend experience with HTML/jQuery. No React experience."
  },
  {
    id: 'c4',
    name: 'Priya Singh',
    role: 'Full Stack Engineer',
    email: 'priya@example.com',
    status: 'New',
    resumeText: "Full Stack Engineer proficient in MERN stack (MongoDB, Express, React, Node.js). 4 years exp. Led a team of 3 developers. Strong in TypeScript and Cloud deployment."
  }
];