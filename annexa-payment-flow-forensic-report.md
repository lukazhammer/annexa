# Annexa Payment Flow Forensic Report

## Executive Summary

| Metric | Value |
|--------|-------|
| **Critical Issue** | Premium tier ($29) does NOT include email - users see $4.99 gate after paying $29 |
| **Root Cause** | `tier === 'premium'` check is inconsistent; Preview.jsx shows $4.99 gate regardless of tier |
| **Impact** | User confusion, perceived value mismatch, potential revenue loss |
| **Fix Complexity** | **Simple** - 15 minutes of code changes |

---

## 1. Payment Components Inventory

### 1.1 Pricing Tiers (Current State)

| Tier | Price | Implementation | Email Included? |
|------|-------|----------------|-----------------|
| Free | $0 | Default, tracked via `tier: 'free'` | Yes (watermarked) |
| Clean Export | $4.99 | **NOT IMPLEMENTED** - shows "Payment coming soon!" | N/A |
| Premium | $29 | **NOT IMPLEMENTED** - just sets `setIsPremium(true)` | **NO (BUG)** |

### 1.2 Payment Components Found

#### Component: `UpsellModal.jsx`
**Location:** `src/components/UpsellModal.jsx`
**Purpose:** Shows after document generation - offers free download vs premium upgrade

**Payment Logic:**
```javascript
// Line 140: Premium branch
if (tier === 'premium') {
  // Shows premium features + FREE email button
  return (
    // ... Download ZIP, PDF, Email - ALL FREE for premium
  );
}

// Line 342: Free branch
return (
  // ... Free download + $29 upgrade CTA
);
```

**State Dependencies:**
- Reads: `tier` prop from parent
- Email: **FREE for premium users** ✅

**Conclusion:** UpsellModal correctly handles `tier === 'premium'`

---

#### Component: `Preview.jsx`
**Location:** `src/pages/Preview.jsx`
**Purpose:** Document preview page with download options

**Payment Logic:**
```javascript
// Lines 272-287: $4.99 Clean Export option
<div className="border-2 border-[#C24516] rounded-lg p-6">
  <span className="text-2xl font-bold text-[#C24516]">$4.99</span>
  <Button onClick={() => alert('Payment integration coming soon!')}>
    Pay $4.99 for Clean Export
  </Button>
</div>
```

**🚨 CRITICAL BUG:** 
- NO check for `tier === 'premium'`
- Premium users STILL see $4.99 gate
- Email button works fine (no gate), but "Clean Export" suggests premium content is paywalled

**State Dependencies:**
- Reads: `tier` from `location.state` (line 17)
- **NEVER checks tier for $4.99 gate**

---

#### Component: `CompetitiveIntelligence.jsx`
**Location:** `src/components/CompetitiveIntelligence.jsx`
**Purpose:** Premium feature - competitor analysis

**Payment Logic:**
```javascript
// Line 26: Tier check
const isPremium = tier === 'premium';

// Lines 28-36: Gate check
const handleAnalyzeClick = () => {
  if (!isPremium) {
    setShowUpgradeModal(true);
    return;
  }
  startAnalysis();
};
```

**Conclusion:** Correctly gates premium feature ✅

---

### 1.3 Payment Trigger Points

| Location | Price | Trigger | Implementation Status |
|----------|-------|---------|----------------------|
| `UpsellModal.jsx:415` | $29 | "Upgrade ($29)" button | `onUpgrade()` → sets tier to premium |
| `CompetitiveIntelligence.jsx:429` | $29 | "Upgrade to Premium - $29" | `onUpgrade()` |
| `Preview.jsx:285` | $4.99 | "Pay $4.99 for Clean Export" | **PLACEHOLDER** - alerts only |

---

## 2. User Journey Flows

### 2.1 Free User → Email Documents

```
1. User completes form in Form.jsx
2. Form.handleSubmit() generates documents
3. UpsellModal opens (setShowUpsellModal(true))
4. User clicks "Continue with free version"
5. handleDownloadFree() navigates to /preview with tier: 'free'
6. Preview.jsx shows:
   - Free download (with watermark) ✅
   - Email to me button ✅
   - $4.99 Clean Export option

RESULT: Free users can email FREE (with watermark) ✅
```

### 2.2 Free User → Premium Upgrade

```
1. User at UpsellModal, clicks "Upgrade ($29)"
2. Form.handleUpgrade() is called:
   - base44.analytics.track({ eventName: 'launch_kit_upsell_clicked' })
   - setIsPremium(true)  ← LOCAL STATE ONLY
   - Navigate to /preview with tier: 'premium'
3. Preview.jsx receives tier: 'premium'
4. Preview.jsx still shows $4.99 gate (BUG!)

RESULT: Premium users see confusing $4.99 option ❌
```

### 2.3 Premium User → Email (BROKEN PATH)

```
1. User paid $29 (tier: 'premium')
2. On Preview.jsx, user sees:
   - Free download (no watermark) ✅
   - Email to me button ✅
   - $4.99 "Clean Export" option ❌ CONFUSING

The $4.99 option is shown because Preview.jsx never checks tier
for the "Download Options" section (lines 241-289).

Expected: Premium users should NOT see $4.99 gate.
```

---

## 3. State Management Analysis

### 3.1 Current State Variables

```typescript
// Form.jsx - Component State
const [isPremium, setIsPremium] = useState(false);  // Local only, not persisted

// Navigation State (passed via React Router)
navigate('/preview', {
  state: {
    documents,
    socialBios,
    technicalFiles,
    competitiveIntel,
    formData,
    tier: 'free' | 'premium'  // Passed as string
  }
});

// Preview.jsx - Reads from location.state
const tier = location.state?.tier || 'free';
```

### 3.2 State Transitions

```
INITIAL STATE:
  Form.jsx: isPremium = false
  tier = 'free' (implicit)

AFTER $29 PAYMENT (Form.handleUpgrade):
  Form.jsx: isPremium = true
  tier = 'premium' (navigation state)
  
PROBLEM: No persistence! If user refreshes Preview.jsx:
  tier = location.state?.tier || 'free' → becomes 'free' again!
```

### 3.3 Missing Persistence

**Current:** Payment state is only in React Router's location.state
**Problem:** 
- Refreshing page loses tier
- No server-side verification
- No Stripe integration yet

---

## 4. Logic Conflicts Identified

### Conflict #1: Preview.jsx Shows $4.99 for Premium Users

**File:** `src/pages/Preview.jsx`
**Lines:** 272-287

**Current Code:**
```jsx
<div className="border-2 border-[#C24516] rounded-lg p-6 bg-zinc-900">
  <div className="flex justify-between items-start mb-2">
    <div>
      <h4 className="font-bold text-lg">Clean Export</h4>
      <p className="text-zinc-400 text-sm">Professional documents with no branding</p>
    </div>
    <span className="text-2xl font-bold text-[#C24516]">$4.99</span>
  </div>
  <Button onClick={() => alert('Payment integration coming soon!')}>
    <Download className="w-4 h-4 mr-2" />
    Pay $4.99 for Clean Export
  </Button>
</div>
```

**Problem:** 
- No `if (tier !== 'premium')` check
- Premium users paid $29 and still see $4.99 gate
- Creates confusion about what $29 includes

**Fix:**
```jsx
{tier !== 'premium' && (
  <div className="border-2 border-[#C24516] rounded-lg p-6 bg-zinc-900">
    {/* ... $4.99 gate ... */}
  </div>
)}

{tier === 'premium' && (
  <div className="border-2 border-green-500/50 rounded-lg p-6 bg-zinc-900">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-bold text-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          Premium Export
        </h4>
        <p className="text-zinc-400 text-sm">Professional documents with no branding</p>
      </div>
      <span className="text-2xl font-bold text-green-500">Included</span>
    </div>
    <Button onClick={() => downloadAll(false)} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
      <Download className="w-4 h-4 mr-2" />
      Download Clean Export
    </Button>
  </div>
)}
```

---

### Conflict #2: No Payment Persistence

**Problem:** Payment state only lives in navigation state, lost on refresh

**Current Implementation:**
```javascript
// Form.jsx
navigate('/preview', { state: { tier: 'premium' } });

// Preview.jsx
const tier = location.state?.tier || 'free';  // Defaults to free!
```

**Quick Fix (localStorage):**
```javascript
// Form.jsx - After "payment"
const handleUpgrade = () => {
  localStorage.setItem('annexa.tier', 'premium');
  // ... existing code
};

// Preview.jsx - On load
const [tier, setTier] = useState(() => {
  return location.state?.tier || localStorage.getItem('annexa.tier') || 'free';
});
```

**Proper Fix:** Implement Stripe with server-side tier storage

---

### Conflict #3: Stripe Not Implemented

**File:** `src/pages/Form.jsx:510-529`

**Current Code:**
```javascript
const handleUpgrade = () => {
  // TODO: Implement Stripe payment
  setIsPremium(true);  // ← Just sets local state, no actual payment!
  // ...
};
```

**Impact:**
- Premium "upgrade" is just a state change
- No actual payment processing
- No receipt/confirmation
- No way to verify premium status server-side

---

## 5. Recommended Architecture

### 5.1 Clean Tier Structure

```
TIER 1: FREE ($0)
├── Generate all legal documents
├── Preview in browser
├── Download (with watermark)
└── Email (with watermark)

TIER 2: PREMIUM ($29)
├── Everything in FREE
├── ✓ No watermarks
├── ✓ Social bios
├── ✓ Competitive intelligence
├── ✓ Enhanced llms.txt
├── ✓ Clean export
└── ✓ Email (no watermark)

REMOVED: $4.99 tier (confusing, low value)
```

### 5.2 Code Changes Required

1. **`src/pages/Preview.jsx`**
   - Add `tier === 'premium'` check for Download Options section
   - Show "Included" badge instead of $4.99 for premium users
   - Enable watermark-free download for premium

2. **`src/pages/Form.jsx`**
   - Add localStorage persistence for tier
   - Add Stripe integration for actual payment

3. **State persistence**
   - Store `annexa.tier` in localStorage after payment
   - Read from localStorage on page load

---

## 6. Implementation Roadmap

### Quick Fix (15 minutes)

- [x] 1. Hide $4.99 gate for premium users in `Preview.jsx`
- [ ] 2. Show "Premium Export - Included" for premium users
- [ ] 3. Add localStorage tier persistence

### Proper Refactor (4 hours)

- [ ] 1. Implement Stripe checkout for $29 tier
- [ ] 2. Create `functions/createCheckout.ts` 
- [ ] 3. Create `functions/verifyPayment.ts`
- [ ] 4. Store tier in Base44 user metadata
- [ ] 5. Remove $4.99 tier entirely (too confusing)

### Testing Checklist

- [ ] Free user sees watermarked downloads
- [ ] Free user sees $29 upgrade prompt (not $4.99)
- [ ] Premium user sees "Included" for clean export
- [ ] Premium user can download without watermark
- [ ] Premium user can email without watermark
- [ ] Tier persists across page refresh

---

## 7. Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Breaking existing free flow | Low | Changes only affect premium display |
| Data migration | None | No database changes needed |
| User confusion during transition | Medium | Add clear "Premium" badges |
| Rollback complexity | Low | Single file change can be reverted |

---

## Appendix: Files to Modify

### Immediate (Quick Fix)

1. **`src/pages/Preview.jsx`** - Lines 272-287
   - Add `tier !== 'premium'` conditional
   - Add premium-included variant

### Short-term (Persistence)

2. **`src/pages/Form.jsx`** - Line 515
   - Add `localStorage.setItem('annexa.tier', 'premium')`

3. **`src/pages/Preview.jsx`** - Line 17
   - Update tier initialization to check localStorage

### Long-term (Stripe)

4. **New:** `functions/createCheckout.ts`
5. **New:** `functions/verifyPayment.ts`  
6. **Update:** `src/pages/Form.jsx` - Replace handleUpgrade with Stripe flow

---

*Analysis completed: February 8, 2026*
*Analyst: Antigravity AI*
