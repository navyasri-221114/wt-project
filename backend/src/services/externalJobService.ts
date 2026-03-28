/**
 * ExternalJobService - Production-Ready Hybrid Job Aggregation
 * ─────────────────────────────────────────────────────────────
 * Uses Adzuna API (free tier) to fetch real jobs from top companies.
 * Falls back to curated static data if API is unavailable.
 * Implements in-memory cache with 45-minute TTL.
 *
 * WHY API OVER SCRAPING:
 *   - Scraping violates ToS and breaks on DOM changes
 *   - APIs are rate-limit safe, reliable, and legal
 *   - Structured data requires zero parsing, reducing errors
 *
 * WHY CACHING:
 *   - External API calls are slow (200–800ms). Cache serves in ~1ms.
 *   - Protects against API rate limits (Adzuna: 250 req/day free)
 *   - Ensures uptime even if external API goes down
 */

export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description?: string;
  applyLink: string;
  source: 'external';
  tag: 'Featured';
  fetchedAt: string;
}

// ─── In-Memory Cache ───────────────────────────────────────────────────────────
const CACHE_DURATION_MS = 45 * 60 * 1000; // 45 minutes
let cache: {
  data: ExternalJob[];
  fetchedAt: number;
  isValid: boolean;
} = {
  data: [],
  fetchedAt: 0,
  isValid: false,
};

// ─── Fallback Data (shown when API is unavailable) ────────────────────────────
const FALLBACK_JOBS: ExternalJob[] = [
  {
    id: 'ext-fallback-1',
    title: 'Software Engineer II',
    company: 'Google',
    location: 'Hyderabad, India',
    salary: '₹25L - ₹40L PA',
    description: 'Build next generation systems at scale using Go, Java, and distributed computing.',
    applyLink: 'https://careers.google.com',
    source: 'external',
    tag: 'Featured',
    fetchedAt: new Date().toISOString(),
  },
  {
    id: 'ext-fallback-2',
    title: 'Full Stack Developer',
    company: 'Microsoft',
    location: 'Bengaluru, India',
    salary: '₹22L - ₹35L PA',
    description: 'Join the Azure team to build cloud-native solutions for enterprise clients worldwide.',
    applyLink: 'https://careers.microsoft.com',
    source: 'external',
    tag: 'Featured',
    fetchedAt: new Date().toISOString(),
  },
  {
    id: 'ext-fallback-3',
    title: 'Systems Engineer',
    company: 'TCS',
    location: 'Chennai, India',
    salary: '₹6L - ₹9L PA',
    description: 'Work on enterprise-level IT transformation projects across banking, retail, and healthcare.',
    applyLink: 'https://www.tcs.com/careers',
    source: 'external',
    tag: 'Featured',
    fetchedAt: new Date().toISOString(),
  },
  {
    id: 'ext-fallback-4',
    title: 'Associate Software Engineer',
    company: 'Infosys',
    location: 'Pune, India',
    salary: '₹5L - ₹8L PA',
    description: 'Develop and maintain software solutions across a wide range of client environments.',
    applyLink: 'https://www.infosys.com/careers',
    source: 'external',
    tag: 'Featured',
    fetchedAt: new Date().toISOString(),
  },
  {
    id: 'ext-fallback-5',
    title: 'SDE – Backend',
    company: 'Amazon',
    location: 'Hyderabad, India',
    salary: '₹28L - ₹42L PA',
    description: 'Design, develop, and maintain large-scale distributed systems for Amazon retail operations.',
    applyLink: 'https://amazon.jobs',
    source: 'external',
    tag: 'Featured',
    fetchedAt: new Date().toISOString(),
  },
  {
    id: 'ext-fallback-6',
    title: 'Software Developer',
    company: 'Wipro',
    location: 'Bengaluru, India',
    salary: '₹5.5L - ₹8.5L PA',
    description: 'Work with global clients delivering digital transformation across cloud and AI platforms.',
    applyLink: 'https://careers.wipro.com',
    source: 'external',
    tag: 'Featured',
    fetchedAt: new Date().toISOString(),
  },
];

// ─── Normalize Adzuna Response ─────────────────────────────────────────────────
function normalizeAdzunaJob(raw: any): ExternalJob {
  return {
    id: `ext-adzuna-${raw.id}`,
    title: raw.title || 'Software Engineer',
    company: raw.company?.display_name || 'Top Company',
    location: raw.location?.display_name || 'India',
    salary: raw.salary_min
      ? `₹${Math.round(raw.salary_min / 100000)}L - ₹${Math.round((raw.salary_max || raw.salary_min * 1.4) / 100000)}L PA`
      : undefined,
    description: raw.description?.slice(0, 300) || '',
    applyLink: raw.redirect_url || '#',
    source: 'external',
    tag: 'Featured',
    fetchedAt: new Date().toISOString(),
  };
}

// ─── API Fetch with Timeout ────────────────────────────────────────────────────
async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Primary: Adzuna API ───────────────────────────────────────────────────────
async function fetchFromAdzuna(): Promise<ExternalJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn('[ExternalJobs] Adzuna credentials not set. Using fallback data.');
    return [];
  }

  const queries = [
    'software engineer Google',
    'developer Microsoft',
    'software engineer Amazon',
    'TCS infosys wipro developer',
  ];

  const allJobs: ExternalJob[] = [];
  
  for (const q of queries) {
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=5&what=${encodeURIComponent(q)}&content-type=application/json`;
      const res = await fetchWithTimeout(url, 8000);

      if (!res.ok) {
        console.warn(`[ExternalJobs] Adzuna returned ${res.status} for query: "${q}"`);
        continue;
      }

      const data = await res.json();
      const jobs = (data.results || []).map(normalizeAdzunaJob);
      allJobs.push(...jobs);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`[ExternalJobs] Request timeout for query: "${q}"`);
      } else {
        console.warn(`[ExternalJobs] Adzuna error:`, err.message);
      }
    }
  }

  return allJobs;
}

// ─── Secondary: JSearch via RapidAPI ─────────────────────────────────────────
async function fetchFromJSearch(): Promise<ExternalJob[]> {
  const rapidApiKey = process.env.RAPID_API_KEY;
  if (!rapidApiKey) return [];

  const companies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys'];
  const allJobs: ExternalJob[] = [];

  for (const company of companies.slice(0, 3)) {
    try {
      const url = `https://jsearch.p.rapidapi.com/search?query=software+engineer+${company}+India&num_pages=1&page=1`;
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) continue;

      const data = await res.json();
      const jobs: ExternalJob[] = (data.data || []).slice(0, 3).map((raw: any) => ({
        id: `ext-jsearch-${raw.job_id}`,
        title: raw.job_title || 'Software Engineer',
        company: raw.employer_name || company,
        location: raw.job_city ? `${raw.job_city}, ${raw.job_country}` : 'India',
        salary: raw.job_min_salary
          ? `${raw.job_salary_currency || '$'}${raw.job_min_salary}K - ${raw.job_max_salary || raw.job_min_salary * 1.3}K`
          : undefined,
        description: raw.job_description?.slice(0, 300),
        applyLink: raw.job_apply_link || '#',
        source: 'external' as const,
        tag: 'Featured' as const,
        fetchedAt: new Date().toISOString(),
      }));
      allJobs.push(...jobs);
    } catch (err: any) {
      console.warn(`[ExternalJobs] JSearch error for ${company}:`, err.message);
    }
  }

  return allJobs;
}

// ─── Deduplicate by title+company ─────────────────────────────────────────────
function deduplicate(jobs: ExternalJob[]): ExternalJob[] {
  const seen = new Set<string>();
  return jobs.filter(job => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const externalJobService = {
  /**
   * Returns cached external jobs or fetches fresh ones.
   * NEVER throws — always returns an array (may be empty or fallback).
   */
  async getJobs(filters?: { company?: string; location?: string }): Promise<ExternalJob[]> {
    const now = Date.now();

    // ── Return cache if valid ──────────────────────────────────────────────
    if (cache.isValid && now - cache.fetchedAt < CACHE_DURATION_MS) {
      console.log(`[ExternalJobs] Serving ${cache.data.length} jobs from cache.`);
      return applyFilters(cache.data, filters);
    }

    // ── Fetch fresh data ───────────────────────────────────────────────────
    console.log('[ExternalJobs] Cache expired. Fetching fresh data...');
    
    try {
      // Try Adzuna first, then JSearch as secondary
      let freshJobs = await fetchFromAdzuna();
      
      if (freshJobs.length < 5) {
        console.log('[ExternalJobs] Trying JSearch as secondary source...');
        const jsearchJobs = await fetchFromJSearch();
        freshJobs = [...freshJobs, ...jsearchJobs];
      }

      // If both APIs return nothing, use fallback
      if (freshJobs.length === 0) {
        console.warn('[ExternalJobs] Both APIs returned empty. Using curated fallback data.');
        freshJobs = FALLBACK_JOBS.map(j => ({ ...j, fetchedAt: new Date().toISOString() }));
      }

      const deduplicated = deduplicate(freshJobs);

      // ── Update cache ───────────────────────────────────────────────────
      cache = {
        data: deduplicated,
        fetchedAt: now,
        isValid: true,
      };

      console.log(`[ExternalJobs] Cached ${deduplicated.length} jobs. TTL: 45 minutes.`);
      return applyFilters(deduplicated, filters);

    } catch (err: any) {
      console.error('[ExternalJobs] Fatal fetch error:', err.message);

      // ── Graceful fallback: return stale cache if available ─────────────
      if (cache.data.length > 0) {
        console.warn('[ExternalJobs] Returning stale cache as fallback.');
        return applyFilters(cache.data, filters);
      }

      // ── Last resort: return static fallback ───────────────────────────
      console.warn('[ExternalJobs] Returning static fallback data.');
      return applyFilters(
        FALLBACK_JOBS.map(j => ({ ...j, fetchedAt: new Date().toISOString() })),
        filters
      );
    }
  },

  /** Returns current cache metadata for debugging. */
  getCacheStatus() {
    return {
      isValid: cache.isValid,
      jobCount: cache.data.length,
      fetchedAt: cache.fetchedAt ? new Date(cache.fetchedAt).toISOString() : null,
      expiresAt: cache.fetchedAt
        ? new Date(cache.fetchedAt + CACHE_DURATION_MS).toISOString()
        : null,
      ttlRemainingMs: Math.max(0, CACHE_DURATION_MS - (Date.now() - cache.fetchedAt)),
    };
  },

  /** Force-clears the cache (used for testing). */
  clearCache() {
    cache = { data: [], fetchedAt: 0, isValid: false };
    console.log('[ExternalJobs] Cache cleared.');
  },
};

function applyFilters(jobs: ExternalJob[], filters?: { company?: string; location?: string }): ExternalJob[] {
  let result = jobs;
  if (filters?.company) {
    const q = filters.company.toLowerCase();
    result = result.filter(j => j.company.toLowerCase().includes(q));
  }
  if (filters?.location) {
    const q = filters.location.toLowerCase();
    result = result.filter(j => j.location.toLowerCase().includes(q));
  }
  // Sort by most recently fetched
  return result.sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
}
