export type UserRole = 'entrepreneur' | 'investor';

export type CollaborationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'in_progress'
  | 'closed';

export interface ContactInfo {
  phone: string;
  website: string;
  linkedin: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  location?: string;
  preferences?: string[];
  experience?: string;
  interests?: string[];
  contactInfo?: ContactInfo;
  isOnline?: boolean;
  createdAt: string;

  startupName?: string;
  pitchSummary?: string;
  fundingNeeded?: string;
  industry?: string;
  foundedYear?: number | null;
  teamSize?: number;
  startupHistory?: string;

  investmentInterests?: string[];
  investmentStage?: string[];
  portfolioCompanies?: string[];
  totalInvestments?: number;
  minimumInvestment?: string;
  maximumInvestment?: string;
  investmentHistory?: string;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: string;
  industry: string;
  location: string;
  foundedYear: number | null;
  teamSize: number;
  startupHistory?: string;
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
  investmentHistory?: string;
}

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  investor?: Investor;
  entrepreneur?: Entrepreneur;
  message: string;
  status: CollaborationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}
