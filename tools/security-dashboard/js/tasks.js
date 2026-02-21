/**
 * Personal Security Dashboard - Tasks
 *
 * Defines security tasks, severity ordering, and recommendation logic.
 * Updated to match the three-tier question system.
 */

// Severity levels in priority order (lower number = higher priority)
export const SEVERITY_ORDER = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3
};

// Severity display configuration
export const SEVERITY_CONFIG = {
    CRITICAL: { label: 'CRITICAL', color: '#dc2626', bgColor: '#fef2f2' },
    HIGH: { label: 'HIGH', color: '#ea580c', bgColor: '#fff7ed' },
    MEDIUM: { label: 'MEDIUM', color: '#ca8a04', bgColor: '#fefce8' },
    LOW: { label: 'LOW', color: '#16a34a', bgColor: '#f0fdf4' }
};

/**
 * Security task definitions
 * Each task has:
 * - id: Unique identifier
 * - title: Display title
 * - description: Short description of why this matters
 * - severity: CRITICAL | HIGH | MEDIUM | LOW
 * - category: Grouping category
 * - articleSlug: Maps to articles/security/{slug}.md
 * - condition: Function that returns true if task should be shown
 * - estimatedTime: Time estimate for completion
 * - questionId: Links to the questionnaire question (for status tracking)
 */
export const SECURITY_TASKS = [
    // ============ TIER 1: CRITICAL ============
    {
        id: 'enable-2fa-email',
        title: 'Enable 2FA on Your Email',
        description: 'Your email is the master key to all other accounts. If compromised, attackers can reset passwords for everything.',
        severity: 'CRITICAL',
        category: '2fa',
        articleSlug: '2fa-email',
        condition: (q) => q.emailTwoFactor === 'no' || q.emailTwoFactor === 'unsure',
        estimatedTime: '10-15 min',
        questionId: 'emailTwoFactor'
    },
    {
        id: 'setup-password-manager',
        title: 'Set Up a Password Manager',
        description: 'Using unique passwords for every account is impossible to remember. A password manager makes it easy and secure.',
        severity: 'CRITICAL',
        category: 'passwords',
        articleSlug: 'password-manager',
        condition: (q) => q.passwordManager === 'memory' || q.passwordManager === 'reuse',
        estimatedTime: '20-30 min',
        questionId: 'passwordManager'
    },
    {
        id: 'upgrade-password-manager',
        title: 'Consider a Dedicated Password Manager',
        description: 'Browser password managers are convenient but dedicated managers offer better security, sharing, and cross-platform support.',
        severity: 'MEDIUM',
        category: 'passwords',
        articleSlug: 'password-manager',
        condition: (q) => q.passwordManager === 'browser',
        estimatedTime: '20-30 min',
        questionId: 'passwordManager'
    },
    {
        id: 'enable-2fa-banking',
        title: 'Enable 2FA on All Financial Accounts',
        description: 'Protect your financial accounts with an extra layer of security beyond just a password.',
        severity: 'CRITICAL',
        category: '2fa',
        articleSlug: '2fa-banking',
        condition: (q) => q.financialTwoFactor === 'no' || q.financialTwoFactor === 'some' || q.financialTwoFactor === 'unsure',
        estimatedTime: '10-15 min',
        questionId: 'financialTwoFactor'
    },

    // ============ TIER 2: IMPORTANT ============
    {
        id: 'enable-phone-lock',
        title: 'Enable Phone Screen Lock',
        description: 'Physical access to an unlocked phone exposes everything: email, banking apps, photos, and messages.',
        severity: 'HIGH',
        category: 'device',
        articleSlug: 'device-security',
        condition: (q) => q.phoneLock === 'none',
        estimatedTime: '5 min',
        questionId: 'phoneLock'
    },
    {
        id: 'enable-computer-lock',
        title: 'Set Up Computer Password Lock',
        description: 'An unlocked computer exposes all your files, saved passwords, and active login sessions.',
        severity: 'HIGH',
        category: 'device',
        articleSlug: 'device-security',
        condition: (q) => q.computerLock === 'none' || q.computerLock === 'sleep',
        estimatedTime: '5 min',
        questionId: 'computerLock'
    },
    {
        id: 'enable-auto-updates',
        title: 'Enable Automatic Updates',
        description: 'Security patches fix vulnerabilities that attackers actively exploit. Staying updated protects you.',
        severity: 'HIGH',
        category: 'updates',
        articleSlug: 'enable-updates',
        condition: (q) => q.softwareUpdates === 'delay' || q.softwareUpdates === 'unsure',
        estimatedTime: '5-10 min',
        questionId: 'softwareUpdates'
    },
    {
        id: 'setup-backups',
        title: 'Set Up Automatic Backups',
        description: 'Ransomware and device loss are common threats. Automatic backups ensure you never lose important files.',
        severity: 'HIGH',
        category: 'backups',
        articleSlug: 'backup-basics',
        condition: (q) => q.backupStatus === 'none' || q.backupStatus === 'some' || q.backupStatus === 'unsure',
        estimatedTime: '15-20 min',
        questionId: 'backupStatus'
    },
    {
        id: 'test-backup-restore',
        title: 'Test Your Backup Recovery',
        description: 'A backup you have never tested might not work when you need it most. Verify you can actually restore.',
        severity: 'MEDIUM',
        category: 'backups',
        articleSlug: 'backup-basics',
        condition: (q) => q.backupStatus === 'auto' && q.backupTested === 'no',
        estimatedTime: '10-15 min',
        questionId: 'backupTested'
    },

    // ============ TIER 3: GOOD PRACTICES ============
    {
        id: 'public-wifi-safety',
        title: 'Practice Public WiFi Safety',
        description: 'Public networks can be monitored. Learn how to protect yourself when connecting outside your home.',
        severity: 'MEDIUM',
        category: 'network',
        articleSlug: 'network-security',
        condition: (q) => q.publicWifi === 'normal',
        estimatedTime: '10 min',
        questionId: 'publicWifi'
    },
    {
        id: 'learn-phishing',
        title: 'Learn to Spot Phishing Attacks',
        description: 'Phishing is the most common way accounts get compromised. Learn the warning signs.',
        severity: 'MEDIUM',
        category: 'awareness',
        articleSlug: 'phishing-awareness',
        condition: (q) => q.phishingAwareness === 'casual' || q.phishingAwareness === 'unsure',
        estimatedTime: '10-15 min',
        questionId: 'phishingAwareness'
    },
    {
        id: 'social-privacy',
        title: 'Review Social Media Privacy Settings',
        description: 'Public profiles expose personal info useful for targeted attacks and identity theft.',
        severity: 'LOW',
        category: 'privacy',
        articleSlug: 'social-media-privacy',
        condition: (q) => q.socialPrivacy === 'public' || q.socialPrivacy === 'mixed',
        estimatedTime: '15 min',
        questionId: 'socialPrivacy'
    },
    {
        id: 'setup-recovery',
        title: 'Set Up Account Recovery Options',
        description: 'Without backup recovery methods, you could be permanently locked out of your accounts.',
        severity: 'MEDIUM',
        category: 'recovery',
        articleSlug: 'account-recovery',
        condition: (q) => q.accountRecovery === 'no' || q.accountRecovery === 'never_thought' || q.accountRecovery === 'maybe',
        estimatedTime: '15-20 min',
        questionId: 'accountRecovery'
    },

    // ============ ALWAYS-SHOWN TASKS ============
    {
        id: 'check-breaches',
        title: 'Check for Data Breaches',
        description: 'Your credentials may have been exposed in past breaches. Find out and change compromised passwords.',
        severity: 'MEDIUM',
        category: 'passwords',
        articleSlug: 'check-breaches',
        condition: () => true, // Always show this one
        estimatedTime: '5-10 min',
        questionId: null
    },
    {
        id: 'browser-security',
        title: 'Secure Your Browser',
        description: 'Your browser is your window to the internet. A few settings can significantly improve your privacy and security.',
        severity: 'LOW',
        category: 'browser',
        articleSlug: 'browser-security',
        condition: () => true, // Always show as a best practice
        estimatedTime: '10-15 min',
        questionId: null
    }
];

/**
 * Get recommended tasks based on questionnaire answers.
 * Filters out completed and dismissed tasks, then sorts by severity.
 *
 * @param {Object} questionnaire - User's questionnaire answers
 * @param {string[]} completedTasks - Array of completed task IDs
 * @param {string[]} dismissedTasks - Array of dismissed task IDs
 * @returns {Array} Filtered and sorted tasks
 */
export function getRecommendedTasks(questionnaire = {}, completedTasks = [], dismissedTasks = []) {
    return SECURITY_TASKS
        .filter(task => {
            // Skip completed or dismissed tasks
            if (completedTasks.includes(task.id) || dismissedTasks.includes(task.id)) {
                return false;
            }
            // Check if task condition is met
            return task.condition(questionnaire);
        })
        .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/**
 * Get all tasks with their completion status.
 *
 * @param {Object} questionnaire - User's questionnaire answers
 * @param {string[]} completedTasks - Array of completed task IDs
 * @param {string[]} dismissedTasks - Array of dismissed task IDs
 * @returns {Array} All applicable tasks with status
 */
export function getAllTasksWithStatus(questionnaire = {}, completedTasks = [], dismissedTasks = []) {
    return SECURITY_TASKS
        .filter(task => task.condition(questionnaire) || completedTasks.includes(task.id))
        .map(task => ({
            ...task,
            isCompleted: completedTasks.includes(task.id),
            isDismissed: dismissedTasks.includes(task.id)
        }))
        .sort((a, b) => {
            // Completed tasks go to the bottom
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }
            // Then sort by severity
            return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        });
}

/**
 * Get the highest priority incomplete task.
 *
 * @param {Object} questionnaire - User's questionnaire answers
 * @param {string[]} completedTasks - Array of completed task IDs
 * @param {string[]} dismissedTasks - Array of dismissed task IDs
 * @returns {Object|null} The top priority task or null
 */
export function getTopPriorityTask(questionnaire = {}, completedTasks = [], dismissedTasks = []) {
    const recommended = getRecommendedTasks(questionnaire, completedTasks, dismissedTasks);
    return recommended.length > 0 ? recommended[0] : null;
}

/**
 * Calculate completion progress.
 *
 * @param {Object} questionnaire - User's questionnaire answers
 * @param {string[]} completedTasks - Array of completed task IDs
 * @param {string[]} dismissedTasks - Array of dismissed task IDs
 * @returns {Object} Progress stats { completed, total, percentage }
 */
export function getProgressStats(questionnaire = {}, completedTasks = [], dismissedTasks = []) {
    const applicableTasks = SECURITY_TASKS.filter(task =>
        task.condition(questionnaire) || completedTasks.includes(task.id)
    );

    const completedCount = applicableTasks.filter(task =>
        completedTasks.includes(task.id)
    ).length;

    const total = applicableTasks.length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
        completed: completedCount,
        total,
        percentage
    };
}

/**
 * Get tasks grouped by severity for display
 */
export function getTasksBySeverity(questionnaire = {}, completedTasks = [], dismissedTasks = []) {
    const tasks = getAllTasksWithStatus(questionnaire, completedTasks, dismissedTasks);

    return {
        CRITICAL: tasks.filter(t => t.severity === 'CRITICAL'),
        HIGH: tasks.filter(t => t.severity === 'HIGH'),
        MEDIUM: tasks.filter(t => t.severity === 'MEDIUM'),
        LOW: tasks.filter(t => t.severity === 'LOW')
    };
}
