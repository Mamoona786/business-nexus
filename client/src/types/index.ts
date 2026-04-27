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
  walletBalance?: number;
    notificationPreferences?: NotificationPreferences;
  privacySettings?: PrivacySettings;
  twoFactorEnabled?: boolean;
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

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  participant: User;
  lastMessage?: {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
  };
  unreadCount: number;
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

export type DocumentStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'signed';

export interface DocumentVersion {
  version: number;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Document {
  _id?: string;
  id?: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: User | string;
  relatedUsers: string[];
  version: number;
  versions: DocumentVersion[];
  status: DocumentStatus;
  signatureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  verifyLoginOtp: (email: string, otp: string, role: UserRole) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type MeetingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'rescheduled';

export type MeetingType = 'video' | 'audio' | 'in_person';

export interface Meeting {
  id: string;
  title: string;
  createdBy: User | string;
  participants: User[] | string[];
  date: string;
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  notes?: string;
  meetingLink?: string;
  roomId?: string;
  createdAt: string;
  updatedAt?: string;
}
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed';

export type TransactionType = 'deposit' | 'withdraw' | 'transfer';

export interface Transaction {
  id: string;
  userId: string;
  fromUserId?: string | null;
  toUserId?: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'collaboration'
  | 'meeting'
  | 'document'
  | 'payment'
  | 'message'
  | 'system'
  | 'support';

export interface AppNotification {
  id: string;
  recipient: string;
  sender?: User | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  entityId?: string | null;
  entityType?: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  messages: boolean;
  meetings: boolean;
  documents: boolean;
  payments: boolean;
  collaborations: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showOnlineStatus: boolean;
}
