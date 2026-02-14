/**
 * All user-facing strings live here.
 * Components import from this file to enforce language rules.
 *
 * NEVER use: ICP, Prospects, Outreach, Deploy, Ship, App, Pipeline, API
 * ALWAYS use: targeting, customers/contacts, email/reach out, share, product/pitch page
 */

export const COPY = {
  // Brand
  brandName: "Vibe & Sell",
  poweredBy: "Powered by Crustdata",

  // Nav
  navMyProjects: "My Projects",

  // Home — Mode selection
  modeBuilderTitle: "Find customers for what I'm building",
  modeBuilderSubtitle: "Describe your product. We'll find 100 real people who need it.",
  modeSellerTitle: "Create a pitch page for a target company",
  modeSellerSubtitle: "Build a personalized demo page and find the right contacts.",

  // Home — Builder form
  builderFieldLabel: "What did you build? (or what are you building?)",
  builderFieldPlaceholder:
    "e.g. A tool that helps recruiting agencies track candidate progress and automate follow-up emails",
  builderNotesLabel: "Anything else we should know?",
  builderNotesPlaceholder:
    "e.g. We're targeting mid-market companies in the US, our price point is $200/mo",
  builderSubmit: "Find My First 100 Customers →",

  // Home — Seller form
  sellerFieldLabel: "What does your product do for them?",
  sellerFieldPlaceholder:
    "e.g. Crustdata's real-time company signals can power lead scoring for their sales team — enriching every lead with headcount growth, funding stage, and hiring velocity",
  sellerCompanyLabel: "Which company are you selling into?",
  sellerCompanyPlaceholder: "e.g. stripe.com or Stripe",
  sellerAddCompany: "+ Add another company",
  sellerTitlesLabel: "Who should see this?",
  sellerTitlesHelper: "Leave blank and we'll figure out the right people",
  sellerSubmit: "Create Pitch Page & Find Contacts →",

  // Example chips — Builder
  builderExamples: [
    "Recruiting candidate tracker",
    "Sales prospecting tool",
    "Investor deal flow CRM",
    "AI writing assistant for marketers",
  ],

  // Example chips — Seller
  sellerExamples: [
    "Real-time lead scoring with Crustdata signals",
    "Data enrichment for their CRM",
    "Hiring signal alerts for their recruiting team",
    "Company growth tracking dashboard",
  ],

  // Title suggestions for tag input
  titleSuggestions: [
    "VP Sales",
    "Head of Revenue Ops",
    "CTO",
    "Director of Engineering",
    "Head of Data",
    "VP Growth",
  ],

  // Loading — Builder steps
  loadingBuilderSteps: [
    "Analyzing what you built…",
    "Figuring out who needs this…",
    "Searching 700M+ professionals…",
    "Writing personalized emails…",
  ],

  // Loading — Seller steps (templates with {company} placeholder)
  loadingSellerSteps: [
    "Understanding your pitch…",
    "Building your demo page…",
    "Pulling real data on {company}…",
    "Finding the right people at {company}…",
    "Writing personalized emails…",
  ],

  // Results — Builder
  resultsBuilderHeader: (count: number, companies: number) =>
    `We found ${count} people across ${companies} companies who need what you're building`,
  resultsEditTargeting: "Edit targeting ↓",
  resultsUpdateTargeting: "Update Results",
  resultsShowAll: (count: number) => `Show all ${count} customers`,
  resultsSortBestMatch: "Best match",
  resultsSortCompanySize: "Company size",
  resultsSortRecentlyActive: "Recently active",

  // Results — Seller
  resultsSellerContactsHeader: (count: number, company: string) =>
    `${count} contacts at ${company}`,

  // Contact card
  contactWriteEmail: "Write Email",
  contactStrongMatch: "Strong match",
  contactGoodMatch: "Good match",
  contactDrafted: "Drafted",
  contactSent: "Sent",

  // Role tags
  roleDecisionMaker: "Decision Maker",
  roleChampion: "Champion",
  roleTechnicalEvaluator: "Technical Evaluator",

  // Product page
  productPageOpenPage: "Open Page",
  productPageCopyLink: "Copy Link",
  productPageEdit: "Edit",
  productPageCta: "Request Access",
  productPageSectionTitle: "Your Product Page",

  // Pitch page
  pitchPageOpenFull: "Open Full Page",
  pitchPageCopyLink: "Copy Link",
  pitchPageEdit: "Edit Page",
  pitchPageSectionTitle: "Your Pitch Page",
  pitchPageCtaDefault: "Want to see this live? Let's chat.",
  pitchPageFooter: "Built with Vibe & Sell · Powered by Crustdata",
  pitchPagePoweredBy: "Powered by Crustdata real-time company signals",

  // Email composer
  emailComposerTitle: "Draft Email",
  emailCopy: "Copy Email",
  emailCopied: "Copied!",
  emailOpenGmail: "Open in Gmail",
  emailPrevious: "← Previous",
  emailNext: "Next →",

  // Workspace
  workspaceTitle: "My Projects",
  workspaceEmpty: "You haven't created anything yet",
  workspaceGetStarted: "Get Started →",
  workspaceBuilderFindMore: "Find More Customers",
  workspaceBuilderOpen: "Open",
  workspaceSellerReuse: "Reuse for New Company",
  workspaceSellerOpen: "Open",
  workspaceReusePrompt: "Which company?",
  workspaceAccountsHeader: "Your Accounts",

  // Quick start
  quickStartHeader: "Your Accounts",
  quickStartNewPitch: "New Pitch Page →",

  // User setup
  userSetupTitle: "Quick setup",
  userSetupSubtitle: "This helps us personalize your emails and pitch pages.",
  userSetupNameLabel: "Your name",
  userSetupNamePlaceholder: "e.g. Sarah Chan",
  userSetupCompanyLabel: "Your company",
  userSetupCompanyPlaceholder: "e.g. Crustdata",
  userSetupEmailLabel: "Your email",
  userSetupEmailPlaceholder: "e.g. sarah@crustdata.com",
  userSetupSubmit: "Continue",

  // Shareable pages
  shareableFooter: "Built with Vibe & Sell",
  shareableNotFound: "Page not found",
  shareableNotFoundDesc: "This page doesn't exist or has been removed.",

  // Validation
  validationRequired: "This field is required",
  validationCompanyRequired: "Please enter at least one company",

  // Toast
  toastLinkCopied: "Link copied to clipboard",
  toastEmailCopied: "Email copied to clipboard",
} as const;
