/**
 * Security Dashboard - Question Definitions
 * Three-tier question system with tooltips and follow-ups
 */

/**
 * Question tiers with metadata
 */
export const TIERS = {
    CRITICAL: {
        id: 'critical',
        label: 'Critical Security',
        description: 'Protects against the most common, damaging attacks',
        weight: 50  // 50% of total score
    },
    IMPORTANT: {
        id: 'important',
        label: 'Strong Foundation',
        description: 'Significant protection against common threats',
        weight: 35  // 35% of total score
    },
    GOOD_PRACTICES: {
        id: 'good_practices',
        label: 'Enhanced Security',
        description: 'Additional protection for privacy-conscious users',
        weight: 15  // 15% of total score
    }
};

/**
 * Tooltip explanations for "unsure" answers
 */
export const TOOLTIPS = {
    twoFactor: '2FA adds a second step when logging in, like a code sent to your phone. It stops attackers even if they have your password.',
    passwordManager: 'A password manager stores all your passwords securely, so you only need to remember one master password. It can also generate strong, unique passwords for each site.',
    backups: 'Backups are copies of your important files stored separately from your device. If your phone breaks, gets stolen, or is hit by ransomware, backups let you recover your photos and data.',
    vpn: 'A VPN (Virtual Private Network) encrypts your internet connection, hiding your activity from others on the same network. Useful on public WiFi.',
    phishing: 'Phishing is when attackers send fake emails pretending to be from trusted companies, trying to trick you into clicking malicious links or entering your password on fake websites.',
    accountRecovery: 'Backup codes or recovery methods let you get back into your accounts if you lose your phone or forget your password. Without them, you could be permanently locked out.'
};

/**
 * Question definitions
 * Each question has:
 * - id: Unique identifier (matches localStorage keys)
 * - tier: CRITICAL | IMPORTANT | GOOD_PRACTICES
 * - text: The question text
 * - helpText: Brief explanation of why this matters
 * - options: Array of answer options with value, label, and score
 * - tooltip: Shown when user selects "unsure"
 * - followUp: Optional follow-up question if certain answers are selected
 */
export const QUESTIONS = [
    // ============ TIER 1: CRITICAL (50%) ============
    {
        id: 'emailTwoFactor',
        tier: 'CRITICAL',
        text: 'Is two-factor authentication enabled on your primary email?',
        helpText: 'Email is the recovery method for all other accounts. Compromise here = compromise everywhere.',
        options: [
            { value: 'yes', label: 'Yes', score: 1.0 },
            { value: 'no', label: 'No', score: 0 },
            { value: 'unsure', label: "Unsure / What's that?", score: 0.25 }
        ],
        tooltip: TOOLTIPS.twoFactor,
        followUp: {
            condition: (answer) => answer === 'yes',
            question: {
                id: 'emailTwoFactorMethod',
                text: 'What type of 2FA do you use?',
                options: [
                    { value: 'app', label: 'Authenticator app (Google/Microsoft Authenticator, etc.)', score: 1.0 },
                    { value: 'sms', label: 'Text message (SMS)', score: 0.7 },
                    { value: 'key', label: 'Security key (YubiKey, etc.)', score: 1.0 },
                    { value: 'unsure', label: "Not sure", score: 0.5 }
                ]
            }
        },
        weight: 20
    },
    {
        id: 'passwordManager',
        tier: 'CRITICAL',
        text: 'How do you manage your passwords?',
        helpText: 'Password reuse is the #1 way accounts get compromised after data breaches.',
        options: [
            { value: 'dedicated', label: 'Password manager (1Password, Bitwarden, etc.)', score: 1.0 },
            { value: 'browser', label: "Browser's built-in password saving", score: 0.7 },
            { value: 'memory', label: 'I remember them / write them down', score: 0.3 },
            { value: 'reuse', label: 'I reuse the same passwords across sites', score: 0 }
        ],
        tooltip: TOOLTIPS.passwordManager,
        followUp: {
            condition: (answer) => answer === 'dedicated',
            question: {
                id: 'passwordManagerGenerates',
                text: 'Does it generate random passwords for new accounts?',
                options: [
                    { value: 'yes', label: 'Yes', score: 1.0 },
                    { value: 'no', label: 'No, I create my own', score: 0.5 },
                    { value: 'unsure', label: 'Not sure', score: 0.5 }
                ]
            }
        },
        weight: 15
    },
    {
        id: 'financialTwoFactor',
        tier: 'CRITICAL',
        text: 'Is two-factor authentication enabled on your bank/financial accounts?',
        helpText: 'Direct financial impact from compromise.',
        options: [
            { value: 'all', label: 'Yes, on all of them', score: 1.0 },
            { value: 'some', label: 'Yes, on some of them', score: 0.5 },
            { value: 'no', label: 'No', score: 0 },
            { value: 'unsure', label: "I don't know how to check", score: 0.25 }
        ],
        tooltip: TOOLTIPS.twoFactor,
        weight: 15
    },

    // ============ TIER 2: IMPORTANT (35%) ============
    {
        id: 'phoneLock',
        tier: 'IMPORTANT',
        text: 'Does your phone have a screen lock?',
        helpText: 'Physical access to unlocked devices bypasses all other security.',
        options: [
            { value: 'biometric', label: 'Yes, biometric (fingerprint/face)', score: 1.0 },
            { value: 'pin', label: 'Yes, PIN or pattern', score: 0.8 },
            { value: 'none', label: 'No / I disabled it', score: 0 }
        ],
        weight: 5
    },
    {
        id: 'computerLock',
        tier: 'IMPORTANT',
        text: 'Does your computer require a password to log in?',
        helpText: 'An unlocked computer exposes everything: email, files, saved passwords.',
        options: [
            { value: 'always', label: 'Yes, always', score: 1.0 },
            { value: 'sleep', label: 'Yes, but only after sleep/away', score: 0.7 },
            { value: 'none', label: 'No', score: 0 }
        ],
        weight: 5
    },
    {
        id: 'softwareUpdates',
        tier: 'IMPORTANT',
        text: 'How do you handle software updates on your devices?',
        helpText: 'Known vulnerabilities are actively exploited; updates patch them.',
        options: [
            { value: 'auto', label: 'They install automatically', score: 1.0 },
            { value: 'prompt', label: 'I install them within a few days', score: 0.8 },
            { value: 'delay', label: 'I often delay or skip them', score: 0.2 },
            { value: 'unsure', label: "I'm not sure", score: 0.3 }
        ],
        weight: 10
    },
    {
        id: 'backupStatus',
        tier: 'IMPORTANT',
        text: 'If your phone was lost/stolen today, would you lose important photos or data?',
        helpText: 'Ransomware and device loss are common; backups are the recovery path.',
        options: [
            { value: 'auto', label: 'No, everything is backed up automatically', score: 1.0 },
            { value: 'some', label: "I'd lose some things", score: 0.5 },
            { value: 'none', label: "I'd lose a lot", score: 0 },
            { value: 'unsure', label: "I'm not sure", score: 0.3 }
        ],
        tooltip: TOOLTIPS.backups,
        followUp: {
            condition: (answer) => answer === 'auto',
            question: {
                id: 'backupTested',
                text: 'Have you ever tested restoring from backup?',
                options: [
                    { value: 'yes', label: 'Yes', score: 1.0 },
                    { value: 'no', label: 'No', score: 0.5 }
                ]
            }
        },
        weight: 10
    },

    // ============ TIER 3: GOOD PRACTICES (15%) ============
    {
        id: 'publicWifi',
        tier: 'GOOD_PRACTICES',
        text: 'When using public WiFi (coffee shops, airports), do you:',
        helpText: 'Public WiFi can be monitored by others on the same network.',
        options: [
            { value: 'avoid', label: 'Avoid sensitive activities (banking, email)', score: 0.8 },
            { value: 'vpn', label: 'Use a VPN', score: 1.0 },
            { value: 'normal', label: 'Use it normally without concern', score: 0.2 },
            { value: 'never', label: "I don't use public WiFi", score: 1.0 }
        ],
        tooltip: TOOLTIPS.vpn,
        weight: 4
    },
    {
        id: 'phishingAwareness',
        tier: 'GOOD_PRACTICES',
        text: 'When you receive an unexpected email asking you to click a link or log in:',
        helpText: 'Phishing attacks are the most common way accounts get compromised.',
        options: [
            { value: 'careful', label: 'I check the sender and URL carefully before clicking', score: 1.0 },
            { value: 'casual', label: 'I usually click if it looks legitimate', score: 0.3 },
            { value: 'unsure', label: "I'm not sure what to look for", score: 0.2 }
        ],
        tooltip: TOOLTIPS.phishing,
        weight: 4
    },
    {
        id: 'socialPrivacy',
        tier: 'GOOD_PRACTICES',
        text: 'Are your social media profiles set to private/friends-only?',
        helpText: 'Public profiles expose personal info useful for targeted attacks and identity theft.',
        options: [
            { value: 'private', label: 'Yes, all of them', score: 1.0 },
            { value: 'mixed', label: "Some are, some aren't", score: 0.5 },
            { value: 'public', label: "No, they're public", score: 0.2 },
            { value: 'none', label: "I don't use social media", score: 1.0 }
        ],
        weight: 3
    },
    {
        id: 'accountRecovery',
        tier: 'GOOD_PRACTICES',
        text: 'If you forgot your email password and lost your phone, could you recover your accounts?',
        helpText: 'Without backup recovery methods, you could be permanently locked out.',
        options: [
            { value: 'yes', label: 'Yes, I have backup codes or a secondary method', score: 1.0 },
            { value: 'maybe', label: "I think so, but I'm not sure", score: 0.5 },
            { value: 'no', label: 'Probably not', score: 0.2 },
            { value: 'never_thought', label: "I've never thought about this", score: 0 }
        ],
        tooltip: TOOLTIPS.accountRecovery,
        weight: 4
    }
];

/**
 * Get questions by tier
 */
export function getQuestionsByTier(tierId) {
    return QUESTIONS.filter(q => q.tier === tierId);
}

/**
 * Get Tier 1 questions only (for Quick assessment)
 */
export function getQuickAssessmentQuestions() {
    return QUESTIONS.filter(q => q.tier === 'CRITICAL');
}

/**
 * Get all questions (for Full assessment)
 */
export function getFullAssessmentQuestions() {
    return QUESTIONS;
}

/**
 * Get a question by ID
 */
export function getQuestionById(id) {
    return QUESTIONS.find(q => q.id === id);
}

/**
 * Check if a question has a follow-up that should be shown
 */
export function shouldShowFollowUp(questionId, answer) {
    const question = getQuestionById(questionId);
    if (!question || !question.followUp) return false;
    return question.followUp.condition(answer);
}

/**
 * Get the follow-up question for a parent question
 */
export function getFollowUpQuestion(questionId) {
    const question = getQuestionById(questionId);
    return question?.followUp?.question || null;
}
