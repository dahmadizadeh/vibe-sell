export type ProjectMode = 'builder' | 'seller';

export type RoleTag = 'decision_maker' | 'champion' | 'technical_evaluator';
export type MockupType = 'dashboard' | 'table' | 'kanban' | 'alerts';
export type RelevanceLevel = 'strong' | 'good';

export interface Project {
  id: string;
  mode: ProjectMode;
  title: string;
  description: string;
  createdAt: string;
  targeting: Targeting;
  contacts: Contact[];
  emailDrafts: EmailDraft[];
  stats: ProjectStats;
  productPage?: ProductPage;
  pitchPages?: PitchPage[];
  targetCompanies?: string[];
  dataSource?: 'live' | 'mock';
  viabilityAnalysis?: ViabilityAnalysis;
  audienceGroups?: AudienceGroup[];
}

export interface Targeting {
  industries: string[];
  companySize: { min: number; max: number };
  titles: string[];
  regions: string[];
  summary: string;
}

export interface Contact {
  id: string;
  name: string;
  firstName: string;
  title: string;
  company: string;
  companySize: number;
  industry: string;
  department?: string;
  roleTag?: RoleTag;
  matchReason: string;
  relevance: RelevanceLevel;
  linkedinUrl: string;
  email?: string;
}

export interface ProductPage {
  name: string;
  tagline: string;
  features: string[];
  shareUrl: string;
  reactCode?: string;
}

export interface PitchPage {
  targetCompany: string;
  companyDomain?: string;
  headline: string;
  subtitle: string;
  problemPoints: string[];
  solutionMockups: Mockup[];
  urgencySignals: string[];
  ctaText: string;
  shareUrl: string;
}

export interface Mockup {
  type: MockupType;
  title: string;
  caption: string;
  companyName: string;
  dataPoints: Record<string, string | number>;
}

export interface EmailDraft {
  contactId: string;
  subject: string;
  body: string;
  mode: ProjectMode;
  status?: DraftStatus;
}

export interface ProjectStats {
  contactsFound: number;
  emailsSent: number;
  replies: number;
  meetingsBooked: number;
}

export type DraftStatus = 'none' | 'drafted' | 'sent';

export interface Competitor {
  name: string;
  description: string;
  funding?: string;
  url?: string;
}

export interface ViabilityAnalysis {
  overallScore: number;
  verdict: 'Strong' | 'Promising' | 'Needs Work' | 'Risky';
  dimensions: {
    marketDemand: { score: number; reasoning: string };
    competition: { score: number; reasoning: string; competitors: Competitor[] };
    monetization: { score: number; reasoning: string; suggestedModels: string[] };
    feasibility: { score: number; reasoning: string };
    timing: { score: number; reasoning: string };
  };
  summary: string;
  topRisks: string[];
  topOpportunities: string[];
}

export interface AudienceGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  searchFilters: {
    titles: string[];
    industries: string[];
    keywords?: string[];
    companies?: string[];
    regions: string[];
  };
  count: number;
  contacts?: Contact[];
}

export interface UserProfile {
  name: string;
  company: string;
  email: string;
}
