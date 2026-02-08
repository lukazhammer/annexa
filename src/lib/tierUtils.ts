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
 * Get the current user tier (free or premium)
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
 * Upgrade user to premium tier
 * @param transactionId - Optional Stripe transaction ID
 */
export function upgradeToPremium(transactionId?: string): void {
    setTierData('premium', transactionId);
}

/**
 * Clear all tier data (reset to free)
 */
export function clearTierData(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if user has premium tier
 */
export function isPremium(): boolean {
    return getUserTier() === 'premium';
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
            setTierData('premium', 'migrated_' + Date.now());
            localStorage.removeItem(oldKey);
            console.log(`Migrated tier data from ${oldKey}`);
            break;
        }
    }
}
