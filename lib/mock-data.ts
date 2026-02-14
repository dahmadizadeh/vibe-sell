import type {
  Contact,
  EmailDraft,
  Targeting,
  ProductPage,
  PitchPage,
  Project,
} from "./types";

// ─── BUILDER: RECRUITING ────────────────────────────────────────────────────

const recruitingTargeting: Targeting = {
  industries: ["Staffing & Recruiting", "HR Technology"],
  companySize: { min: 50, max: 500 },
  titles: [
    "Head of Talent Acquisition",
    "VP Recruiting",
    "Director of Talent",
    "Head of People Operations",
  ],
  regions: ["United States"],
  summary:
    "Recruiting agencies and staffing firms, 50\u2013500 employees, led by Heads of Talent and VPs of Recruiting in the US",
};

const recruitingContacts: Contact[] = [
  { id: "r-01", name: "Sarah Martinez", firstName: "Sarah", title: "VP of Talent Acquisition", company: "Hirewell", companySize: 280, industry: "Staffing & Recruiting", matchReason: "Hirewell grew headcount 28% last quarter and posted 12 new recruiting coordinator roles this month", relevance: "strong", linkedinUrl: "https://linkedin.com/in/sarah-martinez" },
  { id: "r-02", name: "James Liu", firstName: "James", title: "Director of Recruiting Operations", company: "Kforce", companySize: 340, industry: "Staffing & Recruiting", matchReason: "Kforce expanded into 3 new markets this quarter and is actively hiring recruiting managers", relevance: "strong", linkedinUrl: "https://linkedin.com/in/james-liu" },
  { id: "r-03", name: "Priya Deshmukh", firstName: "Priya", title: "Head of Talent Acquisition", company: "TalentBridge", companySize: 185, industry: "Staffing & Recruiting", matchReason: "TalentBridge closed a $14M Series B in January and plans to double their recruiting team by Q3", relevance: "strong", linkedinUrl: "https://linkedin.com/in/priya-deshmukh" },
  { id: "r-04", name: "Marcus Thompson", firstName: "Marcus", title: "VP Recruiting", company: "PeopleFirst Staffing", companySize: 210, industry: "Staffing & Recruiting", matchReason: "PeopleFirst Staffing saw 45% higher web traffic in December after launching their healthcare staffing vertical", relevance: "strong", linkedinUrl: "https://linkedin.com/in/marcus-thompson" },
  { id: "r-05", name: "Amanda Chen", firstName: "Amanda", title: "Director of Talent", company: "Lever Talent Group", companySize: 95, industry: "HR Technology", matchReason: "Lever Talent Group hired a new CTO last month and posted 8 engineering roles in the past two weeks", relevance: "strong", linkedinUrl: "https://linkedin.com/in/amanda-chen" },
  { id: "r-06", name: "David Okafor", firstName: "David", title: "Head of People Operations", company: "RecruitEdge", companySize: 120, industry: "Staffing & Recruiting", matchReason: "RecruitEdge increased their job placement volume by 33% quarter-over-quarter and opened a new office in Austin", relevance: "strong", linkedinUrl: "https://linkedin.com/in/david-okafor" },
  { id: "r-07", name: "Rachel Goldstein", firstName: "Rachel", title: "VP of Talent Acquisition", company: "NorthStar Recruiting", companySize: 310, industry: "Staffing & Recruiting", matchReason: "NorthStar Recruiting just replaced their legacy ATS and is evaluating modern candidate tracking tools", relevance: "strong", linkedinUrl: "https://linkedin.com/in/rachel-goldstein" },
  { id: "r-08", name: "Kevin Park", firstName: "Kevin", title: "Director of Recruiting Operations", company: "Apex Talent Solutions", companySize: 175, industry: "Staffing & Recruiting", matchReason: "Apex Talent Solutions reported 52% year-over-year revenue growth and is scaling their RPO division", relevance: "strong", linkedinUrl: "https://linkedin.com/in/kevin-park" },
  { id: "r-09", name: "Lisa Fernandez", firstName: "Lisa", title: "Head of Talent Acquisition", company: "StaffConnect", companySize: 430, industry: "Staffing & Recruiting", matchReason: "StaffConnect added 67 new enterprise clients in Q4 and their hiring velocity doubled in the last 60 days", relevance: "strong", linkedinUrl: "https://linkedin.com/in/lisa-fernandez" },
  { id: "r-10", name: "Brian Walsh", firstName: "Brian", title: "VP Recruiting", company: "ClearPath HR", companySize: 88, industry: "HR Technology", matchReason: "ClearPath HR launched a new contract staffing division last month and is hiring 5 senior recruiters", relevance: "good", linkedinUrl: "https://linkedin.com/in/brian-walsh" },
  { id: "r-11", name: "Natasha Ivanova", firstName: "Natasha", title: "Director of Talent", company: "SkillBridge", companySize: 155, industry: "HR Technology", matchReason: "SkillBridge raised a $9M Series A two weeks ago with plans to expand their talent marketplace product", relevance: "strong", linkedinUrl: "https://linkedin.com/in/natasha-ivanova" },
  { id: "r-12", name: "Carlos Ruiz", firstName: "Carlos", title: "Head of People Operations", company: "Vantage Staffing", companySize: 260, industry: "Staffing & Recruiting", matchReason: "Vantage Staffing promoted their COO to CEO last month and announced a strategic shift toward tech staffing", relevance: "good", linkedinUrl: "https://linkedin.com/in/carlos-ruiz" },
  { id: "r-13", name: "Emily Watson", firstName: "Emily", title: "VP of Talent Acquisition", company: "TalentForge", companySize: 195, industry: "Staffing & Recruiting", matchReason: "TalentForge posted 19 open roles in the last 30 days, up from 4 the previous month, signaling rapid growth", relevance: "strong", linkedinUrl: "https://linkedin.com/in/emily-watson" },
  { id: "r-14", name: "Jason Nakamura", firstName: "Jason", title: "Director of Recruiting Operations", company: "PrimeHire", companySize: 78, industry: "Staffing & Recruiting", matchReason: "PrimeHire won a $3.2M government staffing contract last quarter and needs to scale their recruiter capacity", relevance: "good", linkedinUrl: "https://linkedin.com/in/jason-nakamura" },
  { id: "r-15", name: "Danielle Brooks", firstName: "Danielle", title: "Head of Talent Acquisition", company: "Horizon Talent", companySize: 410, industry: "Staffing & Recruiting", matchReason: "Horizon Talent\u2019s LinkedIn job posts surged 78% in Q1 and they recently expanded into financial services staffing", relevance: "strong", linkedinUrl: "https://linkedin.com/in/danielle-brooks" },
  { id: "r-16", name: "Andrew Kim", firstName: "Andrew", title: "VP Recruiting", company: "BlueSky Recruiting", companySize: 62, industry: "Staffing & Recruiting", matchReason: "BlueSky Recruiting opened a second office in Denver last month and grew their headcount by 15 people in Q4", relevance: "good", linkedinUrl: "https://linkedin.com/in/andrew-kim" },
  { id: "r-17", name: "Sofia Alvarez", firstName: "Sofia", title: "Director of Talent", company: "WorkBridge Solutions", companySize: 335, industry: "Staffing & Recruiting", matchReason: "WorkBridge Solutions saw a 41% spike in inbound candidate applications after launching a new employer branding campaign", relevance: "good", linkedinUrl: "https://linkedin.com/in/sofia-alvarez" },
  { id: "r-18", name: "Ryan O\u2019Malley", firstName: "Ryan", title: "Head of People Operations", company: "TalentNest", companySize: 145, industry: "HR Technology", matchReason: "TalentNest replaced their VP of Engineering two weeks ago and posted 6 senior engineering roles since then", relevance: "good", linkedinUrl: "https://linkedin.com/in/ryan-omalley" },
  { id: "r-19", name: "Megan Patel", firstName: "Megan", title: "VP of Talent Acquisition", company: "StaffLogic", companySize: 225, industry: "Staffing & Recruiting", matchReason: "StaffLogic\u2019s website traffic jumped 62% month-over-month after announcing a partnership with a major job board", relevance: "strong", linkedinUrl: "https://linkedin.com/in/megan-patel" },
  { id: "r-20", name: "Chris Henley", firstName: "Chris", title: "Director of Recruiting Operations", company: "RapidHire", companySize: 490, industry: "Staffing & Recruiting", matchReason: "RapidHire is consolidating 4 recruiting tools into one platform and their procurement team is actively evaluating vendors", relevance: "strong", linkedinUrl: "https://linkedin.com/in/chris-henley" },
];

const recruitingProductPage: ProductPage = {
  name: "PipeTrack",
  tagline: "Candidate tracking for modern recruiting teams",
  features: [
    "Visual candidate board with drag-and-drop stages",
    "Automated follow-up sequences triggered by stage changes",
    "Team analytics showing time-to-fill and conversion rates",
  ],
  shareUrl: "/p/pipetrack-001",
};

const recruitingEmailDrafts: EmailDraft[] = [
  { contactId: "r-01", subject: "Scaling recruiting ops after 28% growth at Hirewell", body: "Hi Sarah,\n\nI noticed Hirewell grew headcount 28% last quarter and has 12 new recruiting coordinator openings this month \u2014 that\u2019s an incredible pace. When teams scale that fast, candidate tracking usually becomes the first bottleneck.\n\nWe built PipeTrack specifically for recruiting firms hitting this kind of inflection point. It gives your team a visual candidate board with automated follow-ups so nothing slips through the cracks. Vertex Staffing cut their time-to-fill by 35% within two months of switching.\n\nWould love to show you a quick demo: vibesell.app/p/pipetrack-001\n\nOpen to a 15-minute call this week?", mode: "builder" },
  { contactId: "r-02", subject: "Managing candidate flow across Kforce\u2019s new markets", body: "Hi James,\n\nCongrats on Kforce\u2019s expansion into 3 new markets this quarter. Scaling recruiting operations across geographies is one of the toughest coordination challenges \u2014 especially when you\u2019re hiring recruiting managers simultaneously.\n\nPipeTrack was designed for exactly this: a centralized candidate board that keeps distributed teams aligned with real-time stage updates and automated follow-up sequences. Teams like yours typically see a 40% reduction in candidate drop-off within the first quarter.\n\nHere\u2019s a quick look at how it works: vibesell.app/p/pipetrack-001\n\nWould a 15-minute walkthrough be useful this week?", mode: "builder" },
  { contactId: "r-03", subject: "Post-Series B recruiting infrastructure at TalentBridge", body: "Hi Priya,\n\nCongrats on the $14M Series B! Doubling a recruiting team by Q3 is an ambitious goal \u2014 and the right tooling makes all the difference when you\u2019re moving that fast.\n\nPipeTrack gives growing recruiting teams a visual candidate board with automated stage-based follow-ups and team-level analytics so you can track time-to-fill and conversion rates as you scale. One team at a similar stage reduced their average hiring cycle by 11 days after switching.\n\nTake a look: vibesell.app/p/pipetrack-001\n\nWorth a quick 15-minute conversation this week?", mode: "builder" },
  { contactId: "r-04", subject: "Handling candidate volume in PeopleFirst\u2019s new healthcare vertical", body: "Hi Marcus,\n\nI saw PeopleFirst Staffing\u2019s web traffic jumped 45% in December after the healthcare staffing launch \u2014 that\u2019s a strong signal. More traffic usually means more candidates to track, and healthcare staffing has notoriously tight timelines.\n\nPipeTrack helps recruiting teams manage high-volume candidate flow with a drag-and-drop board, automated follow-ups triggered by stage changes, and analytics that surface bottlenecks before they become problems.\n\nHere\u2019s a quick overview: vibesell.app/p/pipetrack-001\n\nDo you have 15 minutes this week to chat?", mode: "builder" },
  { contactId: "r-05", subject: "Coordinating hiring after Lever Talent\u2019s CTO change", body: "Hi Amanda,\n\nI noticed Lever Talent Group brought on a new CTO recently and has 8 engineering roles posted in just two weeks. That kind of hiring surge after a leadership change usually needs tight coordination between recruiting and the new executive.\n\nPipeTrack gives your team real-time visibility into every candidate\u2019s stage, automated follow-ups, and analytics that help you report progress to leadership without manually pulling data. It\u2019s built for exactly these high-velocity moments.\n\nCheck it out here: vibesell.app/p/pipetrack-001\n\nWould a 15-minute call be helpful?", mode: "builder" },
  { contactId: "r-06", subject: "Tracking candidate flow after RecruitEdge\u2019s 33% volume increase", body: "Hi David,\n\nRecruitEdge\u2019s placement volume is up 33% quarter-over-quarter and you\u2019ve just opened the Austin office \u2014 that\u2019s serious momentum. At that growth rate, most teams find their existing tracking tools start to crack.\n\nPipeTrack is designed for this exact moment: a visual candidate board that scales with your team, automated follow-up sequences, and conversion analytics that help you spot drop-off points. Teams at your stage typically see a 25% improvement in recruiter productivity within 60 days.\n\nHere\u2019s a quick look: vibesell.app/p/pipetrack-001\n\nDo you have 15 minutes to explore whether this fits?", mode: "builder" },
  { contactId: "r-07", subject: "Replacing your legacy ATS at NorthStar Recruiting", body: "Hi Rachel,\n\nI heard NorthStar is moving away from your legacy ATS and evaluating modern candidate tracking tools \u2014 great timing. Most teams making that switch are looking for something that\u2019s faster to set up and easier for recruiters to actually use.\n\nPipeTrack takes a different approach: a visual drag-and-drop board instead of clunky forms, automated follow-ups that trigger on stage changes, and team analytics built in from day one. Migration typically takes under a week.\n\nSee it in action: vibesell.app/p/pipetrack-001\n\nWould 15 minutes this week work to walk through how it compares to what you\u2019re evaluating?", mode: "builder" },
  { contactId: "r-08", subject: "Scaling RPO operations at Apex Talent Solutions", body: "Hi Kevin,\n\nApex Talent\u2019s 52% year-over-year revenue growth is impressive, especially with the RPO division scaling up. RPO engagements demand tight candidate tracking across multiple client accounts \u2014 and that gets complicated fast.\n\nPipeTrack lets you manage candidate boards per engagement with automated follow-ups and client-ready analytics showing time-to-fill and conversion rates. Several RPO teams use it to run 10+ concurrent searches without losing track of a single candidate.\n\nTake a look: vibesell.app/p/pipetrack-001\n\nOpen to a 15-minute call to see if it fits your workflow?", mode: "builder" },
  { contactId: "r-09", subject: "Managing candidate volume after StaffConnect\u2019s enterprise expansion", body: "Hi Lisa,\n\nAdding 67 new enterprise clients in Q4 with hiring velocity doubling \u2014 StaffConnect is clearly in a high-growth phase. At that scale, the gap between a good candidate experience and a messy one usually comes down to how well your tracking system handles volume.\n\nPipeTrack was built for recruiting firms operating at this pace. Visual candidate boards with automated stage-based follow-ups mean your team spends less time on admin and more time placing candidates. Our analytics also help you prove ROI to those new enterprise clients.\n\nSee how it works: vibesell.app/p/pipetrack-001\n\nWorth 15 minutes to discuss?", mode: "builder" },
  { contactId: "r-10", subject: "Building the right stack for ClearPath\u2019s new contract division", body: "Hi Brian,\n\nI saw ClearPath HR just launched a contract staffing division and is hiring 5 senior recruiters. Starting a new division is the perfect time to set up the right tools from day one rather than retrofitting later.\n\nPipeTrack gives new teams a visual candidate board with automated follow-ups and conversion analytics from the start. It takes about 30 minutes to set up and your new recruiters can be productive on day one.\n\nHere\u2019s a quick overview: vibesell.app/p/pipetrack-001\n\nDo you have 15 minutes this week for a quick walkthrough?", mode: "builder" },
  { contactId: "r-11", subject: "Post-Series A tooling decisions at SkillBridge", body: "Hi Natasha,\n\nCongrats on the $9M Series A! Expanding a talent marketplace product means your internal recruiting needs are about to accelerate too. Getting the right candidate tracking in place now saves a lot of pain at the next stage of growth.\n\nPipeTrack offers a visual board with automated follow-ups and team analytics \u2014 it\u2019s designed for fast-moving teams that can\u2019t afford to lose candidates to slow processes. Teams post-funding typically cut their time-to-fill by 20% within the first quarter.\n\nCheck it out: vibesell.app/p/pipetrack-001\n\nWould a quick 15-minute demo be helpful?", mode: "builder" },
  { contactId: "r-12", subject: "Supporting Vantage Staffing\u2019s shift to tech recruiting", body: "Hi Carlos,\n\nI noticed Vantage Staffing\u2019s new CEO is steering the company toward tech staffing \u2014 that\u2019s a significant strategic pivot. Tech candidates move fast, and the tracking tools that worked for other verticals often don\u2019t keep up.\n\nPipeTrack was built for high-velocity recruiting. Visual candidate boards, automated follow-ups triggered by stage changes, and analytics that show exactly where candidates drop off. It\u2019s particularly popular with teams transitioning into tech staffing.\n\nHere\u2019s a look: vibesell.app/p/pipetrack-001\n\nWorth a 15-minute conversation about how it fits your new direction?", mode: "builder" },
  { contactId: "r-13", subject: "Tracking candidates through TalentForge\u2019s growth spike", body: "Hi Emily,\n\nTalentForge went from 4 open roles to 19 in a single month \u2014 that\u2019s nearly a 5x jump. When hiring accelerates that fast, candidate tracking is usually the first thing that breaks.\n\nPipeTrack handles exactly this scenario: a visual board that scales with your volume, automated follow-ups so no candidate gets ghosted, and real-time analytics showing time-to-fill and conversion by stage. It\u2019s designed for teams experiencing growth spikes.\n\nSee it here: vibesell.app/p/pipetrack-001\n\nDo you have 15 minutes to explore whether it fits?", mode: "builder" },
  { contactId: "r-14", subject: "Scaling recruiter capacity for PrimeHire\u2019s government contract", body: "Hi Jason,\n\nCongrats on the $3.2M government staffing contract! Government engagements come with strict compliance and reporting requirements \u2014 which makes reliable candidate tracking even more critical.\n\nPipeTrack gives your team a visual board with automated follow-ups and detailed analytics that make compliance reporting straightforward. Several staffing firms use it for government contracts because the audit trail is built in.\n\nTake a look: vibesell.app/p/pipetrack-001\n\nWould 15 minutes this week work to discuss how it handles government staffing workflows?", mode: "builder" },
  { contactId: "r-15", subject: "Managing financial services recruiting at Horizon Talent", body: "Hi Danielle,\n\nHorizon Talent\u2019s LinkedIn job posts surging 78% in Q1 is a clear growth signal, and expanding into financial services staffing adds a new layer of complexity. FinServ candidates tend to have longer hiring cycles with more stakeholders involved.\n\nPipeTrack\u2019s visual candidate board handles multi-stage processes well, with automated follow-ups that keep candidates engaged through longer cycles. The team analytics help you track conversion rates by vertical so you can optimize as you ramp up financial services.\n\nHere\u2019s an overview: vibesell.app/p/pipetrack-001\n\nOpen to a 15-minute call?", mode: "builder" },
  { contactId: "r-16", subject: "Setting up the Denver office with the right tools at BlueSky", body: "Hi Andrew,\n\nOpening the Denver office and adding 15 people in Q4 \u2014 that\u2019s solid growth for BlueSky Recruiting. Getting a new office aligned on the same candidate tracking workflow as HQ is one of those things that pays dividends early.\n\nPipeTrack gives distributed teams a single visual board with real-time updates, automated follow-ups, and analytics that let you compare performance across locations. It takes under an hour to onboard a new office.\n\nCheck it out: vibesell.app/p/pipetrack-001\n\nWould a 15-minute walkthrough be useful?", mode: "builder" },
  { contactId: "r-17", subject: "Converting inbound candidates at WorkBridge Solutions", body: "Hi Sofia,\n\nA 41% spike in inbound candidate applications is great \u2014 but only if your team can process them efficiently. After a branding campaign drives that kind of volume, the bottleneck usually shifts to candidate tracking and follow-up speed.\n\nPipeTrack automates follow-ups based on candidate stage changes, so your team responds faster without manual work. The visual board makes it easy to see where every candidate stands, and the analytics show exactly where conversion drops off.\n\nSee how it works: vibesell.app/p/pipetrack-001\n\nDo you have 15 minutes this week?", mode: "builder" },
  { contactId: "r-18", subject: "Supporting TalentNest\u2019s engineering hiring surge", body: "Hi Ryan,\n\nA new VP of Engineering plus 6 senior engineering roles posted in two weeks \u2014 TalentNest is clearly in build mode. Engineering hires are notoriously hard to track because of the technical screening stages and multiple interviewers.\n\nPipeTrack handles complex multi-stage processes with a visual board, automated follow-ups at each stage transition, and analytics that show you where engineering candidates get stuck. It helps People Ops give the new VP clear data on hiring progress.\n\nTake a look: vibesell.app/p/pipetrack-001\n\nWorth a 15-minute chat?", mode: "builder" },
  { contactId: "r-19", subject: "Capitalizing on StaffLogic\u2019s traffic surge", body: "Hi Megan,\n\nStaffLogic\u2019s website traffic jumping 62% month-over-month after the job board partnership is a strong signal \u2014 more eyeballs mean more candidates entering your funnel. The question is whether your current tracking can handle the increased volume without candidates falling through.\n\nPipeTrack scales seamlessly with volume. Automated follow-ups keep candidates engaged, the visual board prevents bottlenecks, and conversion analytics help you measure the ROI of that partnership.\n\nHere\u2019s how it works: vibesell.app/p/pipetrack-001\n\nOpen to 15 minutes this week?", mode: "builder" },
  { contactId: "r-20", subject: "Consolidating your recruiting stack at RapidHire", body: "Hi Chris,\n\nI heard RapidHire is consolidating 4 recruiting tools into one platform \u2014 that\u2019s a smart move at your scale. Running 490 people across fragmented tools creates data silos and makes it impossible to get a unified view of candidate flow.\n\nPipeTrack was built to be the single tool recruiting teams actually need: visual candidate boards, automated follow-ups, and team analytics in one place. Teams consolidating typically save 8+ hours per recruiter per week on tool-switching alone.\n\nSee if it fits: vibesell.app/p/pipetrack-001\n\nWould 15 minutes work to walk through how it replaces your current stack?", mode: "builder" },
];

// ─── BUILDER: SALES ─────────────────────────────────────────────────────────

const salesTargeting: Targeting = {
  industries: ["B2B SaaS"],
  companySize: { min: 200, max: 2000 },
  titles: [
    "VP Sales",
    "Head of Revenue",
    "Sales Director",
    "CRO",
    "Director of Business Development",
  ],
  regions: ["United States", "United Kingdom"],
  summary:
    "B2B SaaS companies, 200\u20132,000 employees, led by VPs of Sales and Heads of Revenue in the US and UK",
};

const salesContacts: Contact[] = [
  { id: "s-01", name: "Daniel Voss", firstName: "Daniel", title: "VP Sales", company: "SignalStack", companySize: 420, industry: "B2B SaaS", matchReason: "SignalStack closed a $38M Series C last month and immediately posted 9 account executive roles", relevance: "strong", linkedinUrl: "https://linkedin.com/in/daniel-voss" },
  { id: "s-02", name: "Catherine Blake", firstName: "Catherine", title: "Head of Revenue", company: "CloudReach", companySize: 680, industry: "B2B SaaS", matchReason: "CloudReach promoted their VP Sales to CRO in January and is restructuring the entire go-to-market org", relevance: "strong", linkedinUrl: "https://linkedin.com/in/catherine-blake" },
  { id: "s-03", name: "Michael Reeves", firstName: "Michael", title: "CRO", company: "RevOps Engine", companySize: 310, industry: "B2B SaaS", matchReason: "RevOps Engine hit $25M ARR last quarter and their sales team grew from 18 to 31 reps in 90 days", relevance: "strong", linkedinUrl: "https://linkedin.com/in/michael-reeves" },
  { id: "s-04", name: "Jessica Tran", firstName: "Jessica", title: "Sales Director", company: "DataPulse", companySize: 540, industry: "B2B SaaS", matchReason: "DataPulse\u2019s website traffic jumped 55% after their Product Hunt launch and their sales team is scrambling to handle inbound", relevance: "strong", linkedinUrl: "https://linkedin.com/in/jessica-tran" },
  { id: "s-05", name: "Robert Ashworth", firstName: "Robert", title: "VP Sales", company: "SyncGrid", companySize: 870, industry: "B2B SaaS", matchReason: "SyncGrid opened a London office this quarter and is hiring 7 enterprise AEs for the EMEA market", relevance: "strong", linkedinUrl: "https://linkedin.com/in/robert-ashworth" },
  { id: "s-06", name: "Hannah Mueller", firstName: "Hannah", title: "Director of Business Development", company: "FlowMetrics", companySize: 245, industry: "B2B SaaS", matchReason: "FlowMetrics raised a $12M Series B three weeks ago with stated plans to triple their outbound sales motion", relevance: "strong", linkedinUrl: "https://linkedin.com/in/hannah-mueller" },
  { id: "s-07", name: "Patrick Donovan", firstName: "Patrick", title: "Head of Revenue", company: "BrightLoop", companySize: 390, industry: "B2B SaaS", matchReason: "BrightLoop\u2019s new CEO joined from Gong in December and announced a company-wide shift to product-led sales", relevance: "strong", linkedinUrl: "https://linkedin.com/in/patrick-donovan" },
  { id: "s-08", name: "Stephanie Yuen", firstName: "Stephanie", title: "CRO", company: "Launchpad AI", companySize: 1200, industry: "B2B SaaS", matchReason: "Launchpad AI crossed $50M ARR in Q4 and their sales hiring velocity is at 15 new reps per month", relevance: "strong", linkedinUrl: "https://linkedin.com/in/stephanie-yuen" },
  { id: "s-09", name: "Thomas Richter", firstName: "Thomas", title: "VP Sales", company: "FieldEdge Pro", companySize: 475, industry: "B2B SaaS", matchReason: "FieldEdge Pro replaced their entire sales tech stack in January and is actively evaluating new prospecting tools", relevance: "strong", linkedinUrl: "https://linkedin.com/in/thomas-richter" },
  { id: "s-10", name: "Olivia Grant", firstName: "Olivia", title: "Sales Director", company: "NexGen Analytics", companySize: 350, industry: "B2B SaaS", matchReason: "NexGen Analytics saw a 48% increase in demo requests last quarter but their lead-to-close rate dropped 12 points", relevance: "strong", linkedinUrl: "https://linkedin.com/in/olivia-grant" },
  { id: "s-11", name: "William Hartley", firstName: "William", title: "Director of Business Development", company: "ScaleOps", companySize: 590, industry: "B2B SaaS", matchReason: "ScaleOps hired 4 new SDR managers in the past month and their outbound team doubled since Q3", relevance: "good", linkedinUrl: "https://linkedin.com/in/william-hartley" },
  { id: "s-12", name: "Aisha Rahman", firstName: "Aisha", title: "Head of Revenue", company: "TrueSignal", companySize: 280, industry: "B2B SaaS", matchReason: "TrueSignal just signed a strategic partnership with Snowflake and is ramping a co-sell motion with 6 new sales hires", relevance: "strong", linkedinUrl: "https://linkedin.com/in/aisha-rahman" },
  { id: "s-13", name: "George Callahan", firstName: "George", title: "VP Sales", company: "PivotCRM", companySize: 715, industry: "B2B SaaS", matchReason: "PivotCRM\u2019s latest earnings call revealed 29% QoQ bookings growth and plans to expand into mid-market segments", relevance: "good", linkedinUrl: "https://linkedin.com/in/george-callahan" },
  { id: "s-14", name: "Maria Santos", firstName: "Maria", title: "CRO", company: "Beacon Data", companySize: 960, industry: "B2B SaaS", matchReason: "Beacon Data acquired a sales intelligence startup last month and is integrating 40 new sales reps from the acquisition", relevance: "strong", linkedinUrl: "https://linkedin.com/in/maria-santos" },
  { id: "s-15", name: "Alexander Webb", firstName: "Alexander", title: "Sales Director", company: "LoopStack", companySize: 205, industry: "B2B SaaS", matchReason: "LoopStack\u2019s VP Sales departed two weeks ago and they\u2019re running an interim leadership structure while searching for a replacement", relevance: "good", linkedinUrl: "https://linkedin.com/in/alexander-webb" },
  { id: "s-16", name: "Fatima Al-Rashid", firstName: "Fatima", title: "Head of Revenue", company: "ConvergeTech", companySize: 440, industry: "B2B SaaS", matchReason: "ConvergeTech launched a new enterprise tier in January and is hiring 8 enterprise sales reps to support the upmarket push", relevance: "strong", linkedinUrl: "https://linkedin.com/in/fatima-al-rashid" },
  { id: "s-17", name: "Nathan Cross", firstName: "Nathan", title: "VP Sales", company: "Uplift Systems", companySize: 1500, industry: "B2B SaaS", matchReason: "Uplift Systems reported a 63% increase in web traffic after a Super Bowl mention and their inbound sales team is overwhelmed", relevance: "strong", linkedinUrl: "https://linkedin.com/in/nathan-cross" },
  { id: "s-18", name: "Elena Petrova", firstName: "Elena", title: "Director of Business Development", company: "ClearMetrics", companySize: 330, industry: "B2B SaaS", matchReason: "ClearMetrics expanded their SDR team from 8 to 22 people this quarter and is investing heavily in outbound tooling", relevance: "strong", linkedinUrl: "https://linkedin.com/in/elena-petrova" },
  { id: "s-19", name: "Simon Leclerc", firstName: "Simon", title: "CRO", company: "VelocityIQ", companySize: 825, industry: "B2B SaaS", matchReason: "VelocityIQ opened offices in Manchester and Dublin this quarter as part of a broader UK and Ireland expansion", relevance: "good", linkedinUrl: "https://linkedin.com/in/simon-leclerc" },
  { id: "s-20", name: "Christine Delgado", firstName: "Christine", title: "Sales Director", company: "StackLayer", companySize: 260, industry: "B2B SaaS", matchReason: "StackLayer\u2019s recent G2 reviews mention frustration with their current prospecting tools and their sales ops team posted a vendor comparison project", relevance: "strong", linkedinUrl: "https://linkedin.com/in/christine-delgado" },
];

const salesProductPage: ProductPage = {
  name: "ProspectFlow",
  tagline: "AI-powered sales intelligence for B2B teams",
  features: [
    "Automated lead scoring based on real-time signals",
    "Company tracking with funding and growth alerts",
    "Personalized email sequences with A/B testing",
  ],
  shareUrl: "/p/prospectflow-001",
};

const salesEmailDrafts: EmailDraft[] = [
  { contactId: "s-01", subject: "Turning SignalStack\u2019s Series C momentum into revenue", body: "Hi Daniel,\n\nCongrats on the $38M Series C \u2014 and those 9 new AE openings show you\u2019re wasting no time putting the capital to work. The challenge now is making sure each new rep has the right customers to call from day one.\n\nProspectFlow uses real-time signals like funding events, hiring velocity, and web traffic to automatically score and surface the highest-value leads for your team. It\u2019s how B2B teams turn headcount investment into booked revenue faster.\n\nSee how it works: vibesell.app/p/prospectflow-001\n\nWorth a 15-minute conversation?", mode: "builder" },
  { contactId: "s-02", subject: "Supporting CloudReach\u2019s GTM restructure", body: "Hi Catherine,\n\nRestructuring the go-to-market org after a CRO promotion is a great opportunity to rethink how your team finds and prioritizes customers. New leadership structures need new tooling to match.\n\nProspectFlow gives revenue teams real-time company tracking with funding and growth alerts, automated lead scoring, and personalized outreach sequences. It\u2019s built for teams going through exactly this kind of GTM evolution.\n\nTake a look: vibesell.app/p/prospectflow-001\n\nDo you have 15 minutes this week?", mode: "builder" },
  { contactId: "s-03", subject: "Keeping up with RevOps Engine\u2019s sales growth", body: "Hi Michael,\n\nHitting $25M ARR and nearly doubling the sales team in 90 days is exceptional. At that pace, the biggest risk is new reps spending weeks figuring out who to target instead of closing deals.\n\nProspectFlow solves this with automated lead scoring based on real-time signals \u2014 your new reps get a prioritized list of high-intent companies from day one. Teams scaling as fast as RevOps Engine typically see 30% faster ramp time.\n\nHere\u2019s a demo: vibesell.app/p/prospectflow-001\n\nOpen to a quick 15-minute call?", mode: "builder" },
  { contactId: "s-04", subject: "Converting DataPulse\u2019s inbound surge into closed deals", body: "Hi Jessica,\n\nA 55% traffic spike after Product Hunt is exciting, but it creates a classic problem: too many leads, not enough signal on which ones are actually ready to buy. Your sales team shouldn\u2019t have to guess.\n\nProspectFlow scores inbound leads in real time using company signals like growth rate, tech stack, and hiring patterns. It helps your team focus on the 20% of leads that drive 80% of revenue.\n\nSee it in action: vibesell.app/p/prospectflow-001\n\nWorth 15 minutes to discuss?", mode: "builder" },
  { contactId: "s-05", subject: "Ramping EMEA sales at SyncGrid", body: "Hi Robert,\n\nOpening the London office and hiring 7 enterprise AEs for EMEA is a major move. New market entry is hardest when reps don\u2019t have local market intelligence to work with.\n\nProspectFlow provides real-time company tracking with regional filters, so your EMEA team gets the same quality of lead intelligence your US team relies on. Funding alerts, growth signals, and automated scoring work across markets.\n\nTake a look: vibesell.app/p/prospectflow-001\n\nDo you have 15 minutes to discuss your EMEA launch?", mode: "builder" },
  { contactId: "s-06", subject: "Tripling outbound at FlowMetrics post-Series B", body: "Hi Hannah,\n\nTripling the outbound motion after a $12M raise is ambitious \u2014 and it only works if your team is reaching out to the right companies. More outbound volume without better targeting just means more noise.\n\nProspectFlow uses real-time signals to identify which companies are most likely to buy right now, then helps your team send personalized sequences with built-in A/B testing. It\u2019s how post-funding teams scale outbound without sacrificing quality.\n\nHere\u2019s how it works: vibesell.app/p/prospectflow-001\n\nOpen to 15 minutes this week?", mode: "builder" },
  { contactId: "s-07", subject: "Sales intelligence for BrightLoop\u2019s product-led pivot", body: "Hi Patrick,\n\nA company-wide shift to product-led sales under new leadership from Gong is a bold move. The challenge with PLS is identifying which free users have the buying signals that warrant a sales touch.\n\nProspectFlow tracks company-level signals like funding, headcount growth, and tech adoption to help your sales team focus on the product users most likely to convert to enterprise deals. It bridges the gap between product usage and sales outreach.\n\nCheck it out: vibesell.app/p/prospectflow-001\n\nWorth a 15-minute conversation about how it fits the PLS model?", mode: "builder" },
  { contactId: "s-08", subject: "Maintaining quality at Launchpad AI\u2019s hiring pace", body: "Hi Stephanie,\n\nHiring 15 new reps per month at $50M+ ARR is serious scale. The risk at that velocity is that new reps default to spray-and-pray outbound because they don\u2019t know which accounts to prioritize.\n\nProspectFlow\u2019s automated lead scoring gives every new rep a curated list of high-signal accounts from their first week. Company tracking with real-time alerts means they\u2019re always working the freshest opportunities.\n\nSee the product: vibesell.app/p/prospectflow-001\n\nDo you have 15 minutes to explore whether it helps with onboarding at your scale?", mode: "builder" },
  { contactId: "s-09", subject: "Evaluating prospecting tools at FieldEdge Pro", body: "Hi Thomas,\n\nI heard FieldEdge Pro is replacing the entire sales tech stack \u2014 that\u2019s a rare opportunity to get it right from the ground up. Most teams regret locking into a prospecting tool before understanding what signals actually drive their conversions.\n\nProspectFlow is different because it scores leads based on real-time company signals, not just firmographics. Funding events, hiring velocity, web traffic changes \u2014 the things that actually predict buying intent.\n\nHere\u2019s an overview: vibesell.app/p/prospectflow-001\n\nWould 15 minutes work to include us in your evaluation?", mode: "builder" },
  { contactId: "s-10", subject: "Fixing NexGen\u2019s lead-to-close drop-off", body: "Hi Olivia,\n\nA 48% increase in demo requests with a 12-point drop in close rate tells a clear story: your team is spending time on leads that look good on paper but aren\u2019t actually ready to buy. That\u2019s a prioritization problem.\n\nProspectFlow scores leads using real-time buying signals so your team focuses on the companies with the highest intent. Teams with similar conversion challenges typically see close rates recover within one quarter.\n\nTake a look: vibesell.app/p/prospectflow-001\n\nOpen to a 15-minute call to dig into this?", mode: "builder" },
  { contactId: "s-11", subject: "Arming ScaleOps\u2019 growing SDR team with better data", body: "Hi William,\n\nGoing from 8 to 22 SDRs this quarter is a significant investment. The difference between a productive SDR team and an expensive one often comes down to the quality of data they\u2019re working with.\n\nProspectFlow gives SDRs real-time company signals so they can personalize outreach with relevant triggers like funding rounds, leadership changes, and growth milestones. It\u2019s the difference between cold outreach and warm, signal-driven conversations.\n\nSee how it works: vibesell.app/p/prospectflow-001\n\nDo you have 15 minutes?", mode: "builder" },
  { contactId: "s-12", subject: "Powering TrueSignal\u2019s Snowflake co-sell motion", body: "Hi Aisha,\n\nA co-sell partnership with Snowflake is a huge channel opportunity \u2014 but identifying the right joint accounts to pursue together requires real-time data on which Snowflake customers are growing and buying complementary tools.\n\nProspectFlow tracks company signals across your partner ecosystem so you can identify the highest-potential co-sell accounts automatically. Automated alerts ensure your 6 new sales hires are always working the best opportunities.\n\nCheck it out: vibesell.app/p/prospectflow-001\n\nWorth 15 minutes to discuss?", mode: "builder" },
  { contactId: "s-13", subject: "Expanding into mid-market at PivotCRM", body: "Hi George,\n\nMoving into mid-market after 29% QoQ bookings growth in enterprise is a classic expansion play. The challenge is that mid-market selling requires higher volume and faster cycles \u2014 your team needs different signals than enterprise.\n\nProspectFlow\u2019s automated scoring adjusts for segment-specific buying signals so your mid-market reps focus on companies showing growth patterns that match your ideal customer. It\u2019s built for multi-segment sales teams.\n\nHere\u2019s a quick look: vibesell.app/p/prospectflow-001\n\nOpen to a 15-minute chat?", mode: "builder" },
  { contactId: "s-14", subject: "Integrating Beacon Data\u2019s post-acquisition sales team", body: "Hi Maria,\n\nIntegrating 40 new sales reps from an acquisition is one of the hardest operational challenges in SaaS. Getting everyone on the same targeting criteria and lead scoring methodology is critical to preventing chaos.\n\nProspectFlow provides a unified lead scoring system based on real-time signals that both legacy and acquired teams can rally around. It gives every rep the same prioritized view regardless of which org they came from.\n\nSee the product: vibesell.app/p/prospectflow-001\n\nWould 15 minutes work to discuss the integration use case?", mode: "builder" },
  { contactId: "s-15", subject: "Navigating LoopStack\u2019s leadership transition", body: "Hi Alexander,\n\nLeadership transitions are tough, especially when the VP Sales role is open and the team is running on interim structure. This is actually a great time to evaluate tools \u2014 a new VP will want to see that the foundation is solid.\n\nProspectFlow\u2019s automated lead scoring and company tracking can run independently of leadership changes, giving your team consistent direction even during transitions. It\u2019s one less thing for the new VP to fix when they arrive.\n\nHere\u2019s an overview: vibesell.app/p/prospectflow-001\n\nDo you have 15 minutes?", mode: "builder" },
  { contactId: "s-16", subject: "Filling ConvergeTech\u2019s enterprise sales seats", body: "Hi Fatima,\n\nLaunching an enterprise tier and hiring 8 enterprise reps is a big bet. Enterprise selling lives and dies on account intelligence \u2014 your new reps need deep company signals to have credible conversations with C-suite buyers.\n\nProspectFlow provides real-time tracking of funding events, leadership changes, and growth milestones for every target account. It\u2019s how enterprise reps walk into meetings already knowing what matters to the buyer.\n\nTake a look: vibesell.app/p/prospectflow-001\n\nWorth a 15-minute call?", mode: "builder" },
  { contactId: "s-17", subject: "Handling Uplift Systems\u2019 inbound explosion", body: "Hi Nathan,\n\nA 63% traffic spike from a Super Bowl mention is incredible exposure, but your inbound team being overwhelmed means high-value leads are probably getting the same treatment as tire-kickers. That\u2019s expensive.\n\nProspectFlow scores every inbound lead in real time using company signals so your team knows exactly who to call first. When volume is this high, automated prioritization is the only way to capture the full value.\n\nSee how it works: vibesell.app/p/prospectflow-001\n\nDo you have 15 minutes to discuss your inbound triage?", mode: "builder" },
  { contactId: "s-18", subject: "Equipping ClearMetrics\u2019 expanded outbound team", body: "Hi Elena,\n\nGoing from 8 to 22 SDRs and investing heavily in outbound tooling tells me ClearMetrics is serious about building a scalable outbound engine. The tool choices you make now will define productivity for the next 18 months.\n\nProspectFlow combines real-time company signals with personalized email sequences and A/B testing in one platform. It\u2019s designed for outbound-heavy teams that want quality and volume.\n\nCheck it out: vibesell.app/p/prospectflow-001\n\nOpen to 15 minutes to compare it to what you\u2019re evaluating?", mode: "builder" },
  { contactId: "s-19", subject: "Sales intelligence for VelocityIQ\u2019s UK expansion", body: "Hi Simon,\n\nOpening Manchester and Dublin offices is a clear signal that VelocityIQ is going all-in on the UK and Ireland market. New market entry with a distributed sales team requires consistent lead intelligence across geographies.\n\nProspectFlow provides automated lead scoring and company tracking that works across regions. Your UK reps get the same quality signals as your US team, with local market context.\n\nHere\u2019s a look: vibesell.app/p/prospectflow-001\n\nWould 15 minutes work to discuss the international use case?", mode: "builder" },
  { contactId: "s-20", subject: "Replacing StackLayer\u2019s current prospecting tools", body: "Hi Christine,\n\nI noticed some recent G2 reviews from StackLayer mentioning frustration with your current prospecting setup, and it looks like your sales ops team is running a vendor comparison. That\u2019s a signal I don\u2019t want to ignore.\n\nProspectFlow is built differently \u2014 it scores leads based on real-time company signals rather than static firmographic data, and the email sequences include native A/B testing. Happy to show you how it compares to whatever else you\u2019re looking at.\n\nSee for yourself: vibesell.app/p/prospectflow-001\n\nOpen to a 15-minute walkthrough?", mode: "builder" },
];

// ─── BUILDER: INVESTOR ──────────────────────────────────────────────────────

const investorTargeting: Targeting = {
  industries: ["Venture Capital", "Private Equity", "Growth Equity"],
  companySize: { min: 10, max: 200 },
  titles: ["Partner", "Principal", "Associate", "Managing Director"],
  regions: ["United States", "Europe"],
  summary:
    "VC and PE firms, 10\u2013200 employees, led by Partners and Principals in the US and Europe",
};

const investorContacts: Contact[] = [
  { id: "i-01", name: "Jonathan Mercer", firstName: "Jonathan", title: "Partner", company: "Northstar Ventures", companySize: 45, industry: "Venture Capital", matchReason: "Northstar Ventures closed a $220M Fund III in December and is actively deploying into B2B SaaS", relevance: "strong", linkedinUrl: "https://linkedin.com/in/jonathan-mercer" },
  { id: "i-02", name: "Laura Hsu", firstName: "Laura", title: "Principal", company: "Ironwood Capital", companySize: 32, industry: "Private Equity", matchReason: "Ironwood Capital exited two portfolio companies last quarter at a combined $340M valuation and is re-deploying capital", relevance: "strong", linkedinUrl: "https://linkedin.com/in/laura-hsu" },
  { id: "i-03", name: "Sebastian Engel", firstName: "Sebastian", title: "Managing Director", company: "Summit Bridge Capital", companySize: 78, industry: "Growth Equity", matchReason: "Summit Bridge Capital hired 3 new associates in January and shifted sector focus to include fintech and healthtech", relevance: "strong", linkedinUrl: "https://linkedin.com/in/sebastian-engel" },
  { id: "i-04", name: "Victoria Thornton", firstName: "Victoria", title: "Partner", company: "Cascade Equity Partners", companySize: 55, industry: "Private Equity", matchReason: "Cascade Equity promoted two VPs to Partner last month and announced a $180M growth fund focused on vertical SaaS", relevance: "strong", linkedinUrl: "https://linkedin.com/in/victoria-thornton" },
  { id: "i-05", name: "Andrew Byrne", firstName: "Andrew", title: "Principal", company: "Ridgeline Ventures", companySize: 28, industry: "Venture Capital", matchReason: "Ridgeline Ventures opened a Berlin office this quarter to expand their European deal sourcing capabilities", relevance: "strong", linkedinUrl: "https://linkedin.com/in/andrew-byrne" },
  { id: "i-06", name: "Sophia Chang", firstName: "Sophia", title: "Associate", company: "Ember Growth", companySize: 18, industry: "Growth Equity", matchReason: "Ember Growth\u2019s latest portfolio company just hit $100M ARR, validating their growth-stage thesis and freeing capital for new investments", relevance: "good", linkedinUrl: "https://linkedin.com/in/sophia-chang" },
  { id: "i-07", name: "Richard Alvarez", firstName: "Richard", title: "Managing Director", company: "Pinnacle Partners", companySize: 92, industry: "Private Equity", matchReason: "Pinnacle Partners raised $450M for Fund V last quarter and is actively sourcing Series B and C companies", relevance: "strong", linkedinUrl: "https://linkedin.com/in/richard-alvarez" },
  { id: "i-08", name: "Natalie Dubois", firstName: "Natalie", title: "Partner", company: "Horizon Equity Group", companySize: 40, industry: "Growth Equity", matchReason: "Horizon Equity Group added a dedicated data infrastructure practice after three successful exits in the space", relevance: "strong", linkedinUrl: "https://linkedin.com/in/natalie-dubois" },
  { id: "i-09", name: "Marcus Lindqvist", firstName: "Marcus", title: "Principal", company: "Nordic Bridge Capital", companySize: 22, industry: "Venture Capital", matchReason: "Nordic Bridge Capital closed their first US deal last month and is expanding their deal sourcing to include North American startups", relevance: "good", linkedinUrl: "https://linkedin.com/in/marcus-lindqvist" },
  { id: "i-10", name: "Diana Crawford", firstName: "Diana", title: "Partner", company: "Elevation Capital Group", companySize: 65, industry: "Venture Capital", matchReason: "Elevation Capital Group led 4 Series A rounds in Q4 totaling $82M and posted 2 new investor relations roles this month", relevance: "strong", linkedinUrl: "https://linkedin.com/in/diana-crawford" },
  { id: "i-11", name: "Tomasz Kowalski", firstName: "Tomasz", title: "Associate", company: "Vanguard Growth Partners", companySize: 35, industry: "Growth Equity", matchReason: "Vanguard Growth Partners shifted their thesis from consumer to B2B enterprise this quarter after two consumer portfolio write-downs", relevance: "good", linkedinUrl: "https://linkedin.com/in/tomasz-kowalski" },
  { id: "i-12", name: "Camille Laurent", firstName: "Camille", title: "Managing Director", company: "Atlas Venture Capital", companySize: 110, industry: "Venture Capital", matchReason: "Atlas Venture Capital opened a Paris office in December and hired a dedicated European deal team of 5 people", relevance: "strong", linkedinUrl: "https://linkedin.com/in/camille-laurent" },
  { id: "i-13", name: "Henry Blackwell", firstName: "Henry", title: "Partner", company: "Granite Point Capital", companySize: 48, industry: "Private Equity", matchReason: "Granite Point Capital completed a $120M secondary sale last month, freeing dry powder for new growth investments", relevance: "strong", linkedinUrl: "https://linkedin.com/in/henry-blackwell" },
  { id: "i-14", name: "Isabelle Fontaine", firstName: "Isabelle", title: "Principal", company: "Meridian Equity", companySize: 58, industry: "Private Equity", matchReason: "Meridian Equity\u2019s new Managing Partner joined from KKR in January and is reshaping the firm\u2019s mid-market strategy", relevance: "strong", linkedinUrl: "https://linkedin.com/in/isabelle-fontaine" },
  { id: "i-15", name: "David Kim", firstName: "David", title: "Associate", company: "Redwood Ventures", companySize: 15, industry: "Venture Capital", matchReason: "Redwood Ventures made 6 seed investments in the last 90 days, their most active quarter ever, focusing on developer tools", relevance: "good", linkedinUrl: "https://linkedin.com/in/david-kim-vc" },
  { id: "i-16", name: "Alexandra Petrov", firstName: "Alexandra", title: "Partner", company: "Ironclad Capital", companySize: 72, industry: "Growth Equity", matchReason: "Ironclad Capital\u2019s two largest portfolio companies filed for IPO in Q4, signaling a potential distribution cycle and fresh deployment", relevance: "strong", linkedinUrl: "https://linkedin.com/in/alexandra-petrov" },
  { id: "i-17", name: "James Whitfield", firstName: "James", title: "Managing Director", company: "Sterling Equity Partners", companySize: 130, industry: "Private Equity", matchReason: "Sterling Equity Partners announced a dedicated $75M co-investment vehicle last month for LP direct participation", relevance: "good", linkedinUrl: "https://linkedin.com/in/james-whitfield" },
  { id: "i-18", name: "Elena Rossi", firstName: "Elena", title: "Principal", company: "Alpine Growth Fund", companySize: 25, industry: "Growth Equity", matchReason: "Alpine Growth Fund expanded their operating partner team by 3 people this quarter, signaling increased portfolio support capacity", relevance: "good", linkedinUrl: "https://linkedin.com/in/elena-rossi" },
  { id: "i-19", name: "Peter Magnusson", firstName: "Peter", title: "Partner", company: "Catalyst Equity Group", companySize: 88, industry: "Private Equity", matchReason: "Catalyst Equity Group opened a Munich office this quarter and hired a European head of deal origination", relevance: "strong", linkedinUrl: "https://linkedin.com/in/peter-magnusson" },
  { id: "i-20", name: "Michelle Tanaka", firstName: "Michelle", title: "Associate", company: "Sequoia Ridge Partners", companySize: 42, industry: "Venture Capital", matchReason: "Sequoia Ridge Partners launched a dedicated climate tech fund of $95M and is sourcing their first 10 investments", relevance: "good", linkedinUrl: "https://linkedin.com/in/michelle-tanaka" },
];

const investorProductPage: ProductPage = {
  name: "DealStream",
  tagline: "Deal flow management for modern investors",
  features: [
    "Customizable deal stages with team collaboration",
    "Automated due diligence checklists and scoring",
    "LP reporting with portfolio analytics",
  ],
  shareUrl: "/p/dealstream-001",
};

const investorEmailDrafts: EmailDraft[] = [
  { contactId: "i-01", subject: "Managing deal flow after Northstar\u2019s $220M Fund III close", body: "Hi Jonathan,\n\nCongrats on closing Fund III at $220M. Deploying into B2B SaaS means your deal volume is about to spike \u2014 the sector is generating more fundable companies than any other category right now.\n\nDealStream helps VC teams manage high-volume deal flow with customizable stages, automated due diligence checklists, and LP reporting built in. It\u2019s designed for teams that are actively deploying and need to move fast without losing rigor.\n\nSee it here: vibesell.app/p/dealstream-001\n\nWorth a 15-minute call to walk through it?", mode: "builder" },
  { contactId: "i-02", subject: "Tracking re-deployment after Ironwood\u2019s $340M exits", body: "Hi Laura,\n\nTwo exits totaling $340M in a single quarter is a remarkable result. The re-deployment phase is when deal flow management matters most \u2014 your team is simultaneously sourcing, diligencing, and closing at peak velocity.\n\nDealStream gives PE teams a unified view of every deal in progress, with automated scoring and collaborative due diligence checklists. LP reporting updates automatically as deals progress through stages.\n\nCheck it out: vibesell.app/p/dealstream-001\n\nDo you have 15 minutes to see how it handles the re-deployment workflow?", mode: "builder" },
  { contactId: "i-03", subject: "Supporting Summit Bridge\u2019s sector expansion", body: "Hi Sebastian,\n\nHiring 3 new associates and expanding into fintech and healthtech is a significant move for Summit Bridge. New sectors mean new deal sources, new evaluation criteria, and more complexity in tracking everything.\n\nDealStream\u2019s customizable deal stages and scoring let you configure separate workflows per sector while keeping a unified portfolio view. The due diligence checklists adapt to sector-specific requirements.\n\nHere\u2019s an overview: vibesell.app/p/dealstream-001\n\nWorth 15 minutes to discuss?", mode: "builder" },
  { contactId: "i-04", subject: "Deal management for Cascade\u2019s new growth fund", body: "Hi Victoria,\n\nCongrats on the Partner promotions and the $180M vertical SaaS growth fund. Launching a new fund with a specific thesis requires tight deal tracking to ensure every investment fits the mandate.\n\nDealStream helps growth equity teams manage deal flow with customizable stages, thesis-aligned scoring, and LP reporting that shows how the portfolio maps to your stated strategy. It\u2019s built for teams launching new vehicles.\n\nSee the product: vibesell.app/p/dealstream-001\n\nOpen to a 15-minute walkthrough?", mode: "builder" },
  { contactId: "i-05", subject: "Sourcing European deals from Ridgeline\u2019s new Berlin office", body: "Hi Andrew,\n\nOpening a Berlin office for European deal sourcing is a smart move \u2014 the European startup ecosystem is producing more Series A-ready companies than ever. But managing deal flow across two continents requires a system that keeps both teams aligned.\n\nDealStream offers real-time deal stage visibility across offices, collaborative due diligence, and unified LP reporting. Your Berlin and US teams can work the same deals without stepping on each other.\n\nTake a look: vibesell.app/p/dealstream-001\n\nDo you have 15 minutes?", mode: "builder" },
  { contactId: "i-06", subject: "Tracking new investments after Ember Growth\u2019s portfolio milestone", body: "Hi Sophia,\n\nA portfolio company hitting $100M ARR is a strong validation of Ember Growth\u2019s thesis. With capital freed up for new investments, having a structured deal flow system becomes critical for maintaining your hit rate.\n\nDealStream helps growth equity teams track every opportunity from sourcing through close, with automated scoring and due diligence checklists. The LP reporting module makes it easy to showcase wins like the $100M ARR milestone.\n\nCheck it out: vibesell.app/p/dealstream-001\n\nWorth a quick 15-minute call?", mode: "builder" },
  { contactId: "i-07", subject: "Managing Fund V deployment at Pinnacle Partners", body: "Hi Richard,\n\nDeploying $450M across Series B and C companies means Pinnacle Partners will be evaluating hundreds of deals over the next 24 months. At that scale, the difference between a great fund and a good one often comes down to deal flow discipline.\n\nDealStream provides customizable deal stages, automated scoring, and collaborative due diligence designed for PE firms deploying large funds. LP reporting updates in real time as your deal flow progresses.\n\nSee how it works: vibesell.app/p/dealstream-001\n\nOpen to 15 minutes?", mode: "builder" },
  { contactId: "i-08", subject: "Deal tracking for Horizon Equity\u2019s data infrastructure practice", body: "Hi Natalie,\n\nLaunching a dedicated data infrastructure practice after three successful exits shows real conviction. Specialized practices need specialized deal tracking \u2014 the evaluation criteria for data infrastructure companies are different from general SaaS.\n\nDealStream lets you create practice-specific deal stages and scoring models while maintaining a unified firm-wide view. Due diligence checklists can be tailored to data infrastructure-specific technical requirements.\n\nHere\u2019s a look: vibesell.app/p/dealstream-001\n\nDo you have 15 minutes to discuss the practice-specific use case?", mode: "builder" },
  { contactId: "i-09", subject: "Scaling Nordic Bridge\u2019s US deal sourcing", body: "Hi Marcus,\n\nClosing your first US deal and expanding sourcing to North America is an exciting milestone for Nordic Bridge. Cross-border deal flow adds complexity \u2014 different legal structures, market dynamics, and time zones all make tracking harder.\n\nDealStream is built for distributed investment teams. Real-time deal stages, collaborative due diligence, and LP reporting that works across your Nordic and US operations.\n\nTake a look: vibesell.app/p/dealstream-001\n\nWorth 15 minutes to walk through the cross-border features?", mode: "builder" },
  { contactId: "i-10", subject: "Tracking Elevation Capital\u2019s Series A velocity", body: "Hi Diana,\n\nFour Series A rounds totaling $82M in a single quarter is impressive deal velocity. At that pace, keeping track of follow-on rights, board seats, and portfolio monitoring becomes a full-time job in itself.\n\nDealStream automates the tracking so your team can focus on picking winners. Customizable stages, automated checklists, and LP reporting that reflects your actual deployment pace.\n\nSee it here: vibesell.app/p/dealstream-001\n\nOpen to a 15-minute call?", mode: "builder" },
  { contactId: "i-11", subject: "Retooling deal flow after Vanguard\u2019s thesis pivot", body: "Hi Tomasz,\n\nShifting from consumer to B2B enterprise is a significant thesis change. New investment criteria, new sourcing channels, new evaluation frameworks \u2014 it\u2019s essentially rebuilding your deal flow process from scratch.\n\nDealStream makes thesis pivots manageable with fully customizable deal stages, scoring models, and due diligence templates. You can set up a B2B enterprise workflow in under an hour.\n\nHere\u2019s how it works: vibesell.app/p/dealstream-001\n\nDo you have 15 minutes to explore it?", mode: "builder" },
  { contactId: "i-12", subject: "Managing European deal flow at Atlas Venture Capital", body: "Hi Camille,\n\nOpening the Paris office with a dedicated 5-person European deal team is a major commitment. Coordinating deal flow across your existing team and the new Paris office requires a system both sides can trust.\n\nDealStream provides real-time visibility across offices with customizable stages, collaborative due diligence, and LP reporting that aggregates global activity. Several multi-office VC firms use it to keep distributed teams aligned.\n\nCheck it out: vibesell.app/p/dealstream-001\n\nWorth 15 minutes to discuss the multi-office setup?", mode: "builder" },
  { contactId: "i-13", subject: "Deploying Granite Point\u2019s freed-up capital", body: "Hi Henry,\n\nA $120M secondary sale freeing dry powder for new investments means Granite Point is about to enter an active sourcing phase. Having a clean deal tracking system in place before the volume ramps up makes a real difference.\n\nDealStream helps PE teams manage the full deal lifecycle from sourcing through close, with automated scoring and LP-ready reporting. It\u2019s designed for the moments when deal velocity accelerates.\n\nSee the product: vibesell.app/p/dealstream-001\n\nOpen to a 15-minute walkthrough?", mode: "builder" },
  { contactId: "i-14", subject: "Supporting Meridian Equity\u2019s mid-market strategy refresh", body: "Hi Isabelle,\n\nA new Managing Partner from KKR reshaping the mid-market strategy is a transformative moment for Meridian. New leadership typically wants to see the deal flow process and data from day one.\n\nDealStream gives incoming leaders immediate visibility into every deal in the funnel, with customizable stages that can be reconfigured to match the new strategy. Automated scoring helps align the team around updated investment criteria.\n\nTake a look: vibesell.app/p/dealstream-001\n\nDo you have 15 minutes?", mode: "builder" },
  { contactId: "i-15", subject: "Tracking Redwood\u2019s record seed investment pace", body: "Hi David,\n\nSix seed investments in 90 days is Redwood\u2019s most active quarter ever. At the seed stage, deal volume is high and diligence needs to be fast but thorough \u2014 that\u2019s a hard balance to strike without good tooling.\n\nDealStream is built for high-velocity seed investing. Lightweight deal stages, fast scoring, and automated checklists that help you maintain rigor without slowing down. LP reporting captures your deployment pace in real time.\n\nHere\u2019s how it works: vibesell.app/p/dealstream-001\n\nWorth a quick 15-minute call?", mode: "builder" },
  { contactId: "i-16", subject: "Managing Ironclad\u2019s post-IPO deployment cycle", body: "Hi Alexandra,\n\nTwo portfolio companies filing for IPO in Q4 is a tremendous outcome. The distribution cycle that follows creates a natural window for fresh deployment \u2014 and LPs will expect to see a structured approach to putting new capital to work.\n\nDealStream helps growth equity teams transition from harvest to deployment with customizable stages, collaborative diligence, and LP reporting that tells the full story from exit to re-investment.\n\nSee it here: vibesell.app/p/dealstream-001\n\nOpen to 15 minutes to discuss?", mode: "builder" },
  { contactId: "i-17", subject: "Deal tracking for Sterling\u2019s co-investment vehicle", body: "Hi James,\n\nLaunching a dedicated $75M co-investment vehicle adds a new layer of complexity to your deal process. LPs participating directly need more transparency and more frequent updates than traditional fund structures.\n\nDealStream\u2019s LP reporting module is designed for exactly this scenario. Real-time deal stage visibility, automated updates, and co-investment tracking keep your LPs informed without creating extra work for your team.\n\nCheck it out: vibesell.app/p/dealstream-001\n\nWorth 15 minutes to walk through the co-invest features?", mode: "builder" },
  { contactId: "i-18", subject: "Scaling portfolio support at Alpine Growth Fund", body: "Hi Elena,\n\nAdding 3 operating partners this quarter signals that Alpine is taking portfolio support seriously. The challenge is coordinating deal flow with operating capacity \u2014 you don\u2019t want to close deals faster than your team can support them.\n\nDealStream connects deal tracking with portfolio monitoring so you can see capacity constraints before they become problems. Customizable stages and team collaboration features keep investing and operations aligned.\n\nHere\u2019s a look: vibesell.app/p/dealstream-001\n\nDo you have 15 minutes?", mode: "builder" },
  { contactId: "i-19", subject: "European deal origination at Catalyst Equity Group", body: "Hi Peter,\n\nOpening the Munich office and hiring a European head of deal origination is a strong commitment to the region. Building a European deal flow from scratch requires tools that work across languages, jurisdictions, and team structures.\n\nDealStream supports multi-office deal tracking with customizable stages, automated due diligence checklists that adapt to regional requirements, and LP reporting that aggregates global deal activity.\n\nSee how it works: vibesell.app/p/dealstream-001\n\nOpen to a 15-minute call?", mode: "builder" },
  { contactId: "i-20", subject: "Sourcing Sequoia Ridge\u2019s first climate tech investments", body: "Hi Michelle,\n\nLaunching a $95M climate tech fund and sourcing the first 10 investments is an exciting mandate. Climate tech deals often have unique diligence requirements \u2014 regulatory considerations, technical feasibility assessments, and impact metrics that generic tools don\u2019t handle well.\n\nDealStream\u2019s customizable due diligence checklists let you build climate tech-specific evaluation frameworks. Automated scoring helps your team consistently assess opportunities against your thesis.\n\nCheck it out: vibesell.app/p/dealstream-001\n\nWorth 15 minutes to discuss the climate tech workflow?", mode: "builder" },
];

// ─── SELLER: STRIPE ─────────────────────────────────────────────────────────

const stripePitchPage: PitchPage = {
  targetCompany: "Stripe",
  companyDomain: "stripe.com",
  headline: "How Crustdata Powers Lead Scoring for Stripe",
  subtitle:
    "Real-time company signals \u2014 headcount growth, funding events, hiring velocity \u2014 to score and prioritize every lead in Stripe\u2019s funnel",
  problemPoints: [
    "Stripe processes millions of potential leads across 46 countries \u2014 but without real-time company signals, reps can\u2019t tell which leads are actually in buying mode",
    "Manual lead scoring based on firmographics misses the signals that matter: headcount surges, new funding rounds, leadership changes, and tech stack shifts",
    "With 23 new sales hires in Q4 alone, every rep needs a prioritized lead list from day one \u2014 not weeks of ramp time figuring out who to call",
  ],
  solutionMockups: [
    {
      type: "dashboard",
      title: "Crustdata Lead Scoring \u2014 Stripe View",
      caption: "Every lead enriched with real-time Crustdata signals",
      companyName: "Stripe",
      dataPoints: {
        totalLeads: 2847,
        avgScore: 73,
        topScore: 98,
        conversionRate: "34%",
      },
    },
    {
      type: "table",
      title: "Crustdata Signal Feed",
      caption: "Real-time hiring velocity, funding, and growth signals",
      companyName: "Stripe",
      dataPoints: {
        rows: 12,
        topLead: "Series B Fintech",
        score: 95,
        lastActivity: "2h ago",
      },
    },
    {
      type: "alerts",
      title: "Crustdata Signal Alerts",
      caption: "Automated alerts when leads show buying signals",
      companyName: "Stripe",
      dataPoints: {
        newAlerts: 8,
        topAlert: "Series B fintech, 200 employees, 40% QoQ growth",
        priority: "High",
      },
    },
  ],
  urgencySignals: [
    "Stripe added 23 sales roles in Q4 2025 \u2014 new reps need lead intelligence from day one",
    "Stripe\u2019s enterprise revenue grew 34% YoY but lead-to-close rate dropped 8 points",
    "3 competitors in payments infrastructure already use signal-based lead scoring",
  ],
  ctaText: "Want to see Crustdata signals for your leads? Let\u2019s chat.",
  shareUrl: "/d/stripe-lead-scoring",
};

const stripeContacts: Contact[] = [
  // Decision Makers
  { id: "st-01", name: "Karen Mitchell", firstName: "Karen", title: "VP of Sales", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Sales", roleTag: "decision_maker", matchReason: "Karen has led Stripe\u2019s sales org through 23 new hires in Q4 2025 and is actively restructuring territory assignments", relevance: "strong", linkedinUrl: "https://linkedin.com/in/karen-mitchell" },
  { id: "st-02", name: "Derek Whitman", firstName: "Derek", title: "Head of Revenue Operations", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Revenue Operations", roleTag: "decision_maker", matchReason: "Derek was promoted to Head of RevOps 4 months ago and has been evaluating new sales intelligence vendors since January", relevance: "strong", linkedinUrl: "https://linkedin.com/in/derek-whitman" },
  { id: "st-03", name: "Angela Forrest", firstName: "Angela", title: "CRO", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Revenue", roleTag: "decision_maker", matchReason: "Angela joined as CRO in September 2025 from Datadog and has publicly discussed the need for better lead prioritization at scale", relevance: "strong", linkedinUrl: "https://linkedin.com/in/angela-forrest" },
  // Champions
  { id: "st-04", name: "Ryan Oduya", firstName: "Ryan", title: "Director of Sales Engineering", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Sales Engineering", roleTag: "champion", matchReason: "Ryan\u2019s team expanded from 12 to 19 SEs this quarter to support the growing enterprise sales motion", relevance: "strong", linkedinUrl: "https://linkedin.com/in/ryan-oduya" },
  { id: "st-05", name: "Lisa Chandra", firstName: "Lisa", title: "Senior Manager, Inbound Sales", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Sales", roleTag: "champion", matchReason: "Lisa\u2019s inbound team handles 2,800+ leads monthly and she recently posted about the challenges of manual lead triage on LinkedIn", relevance: "strong", linkedinUrl: "https://linkedin.com/in/lisa-chandra" },
  { id: "st-06", name: "Tomás Herrera", firstName: "Tom\u00e1s", title: "Head of Sales Analytics", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Analytics", roleTag: "champion", matchReason: "Tom\u00e1s presented at a SaaStr session last month on the limitations of rule-based lead scoring at Stripe\u2019s scale", relevance: "strong", linkedinUrl: "https://linkedin.com/in/tomas-herrera" },
  { id: "st-07", name: "Nina Vasquez", firstName: "Nina", title: "Director of Growth", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Growth", roleTag: "champion", matchReason: "Nina\u2019s growth team launched 3 new self-serve conversion experiments in Q4 and is looking for better signal-based targeting", relevance: "good", linkedinUrl: "https://linkedin.com/in/nina-vasquez" },
  // Technical Evaluators
  { id: "st-08", name: "Arun Krishnamurthy", firstName: "Arun", title: "Staff Engineer, Sales Platform", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Engineering", roleTag: "technical_evaluator", matchReason: "Arun\u2019s team owns Stripe\u2019s internal sales tooling and recently posted a job listing for a lead scoring ML engineer", relevance: "strong", linkedinUrl: "https://linkedin.com/in/arun-krishnamurthy" },
  { id: "st-09", name: "Margaret O\u2019Brien", firstName: "Margaret", title: "Director of Data Engineering", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Data Engineering", roleTag: "technical_evaluator", matchReason: "Margaret\u2019s team built Stripe\u2019s internal data warehouse and she\u2019s been exploring third-party signal enrichment vendors", relevance: "strong", linkedinUrl: "https://linkedin.com/in/margaret-obrien" },
  { id: "st-10", name: "Victor Ng", firstName: "Victor", title: "Senior PM, Internal Tools", company: "Stripe", companySize: 8400, industry: "Payments Infrastructure", department: "Product", roleTag: "technical_evaluator", matchReason: "Victor shipped a new internal CRM dashboard in Q4 and is scoping v2 requirements including automated lead scoring", relevance: "strong", linkedinUrl: "https://linkedin.com/in/victor-ng" },
];

const stripeEmailDrafts: EmailDraft[] = [
  { contactId: "st-01", subject: "How Crustdata helps Stripe\u2019s growing sales team prioritize leads", body: "Hi Karen,\n\nWith 23 new hires and territory restructuring underway, getting every rep on the right leads from day one is everything. Crustdata\u2019s real-time lead scoring uses live hiring, funding, and tech-install signals to surface the accounts most likely to convert \u2014 no manual prioritization needed.\n\nI put together a Stripe-specific demo: vibesell.app/d/stripe-lead-scoring\n\nWould love to walk you through it \u2014 15 minutes this week?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "st-02", subject: "Crustdata for Stripe\u2019s RevOps \u2014 built for your evaluation", body: "Hi Derek,\n\nCongrats on the RevOps promotion. As you evaluate vendors, Crustdata is worth a look \u2014 we provide real-time company signals (hiring velocity, funding, tech stack changes) that plug directly into your existing sales workflow to score and route leads automatically.\n\nI built a Stripe-specific demo: vibesell.app/d/stripe-lead-scoring\n\nHappy to do a 15-minute walkthrough whenever works.\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "st-03", subject: "Crustdata\u2019s approach to lead prioritization at Stripe\u2019s scale", body: "Hi Angela,\n\nYour SaaStr comments about lead prioritization challenges resonated \u2014 it\u2019s exactly the problem Crustdata solves. We use real-time company signals like headcount growth and funding events to score leads automatically, replacing the manual process you described wanting to move past.\n\nI built a Stripe-specific demo: vibesell.app/d/stripe-lead-scoring\n\nWorth a 15-minute look?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "st-04", subject: "Crustdata can help your 19 SEs focus on the right deals", body: "Hi Ryan,\n\nGrowing from 12 to 19 SEs is exciting \u2014 but the real leverage is making sure each one is spending time on the highest-value opportunities. Crustdata\u2019s lead scoring uses real-time signals to rank every deal, so your team focuses where it matters most.\n\nI built a demo for your SE team: vibesell.app/d/stripe-lead-scoring\n\nHappy to chat for 15 minutes.\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "st-05", subject: "Crustdata can automate lead triage for your 2,800+ leads/month", body: "Hi Lisa,\n\nYour LinkedIn post about manual lead triage at 2,800+ leads/month hit close to home \u2014 that\u2019s exactly the problem Crustdata solves. Our scoring engine processes leads in real time using live company signals, so your inbound team focuses on the ones most likely to convert.\n\nI built a demo for Stripe\u2019s inbound flow: vibesell.app/d/stripe-lead-scoring\n\nWould 15 minutes work to walk through it?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "st-06", subject: "Crustdata\u2019s signal-driven scoring \u2014 beyond the rules you talked about at SaaStr", body: "Hi Tom\u00e1s,\n\nYour SaaStr talk on the limits of rule-based scoring was excellent. Crustdata takes a different approach \u2014 we use real-time company signals (hiring, funding, tech stack changes) instead of static rules, which directly addresses the pain points you raised.\n\nI built a demo around your team\u2019s use case: vibesell.app/d/stripe-lead-scoring\n\nWould love your feedback \u2014 15 minutes?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "st-07", subject: "Crustdata signals to power Stripe\u2019s self-serve conversion experiments", body: "Hi Nina,\n\nYour team\u2019s Q4 self-serve conversion experiments would get a major boost from better signal-based targeting. Crustdata provides real-time company data \u2014 hiring patterns, tech installs, funding \u2014 so your growth team can target the accounts most likely to convert.\n\nI put together a demo for your use case: vibesell.app/d/stripe-lead-scoring\n\nOpen to a quick 15-minute chat?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "st-08", subject: "Crustdata\u2019s API vs. building lead scoring ML in-house at Stripe", body: "Hi Arun,\n\nI saw the ML engineer posting for lead scoring on your team. Before you build from scratch, Crustdata\u2019s API might save you months \u2014 we provide real-time company signals via REST API with sub-second latency, and our scoring models are already trained on the signals that matter.\n\nI put together a technical demo: vibesell.app/d/stripe-lead-scoring\n\n15 minutes for a technical walkthrough?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "st-09", subject: "Crustdata\u2019s signal enrichment API for Stripe\u2019s data warehouse", body: "Hi Margaret,\n\nI heard you\u2019re exploring enrichment vendors for Stripe\u2019s data warehouse. Crustdata\u2019s API delivers real-time company signals \u2014 hiring, funding, technographics \u2014 via batch or streaming ingestion, and integrates cleanly with Snowflake, BigQuery, and Redshift.\n\nI built a Stripe-specific technical demo: vibesell.app/d/stripe-lead-scoring\n\nWould 15 minutes work for a technical deep-dive?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "st-10", subject: "Crustdata for Stripe\u2019s CRM dashboard v2 \u2014 lead scoring built in", body: "Hi Victor,\n\nAs you scope v2 of the CRM dashboard, Crustdata can handle the lead scoring piece out of the box. Our API returns real-time scores based on live company signals, so you can embed scoring directly into the dashboard without building an ML pipeline from scratch.\n\nI put together a product demo: vibesell.app/d/stripe-lead-scoring\n\nHappy to do a 15-minute walkthrough.\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
];

// ─── SELLER: GOOGLE CLOUD ──────────────────────────────────────────────────

const googleCloudPitchPage: PitchPage = {
  targetCompany: "Google Cloud",
  companyDomain: "cloud.google.com",
  headline: "How Crustdata Powers Data Enrichment for Google Cloud",
  subtitle:
    "Real-time firmographic, technographic, and growth signals to enrich every account in Google Cloud\u2019s enterprise pipeline",
  problemPoints: [
    "Google Cloud covers thousands of enterprise accounts globally \u2014 but without real-time enrichment, reps can\u2019t tell which prospects are actively evaluating cloud infrastructure",
    "Competing with AWS and Azure requires knowing when target companies raise funding, hire engineers, or show infrastructure growth signals before the competition does",
    "With 15 new enterprise sales hires in Q1 2026, each rep needs enriched accounts from day one \u2014 not weeks of manual research to build territory knowledge",
  ],
  solutionMockups: [
    {
      type: "dashboard",
      title: "Crustdata Enrichment \u2014 Google Cloud View",
      caption: "Every account enriched with real-time Crustdata signals",
      companyName: "Google Cloud",
      dataPoints: {
        totalAccounts: 12840,
        enrichedPercent: "74%",
        staleRecords: 2930,
        avgDataAge: "21 days",
      },
    },
    {
      type: "kanban",
      title: "Crustdata Expansion Signals",
      caption: "Accounts showing cloud adoption and growth signals",
      companyName: "Google Cloud",
      dataPoints: {
        readyToExpand: 418,
        inReview: 156,
        contacted: 103,
        converted: 62,
      },
    },
    {
      type: "alerts",
      title: "Crustdata Signal Alerts",
      caption: "Automated alerts when accounts show buying signals",
      companyName: "Google Cloud",
      dataPoints: {
        newSignals: 192,
        topSignal: "Series C fintech hiring 12 infrastructure engineers",
        priority: "High",
        alertsThisWeek: 57,
      },
    },
  ],
  urgencySignals: [
    "Google Cloud added 15 enterprise sales roles in Q1 2026 \u2014 new reps need enriched account intelligence from day one",
    "Google Cloud\u2019s enterprise revenue grew 28% YoY but win rate against AWS dropped 5 points \u2014 better account enrichment closes the gap",
    "Two major cloud competitors are already using third-party enrichment to identify high-intent accounts before Google Cloud engages",
  ],
  ctaText: "Want to see Crustdata enrichment for your accounts? Let\u2019s chat.",
  shareUrl: "/d/google-cloud-enrichment",
};

const googleCloudContacts: Contact[] = [
  // Decision Makers
  { id: "gc-01", name: "Patricia Nolan", firstName: "Patricia", title: "VP of Enterprise Sales", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Sales", roleTag: "decision_maker", matchReason: "Patricia is leading Google Cloud\u2019s enterprise sales expansion with 15 new hires in Q1 2026 to compete with AWS and Azure", relevance: "strong", linkedinUrl: "https://linkedin.com/in/patricia-nolan" },
  { id: "gc-02", name: "Gregory Fields", firstName: "Gregory", title: "Head of Revenue Operations", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Revenue Operations", roleTag: "decision_maker", matchReason: "Gregory is restructuring Google Cloud\u2019s account enrichment pipeline after win rates against AWS dropped 5 points in Q4", relevance: "strong", linkedinUrl: "https://linkedin.com/in/gregory-fields" },
  { id: "gc-03", name: "Sandra Huang", firstName: "Sandra", title: "CRO", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Revenue", roleTag: "decision_maker", matchReason: "Sandra joined as CRO in late 2025 and has publicly discussed the need for better account intelligence to compete with AWS and Azure", relevance: "strong", linkedinUrl: "https://linkedin.com/in/sandra-huang" },
  // Champions
  { id: "gc-04", name: "Tyler Morrison", firstName: "Tyler", title: "Director of Sales Operations", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Sales Operations", roleTag: "champion", matchReason: "Tyler\u2019s team is building a new account prioritization model and needs real-time cloud adoption signals to identify high-intent prospects", relevance: "strong", linkedinUrl: "https://linkedin.com/in/tyler-morrison" },
  { id: "gc-05", name: "Rachel Kim", firstName: "Rachel", title: "Senior Manager, Enterprise Sales", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Sales", roleTag: "champion", matchReason: "Rachel\u2019s enterprise team lost 4 deals in Q4 to AWS where the competitor had richer account intelligence and faster engagement", relevance: "strong", linkedinUrl: "https://linkedin.com/in/rachel-kim-gc" },
  { id: "gc-06", name: "Brandon Ortiz", firstName: "Brandon", title: "Head of Partner Sales Analytics", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Partner Sales", roleTag: "champion", matchReason: "Brandon\u2019s team needs enriched data on partner-sourced accounts to identify which prospects are actively evaluating multi-cloud strategies", relevance: "strong", linkedinUrl: "https://linkedin.com/in/brandon-ortiz" },
  { id: "gc-07", name: "Jennifer Walsh", firstName: "Jennifer", title: "Director of Customer Expansion", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Customer Success", roleTag: "champion", matchReason: "Jennifer launched a new cloud migration expansion playbook in January that depends on real-time growth signals to identify upsell-ready accounts", relevance: "good", linkedinUrl: "https://linkedin.com/in/jennifer-walsh" },
  // Technical Evaluators
  { id: "gc-08", name: "Rajesh Patel", firstName: "Rajesh", title: "Staff Engineer, Sales Platform", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Engineering", roleTag: "technical_evaluator", matchReason: "Rajesh\u2019s team owns Google Cloud\u2019s internal sales tooling and recently posted requirements for third-party data enrichment API integrations", relevance: "strong", linkedinUrl: "https://linkedin.com/in/rajesh-patel-gc" },
  { id: "gc-09", name: "Michelle Torres", firstName: "Michelle", title: "Director of Data Science", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Data Science", roleTag: "technical_evaluator", matchReason: "Michelle\u2019s team is building a new account scoring model and needs higher-quality firmographic and technographic inputs to predict cloud adoption intent", relevance: "strong", linkedinUrl: "https://linkedin.com/in/michelle-torres" },
  { id: "gc-10", name: "David Nakamura", firstName: "David", title: "Senior PM, Internal Tools", company: "Google Cloud", companySize: 182000, industry: "Cloud Infrastructure", department: "Product", roleTag: "technical_evaluator", matchReason: "David is scoping a new account enrichment layer for Google Cloud\u2019s internal CRM and is benchmarking third-party enrichment vendors", relevance: "strong", linkedinUrl: "https://linkedin.com/in/david-nakamura" },
];

const googleCloudEmailDrafts: EmailDraft[] = [
  { contactId: "gc-01", subject: "Enriched accounts for Google Cloud\u2019s growing sales team", body: "Hi Patricia,\n\nWith 15 new enterprise reps joining in Q1, each one needs enriched account data from day one to compete effectively against AWS and Azure. Crustdata provides real-time firmographic and growth signals that surface which accounts are actively evaluating cloud infrastructure.\n\nI put together a personalized demo: vibesell.app/d/google-cloud-enrichment\n\nWould 15 minutes work to walk through it?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "gc-02", subject: "Crustdata enrichment for Google Cloud\u2019s RevOps pipeline", body: "Hi Gregory,\n\nAfter win rates against AWS dropped 5 points, better account enrichment is the fastest lever to pull. Crustdata enriches your pipeline with real-time hiring velocity, funding events, and infrastructure growth signals so reps engage the right accounts first.\n\nHere\u2019s a custom demo: vibesell.app/d/google-cloud-enrichment\n\nOpen to a 15-minute walkthrough?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "gc-03", subject: "Crustdata account intelligence for Google Cloud", body: "Hi Sandra,\n\nYour comments about needing better account intelligence to compete with AWS and Azure resonated. Crustdata delivers real-time firmographic, technographic, and growth signals that help enterprise reps identify high-intent accounts before the competition does.\n\nSee the custom demo here: vibesell.app/d/google-cloud-enrichment\n\n15 minutes to discuss?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "gc-04", subject: "Cloud adoption signals for Google Cloud\u2019s account model", body: "Hi Tyler,\n\nBuilding an account prioritization model without real-time cloud adoption signals is like flying blind. Crustdata provides the hiring, funding, and infrastructure growth data your model needs to accurately score which prospects are ready to move.\n\nCheck out this custom demo: vibesell.app/d/google-cloud-enrichment\n\nWould 15 minutes work?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "gc-05", subject: "Crustdata enrichment to win against AWS", body: "Hi Rachel,\n\nLosing 4 enterprise deals to AWS in Q4 because they had better account intelligence is exactly the problem Crustdata solves. Our real-time enrichment gives your team the same depth of insight on every account \u2014 funding rounds, hiring surges, tech stack changes \u2014 so you engage earlier and smarter.\n\nHere\u2019s a personalized demo: vibesell.app/d/google-cloud-enrichment\n\nOpen to a 15-minute look?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "gc-06", subject: "Crustdata enrichment for Google Cloud partner accounts", body: "Hi Brandon,\n\nIdentifying which partner-sourced accounts are actively evaluating multi-cloud requires real-time signals, not static firmographics. Crustdata enriches partner accounts with hiring velocity, funding events, and infrastructure growth data so your team knows exactly where to focus.\n\nTake a look: vibesell.app/d/google-cloud-enrichment\n\nWorth 15 minutes?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "gc-07", subject: "Growth signals for Google Cloud\u2019s expansion playbook", body: "Hi Jennifer,\n\nYour cloud migration expansion playbook is only as good as the data feeding it. Crustdata surfaces real-time growth signals \u2014 headcount surges, infrastructure spend increases, new engineering hires \u2014 to identify which accounts are ready for upsell.\n\nSee the demo here: vibesell.app/d/google-cloud-enrichment\n\nHappy to chat for 15 minutes.\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "gc-08", subject: "Crustdata enrichment API for Google Cloud\u2019s sales platform", body: "Hi Rajesh,\n\nI saw the requirements for third-party data enrichment API integrations on your team\u2019s roadmap. Crustdata\u2019s API delivers real-time firmographic and technographic signals that plug directly into existing sales platforms with minimal engineering lift.\n\nHere\u2019s a technical demo: vibesell.app/d/google-cloud-enrichment\n\n15 minutes for a technical walkthrough?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "gc-09", subject: "Crustdata inputs for Google Cloud\u2019s account scoring model", body: "Hi Michelle,\n\nBuilding an account scoring model to predict cloud adoption intent requires high-quality firmographic and technographic inputs. Crustdata provides real-time signals \u2014 hiring patterns, funding events, tech stack shifts \u2014 that dramatically improve model accuracy.\n\nCheck out this demo: vibesell.app/d/google-cloud-enrichment\n\nWould 15 minutes work for a data-focused discussion?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "gc-10", subject: "Crustdata benchmarking for Google Cloud\u2019s CRM enrichment", body: "Hi David,\n\nI heard you\u2019re scoping an account enrichment layer and benchmarking third-party vendors. Crustdata delivers real-time firmographic, technographic, and growth signals purpose-built for enterprise sales teams at Google Cloud\u2019s scale.\n\nHere\u2019s a personalized demo: vibesell.app/d/google-cloud-enrichment\n\nOpen to a 15-minute comparison session?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
];

// ─── SELLER: SALESFORCE ─────────────────────────────────────────────────────

const salesforcePitchPage: PitchPage = {
  targetCompany: "Salesforce",
  companyDomain: "salesforce.com",
  headline: "How Crustdata Powers Hiring Signal Intelligence for Salesforce",
  subtitle:
    "Real-time hiring data \u2014 job posting patterns, headcount changes, team growth signals \u2014 to identify accounts in active buying mode",
  problemPoints: [
    "Salesforce manages thousands of enterprise accounts globally \u2014 but without real-time hiring signals, reps can\u2019t tell which companies are in active growth mode and ready to buy",
    "With 73,000+ employees and a multi-cloud sales motion, identifying which accounts are expanding teams and need new tools requires data that goes beyond what\u2019s in the CRM",
    "Without real-time hiring intelligence, the sales team misses accounts that are adding headcount, creating new departments, or scaling teams \u2014 the strongest buying signals in enterprise software",
  ],
  solutionMockups: [
    {
      type: "dashboard",
      title: "Crustdata Hiring Intelligence \u2014 Salesforce View",
      caption: "Every account enriched with real-time hiring signals",
      companyName: "Salesforce",
      dataPoints: {
        trackedAccounts: 4230,
        activelyHiring: 1847,
        avgHiringVelocity: "+23%",
        topSignal: "Engineering hiring surge",
      },
    },
    {
      type: "table",
      title: "Crustdata Hiring Signal Feed",
      caption: "Real-time job posting patterns and headcount changes",
      companyName: "Salesforce",
      dataPoints: {
        rows: 15,
        topAccount: "Series C SaaS, +40 engineering hires",
        score: 97,
        lastActivity: "1h ago",
      },
    },
    {
      type: "alerts",
      title: "Crustdata Hiring Alerts",
      caption: "Automated alerts when accounts show hiring surges",
      companyName: "Salesforce",
      dataPoints: {
        activeAlerts: 18,
        topAlert: "Enterprise account doubled engineering team in 60 days",
        priority: "High",
        alertsThisWeek: 12,
      },
    },
  ],
  urgencySignals: [
    "Salesforce restructured its sales operations in Q4 2025 \u2014 the new team needs signal-driven account prioritization",
    "Salesforce\u2019s Q3 2025 earnings call highlighted the need for better tools to identify accounts in active buying mode",
    "2 major CRM competitors already use hiring signal intelligence to prioritize enterprise accounts",
  ],
  ctaText: "Want to see Crustdata hiring signals for your accounts? Let\u2019s chat.",
  shareUrl: "/d/salesforce-hiring-signals",
};

const salesforceContacts: Contact[] = [
  // Decision Makers
  { id: "sf-01", name: "Christopher Hayes", firstName: "Christopher", title: "VP of Enterprise Sales", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Sales", roleTag: "decision_maker", matchReason: "Christopher oversees $1.8B in enterprise bookings and his team missed forecast by 7% in Q3 2025", relevance: "strong", linkedinUrl: "https://linkedin.com/in/christopher-hayes-sf" },
  { id: "sf-02", name: "Diane Colbert", firstName: "Diane", title: "Head of Revenue Strategy", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Revenue Strategy", roleTag: "decision_maker", matchReason: "Diane was hired in October 2025 specifically to improve forecast accuracy across Salesforce\u2019s multi-cloud sales motion", relevance: "strong", linkedinUrl: "https://linkedin.com/in/diane-colbert" },
  { id: "sf-03", name: "Martin Schultz", firstName: "Martin", title: "SVP of Sales Operations", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Sales Operations", roleTag: "decision_maker", matchReason: "Martin led the Q4 2025 restructuring of revenue operations and is consolidating forecasting tools across all cloud products", relevance: "strong", linkedinUrl: "https://linkedin.com/in/martin-schultz" },
  // Champions
  { id: "sf-04", name: "Janet Liang", firstName: "Janet", title: "Director of Sales Analytics", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Analytics", roleTag: "champion", matchReason: "Janet\u2019s team built 12 new forecast dashboards in Q4 but still relies on manual data pulls for real-time deal signals", relevance: "strong", linkedinUrl: "https://linkedin.com/in/janet-liang" },
  { id: "sf-05", name: "Paul Rivera", firstName: "Paul", title: "Senior Director, Mid-Market Sales", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Sales", roleTag: "champion", matchReason: "Paul\u2019s mid-market segment grew 22% but deal visibility across 600+ active opportunities is a persistent challenge", relevance: "strong", linkedinUrl: "https://linkedin.com/in/paul-rivera" },
  { id: "sf-06", name: "Samantha Greene", firstName: "Samantha", title: "Head of Deal Strategy", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Sales Strategy", roleTag: "champion", matchReason: "Samantha identified that 18% of deals marked as \u2018commit\u2019 in Q3 actually slipped to the following quarter", relevance: "strong", linkedinUrl: "https://linkedin.com/in/samantha-greene" },
  { id: "sf-07", name: "Trevor Kim", firstName: "Trevor", title: "Director of Partner Sales", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Partner Sales", roleTag: "champion", matchReason: "Trevor\u2019s partner-sourced deal flow grew 35% in 2025 but lacks the same analytics rigor as direct sales", relevance: "good", linkedinUrl: "https://linkedin.com/in/trevor-kim" },
  // Technical Evaluators
  { id: "sf-08", name: "Rebecca Sterling", firstName: "Rebecca", title: "Staff Engineer, Revenue Systems", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Engineering", roleTag: "technical_evaluator", matchReason: "Rebecca\u2019s team maintains Salesforce\u2019s internal revenue tracking systems and is evaluating real-time data streaming solutions", relevance: "strong", linkedinUrl: "https://linkedin.com/in/rebecca-sterling" },
  { id: "sf-09", name: "Howard Chen", firstName: "Howard", title: "Director of Business Intelligence", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Business Intelligence", roleTag: "technical_evaluator", matchReason: "Howard\u2019s BI team supports 200+ internal dashboards and recently flagged data latency as the biggest barrier to accurate forecasting", relevance: "strong", linkedinUrl: "https://linkedin.com/in/howard-chen" },
  { id: "sf-10", name: "Alicia Drummond", firstName: "Alicia", title: "Senior PM, Revenue Cloud", company: "Salesforce", companySize: 73000, industry: "Enterprise Software", department: "Product", roleTag: "technical_evaluator", matchReason: "Alicia is building the next generation of Revenue Cloud features and is researching real-time analytics capabilities for the 2026 roadmap", relevance: "strong", linkedinUrl: "https://linkedin.com/in/alicia-drummond" },
];

const salesforceEmailDrafts: EmailDraft[] = [
  { contactId: "sf-01", subject: "Crustdata hiring signals for Salesforce\u2019s enterprise accounts", body: "Hi Christopher,\n\nMissing forecast by 7% on $1.8B in bookings often comes down to not knowing which accounts are in active buying mode. Crustdata tracks real-time hiring signals \u2014 job postings, headcount changes, team growth \u2014 so your enterprise reps can prioritize accounts that are actually expanding and ready to purchase.\n\nI put together a custom view for Salesforce: vibesell.app/d/salesforce-hiring-signals\n\nWorth 15 minutes to walk through it?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "sf-02", subject: "Crustdata hiring intelligence for Salesforce\u2019s revenue strategy", body: "Hi Diane,\n\nImproving forecast accuracy starts with knowing which accounts are actively growing. Crustdata provides real-time hiring signals \u2014 job posting surges, new department creation, headcount velocity \u2014 so your revenue strategy team can identify accounts in buying mode before competitors do.\n\nHere\u2019s a custom view for Salesforce: vibesell.app/d/salesforce-hiring-signals\n\nOpen to a 15-minute walkthrough?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "sf-03", subject: "Crustdata hiring signals for Salesforce\u2019s new sales ops team", body: "Hi Martin,\n\nAfter the Q4 restructuring, your new sales ops team needs a way to prioritize accounts based on real buying signals. Crustdata surfaces real-time hiring data \u2014 which accounts are adding headcount, building new teams, and scaling departments \u2014 so your reps focus on accounts ready to buy.\n\nCheck it out: vibesell.app/d/salesforce-hiring-signals\n\nWould 15 minutes work?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "sf-04", subject: "Crustdata hiring signals to replace manual data pulls at Salesforce", body: "Hi Janet,\n\nBuilding 12 dashboards but still pulling data manually for real-time signals is a gap Crustdata can close. Our platform automatically enriches every account with hiring signals \u2014 job postings, headcount changes, team growth patterns \u2014 so your analytics team gets live buying indicators without the manual work.\n\nSee it here: vibesell.app/d/salesforce-hiring-signals\n\nHappy to do a 15-minute walkthrough.\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "sf-05", subject: "Crustdata hiring signals for Salesforce\u2019s mid-market accounts", body: "Hi Paul,\n\n22% growth across 600+ opportunities means your team needs a fast way to spot which mid-market accounts are in buying mode. Crustdata tracks real-time hiring signals \u2014 when a company starts adding headcount or building new teams, that\u2019s a strong indicator they\u2019re ready to invest in new tools.\n\nTake a look: vibesell.app/d/salesforce-hiring-signals\n\nWorth 15 minutes?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "sf-06", subject: "Crustdata hiring intelligence to reduce deal slippage at Salesforce", body: "Hi Samantha,\n\n18% commit-stage slippage often means deals are being prioritized without enough external signal. Crustdata\u2019s hiring intelligence shows which accounts are actively expanding \u2014 adding headcount, creating new roles, scaling teams \u2014 giving your deal strategy team a real-time view of buyer readiness.\n\nHere it is: vibesell.app/d/salesforce-hiring-signals\n\nOpen to a 15-minute discussion?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "sf-07", subject: "Crustdata hiring signals for Salesforce\u2019s partner channel", body: "Hi Trevor,\n\nPartner-sourced deals growing 35% without the same intelligence as direct sales is a gap worth closing. Crustdata\u2019s hiring signal data works across both direct and partner accounts \u2014 surfacing which companies are adding headcount and scaling teams so your partner reps can prioritize the right opportunities.\n\nCheck it out: vibesell.app/d/salesforce-hiring-signals\n\n15 minutes to discuss?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "sf-08", subject: "Crustdata\u2019s hiring signal API for Salesforce\u2019s revenue systems", body: "Hi Rebecca,\n\nI heard you\u2019re evaluating real-time data streaming solutions for Salesforce\u2019s revenue systems. Crustdata\u2019s API delivers structured hiring signal data \u2014 job postings, headcount changes, team growth indicators \u2014 that integrates directly into enterprise-grade data pipelines.\n\nHere\u2019s a technical overview: vibesell.app/d/salesforce-hiring-signals\n\nWould 15 minutes work for a technical deep-dive?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "sf-09", subject: "Crustdata hiring data to solve latency in Salesforce\u2019s BI layer", body: "Hi Howard,\n\nData latency across 200+ dashboards means your BI team is working with stale account signals. Crustdata delivers real-time hiring intelligence \u2014 job posting patterns, headcount velocity, team growth \u2014 with low-latency data feeds designed for enterprise BI systems at Salesforce\u2019s scale.\n\nSee it here: vibesell.app/d/salesforce-hiring-signals\n\nOpen to a 15-minute technical walkthrough?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
  { contactId: "sf-10", subject: "Crustdata hiring signals for Revenue Cloud\u2019s 2026 roadmap", body: "Hi Alicia,\n\nIf the 2026 Revenue Cloud roadmap includes account intelligence features, hiring signal data is worth exploring. Crustdata surfaces real-time job posting patterns and headcount changes that help sales teams identify which accounts are in active buying mode \u2014 a capability that could be a powerful addition to Revenue Cloud.\n\nTake a look: vibesell.app/d/salesforce-hiring-signals\n\nWorth 15 minutes to compare notes?\n\nBest,\nSarah Chan\nCrustdata", mode: "seller" },
];

// ─── WORKSPACE PROJECTS ─────────────────────────────────────────────────────

const workspaceProjects: Project[] = [
  {
    id: "proj-001",
    mode: "builder",
    title: "PipeTrack",
    description: "Candidate tracking product for recruiting teams \u2014 targeting staffing firms and HR technology companies in the US",
    createdAt: "2026-01-15T10:30:00Z",
    targeting: recruitingTargeting,
    contacts: recruitingContacts,
    emailDrafts: recruitingEmailDrafts,
    stats: { contactsFound: 20, emailsSent: 12, replies: 3, meetingsBooked: 0 },
    productPage: recruitingProductPage,
  },
  {
    id: "proj-002",
    mode: "builder",
    title: "ProspectFlow",
    description: "AI-powered sales intelligence product for B2B teams \u2014 targeting SaaS companies led by VPs of Sales and Heads of Revenue",
    createdAt: "2026-02-01T14:00:00Z",
    targeting: salesTargeting,
    contacts: salesContacts,
    emailDrafts: salesEmailDrafts,
    stats: { contactsFound: 20, emailsSent: 0, replies: 0, meetingsBooked: 0 },
    productPage: salesProductPage,
  },
  {
    id: "proj-003",
    mode: "builder",
    title: "DealStream",
    description: "Deal flow management product for investors \u2014 targeting VC and PE firms led by Partners and Principals",
    createdAt: "2026-01-20T09:00:00Z",
    targeting: investorTargeting,
    contacts: investorContacts,
    emailDrafts: investorEmailDrafts,
    stats: { contactsFound: 20, emailsSent: 5, replies: 1, meetingsBooked: 1 },
    productPage: investorProductPage,
  },
  {
    id: "proj-004",
    mode: "seller",
    title: "Lead Scoring for Stripe",
    description: "Personalized Crustdata lead scoring demo for Stripe\u2019s sales team \u2014 showing how real-time company signals improve lead prioritization at scale",
    createdAt: "2026-01-25T11:15:00Z",
    targeting: {
      industries: ["Payments Infrastructure"],
      companySize: { min: 5000, max: 10000 },
      titles: ["VP of Sales", "Head of Revenue Operations", "CRO", "Director of Sales Engineering", "Staff Engineer"],
      regions: ["United States"],
      summary: "Stripe\u2019s sales, revenue operations, and engineering teams responsible for lead prioritization and scoring",
    },
    contacts: stripeContacts,
    emailDrafts: stripeEmailDrafts,
    stats: { contactsFound: 10, emailsSent: 8, replies: 2, meetingsBooked: 0 },
    pitchPages: [stripePitchPage],
    targetCompanies: ["Stripe"],
  },
  {
    id: "proj-005",
    mode: "seller",
    title: "Data Enrichment for Google Cloud",
    description: "Personalized data enrichment demo for Google Cloud\u2019s enterprise sales team \u2014 showing how Crustdata enrichment powers their competitive positioning against AWS and Azure",
    createdAt: "2026-02-05T16:45:00Z",
    targeting: {
      industries: ["Cloud Infrastructure"],
      companySize: { min: 100000, max: 200000 },
      titles: ["VP of Enterprise Sales", "Head of Revenue Operations", "CRO", "Director of Sales Operations", "Staff Engineer"],
      regions: ["United States"],
      summary: "Google Cloud\u2019s enterprise sales, revenue operations, and data teams responsible for account enrichment and competitive intelligence",
    },
    contacts: googleCloudContacts,
    emailDrafts: googleCloudEmailDrafts,
    stats: { contactsFound: 10, emailsSent: 0, replies: 0, meetingsBooked: 0 },
    pitchPages: [googleCloudPitchPage],
    targetCompanies: ["Google Cloud"],
  },
  {
    id: "proj-006",
    mode: "seller",
    title: "Hiring Signals for Salesforce",
    description: "Personalized Crustdata hiring signal intelligence demo for Salesforce\u2019s revenue team \u2014 showing how real-time hiring data identifies accounts in active buying mode",
    createdAt: "2026-02-10T09:30:00Z",
    targeting: {
      industries: ["Enterprise Software"],
      companySize: { min: 50000, max: 100000 },
      titles: ["VP of Enterprise Sales", "Head of Revenue Strategy", "SVP of Sales Operations", "Director of Sales Analytics", "Staff Engineer"],
      regions: ["United States"],
      summary: "Salesforce\u2019s enterprise sales, revenue operations, and engineering teams responsible for account intelligence and deal forecasting",
    },
    contacts: salesforceContacts,
    emailDrafts: salesforceEmailDrafts,
    stats: { contactsFound: 10, emailsSent: 3, replies: 1, meetingsBooked: 0 },
    pitchPages: [salesforcePitchPage],
    targetCompanies: ["Salesforce"],
  },
];

// ─── EXPORTED MOCK DATA OBJECT ──────────────────────────────────────────────

export const MOCK_DATA = {
  builder: {
    recruiting: {
      targeting: recruitingTargeting,
      contacts: recruitingContacts,
      productPage: recruitingProductPage,
      emailDrafts: recruitingEmailDrafts,
    },
    sales: {
      targeting: salesTargeting,
      contacts: salesContacts,
      productPage: salesProductPage,
      emailDrafts: salesEmailDrafts,
    },
    investor: {
      targeting: investorTargeting,
      contacts: investorContacts,
      productPage: investorProductPage,
      emailDrafts: investorEmailDrafts,
    },
  },
  seller: {
    stripe: {
      pitchPage: stripePitchPage,
      contacts: stripeContacts,
      emailDrafts: stripeEmailDrafts,
    },
    googleCloud: {
      pitchPage: googleCloudPitchPage,
      contacts: googleCloudContacts,
      emailDrafts: googleCloudEmailDrafts,
    },
    salesforce: {
      pitchPage: salesforcePitchPage,
      contacts: salesforceContacts,
      emailDrafts: salesforceEmailDrafts,
    },
  },
  workspaceProjects,
};

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────

export function detectBuilderScenario(
  description: string
): "recruiting" | "sales" | "investor" {
  const lower = description.toLowerCase();

  const investorKeywords = [
    "investor",
    "vc",
    "venture",
    "private equity",
    "pe ",
    "fund",
    "deal flow",
    "lp ",
    "limited partner",
    "portfolio",
    "growth equity",
    "capital",
    "due diligence",
    "partner",
    "principal",
  ];

  const recruitingKeywords = [
    "recruit",
    "hiring",
    "talent",
    "staffing",
    "candidate",
    "hr ",
    "human resource",
    "people ops",
    "people operation",
    "headhunt",
    "ats",
    "applicant",
    "job board",
    "placement",
    "time-to-fill",
    "time to fill",
  ];

  if (investorKeywords.some((kw) => lower.includes(kw))) {
    return "investor";
  }

  if (recruitingKeywords.some((kw) => lower.includes(kw))) {
    return "recruiting";
  }

  return "sales";
}

export function getBuilderMockData(scenario: string): {
  targeting: Targeting;
  contacts: Contact[];
  productPage: ProductPage;
  emailDrafts: EmailDraft[];
} {
  const key = scenario as keyof typeof MOCK_DATA.builder;
  if (key in MOCK_DATA.builder) {
    return MOCK_DATA.builder[key];
  }
  return MOCK_DATA.builder.sales;
}

export function getSellerMockData(company: string): {
  pitchPage: PitchPage;
  contacts: Contact[];
  emailDrafts: EmailDraft[];
} {
  const lower = company.toLowerCase().trim();

  if (lower.includes("stripe")) {
    return MOCK_DATA.seller.stripe;
  }
  if (lower.includes("google") || lower.includes("google cloud") || lower.includes("gcp")) {
    return MOCK_DATA.seller.googleCloud;
  }
  if (lower.includes("salesforce") || lower.includes("sales force")) {
    return MOCK_DATA.seller.salesforce;
  }

  // Default: find closest match by checking if any seller company name is in the input
  const sellerKeys = Object.keys(MOCK_DATA.seller) as Array<
    keyof typeof MOCK_DATA.seller
  >;
  for (const key of sellerKeys) {
    if (lower.includes(key)) {
      return MOCK_DATA.seller[key];
    }
  }

  // Fallback to Stripe as default
  return MOCK_DATA.seller.stripe;
}
