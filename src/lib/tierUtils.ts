import { UserTier, TierData, TierFeatures, TIER_FEATURES } from './types';

const STORAGE_KEY = 'annexa_user_tier';
const TIER_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Get the stored tier data from localStorage
 * Returns null if not found or expired
 */
export function getTierData(): TierData | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const data: TierData = JSON.parse(stored);
        // Backward compatibility: migrate old "premium" value to "edge".
        if ((data as TierData | { tier?: string }).tier === 'premium') {
            const migratedData: TierData = { ...data, tier: 'edge' };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
            return migratedData;
        }

        // Check if expired
        if (data.expiresAt < Date.now()) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Failed to read tier data:', error);
        return null;
    }
}

/**
 * Store tier data in localStorage with TTL
 */
export function setTierData(tier: UserTier, transactionId?: string): void {
    const data: TierData = {
        tier,
        purchasedAt: Date.now(),
        expiresAt: Date.now() + TIER_TTL,
        transactionId,
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save tier data:', error);
    }
}

/**
 * Get the current user tier (free or edge)
 * Checks localStorage first, falls back to 'free'
 */
export function getUserTier(): UserTier {
    const data = getTierData();
    return data?.tier || 'free';
}

/**
 * Get feature flags for a tier
 */
export function getTierFeatures(tier?: UserTier): TierFeatures {
    const currentTier = tier || getUserTier();
    return TIER_FEATURES[currentTier];
}

/**
 * Upgrade user to EDGE tier
 * @param transactionId - Optional Stripe transaction ID
 */
export function upgradeToEdge(transactionId?: string): void {
    setTierData('edge', transactionId);
}

/**
 * Backward-compatible alias
 */
export function upgradeToPremium(transactionId?: string): void {
    upgradeToEdge(transactionId);
}

/**
 * Clear all tier data (reset to free)
 */
export function clearTierData(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if user has EDGE tier
 */
export function isEdge(): boolean {
    return getUserTier() === 'edge';
}

/**
 * Backward-compatible alias
 */
export function isPremium(): boolean {
    return isEdge();
}

/**
 * Migrate old tier data format if it exists
 * Call once on app initialization
 */
export function migrateOldTierData(): void {
    // Check for old format tier storage
    const oldKeys = ['user_tier', 'vox_tier', 'annexa.tier'];

    for (const oldKey of oldKeys) {
        const oldValue = localStorage.getItem(oldKey);
        if (oldValue === 'premium' && !getTierData()) {
            setTierData('edge', 'migrated_' + Date.now());
            localStorage.removeItem(oldKey);
            console.log(`Migrated tier data from ${oldKey}`);
            break;
        }
    }
}
