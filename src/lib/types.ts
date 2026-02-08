export type UserTier = 'free' | 'premium';

export interface TierData {
    tier: UserTier;
    purchasedAt: number;
    expiresAt: number;
    transactionId?: string;
}

export interface TierFeatures {
    canExport: boolean;
    canEmail: boolean;
    hasPremiumFeatures: boolean;
}

export const TIER_FEATURES: Record<UserTier, TierFeatures> = {
    free: {
        canExport: false,
        canEmail: false,
        hasPremiumFeatures: false,
    },
    premium: {
        canExport: true,
        canEmail: true,
        hasPremiumFeatures: true,
    },
};

export const PRICING = {
    premium: {
        amount: 29,
        currency: 'USD',
        description: 'One-time payment for lifetime access',
    },
} as const;
