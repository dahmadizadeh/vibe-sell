export type ProjectMode = 'builder' | 'seller';
export type ProjectGoal = 'side_project' | 'small_business' | 'venture_scale';

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
  dataSource?: 'live' | 'mock' | 'error';
  viabilityAnalysis?: ViabilityAnalysis;
  audienceGroups?: AudienceGroup[];
  posts?: PostTemplate[];
  conversations?: Conversation[];
  suggestedQuestions?: string[];
  pmfScore?: PMFScore;
  source?: 'idea' | 'url' | 'description';
  externalAppUrl?: string;
  importedAnalysis?: ImportedAnalysis;
  investors?: Contact[];
  teammates?: Contact[];
  linkedInPosts?: LinkedInPost[];
  competitorPosts?: LinkedInPost[];
  detectedCompetitors?: string[];
  seoAudit?: SEOAudit;
  playbooks?: GrowthPlaybook[];
  projectGoal?: ProjectGoal;
  founders?: FounderProfile[];
  growthIntelligence?: GrowthIntelligence;
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
  profilePhotoUrl?: string;
  contactCategory?: 'users' | 'investors' | 'teammates';
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
  crustdataConditions?: Array<Record<string, unknown>>;
  matchReasonTemplate?: string;
  count: number;
  contacts?: Contact[];
}

export interface PostTemplate {
  id: string;
  platform: string;
  purpose: string;
  title: string;
  content: string;
  targetAudience: string;
  bestTimeToPost: string;
  expectedReach: string;
  communityName?: string | null;
}

export interface ConversationAnalysis {
  keyInsights: Array<{ signal: 'positive' | 'neutral' | 'negative' | 'idea'; text: string }>;
  overallSentiment: 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
  willingnessToPay: string;
  currentSolution: string;
  switchingTrigger: string;
  featureRequests: string[];
  bestQuote: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  date: string;
  contactId?: string;
  contactName?: string;
  source: 'audio' | 'notes' | 'live';
  transcript: string;
  duration?: number;
  analysis: ConversationAnalysis;
}

export interface PMFScore {
  overall: number;
  dimensions: {
    problemValidation: number;
    solutionInterest: number;
    willingnessToPay: number;
    referralPotential: number;
  };
  conversationCount: number;
  summary: string;
  biggestRisk: string;
  suggestedAction: string;
}

export interface UserProfile {
  name: string;
  company: string;
  email: string;
}

export interface ImportedAnalysis {
  name: string;
  tagline: string;
  description: string;
  problemSolved: string;
  targetUser: string;
  features: string[];
  industry: string;
  competitors: string[];
}

export interface SEOAudit {
  score: number;
  checks: Array<{
    category: 'seo' | 'aeo';
    item: string;
    status: 'pass' | 'fail' | 'warning';
    detail: string;
  }>;
  recommendations: string[];
  toolSuggestions: string[];
}

export interface GrowthPlaybook {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: string[];
  relevance: string;
}

export interface LinkedInPost {
  id: string;
  authorName: string;
  authorTitle: string;
  authorCompany: string;
  authorLinkedinUrl: string;
  postContent: string;
  postDate: string;
  postUrl?: string;
  likes?: number;
  comments?: number;
  whyRelevant: string;
  commentStrategy: string;
  suggestedComment: string;
  relevanceScore?: number;
}

export interface CompanyAccount {
  name: string;
  industry?: string;
  headcount?: number;
  contactCount: number;
  contacts: Contact[];
  linkedinLogoUrl?: string;
  website?: string;
  hq?: string;
  totalFunding?: number;
  headcountGrowth?: number;
}

export interface FounderProfile {
  id: string;
  linkedinUrl: string;
  name: string;
  firstName: string;
  headline?: string;
  profilePhotoUrl?: string;
  company?: string;
  pastCompanies?: string[];
  education?: string[];
  skills?: string[];
  connectionCount?: number;
  recentPosts?: { content: string; reactions: number; comments: number }[];
}

export interface GrowthIntelligence {
  networkLeverage: string;
  contentAuthority: string;
  warmIntroPaths: string;
  credibilitySignals: string;
  channelFit: string[];
}
