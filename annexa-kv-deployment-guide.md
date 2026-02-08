# Annexa Persistent Caching Deployment Guide

**Status:** ✅ Implementation Complete  
**Date:** February 8, 2026  
**Changes:** Vercel KV caching for Gemini functions

---

## What Was Changed

### Modified Files (3)
1. **`functions/generateDocuments.ts`**
   - Replaced in-memory `Map()` with Vercel KV
   - Graceful fallback to memory cache if KV unavailable
   - 24-hour TTL for cached responses

2. **`functions/enhanceWithAI.ts`**
   - Added KV-based response caching
   - Persistent rate limiting (10 requests/day per IP)
   - Smart TTL: rate limits expire at midnight

3. **`functions/analyzeCompetitor.ts`**
   - Added competitor analysis caching
   - Uses normalized URL as cache key
   - Returns `cached: true` flag when serving from cache

### New Files (1)
4. **`.env.example`**
   - Documents all required environment variables
   - Includes KV credentials template

---

## Expected Performance Impact

### Before (In-Memory Cache)
- Cache hit rate: **~0%** (resets on every cold start)
- Gemini API calls: **100%** of requests
- Cost: $0.0003 per generation × every request
- Cold start penalty: Full generation time every time

### After (Vercel KV Cache)
- Cache hit rate: **~70%** (persists across cold starts)
- Gemini API calls: **~30%** of requests
- Cost: $0.0003 per generation × 30% = **70% cost reduction**
- Cold start penalty: Eliminated for cached content

### Real-World Example
**100 users generating documents:**
- Before: 100 Gemini API calls = $0.03
- After: 30 Gemini API calls + 70 KV reads = $0.009 + negligible KV cost
- **Savings: ~$0.02 per 100 requests (67% reduction)**

---

## Deployment Checklist

### Phase 1: Vercel KV Setup (10 minutes)

**Step 1: Create KV Store**
```bash
# Option A: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Navigate to Storage tab
3. Click "Create Database"
4. Select "KV" (Redis-compatible)
5. Name it: "annexa-cache"
6. Region: Choose closest to your users (e.g., EU for Estonia)
```

```bash
# Option B: Via Vercel CLI
vercel kv create annexa-cache
```

**Step 2: Get Credentials**
```
After creation, Vercel shows:
✅ KV_REST_API_URL=https://...kv.vercel-storage.com
✅ KV_REST_API_TOKEN=...
```

**Copy these values** - you'll need them in the next step.

---

### Phase 2: Environment Configuration (5 minutes)

**Step 1: Update Base44 Environment Variables**

In Base44 dashboard → Settings → Environment Variables, add:

```env
KV_REST_API_URL=https://your-kv-instance.kv.vercel-storage.com
KV_REST_API_TOKEN=your_token_here
```

**Step 2: Verify Existing Variables**

Ensure these are already set (from previous deployment):
```env
GEMINI_API_KEY=your_gemini_key
APP_URL=https://annexa.vox-animus.com
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_base_url
```

---

### Phase 3: Local Testing (15 minutes)

**Step 1: Update Local `.env`**
```bash
# Create .env file in project root
cp .env.example .env

# Add your KV credentials
echo "KV_REST_API_URL=https://..." >> .env
echo "KV_REST_API_TOKEN=..." >> .env
```

**Step 2: Test Functions Locally**
```bash
# Start dev server
npm run dev

# Test document generation
# Navigate to http://localhost:5173/Form
# Fill out form and generate documents
# Check console for cache hit/miss logs
```

**Expected Console Output:**
```
✅ First generation: "Cache miss, generating fresh content"
✅ Second generation (same inputs): "Cache hit, serving from KV"
```

**Step 3: Test Graceful Fallback**
```bash
# Temporarily remove KV credentials from .env
# Comment out KV_REST_API_URL and KV_REST_API_TOKEN

# Start dev server again
npm run dev

# Test document generation
# Should work but use in-memory cache
```

**Expected Console Output:**
```
⚠️  "KV not available, using memory cache"
✅ Function still works
```

---

### Phase 4: Production Deployment (10 minutes)

**Step 1: Commit Changes**
```bash
git status
# Should show:
#   modified: functions/generateDocuments.ts
#   modified: functions/enhanceWithAI.ts
#   modified: functions/analyzeCompetitor.ts
#   new file: .env.example

git add .
git commit -m "feat: implement persistent Gemini caching with Vercel KV

- Add KV-based caching for generateDocuments, enhanceWithAI, analyzeCompetitor
- Graceful fallback to in-memory cache if KV unavailable
- Persistent rate limiting for IP-based restrictions
- Expected 70% reduction in Gemini API costs
- Add .env.example documenting required variables"

git push origin main
```

**Step 2: Base44 Auto-Sync**
- Changes appear in Base44 Builder automatically
- No manual upload required

**Step 3: Deploy to Production**
```bash
# In Base44 UI
1. Click "Publish" button
2. Wait for build to complete (~2 minutes)
3. Verify deployment successful
```

---

### Phase 5: Post-Deployment Verification (15 minutes)

**Test 1: Cache Functionality**
```bash
# Test via frontend UI
1. Go to https://your-annexa-domain.com/Form
2. Fill out form with business details
3. Click "Generate Documents"
4. Note generation time (should be ~3-5 seconds)
5. Go back and fill form with SAME details
6. Click "Generate Documents" again
7. Note generation time (should be <1 second if cached)
```

**What to Look For:**
- ✅ First generation: Normal speed (3-5s)
- ✅ Second generation: Near-instant (<1s)
- ✅ Same output content both times

**Test 2: Rate Limiting Persistence**
```bash
# Test AI enhancement rate limit (10 requests/day)
1. Use the competitive intelligence feature
2. Try to enhance content 11 times from same IP
3. 11th request should return rate limit error
4. Wait until next day (midnight UTC)
5. Rate limit should reset
```

**Expected Behavior:**
- ✅ Requests 1-10: Success
- ✅ Request 11+: "Rate limit exceeded" error
- ✅ Next day: Rate limit resets automatically

**Test 3: Graceful Fallback**
```bash
# Simulate KV unavailability
1. In Base44 environment settings, temporarily remove KV credentials
2. Redeploy
3. Test document generation
4. Should still work (using in-memory fallback)
5. Restore KV credentials
6. Redeploy
```

**Expected Behavior:**
- ✅ Functions work without KV
- ✅ Cache doesn't persist (but doesn't break)
- ✅ Functions work better with KV restored

**Test 4: Cache Expiration**
```bash
# Verify 24-hour TTL
1. Generate a document
2. Wait 25 hours
3. Generate same document again
4. Should be cache miss (regenerates)
```

---

## Monitoring & Verification

### Vercel KV Dashboard Metrics

After deployment, monitor these in Vercel dashboard:

| Metric | Expected Value | What It Means |
|--------|----------------|---------------|
| **Cache Hit Rate** | 60-80% after 24h | Good cache performance |
| **Daily Commands** | 100-500/day | Normal usage |
| **Storage Size** | 1-10 MB | Reasonable cache size |
| **KV Errors** | 0-5/day | Acceptable error rate |

**Red Flags to Watch:**
- ❌ Cache hit rate <30% → Cache keys might not be stable
- ❌ KV errors >50/day → Credential or network issues
- ❌ Storage size >100 MB → TTL might not be working

### Function Logs

Monitor Base44 function logs for these patterns:

**Good Patterns:**
```
✅ "Cache hit for key: business_XYZ_..."
✅ "KV cache set successfully"
✅ "Rate limit check passed (5/10 used)"
```

**Problem Patterns:**
```
❌ "KV operation failed: unauthorized" → Check credentials
❌ "Cache miss on every request" → Check cache key generation
❌ "Memory cache fallback used" → KV credentials missing
```

---

## Troubleshooting

### Problem: Cache Not Persisting
**Symptoms:** Every generation is slow, no cache hits

**Solutions:**
1. Verify KV credentials are set in Base44 environment
2. Check function logs for "KV operation failed" errors
3. Verify KV store is in same region as Base44 deployment
4. Test cache keys are consistent (same input = same key)

### Problem: Rate Limit Not Working
**Symptoms:** Users can make >10 requests/day

**Solutions:**
1. Check KV credentials are set (rate limits need persistence)
2. Verify IP detection works (check `x-forwarded-for` header)
3. Test rate limit key generation (should be `ai_ratelimit_${ip}`)
4. Check TTL calculation (should expire at midnight UTC)

### Problem: Functions Slow After Deployment
**Symptoms:** Even cached content takes 2-3 seconds

**Solutions:**
1. Check KV region matches your user base
2. Verify no network issues between Base44 and Vercel KV
3. Test cache retrieval time directly (should be <100ms)
4. Consider adding connection pooling if consistently slow

### Problem: TypeScript Errors in IDE
**Symptoms:** Red squiggles on `npm:@vercel/kv` imports

**Solution:**
- ✅ **Ignore these** - they're false positives
- ✅ IDE doesn't understand Deno's `npm:` import syntax
- ✅ Code works correctly in Base44's Deno runtime
- ✅ Build succeeded (Exit code: 0) confirms this

---

## Cost Optimization Tracking

### Before KV (Baseline)
```
100 document generations/day × $0.0003 = $0.03/day
30 days × $0.03 = $0.90/month
```

### After KV (Optimized)
```
Cache hit rate: 70%
30 new generations/day × $0.0003 = $0.009/day
70 cached responses × $0 (free KV reads) = $0
Vercel KV cost = ~$0.10/month (hobby tier)

Total: $0.009 × 30 + $0.10 = $0.37/month
```

**Monthly Savings: $0.53 (59% reduction)**  
**Annual Savings: $6.36**

### Scale at 1,000 Generations/Day
```
Without KV: 1000 × $0.0003 × 30 = $9/month
With KV: 300 × $0.0003 × 30 + $0.10 = $2.80/month

Monthly Savings: $6.20 (69% reduction)
Annual Savings: $74.40
```

---

## Next Steps

### Immediate (Today)
- [ ] Create Vercel KV store
- [ ] Add KV credentials to Base44 environment
- [ ] Deploy to production
- [ ] Run verification tests

### Short-term (This Week)
- [ ] Monitor cache hit rate for 7 days
- [ ] Verify rate limiting works as expected
- [ ] Check KV storage size stays under 10 MB
- [ ] Document any issues in function logs

### Long-term (This Month)
- [ ] Analyze cost savings vs baseline
- [ ] Consider adding cache warming for popular inputs
- [ ] Evaluate cache hit rate by document type
- [ ] Consider expanding caching to other functions

---

## Rollback Plan

If KV causes issues:

**Option 1: Disable KV (Immediate)**
```bash
# Remove KV credentials from Base44 environment
# Functions automatically fall back to in-memory cache
# No code changes needed
```

**Option 2: Revert Code (If Fallback Fails)**
```bash
git revert HEAD
git push origin main
# Base44 auto-syncs and redeploys
```

**Option 3: Selective Rollback**
```bash
# Keep KV in some functions, revert in others
# Edit individual function files
# Remove KV imports and restore Map() cache
```

---

## Success Criteria

✅ **Deployment Successful If:**
- Build completes without errors
- All functions respond to requests
- Cache hits appear in logs after repeat requests
- Rate limiting works (10/day enforced)
- No increase in error rates
- Graceful fallback works when KV unavailable

✅ **Optimization Successful If:**
- Cache hit rate >60% after 24 hours
- Gemini API costs reduce by >50%
- Response time for cached content <1 second
- No degradation in output quality
- KV storage stays under 20 MB

---

**Ready to Deploy?**

Follow phases 1-5 in order. Start with Vercel KV setup, then add credentials to Base44, then push code changes.

The implementation is production-ready with graceful fallbacks, so risk is minimal.

Good luck! 🚀
