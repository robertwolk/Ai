# Lead Scraping & Enrichment APIs Reference

## Tier 1: Primary Lead Sources

### Apollo.io API
The all-in-one lead source — company search, contact search, email finding, enrichment.

```
Base URL: https://api.apollo.io/v1

# Search for companies
POST /mixed_companies/search
Body: {
  "organization_num_employees_ranges": ["20,100"],
  "organization_locations": ["Austin, Texas"],
  "q_organization_keyword_tags": ["SaaS", "e-commerce"],
  "technographics": ["shopify", "klaviyo"],
  "revenue_range": {"min": 1000000, "max": 50000000},
  "page": 1, "per_page": 100
}

# Search for contacts (people)
POST /mixed_people/search
Body: {
  "person_titles": ["CEO", "CMO", "Head of Marketing", "VP Growth"],
  "organization_ids": ["org_id_1", "org_id_2"],
  "person_locations": ["United States"],
  "contact_email_status": ["verified"],
  "page": 1, "per_page": 100
}

# Enrich a person
POST /people/match
Body: {
  "email": "john@example.com",
  "first_name": "John", "last_name": "Doe",
  "organization_name": "Acme Corp"
}
Returns: title, company, linkedin_url, phone, email_status, etc.

# Enrich a company
POST /organizations/enrich
Body: { "domain": "example.com" }
Returns: name, industry, employee_count, revenue, technologies, founded_year, etc.
```

**Pricing**: ~$49-149/mo for 2,400-12,000 credits
**Rate limits**: 50 requests/minute

---

### Hunter.io API
Email finding and verification specialist.

```
Base URL: https://api.hunter.io/v2

# Find email by domain + name
GET /email-finder?domain=example.com&first_name=John&last_name=Doe&api_key=KEY
Returns: email, score (confidence), sources

# Find all emails at a domain
GET /domain-search?domain=example.com&api_key=KEY
Returns: list of emails with names, titles, departments

# Verify an email
GET /email-verifier?email=john@example.com&api_key=KEY
Returns: status (valid/invalid/accept_all), score, smtp_check, mx_records

# Bulk email finder
POST /email_finder_batch
Body: { "emails": [{"domain": "example.com", "first_name": "John", "last_name": "Doe"}] }
```

**Pricing**: Free tier (25 searches/mo), $49/mo (500 searches), $149/mo (5,000 searches)
**Rate limits**: 10 requests/second

---

### Crunchbase API
Company data, funding, investors, and growth signals.

```
Base URL: https://api.crunchbase.com/api/v4

# Search organizations
GET /searches/organizations
Body: {
  "field_ids": ["identifier", "short_description", "num_employees_enum", 
                "revenue_range", "founded_on", "location_identifiers",
                "categories", "funding_total", "last_funding_type"],
  "query": [
    {"type": "predicate", "field_id": "num_employees_enum", "operator_id": "between", "values": ["c_00020_00050", "c_00050_00100"]},
    {"type": "predicate", "field_id": "location_identifiers", "operator_id": "includes", "values": ["austin-texas"]},
    {"type": "predicate", "field_id": "last_funding_type", "operator_id": "includes", "values": ["seed", "series_a"]}
  ]
}

# Get company details
GET /entities/organizations/{permalink}

# Get funding rounds
GET /entities/organizations/{permalink}/funding_rounds
```

**Pricing**: $29/mo (basic), $49/mo (pro), enterprise custom
**Rate limits**: 200 requests/minute

---

## Tier 2: Enrichment Sources

### BuiltWith API
Identify what technology a website uses.

```
Base URL: https://api.builtwith.com/v21/api.json

# Technology lookup
GET ?KEY=key&LOOKUP=example.com
Returns: complete technology stack — CMS, e-commerce, analytics, 
         marketing tools, hosting, frameworks, JavaScript libraries, etc.

# Technology search (find sites using specific tech)
GET /search?KEY=key&TECH=Shopify&OFFSET=0&AMOUNT=100
Returns: list of websites using Shopify
```

**Pricing**: $295/mo (basic), $495/mo (pro)
**Rate limits**: 50 requests/minute

---

### Clearbit API (now part of HubSpot)
Company and person enrichment.

```
# Company enrichment
GET https://company.clearbit.com/v2/companies/find?domain=example.com
Returns: name, industry, sector, sub_industry, employee_count, 
         revenue_range, tech, founded_year, description, social profiles

# Person enrichment  
GET https://person.clearbit.com/v2/people/find?email=john@example.com
Returns: name, title, company, linkedin, twitter, location, avatar

# Prospector (find leads at a company)
GET https://prospector.clearbit.com/v1/people/search?domain=example.com&role=marketing&seniority=executive
```

**Pricing**: Free tier (limited), paid plans vary
**Rate limits**: 600 requests/minute

---

### SimilarWeb API
Website traffic and competitive intelligence.

```
Base URL: https://api.similarweb.com/v1

# Website overview
GET /website/{domain}/total-traffic-and-engagement/visits?api_key=KEY&start_date=2024-01&end_date=2024-03&country=us&granularity=monthly
Returns: visits, page_views, bounce_rate, avg_visit_duration

# Traffic sources
GET /website/{domain}/traffic-sources/overview
Returns: direct, referral, search, social, paid, email percentages

# Top keywords
GET /website/{domain}/search-keywords/paid-keywords
Returns: paid search keywords with volume and CPC
```

**Pricing**: Custom enterprise pricing
**Rate limits**: Varies by plan

---

## Tier 3: Verification & Validation

### NeverBounce API
Email verification at scale.

```
Base URL: https://api.neverbounce.com/v4

# Single email verification
POST /single/check
Body: { "email": "john@example.com" }
Returns: result (valid, invalid, disposable, catchall, unknown)

# Bulk verification
POST /jobs/create
Body: { "input_location": "supplied", "input": [{"email": "john@example.com"}, ...] }
Then: GET /jobs/results?job_id=JOB_ID
```

**Pricing**: $0.003-0.008 per verification
**Rate limits**: 100 requests/minute

---

### ZeroBounce API
Email verification + abuse detection.

```
Base URL: https://api.zerobounce.net/v2

# Validate email
GET /validate?api_key=KEY&email=john@example.com
Returns: status (valid/invalid/catch-all/spamtrap/abuse/do_not_mail),
         sub_status, free_email, mx_found, smtp_provider

# Bulk validation
POST /validatebatch
Body: { "email_batch": [{"email_address": "john@example.com"}, ...] }
```

**Pricing**: $0.007-0.01 per verification
**Rate limits**: 200 requests/minute

---

## Tier 4: Web Scraping Tools

### For Dynamic JavaScript Sites (Playwright/Puppeteer)
```javascript
// Playwright example — scrape company "About" page
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://example.com/about');
const teamMembers = await page.$$eval('.team-member', members =>
  members.map(m => ({
    name: m.querySelector('.name')?.textContent,
    title: m.querySelector('.title')?.textContent,
    linkedin: m.querySelector('a[href*="linkedin"]')?.href
  }))
);
```

### For Static HTML Sites (Cheerio)
```javascript
const cheerio = require('cheerio');
const response = await fetch('https://example.com/about');
const html = await response.text();
const $ = cheerio.load(html);
const teamMembers = [];
$('.team-member').each((i, el) => {
  teamMembers.push({
    name: $(el).find('.name').text(),
    title: $(el).find('.title').text()
  });
});
```

### Google Maps Scraping (for local businesses)
```
# Use Google Places API
GET https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Austin+TX&key=KEY
Returns: name, address, phone, rating, website, place_id

# Get details
GET https://maps.googleapis.com/maps/api/place/details/json?place_id=PLACE_ID&key=KEY
Returns: reviews, opening_hours, website, formatted_phone_number
```

### Proxy Rotation (for avoiding blocks)
```javascript
// Use rotating proxy service (BrightData, Oxylabs, SmartProxy)
const proxyList = [
  'http://user:pass@proxy1.example.com:8080',
  'http://user:pass@proxy2.example.com:8080',
  // ...
];
const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
```

---

## Enrichment Chain Sequence

For each lead, run enrichment in this order:

```
1. FIND: Company name + domain
   └─ Source: Apollo or Crunchbase
   
2. ENRICH COMPANY: Industry, size, revenue, tech stack
   └─ Source: Clearbit → BuiltWith → Apollo fallback
   
3. FIND PEOPLE: Decision-maker names + titles at company
   └─ Source: Apollo → LinkedIn → Company website scrape
   
4. FIND EMAILS: Email addresses for each person
   └─ Source: Hunter.io → Apollo → Snov.io fallback
   
5. VERIFY EMAILS: Confirm deliverability
   └─ Source: NeverBounce → ZeroBounce fallback
   
6. FIND PHONES: Direct phone numbers
   └─ Source: Apollo → Lusha (optional)
   
7. FIND SOCIALS: LinkedIn URL, Twitter handle
   └─ Source: Clearbit → Apollo → Google search
   
8. SCORE: Apply lead scoring model (fit + intent + engagement)
   └─ Source: Internal scoring engine
   
9. DEDUPLICATE: Check against existing CRM contacts
   └─ Source: Internal CRM database
   
10. IMPORT: Push to CRM + trigger campaign activation
    └─ Destination: CRM contacts + ad audiences + email sequences
```

---

## Cost Estimation Per Lead

| Service | Cost per lead | What you get |
|---------|--------------|--------------|
| Apollo (find + enrich) | $0.02-0.05 | Company + person + email + phone |
| Hunter (email find) | $0.03-0.10 | Email address + confidence score |
| NeverBounce (verify) | $0.003-0.008 | Email deliverability check |
| BuiltWith (tech stack) | $0.05-0.10 | Full technology profile |
| Clearbit (enrich) | $0.05-0.20 | Company + person enrichment |
| **Total per lead** | **$0.15-0.50** | **Fully enriched + verified** |

For a campaign of 1,000 leads: **$150-$500 estimated cost**
