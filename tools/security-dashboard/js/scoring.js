/**
 * Security Dashboard - Scoring System
 * Weighted scoring with task prioritization
 */

import { QUESTIONS, TIERS, getQuestionById } from './questions.js';

/**
 * Score interpretation thresholds
 */
export const SCORE_LEVELS = {
    NEEDS_ATTENTION: { min: 0, max: 39, label: 'Needs Attention', color: '#dc2626', bgColor: '#fef2f2' },
    GETTING_THERE: { min: 40, max: 59, label: 'Getting There', color: '#ea580c', bgColor: '#fff7ed' },
    GOOD_FOUNDATION: { min: 60, max: 79, label: 'Good Foundation', color: '#ca8a04', bgColor: '#fefce8' },
    WELL_PROTECTED: { min: 80, max: 94, label: 'Well Protected', color: '#22c55e', bgColor: '#f0fdf4' },
    EXCELLENT: { min: 95, max: 100, label: 'Excellent', color: '#16a34a', bgColor: '#dcfce7' }
};

/**
 * Risk multipliers for task prioritization
 */
const RISK_MULTIPLIERS = {
    'no': 2.0,
    'none': 2.0,
    'reuse': 2.0,
    'delay': 1.8,
    'unsure': 1.5,
    'never_thought': 1.5,
    'casual': 1.3,
    'some': 1.0,
    'mixed': 1.0,
    'public': 1.2,
    'normal': 1.3,
    'maybe': 1.2,
    'sleep': 0.8,
    'prompt': 0.5,
    'browser': 0.6,
    'memory': 0.8,
    'pin': 0.5,
    'sms': 0.5
};

/**
 * Estimated time in minutes for tasks (for prioritization)
 */
const TASK_TIMES = {
    emailTwoFactor: 15,
    passwordManager: 30,
    financialTwoFactor: 15,
    phoneLock: 5,
    computerLock: 5,
    softwareUpdates: 10,
    backupStatus: 20,
    publicWifi: 10,
    phishingAwareness: 15,
    socialPrivacy: 15,
    accountRecovery: 20
};

/**
 * Calculate the overall security score
 *
 * @param {Object} answers - User's questionnaire answers
 * @returns {Object} { score, maxScore, percentage, breakdown, level }
 */
export function calculateScore(answers) {
    if (!answers || Object.keys(answers).length === 0) {
        return {
            score: 0,
            maxScore: 0,
            percentage: 0,
            breakdown: [],
            level: null,
            hasAnswers: false
        };
    }

    let totalScore = 0;
    let totalWeight = 0;
    const breakdown = [];

    // Process each question
    for (const question of QUESTIONS) {
        const answer = answers[question.id];
        if (!answer) continue;

        const option = question.options.find(o => o.value === answer);
        if (!option) continue;

        const questionScore = option.score * question.weight;
        totalScore += questionScore;
        totalWeight += question.weight;

        breakdown.push({
            id: question.id,
            tier: question.tier,
            label: getQuestionLabel(question),
            weight: question.weight,
            score: questionScore,
            maxScore: question.weight,
            percentage: Math.round(option.score * 100),
            answer: answer,
            answerLabel: option.label,
            isComplete: option.score >= 0.7
        });

        // Handle follow-up questions
        if (question.followUp && question.followUp.condition(answer)) {
            const followUp = question.followUp.question;
            const followUpAnswer = answers[followUp.id];
            if (followUpAnswer) {
                const followUpOption = followUp.options.find(o => o.value === followUpAnswer);
                if (followUpOption) {
                    // Follow-up questions don't add weight, just modify the parent score slightly
                    const followUpBonus = (followUpOption.score - 0.5) * 2; // -2 to +2 bonus
                    // Follow-ups are tracked but don't affect main score significantly
                }
            }
        }
    }

    const percentage = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
    const level = getScoreLevel(percentage);

    return {
        score: Math.round(totalScore),
        maxScore: totalWeight,
        percentage,
        breakdown,
        level,
        hasAnswers: true
    };
}

/**
 * Get a short label for a question (for breakdown display)
 */
function getQuestionLabel(question) {
    const labels = {
        emailTwoFactor: 'Email 2FA',
        passwordManager: 'Password Management',
        financialTwoFactor: 'Financial 2FA',
        phoneLock: 'Phone Lock',
        computerLock: 'Computer Lock',
        softwareUpdates: 'Software Updates',
        backupStatus: 'Backups',
        publicWifi: 'Public WiFi',
        phishingAwareness: 'Phishing Awareness',
        socialPrivacy: 'Social Privacy',
        accountRecovery: 'Account Recovery'
    };
    return labels[question.id] || question.text;
}

/**
 * Get the score level based on percentage
 */
export function getScoreLevel(percentage) {
    for (const [key, level] of Object.entries(SCORE_LEVELS)) {
        if (percentage >= level.min && percentage <= level.max) {
            return level;
        }
    }
    return SCORE_LEVELS.NEEDS_ATTENTION;
}

/**
 * Calculate task priorities based on answers
 * Priority = (Weight * RiskMultiplier) / EstimatedTime
 *
 * @param {Object} answers - User's questionnaire answers
 * @returns {Array} Sorted list of tasks with priority scores
 */
export function calculateTaskPriorities(answers) {
    const priorities = [];

    for (const question of QUESTIONS) {
        const answer = answers[question.id];
        if (!answer) continue;

        const option = question.options.find(o => o.value === answer);
        if (!option) continue;

        // Skip if already secure (score >= 0.8)
        if (option.score >= 0.8) continue;

        const riskMultiplier = RISK_MULTIPLIERS[answer] || 1.0;
        const estimatedTime = TASK_TIMES[question.id] || 15;
        const priority = (question.weight * riskMultiplier) / (estimatedTime / 15); // Normalize time

        priorities.push({
            questionId: question.id,
            tier: question.tier,
            weight: question.weight,
            answer: answer,
            riskMultiplier,
            estimatedTime,
            priority,
            currentScore: option.score
        });
    }

    // Sort by priority (highest first)
    return priorities.sort((a, b) => b.priority - a.priority);
}

/**
 * Get score breakdown grouped by tier
 */
export function getScoreByTier(answers) {
    const result = {
        CRITICAL: { score: 0, maxScore: 0, percentage: 0, items: [] },
        IMPORTANT: { score: 0, maxScore: 0, percentage: 0, items: [] },
        GOOD_PRACTICES: { score: 0, maxScore: 0, percentage: 0, items: [] }
    };

    for (const question of QUESTIONS) {
        const answer = answers[question.id];
        if (!answer) continue;

        const option = question.options.find(o => o.value === answer);
        if (!option) continue;

        const questionScore = option.score * question.weight;
        const tier = result[question.tier];

        tier.score += questionScore;
        tier.maxScore += question.weight;
        tier.items.push({
            id: question.id,
            label: getQuestionLabel({ id: question.id }),
            score: questionScore,
            maxScore: question.weight,
            isComplete: option.score >= 0.7
        });
    }

    // Calculate percentages
    for (const tier of Object.values(result)) {
        tier.percentage = tier.maxScore > 0
            ? Math.round((tier.score / tier.maxScore) * 100)
            : 0;
    }

    return result;
}

/**
 * Get personalized recommendations based on answers
 */
export function getRecommendations(answers) {
    const priorities = calculateTaskPriorities(answers);
    const recommendations = [];

    for (const item of priorities.slice(0, 3)) { // Top 3 priorities
        const question = getQuestionById(item.questionId);
        if (!question) continue;

        let urgency = 'normal';
        if (item.tier === 'CRITICAL') urgency = 'high';
        if (item.riskMultiplier >= 2.0) urgency = 'critical';

        recommendations.push({
            questionId: item.questionId,
            title: getRecommendationTitle(item.questionId, item.answer),
            description: question.helpText,
            urgency,
            estimatedTime: item.estimatedTime,
            tier: item.tier
        });
    }

    return recommendations;
}

/**
 * Get a recommendation title based on the answer
 */
function getRecommendationTitle(questionId, answer) {
    const titles = {
        emailTwoFactor: {
            'no': 'Enable 2FA on your email',
            'unsure': 'Learn about and enable email 2FA'
        },
        passwordManager: {
            'reuse': 'Stop reusing passwords - set up a password manager',
            'memory': 'Set up a password manager for better security',
            'browser': 'Consider upgrading to a dedicated password manager'
        },
        financialTwoFactor: {
            'no': 'Enable 2FA on your bank accounts',
            'some': 'Enable 2FA on all financial accounts',
            'unsure': 'Check and enable 2FA on financial accounts'
        },
        phoneLock: {
            'none': 'Enable screen lock on your phone'
        },
        computerLock: {
            'none': 'Set up a password on your computer',
            'sleep': 'Enable immediate lock when stepping away'
        },
        softwareUpdates: {
            'delay': 'Enable automatic updates',
            'unsure': 'Check your update settings'
        },
        backupStatus: {
            'none': 'Set up automatic backups immediately',
            'some': 'Improve your backup coverage',
            'unsure': 'Check your backup settings'
        },
        publicWifi: {
            'normal': 'Be more cautious on public WiFi'
        },
        phishingAwareness: {
            'casual': 'Learn to spot phishing attempts',
            'unsure': 'Learn how to identify phishing emails'
        },
        socialPrivacy: {
            'public': 'Review your social media privacy settings',
            'mixed': 'Make all social profiles private'
        },
        accountRecovery: {
            'no': 'Set up backup codes for your accounts',
            'never_thought': 'Plan for account recovery',
            'maybe': 'Verify your recovery methods'
        }
    };

    return titles[questionId]?.[answer] || `Improve your ${questionId.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
}

/**
 * Check if assessment is complete (all questions answered)
 */
export function isAssessmentComplete(answers, mode = 'quick') {
    const questions = mode === 'quick'
        ? QUESTIONS.filter(q => q.tier === 'CRITICAL')
        : QUESTIONS;

    return questions.every(q => answers[q.id]);
}

/**
 * Get completion stats
 */
export function getCompletionStats(answers) {
    const quickQuestions = QUESTIONS.filter(q => q.tier === 'CRITICAL');
    const allQuestions = QUESTIONS;

    const quickAnswered = quickQuestions.filter(q => answers[q.id]).length;
    const allAnswered = allQuestions.filter(q => answers[q.id]).length;

    return {
        quick: {
            answered: quickAnswered,
            total: quickQuestions.length,
            complete: quickAnswered === quickQuestions.length
        },
        full: {
            answered: allAnswered,
            total: allQuestions.length,
            complete: allAnswered === allQuestions.length
        }
    };
}
