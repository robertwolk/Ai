import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type Contact = Prisma.ContactGetPayload<object>;
type Campaign = Prisma.CampaignGetPayload<object>;
type SocialAccount = Prisma.SocialAccountGetPayload<object>;

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Clearing all tables...");

  // Delete in order to avoid FK violations
  await prisma.postApproval.deleteMany();
  await prisma.socialPost.deleteMany();
  await prisma.contentSeries.deleteMany();
  await prisma.contentTheme.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.emailSequenceEnrollment.deleteMany();
  await prisma.emailSequence.deleteMany();
  await prisma.scrapedLead.deleteMany();
  await prisma.leadGenCampaign.deleteMany();
  await prisma.scrapingSource.deleteMany();
  await prisma.leadScore.deleteMany();
  await prisma.targetProfile.deleteMany();
  await prisma.optimizationLog.deleteMany();
  await prisma.optimizationRule.deleteMany();
  await prisma.campaignMetric.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.adSet.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.adAccount.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.pipeline.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  console.log("All tables cleared.");

  // ============================================
  // USER
  // ============================================
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@crm.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.id);

  // ============================================
  // PIPELINES
  // ============================================
  const salesPipeline = await prisma.pipeline.create({
    data: {
      name: "Sales Pipeline",
      isDefault: true,
      stages: JSON.stringify([
        { name: "Lead", probability: 10 },
        { name: "Qualified", probability: 20 },
        { name: "Meeting Booked", probability: 40 },
        { name: "Proposal Sent", probability: 60 },
        { name: "Negotiation", probability: 80 },
        { name: "Won", probability: 100 },
        { name: "Lost", probability: 0 },
      ]),
    },
  });

  const partnershipsPipeline = await prisma.pipeline.create({
    data: {
      name: "Partnerships",
      isDefault: false,
      stages: JSON.stringify([
        { name: "Identified", probability: 10 },
        { name: "Outreach", probability: 25 },
        { name: "Discussion", probability: 50 },
        { name: "Agreement", probability: 75 },
        { name: "Active", probability: 100 },
      ]),
    },
  });
  console.log("Created pipelines");

  // ============================================
  // CONTACTS (25)
  // ============================================
  const contactData = [
    { firstName: "Sarah", lastName: "Chen", email: "sarah.chen@techflow.io", company: "TechFlow Inc", jobTitle: "CTO", source: "GOOGLE_ADS", lifecycleStage: "SQL", leadScore: 85 },
    { firstName: "Marcus", lastName: "Johnson", email: "marcus.j@globalcorp.com", company: "GlobalCorp", jobTitle: "VP of Engineering", source: "META_ADS", lifecycleStage: "OPPORTUNITY", leadScore: 92 },
    { firstName: "Emily", lastName: "Rodriguez", email: "emily.r@startuplab.co", company: "StartupLab", jobTitle: "Founder", source: "ORGANIC", lifecycleStage: "CUSTOMER", leadScore: 78 },
    { firstName: "David", lastName: "Kim", email: "david.kim@nextera.com", company: "NextEra Solutions", jobTitle: "Head of Product", source: "REFERRAL", lifecycleStage: "MQL", leadScore: 65 },
    { firstName: "Olivia", lastName: "Martinez", email: "olivia@cloudnative.dev", company: "CloudNative Dev", jobTitle: "Engineering Manager", source: "COLD_EMAIL", lifecycleStage: "LEAD", leadScore: 42 },
    { firstName: "James", lastName: "Wilson", email: "jwilson@datadriven.ai", company: "DataDriven AI", jobTitle: "CEO", source: "X_ADS", lifecycleStage: "SQL", leadScore: 88 },
    { firstName: "Sophia", lastName: "Patel", email: "sophia.p@innovate.io", company: "Innovate Labs", jobTitle: "Director of Ops", source: "TIKTOK_ADS", lifecycleStage: "LEAD", leadScore: 35 },
    { firstName: "Liam", lastName: "O'Brien", email: "liam@brightpath.com", company: "BrightPath Consulting", jobTitle: "Managing Partner", source: "REFERRAL", lifecycleStage: "CUSTOMER", leadScore: 95 },
    { firstName: "Ava", lastName: "Nakamura", email: "ava.n@quantumleap.tech", company: "QuantumLeap Tech", jobTitle: "VP Sales", source: "GOOGLE_ADS", lifecycleStage: "OPPORTUNITY", leadScore: 71 },
    { firstName: "Noah", lastName: "Brown", email: "noah.b@scalefast.io", company: "ScaleFast", jobTitle: "Growth Lead", source: "META_ADS", lifecycleStage: "MQL", leadScore: 58 },
    { firstName: "Isabella", lastName: "Garcia", email: "isabella@peakdigital.com", company: "Peak Digital", jobTitle: "Marketing Director", source: "ORGANIC", lifecycleStage: "LEAD", leadScore: 29 },
    { firstName: "Ethan", lastName: "Lee", email: "ethan.lee@venturex.co", company: "VentureX", jobTitle: "Partner", source: "COLD_EMAIL", lifecycleStage: "SQL", leadScore: 76 },
    { firstName: "Mia", lastName: "Thompson", email: "mia.t@synthetix.ai", company: "Synthetix AI", jobTitle: "Head of AI", source: "X_ADS", lifecycleStage: "MQL", leadScore: 63 },
    { firstName: "Alexander", lastName: "White", email: "alex.w@cloudpeak.io", company: "CloudPeak", jobTitle: "CTO", source: "GOOGLE_ADS", lifecycleStage: "OPPORTUNITY", leadScore: 81 },
    { firstName: "Charlotte", lastName: "Davis", email: "charlotte@freshworks.co", company: "FreshWorks Co", jobTitle: "Product Manager", source: "TIKTOK_ADS", lifecycleStage: "LEAD", leadScore: 22 },
    { firstName: "Benjamin", lastName: "Taylor", email: "ben.t@rapidgrowth.com", company: "RapidGrowth", jobTitle: "CEO", source: "REFERRAL", lifecycleStage: "CUSTOMER", leadScore: 90 },
    { firstName: "Amelia", lastName: "Anderson", email: "amelia@digitalnext.io", company: "DigitalNext", jobTitle: "COO", source: "META_ADS", lifecycleStage: "SQL", leadScore: 73 },
    { firstName: "William", lastName: "Jackson", email: "wjackson@techbridge.com", company: "TechBridge", jobTitle: "Engineering Lead", source: "ORGANIC", lifecycleStage: "LEAD", leadScore: 18 },
    { firstName: "Harper", lastName: "Moore", email: "harper.m@elevateai.co", company: "Elevate AI", jobTitle: "Data Science Lead", source: "COLD_EMAIL", lifecycleStage: "MQL", leadScore: 55 },
    { firstName: "Lucas", lastName: "Martin", email: "lucas@infracloud.dev", company: "InfraCloud", jobTitle: "DevOps Lead", source: "X_ADS", lifecycleStage: "LEAD", leadScore: 38 },
    { firstName: "Ella", lastName: "Hernandez", email: "ella.h@growthengine.io", company: "Growth Engine", jobTitle: "VP Marketing", source: "GOOGLE_ADS", lifecycleStage: "OPPORTUNITY", leadScore: 84 },
    { firstName: "Jack", lastName: "Robinson", email: "jack.r@codesmith.dev", company: "CodeSmith", jobTitle: "Founder", source: "TIKTOK_ADS", lifecycleStage: "LEAD", leadScore: 10 },
    { firstName: "Grace", lastName: "Clark", email: "grace@stratosphere.com", company: "Stratosphere Inc", jobTitle: "Strategy Director", source: "REFERRAL", lifecycleStage: "SQL", leadScore: 69 },
    { firstName: "Henry", lastName: "Lewis", email: "henry.l@blueshift.ai", company: "BlueShift AI", jobTitle: "ML Engineer", source: "META_ADS", lifecycleStage: "MQL", leadScore: 47 },
    { firstName: "Zoe", lastName: "Walker", email: "zoe.w@pixelcraft.co", company: "PixelCraft", jobTitle: "Design Director", source: "ORGANIC", lifecycleStage: "EVANGELIST", leadScore: 91 },
  ];

  const contacts: Contact[] = [];
  for (const c of contactData) {
    const contact = await prisma.contact.create({
      data: {
        ...c,
        phone: `+1${randomBetween(200, 999)}${randomBetween(1000000, 9999999)}`,
        createdAt: daysAgo(randomBetween(5, 90)),
      },
    });
    contacts.push(contact);
  }
  console.log(`Created ${contacts.length} contacts`);

  // ============================================
  // DEALS (15)
  // ============================================
  const stageOptions = ["LEAD", "QUALIFIED", "MEETING_BOOKED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"];
  const dealData = [
    { title: "TechFlow Enterprise License", contactIdx: 0, value: 75000, stage: "NEGOTIATION", probability: 80 },
    { title: "GlobalCorp Platform Migration", contactIdx: 1, value: 150000, stage: "PROPOSAL_SENT", probability: 60 },
    { title: "StartupLab Annual Plan", contactIdx: 2, value: 24000, stage: "WON", probability: 100 },
    { title: "NextEra Integration Project", contactIdx: 3, value: 45000, stage: "QUALIFIED", probability: 20 },
    { title: "DataDriven AI Suite", contactIdx: 5, value: 95000, stage: "MEETING_BOOKED", probability: 40 },
    { title: "BrightPath Consulting Deal", contactIdx: 7, value: 120000, stage: "WON", probability: 100 },
    { title: "QuantumLeap Expansion", contactIdx: 8, value: 65000, stage: "NEGOTIATION", probability: 80 },
    { title: "VentureX Partnership", contactIdx: 11, value: 35000, stage: "PROPOSAL_SENT", probability: 60 },
    { title: "CloudPeak Infrastructure", contactIdx: 13, value: 88000, stage: "WON", probability: 100 },
    { title: "RapidGrowth Scale-up", contactIdx: 15, value: 55000, stage: "LOST", probability: 0 },
    { title: "DigitalNext Onboarding", contactIdx: 16, value: 42000, stage: "LEAD", probability: 10 },
    { title: "Elevate AI Analytics", contactIdx: 20, value: 73000, stage: "MEETING_BOOKED", probability: 40 },
    { title: "Growth Engine Campaign", contactIdx: 20, value: 18000, stage: "LOST", probability: 0 },
    { title: "Stratosphere Consulting", contactIdx: 22, value: 5000, stage: "QUALIFIED", probability: 20 },
    { title: "PixelCraft Design System", contactIdx: 24, value: 32000, stage: "WON", probability: 100 },
  ];

  const deals = [];
  for (const d of dealData) {
    const isWon = d.stage === "WON";
    const isLost = d.stage === "LOST";
    const deal = await prisma.deal.create({
      data: {
        title: d.title,
        contactId: contacts[d.contactIdx].id,
        value: d.value,
        stage: d.stage,
        pipelineId: salesPipeline.id,
        probability: d.probability,
        assignedToId: admin.id,
        expectedCloseDate: daysAgo(-randomBetween(5, 30)),
        actualCloseDate: isWon ? daysAgo(randomBetween(1, 20)) : isLost ? daysAgo(randomBetween(1, 15)) : undefined,
        lostReason: isLost ? pick(["Budget constraints", "Went with competitor", "Project cancelled", "No response"]) : undefined,
        createdAt: daysAgo(randomBetween(10, 60)),
      },
    });
    deals.push(deal);
  }
  console.log(`Created ${deals.length} deals`);

  // ============================================
  // ACTIVITIES (40)
  // ============================================
  const activityTypes = ["CALL", "EMAIL", "MEETING", "NOTE", "TASK"];
  const activitySubjects: Record<string, string[]> = {
    CALL: ["Discovery call", "Follow-up call", "Product demo call", "Check-in call", "Pricing discussion"],
    EMAIL: ["Sent proposal", "Follow-up email", "Introduction email", "Case study shared", "Meeting recap"],
    MEETING: ["In-person demo", "Quarterly review", "Kickoff meeting", "Strategy session", "Technical deep-dive"],
    NOTE: ["Updated contact info", "Noted budget timeline", "Competitor mentioned", "Decision maker identified", "Requirements gathered"],
    TASK: ["Send contract", "Prepare proposal", "Schedule demo", "Update CRM notes", "Research company background"],
  };

  for (let i = 0; i < 40; i++) {
    const type = pick(activityTypes);
    const contactIdx = randomBetween(0, contacts.length - 1);
    const dealIdx = Math.random() > 0.4 ? randomBetween(0, deals.length - 1) : null;
    const daysBack = randomBetween(0, 60);

    await prisma.activity.create({
      data: {
        contactId: contacts[contactIdx].id,
        dealId: dealIdx !== null ? deals[dealIdx].id : undefined,
        type,
        subject: pick(activitySubjects[type]),
        body: type === "NOTE" ? "Detailed notes from the interaction." : undefined,
        outcome: type === "CALL" ? pick(["Connected", "Left voicemail", "No answer", "Scheduled follow-up"]) : undefined,
        dueDate: type === "TASK" ? daysAgo(-randomBetween(1, 14)) : undefined,
        completedAt: type === "TASK" && Math.random() > 0.5 ? daysAgo(randomBetween(0, 3)) : undefined,
        assignedToId: admin.id,
        createdAt: daysAgo(daysBack),
      },
    });
  }
  console.log("Created 40 activities");

  // ============================================
  // AD ACCOUNTS (4)
  // ============================================
  const adAccountData = [
    { platform: "GOOGLE", accountId: "goog-123456", accountName: "CRM Google Ads" },
    { platform: "META", accountId: "meta-789012", accountName: "CRM Meta Ads" },
    { platform: "X", accountId: "x-345678", accountName: "CRM X Ads" },
    { platform: "TIKTOK", accountId: "tt-901234", accountName: "CRM TikTok Ads" },
  ];

  const adAccounts = [];
  for (const a of adAccountData) {
    const account = await prisma.adAccount.create({
      data: {
        ...a,
        accessToken: `tok_${a.platform.toLowerCase()}_${Date.now()}`,
        isActive: true,
        lastSyncedAt: daysAgo(0),
      },
    });
    adAccounts.push(account);
  }
  console.log(`Created ${adAccounts.length} ad accounts`);

  // ============================================
  // CAMPAIGNS (8)
  // ============================================
  const campaignData = [
    { name: "Google Search - Brand Keywords", platform: "GOOGLE", accountIdx: 0, status: "ACTIVE", budgetDaily: 150, budgetTotal: 4500 },
    { name: "Google Search - Competitor Keywords", platform: "GOOGLE", accountIdx: 0, status: "ACTIVE", budgetDaily: 200, budgetTotal: 6000 },
    { name: "Meta - Lookalike Audiences", platform: "META", accountIdx: 1, status: "ACTIVE", budgetDaily: 120, budgetTotal: 3600 },
    { name: "Meta - Retargeting Website Visitors", platform: "META", accountIdx: 1, status: "PAUSED", budgetDaily: 80, budgetTotal: 2400 },
    { name: "X - Thought Leadership Promoted", platform: "X", accountIdx: 2, status: "ACTIVE", budgetDaily: 75, budgetTotal: 2250 },
    { name: "X - Product Launch Campaign", platform: "X", accountIdx: 2, status: "COMPLETED", budgetDaily: 100, budgetTotal: 3000 },
    { name: "TikTok - Brand Awareness", platform: "TIKTOK", accountIdx: 3, status: "ACTIVE", budgetDaily: 90, budgetTotal: 2700 },
    { name: "TikTok - Lead Gen Spark Ads", platform: "TIKTOK", accountIdx: 3, status: "DRAFT", budgetDaily: 60, budgetTotal: 1800 },
  ];

  const campaigns: Campaign[] = [];
  for (const c of campaignData) {
    const campaign = await prisma.campaign.create({
      data: {
        name: c.name,
        platform: c.platform,
        adAccountId: adAccounts[c.accountIdx].id,
        status: c.status,
        objective: pick(["CONVERSIONS", "TRAFFIC", "BRAND_AWARENESS", "LEAD_GENERATION"]),
        budgetDaily: c.budgetDaily,
        budgetTotal: c.budgetTotal,
        startDate: daysAgo(randomBetween(15, 45)),
        endDate: c.status === "COMPLETED" ? daysAgo(randomBetween(1, 5)) : daysAgo(-randomBetween(15, 45)),
        metrics: JSON.stringify({
          impressions: randomBetween(10000, 500000),
          clicks: randomBetween(500, 15000),
          conversions: randomBetween(10, 300),
          spend: randomBetween(1000, 5000),
          ctr: (Math.random() * 4 + 0.5).toFixed(2),
          cpc: (Math.random() * 3 + 0.5).toFixed(2),
          roas: (Math.random() * 5 + 1).toFixed(2),
        }),
        targeting: JSON.stringify({
          locations: ["United States", "Canada"],
          ageRange: { min: 25, max: 55 },
          interests: ["Technology", "SaaS", "Business"],
        }),
      },
    });
    campaigns.push(campaign);
  }
  console.log(`Created ${campaigns.length} campaigns`);

  // ============================================
  // OPTIMIZATION RULES (4)
  // ============================================
  const ruleData = [
    {
      name: "Pause low ROAS campaigns",
      type: "BUDGET",
      conditions: JSON.stringify([{ metric: "roas", operator: "less_than", value: 1.0, period: "7d" }]),
      actions: JSON.stringify([{ type: "PAUSE", reason: "ROAS below 1.0 for 7 days" }]),
    },
    {
      name: "Increase budget on high performers",
      type: "BUDGET",
      conditions: JSON.stringify([{ metric: "roas", operator: "greater_than", value: 3.0, period: "7d" }]),
      actions: JSON.stringify([{ type: "BUDGET_INCREASE", percentage: 20 }]),
    },
    {
      name: "Rotate underperforming creatives",
      type: "CREATIVE",
      conditions: JSON.stringify([{ metric: "ctr", operator: "less_than", value: 0.5, period: "3d" }]),
      actions: JSON.stringify([{ type: "CREATIVE_CHANGE", action: "rotate_next" }]),
    },
    {
      name: "Bid adjustment for high CPA",
      type: "BID",
      conditions: JSON.stringify([{ metric: "cpa", operator: "greater_than", value: 50, period: "7d" }]),
      actions: JSON.stringify([{ type: "BID_CHANGE", adjustment: -10 }]),
    },
  ];

  for (const r of ruleData) {
    await prisma.optimizationRule.create({ data: { ...r, isEnabled: true } });
  }
  console.log("Created 4 optimization rules");

  // ============================================
  // OPTIMIZATION LOGS (5)
  // ============================================
  const logData = [
    { ruleName: "Pause low ROAS campaigns", actionType: "PAUSE", description: "Paused Meta retargeting campaign due to ROAS below 1.0", oldValue: "ACTIVE", newValue: "PAUSED" },
    { ruleName: "Increase budget on high performers", actionType: "BUDGET_CHANGE", description: "Increased Google Brand Keywords daily budget by 20%", oldValue: "150", newValue: "180" },
    { ruleName: "Rotate underperforming creatives", actionType: "CREATIVE_CHANGE", description: "Rotated ad creative for X Thought Leadership campaign", oldValue: "creative_v1", newValue: "creative_v2" },
    { ruleName: "Bid adjustment for high CPA", actionType: "BID_CHANGE", description: "Reduced bid by 10% for TikTok Brand Awareness", oldValue: "2.50", newValue: "2.25" },
    { ruleName: "Increase budget on high performers", actionType: "BUDGET_CHANGE", description: "Increased Google Competitor Keywords budget by 20%", oldValue: "200", newValue: "240" },
  ];

  for (let i = 0; i < logData.length; i++) {
    await prisma.optimizationLog.create({
      data: {
        ...logData[i],
        campaignId: campaigns[i % campaigns.length].id,
        createdAt: daysAgo(randomBetween(1, 20)),
      },
    });
  }
  console.log("Created 5 optimization logs");

  // ============================================
  // SOCIAL ACCOUNTS (3)
  // ============================================
  const socialAccountData = [
    { platform: "INSTAGRAM", accountId: "ig-crm-official", accountName: "CRM Official", followerCount: 12400 },
    { platform: "FACEBOOK", accountId: "fb-crm-page", accountName: "CRM App", followerCount: 8700 },
    { platform: "LINKEDIN", accountId: "li-crm-company", accountName: "CRM Solutions", followerCount: 5200 },
  ];

  const socialAccounts: SocialAccount[] = [];
  for (const s of socialAccountData) {
    const account = await prisma.socialAccount.create({
      data: {
        ...s,
        accessToken: `social_tok_${s.platform.toLowerCase()}`,
        isActive: true,
      },
    });
    socialAccounts.push(account);
  }
  console.log(`Created ${socialAccounts.length} social accounts`);

  // ============================================
  // CONTENT THEMES (3)
  // ============================================
  const themeData = [
    { name: "Educational", description: "Tips, tutorials, and industry insights", color: "#3B82F6", contentRatio: 0.4 },
    { name: "Behind-the-Scenes", description: "Team culture, office life, product development", color: "#10B981", contentRatio: 0.3 },
    { name: "Product Tips", description: "Feature highlights, use cases, and best practices", color: "#F59E0B", contentRatio: 0.3 },
  ];

  const themes = [];
  for (const t of themeData) {
    const theme = await prisma.contentTheme.create({ data: t });
    themes.push(theme);
  }
  console.log(`Created ${themes.length} content themes`);

  // ============================================
  // SOCIAL POSTS (10)
  // ============================================
  const postData = [
    { content: "5 CRM mistakes that are costing you deals. Thread: 1. Not tracking lead sources...", platform: "LINKEDIN", status: "PUBLISHED", themeIdx: 0 },
    { content: "Our team just shipped the new pipeline view! Here's a sneak peek of what's coming next.", platform: "INSTAGRAM", status: "PUBLISHED", themeIdx: 1 },
    { content: "Pro tip: Use tags to segment your contacts by industry. Makes follow-ups 3x more effective.", platform: "FACEBOOK", status: "PUBLISHED", themeIdx: 2 },
    { content: "What's the #1 feature you'd want in a CRM? Drop your thoughts below!", platform: "LINKEDIN", status: "PUBLISHED", themeIdx: 0 },
    { content: "Friday afternoon at the office - the team celebrating hitting 1000 users!", platform: "INSTAGRAM", status: "SCHEDULED", themeIdx: 1 },
    { content: "Did you know you can automate email sequences based on lead score? Here's how...", platform: "FACEBOOK", status: "SCHEDULED", themeIdx: 2 },
    { content: "The complete guide to lead scoring for B2B SaaS companies.", platform: "LINKEDIN", status: "DRAFT", themeIdx: 0 },
    { content: "Meet our engineering team! Today we're spotlighting our backend developers.", platform: "INSTAGRAM", status: "DRAFT", themeIdx: 1 },
    { content: "3 ways to use our new dashboard to track your sales pipeline.", platform: "FACEBOOK", status: "PUBLISHED", themeIdx: 2 },
    { content: "Why we chose to build our CRM differently - a thread on our engineering philosophy.", platform: "LINKEDIN", status: "SCHEDULED", themeIdx: 0 },
  ];

  const platformToAccount: Record<string, number> = { INSTAGRAM: 0, FACEBOOK: 1, LINKEDIN: 2 };

  for (const p of postData) {
    const isPublished = p.status === "PUBLISHED";
    const isScheduled = p.status === "SCHEDULED";
    await prisma.socialPost.create({
      data: {
        socialAccountId: socialAccounts[platformToAccount[p.platform]].id,
        content: p.content,
        platform: p.platform,
        status: p.status,
        contentThemeId: themes[p.themeIdx].id,
        scheduledAt: isScheduled ? daysAgo(-randomBetween(1, 14)) : isPublished ? daysAgo(randomBetween(1, 30)) : undefined,
        publishedAt: isPublished ? daysAgo(randomBetween(1, 30)) : undefined,
        hashtags: JSON.stringify(["#CRM", "#SaaS", "#Sales", "#Productivity"]),
        mediaUrls: JSON.stringify([]),
        metrics: isPublished
          ? JSON.stringify({
              likes: randomBetween(20, 500),
              comments: randomBetween(5, 80),
              shares: randomBetween(2, 50),
              reach: randomBetween(500, 10000),
              impressions: randomBetween(1000, 25000),
            })
          : JSON.stringify({}),
      },
    });
  }
  console.log("Created 10 social posts");

  // ============================================
  // LEAD GEN CAMPAIGN + SCRAPED LEADS (10)
  // ============================================
  const leadGenCampaign = await prisma.leadGenCampaign.create({
    data: {
      name: "Q1 SaaS Decision Makers Outreach",
      status: "ACTIVE",
      targetProfile: JSON.stringify({
        industries: ["Technology", "SaaS", "Fintech"],
        titles: ["CTO", "VP Engineering", "Head of Product"],
        companySize: "50-500",
        location: "United States",
      }),
      scrapingStrategy: JSON.stringify({
        sources: ["LinkedIn", "Apollo", "Clearbit"],
        enrichment: true,
        deduplication: true,
      }),
      targetLeadCount: 500,
      budget: 2500,
    },
  });

  const grades = ["A", "B", "C", "D"];
  const scrapedLeadNames = [
    { first: "Rachel", last: "Foster", company: "StreamLine Tech" },
    { first: "Derek", last: "Chang", company: "Apex Software" },
    { first: "Monica", last: "Reeves", company: "DataPulse" },
    { first: "Tyler", last: "Bennett", company: "CloudSync" },
    { first: "Nina", last: "Kapoor", company: "AgileWorks" },
    { first: "Chris", last: "Moreno", company: "PlatformX" },
    { first: "Aisha", last: "Williams", company: "NovaTech" },
    { first: "Brian", last: "Schultz", company: "ScalePoint" },
    { first: "Priya", last: "Sharma", company: "InnoSoft" },
    { first: "Kevin", last: "O'Donnell", company: "ByteForge" },
  ];

  for (let i = 0; i < 10; i++) {
    const fitScore = randomBetween(20, 95);
    const intentScore = randomBetween(10, 90);
    const engagementScore = randomBetween(5, 85);
    const totalScore = Math.round((fitScore + intentScore + engagementScore) / 3);
    const grade = totalScore >= 75 ? "A" : totalScore >= 55 ? "B" : totalScore >= 35 ? "C" : "D";

    await prisma.scrapedLead.create({
      data: {
        leadGenCampaignId: leadGenCampaign.id,
        rawData: JSON.stringify({
          firstName: scrapedLeadNames[i].first,
          lastName: scrapedLeadNames[i].last,
          company: scrapedLeadNames[i].company,
          title: pick(["CTO", "VP Engineering", "Head of Product", "Director of Technology"]),
          email: `${scrapedLeadNames[i].first.toLowerCase()}@${scrapedLeadNames[i].company.toLowerCase().replace(/\s/g, "")}.com`,
          linkedin: `https://linkedin.com/in/${scrapedLeadNames[i].first.toLowerCase()}-${scrapedLeadNames[i].last.toLowerCase()}`,
        }),
        enrichmentData: JSON.stringify({
          companySize: randomBetween(50, 500),
          industry: pick(["Technology", "SaaS", "Fintech"]),
          revenue: `$${randomBetween(5, 100)}M`,
          fundingStage: pick(["Series A", "Series B", "Series C"]),
        }),
        fitScore,
        intentScore,
        engagementScore,
        totalScore,
        grade,
        status: pick(["NEW", "ENRICHED", "SCORED", "CONTACTED"]),
        createdAt: daysAgo(randomBetween(1, 20)),
      },
    });
  }
  console.log("Created lead gen campaign with 10 scraped leads");

  // ============================================
  // EMAIL SEQUENCES (2) with steps
  // ============================================
  const coldSequence = await prisma.emailSequence.create({
    data: {
      name: "Cold Outreach - SaaS Decision Makers",
      type: "COLD",
      isActive: true,
      steps: JSON.stringify([
        { delay: 0, subject: "Quick question about {{company}}", body: "Hi {{firstName}}, I noticed {{company}} is growing fast. We help teams like yours streamline their sales pipeline...", type: "EMAIL" },
        { delay: 3, subject: "Re: Quick question about {{company}}", body: "Hi {{firstName}}, just following up on my previous email. I'd love to show you how we helped similar companies increase close rates by 35%...", type: "EMAIL" },
        { delay: 5, subject: "{{firstName}}, a resource for {{company}}", body: "Hi {{firstName}}, I put together a case study that's relevant to what {{company}} is doing. Would you like me to send it over?", type: "EMAIL" },
        { delay: 7, subject: "Last touch - partnership opportunity", body: "Hi {{firstName}}, I don't want to be a bother. If now isn't the right time, no worries. Just reply 'later' and I'll circle back in a few months.", type: "EMAIL" },
        { delay: 14, subject: "Checking back in", body: "Hi {{firstName}}, it's been a couple weeks. If you're still interested in improving your sales process, I'd love to chat for 15 minutes.", type: "EMAIL" },
      ]),
    },
  });

  const nurtureSequence = await prisma.emailSequence.create({
    data: {
      name: "MQL Nurture Sequence",
      type: "NURTURE",
      isActive: true,
      steps: JSON.stringify([
        { delay: 0, subject: "Welcome to CRM - getting started guide", body: "Hi {{firstName}}, thanks for your interest! Here's a quick guide to get the most out of our platform...", type: "EMAIL" },
        { delay: 2, subject: "3 tips to supercharge your pipeline", body: "Hi {{firstName}}, here are three power tips our most successful users swear by...", type: "EMAIL" },
        { delay: 5, subject: "Your free ROI calculator", body: "Hi {{firstName}}, we built an ROI calculator to help you see the impact of better CRM usage...", type: "EMAIL" },
      ]),
    },
  });

  // Enroll some contacts
  const enrollableContacts = contacts.filter((c) =>
    ["MQL", "SQL", "LEAD"].includes(contactData[contacts.indexOf(c)].lifecycleStage)
  );
  const coldEnrollees = enrollableContacts.slice(0, 4);
  const nurtureEnrollees = enrollableContacts.slice(4, 8);

  for (const contact of coldEnrollees) {
    await prisma.emailSequenceEnrollment.create({
      data: {
        sequenceId: coldSequence.id,
        contactId: contact.id,
        currentStep: randomBetween(0, 4),
        status: pick(["ACTIVE", "ACTIVE", "COMPLETED", "PAUSED"]),
        enrolledAt: daysAgo(randomBetween(5, 25)),
      },
    });
  }

  for (const contact of nurtureEnrollees) {
    await prisma.emailSequenceEnrollment.create({
      data: {
        sequenceId: nurtureSequence.id,
        contactId: contact.id,
        currentStep: randomBetween(0, 2),
        status: pick(["ACTIVE", "ACTIVE", "COMPLETED"]),
        enrolledAt: daysAgo(randomBetween(3, 15)),
      },
    });
  }
  console.log("Created 2 email sequences with enrollments");

  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
