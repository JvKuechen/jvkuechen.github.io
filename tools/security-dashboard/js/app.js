/**
 * Security Dashboard - Main Application
 * Portfolio-integrated security assessment tool with progressive disclosure
 */

import {
    QUESTIONS,
    TIERS,
    getQuickAssessmentQuestions,
    getFullAssessmentQuestions,
    getQuestionById,
    shouldShowFollowUp,
    getFollowUpQuestion
} from './questions.js';

import {
    calculateScore,
    getScoreLevel,
    getScoreByTier,
    getCompletionStats,
    SCORE_LEVELS
} from './scoring.js';

import {
    SECURITY_TASKS,
    SEVERITY_CONFIG,
    getRecommendedTasks,
    getAllTasksWithStatus,
    getTopPriorityTask,
    getProgressStats
} from './tasks.js';

// Storage key
const STORAGE_KEY = 'jvk_security_dashboard';

// State
let state = {
    version: 2,
    assessmentMode: 'quick', // 'quick' or 'full'
    questionnaire: {},
    completedTasks: [],
    dismissedTasks: [],
    lastAssessment: null
};

// DOM Elements cache
const elements = {};

/**
 * Initialize the application
 */
function init() {
    cacheElements();
    loadState();
    setupEventListeners();
    renderQuestions();
    updateUI();
}

/**
 * Cache DOM elements
 */
function cacheElements() {
    elements.questionnaireContainer = document.getElementById('questionnaire-container');
    elements.questionnaireTitle = document.getElementById('questionnaire-title');
    elements.assessmentSubtitle = document.getElementById('assessment-subtitle');
    elements.scoreCircle = document.getElementById('score-circle');
    elements.scoreValue = document.getElementById('score-value');
    elements.scoreLevel = document.getElementById('score-level');
    elements.scoreBreakdown = document.getElementById('score-breakdown');
    elements.scoreDetailToggle = document.getElementById('score-detail-toggle');
    elements.scoreDetail = document.getElementById('score-detail');
    elements.scoreDetailBody = document.getElementById('score-detail-body');
    elements.toggleBreakdown = document.getElementById('toggle-breakdown');
    elements.progressSection = document.getElementById('progress-section');
    elements.progressBar = document.getElementById('progress-bar');
    elements.tasksCompleted = document.getElementById('tasks-completed');
    elements.tasksTotal = document.getElementById('tasks-total');
    elements.taskList = document.getElementById('task-list');
    elements.emptyTasks = document.getElementById('empty-tasks');
    elements.topPriorityRow = document.getElementById('top-priority-row');
    elements.topPriorityTitle = document.getElementById('top-priority-title');
    elements.topPriorityDesc = document.getElementById('top-priority-desc');
    elements.topPriorityBtn = document.getElementById('top-priority-btn');
    elements.resetBtn = document.getElementById('reset-btn');
    elements.continueFull = document.getElementById('continue-full');
    elements.expandToFull = document.getElementById('expand-to-full');
    elements.modeButtons = document.querySelectorAll('.mode-btn');
    elements.navLinks = document.querySelectorAll('.nav-link[data-section]');
    elements.sections = document.querySelectorAll('.section-page');
}

/**
 * Load state from localStorage
 */
function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Handle version migration if needed
            if (parsed.version === 2) {
                state = { ...state, ...parsed };
            } else {
                // Migrate from v1 to v2 format
                state.questionnaire = migrateV1ToV2(parsed.questionnaire || {});
                state.completedTasks = parsed.completedTasks || [];
                state.dismissedTasks = parsed.dismissedTasks || [];
            }
        }
    } catch (e) {
        console.warn('Failed to load state:', e);
    }
}

/**
 * Migrate v1 questionnaire format to v2
 */
function migrateV1ToV2(oldQ) {
    const newQ = {};

    // Map old keys to new keys
    if (oldQ.passwordManager) {
        newQ.passwordManager = oldQ.passwordManager === 'yes' ? 'dedicated' :
                              oldQ.passwordManager === 'no' ? 'memory' : oldQ.passwordManager;
    }
    if (oldQ.twoFactorEmail) {
        newQ.emailTwoFactor = oldQ.twoFactorEmail;
    }
    if (oldQ.twoFactorBanking) {
        newQ.financialTwoFactor = oldQ.twoFactorBanking === 'yes' ? 'all' :
                                  oldQ.twoFactorBanking === 'no' ? 'no' : 'unsure';
    }
    if (oldQ.updates) {
        newQ.softwareUpdates = oldQ.updates === 'yes-auto' ? 'auto' :
                              oldQ.updates === 'yes-manual' ? 'prompt' :
                              oldQ.updates === 'no' ? 'delay' : 'unsure';
    }

    return newQ;
}

/**
 * Save state to localStorage
 */
function saveState() {
    try {
        state.lastAssessment = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save state:', e);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Mode toggle buttons
    elements.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setAssessmentMode(mode);
        });
    });

    // Expand to full assessment button
    if (elements.expandToFull) {
        elements.expandToFull.addEventListener('click', () => {
            setAssessmentMode('full');
        });
    }

    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    // Also handle hash links
    document.querySelectorAll('a[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.dataset.section);
        });
    });

    // Top priority button
    if (elements.topPriorityBtn) {
        elements.topPriorityBtn.addEventListener('click', () => {
            const task = getTopPriorityTask(state.questionnaire, state.completedTasks, state.dismissedTasks);
            if (task) navigateToArticle(task);
        });
    }

    // Toggle score breakdown
    if (elements.toggleBreakdown) {
        elements.toggleBreakdown.addEventListener('click', () => {
            const isVisible = elements.scoreDetail.style.display !== 'none';
            elements.scoreDetail.style.display = isVisible ? 'none' : 'block';
            elements.toggleBreakdown.innerHTML = isVisible
                ? '<i class="fa fa-chevron-down"></i> Show scoring breakdown'
                : '<i class="fa fa-chevron-up"></i> Hide scoring breakdown';
        });
    }

    // Reset button
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', () => {
            if (confirm('Reset all data? This will clear your assessment and task progress.')) {
                state = {
                    version: 2,
                    assessmentMode: 'quick',
                    questionnaire: {},
                    completedTasks: [],
                    dismissedTasks: [],
                    lastAssessment: null
                };
                saveState();
                renderQuestions();
                updateUI();
            }
        });
    }

    // Scroll listener for navbar solid background
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar-default');
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-solid');
        } else {
            navbar.classList.remove('navbar-solid');
        }
    });
}

/**
 * Set assessment mode (quick/full)
 */
function setAssessmentMode(mode) {
    state.assessmentMode = mode;
    saveState();

    // Update mode buttons
    elements.modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update subtitle
    elements.assessmentSubtitle.textContent = mode === 'quick'
        ? 'Quick check - 3 questions'
        : 'Full assessment - 12 questions';

    // Update questionnaire title
    elements.questionnaireTitle.textContent = mode === 'quick'
        ? 'Critical Security Questions'
        : 'Comprehensive Security Questions';

    // Re-render questions
    renderQuestions();
    updateUI();
}

/**
 * Render questions based on current mode
 */
function renderQuestions() {
    const questions = state.assessmentMode === 'quick'
        ? getQuickAssessmentQuestions()
        : getFullAssessmentQuestions();

    let currentTier = null;
    let html = '';

    questions.forEach((question, index) => {
        // Add tier header if changed (only in full mode)
        if (state.assessmentMode === 'full' && question.tier !== currentTier) {
            currentTier = question.tier;
            const tierInfo = TIERS[currentTier];
            html += `
                <div class="tier-header">
                    <h5>${tierInfo.label}</h5>
                    <small class="text-muted">${tierInfo.description}</small>
                </div>
            `;
        }

        html += renderQuestion(question, index + 1);

        // Check for follow-up
        const answer = state.questionnaire[question.id];
        if (answer && shouldShowFollowUp(question.id, answer)) {
            const followUp = getFollowUpQuestion(question.id);
            if (followUp) {
                html += renderFollowUpQuestion(followUp, question.id);
            }
        }
    });

    elements.questionnaireContainer.innerHTML = html;

    // Add change listeners to all selects
    elements.questionnaireContainer.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', handleAnswerChange);
    });

    // Add tooltip close handlers
    elements.questionnaireContainer.querySelectorAll('.tooltip-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.tooltip-box').style.display = 'none';
        });
    });
}

/**
 * Render a single question
 */
function renderQuestion(question, number) {
    const savedAnswer = state.questionnaire[question.id] || '';
    const showTooltip = savedAnswer === 'unsure' && question.tooltip;

    return `
        <div class="question-group" data-question-id="${question.id}">
            <label for="q-${question.id}">
                <span class="question-number">${number}.</span>
                ${question.text}
            </label>
            <p class="help-text">${question.helpText}</p>
            <select class="form-control" id="q-${question.id}" name="${question.id}">
                <option value="">Select an option</option>
                ${question.options.map(opt => `
                    <option value="${opt.value}" ${savedAnswer === opt.value ? 'selected' : ''}>
                        ${opt.label}
                    </option>
                `).join('')}
            </select>
            ${question.tooltip ? `
                <div class="tooltip-box" style="display: ${showTooltip ? 'block' : 'none'};">
                    <div class="tooltip-content">
                        <button class="tooltip-close">&times;</button>
                        <p class="tooltip-text">${question.tooltip}</p>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Render a follow-up question
 */
function renderFollowUpQuestion(followUp, parentId) {
    const savedAnswer = state.questionnaire[followUp.id] || '';

    return `
        <div class="question-group follow-up" data-question-id="${followUp.id}" data-parent="${parentId}">
            <label for="q-${followUp.id}">
                <i class="fa fa-level-up fa-rotate-90"></i>
                ${followUp.text}
            </label>
            <select class="form-control" id="q-${followUp.id}" name="${followUp.id}">
                <option value="">Select an option</option>
                ${followUp.options.map(opt => `
                    <option value="${opt.value}" ${savedAnswer === opt.value ? 'selected' : ''}>
                        ${opt.label}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
}

/**
 * Handle answer changes
 */
function handleAnswerChange(e) {
    const select = e.target;
    const questionId = select.name;
    const value = select.value;

    // Update state
    if (value) {
        state.questionnaire[questionId] = value;
    } else {
        delete state.questionnaire[questionId];
    }

    // Show tooltip for "unsure" answers
    const questionGroup = select.closest('.question-group');
    const tooltip = questionGroup.querySelector('.tooltip-box');
    if (tooltip) {
        tooltip.style.display = value === 'unsure' ? 'block' : 'none';
    }

    // Handle follow-up questions
    const question = getQuestionById(questionId);
    if (question && question.followUp) {
        // Re-render to show/hide follow-up
        renderQuestions();
    }

    saveState();
    updateUI();
}

/**
 * Show a section
 */
function showSection(sectionId) {
    elements.sections.forEach(s => {
        s.style.display = s.id === sectionId ? 'block' : 'none';
        s.classList.toggle('active', s.id === sectionId);
    });

    elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });

    // Scroll to top
    window.scrollTo(0, 0);
}

/**
 * Update all UI elements
 */
function updateUI() {
    updateScore();
    updateProgress();
    updateTopPriority();
    updateContinuePrompt();
    renderTasks();
}

/**
 * Calculate and update the score display
 */
function updateScore() {
    const scoreData = calculateScore(state.questionnaire);

    if (!scoreData.hasAnswers) {
        elements.scoreValue.textContent = '--';
        elements.scoreCircle.className = 'score-circle unknown';
        elements.scoreLevel.textContent = '';
        elements.scoreBreakdown.innerHTML = '<p class="text-muted">Complete the assessment to see your score</p>';
        elements.scoreDetailToggle.style.display = 'none';
        return;
    }

    elements.scoreValue.textContent = scoreData.percentage;

    // Set color class based on level
    let colorClass = 'danger';
    if (scoreData.percentage >= 95) colorClass = 'excellent';
    else if (scoreData.percentage >= 80) colorClass = 'success';
    else if (scoreData.percentage >= 60) colorClass = 'warning';
    else if (scoreData.percentage >= 40) colorClass = 'caution';
    elements.scoreCircle.className = `score-circle ${colorClass}`;

    // Show level label
    elements.scoreLevel.innerHTML = `<span style="color: ${scoreData.level.color}">${scoreData.level.label}</span>`;

    // Update simple breakdown
    const breakdownHtml = scoreData.breakdown.map(item => {
        const icon = item.isComplete ? 'fa-check text-success' : 'fa-times text-danger';
        return `<span class="${item.isComplete ? 'text-success' : 'text-danger'}"><i class="fa ${icon}"></i> ${item.label}</span>`;
    }).join('<br>');
    elements.scoreBreakdown.innerHTML = breakdownHtml;

    // Show score detail toggle
    elements.scoreDetailToggle.style.display = 'block';

    // Update detailed breakdown table
    const tierScores = getScoreByTier(state.questionnaire);
    let detailHtml = '';

    for (const [tierKey, tier] of Object.entries(tierScores)) {
        if (tier.items.length === 0) continue;

        for (const item of tier.items) {
            const status = item.isComplete
                ? '<span class="text-success"><i class="fa fa-check"></i></span>'
                : '<span class="text-danger"><i class="fa fa-exclamation-circle"></i></span>';
            detailHtml += `
                <tr>
                    <td>${item.label}</td>
                    <td>${Math.round(item.score)}/${item.maxScore}</td>
                    <td>${status}</td>
                </tr>
            `;
        }
    }
    elements.scoreDetailBody.innerHTML = detailHtml;
}

/**
 * Update progress display
 */
function updateProgress() {
    const stats = getProgressStats(state.questionnaire, state.completedTasks, state.dismissedTasks);

    if (stats.total === 0) {
        elements.progressSection.style.display = 'none';
        return;
    }

    elements.progressSection.style.display = 'block';
    elements.tasksCompleted.textContent = stats.completed;
    elements.tasksTotal.textContent = stats.total;
    elements.progressBar.style.width = `${stats.percentage}%`;
}

/**
 * Update top priority display
 */
function updateTopPriority() {
    const task = getTopPriorityTask(state.questionnaire, state.completedTasks, state.dismissedTasks);

    if (!task) {
        elements.topPriorityRow.style.display = 'none';
        return;
    }

    elements.topPriorityRow.style.display = 'block';
    elements.topPriorityTitle.textContent = task.title;
    elements.topPriorityDesc.textContent = task.description;
}

/**
 * Update the "continue to full assessment" prompt
 */
function updateContinuePrompt() {
    if (state.assessmentMode === 'full') {
        elements.continueFull.style.display = 'none';
        return;
    }

    const stats = getCompletionStats(state.questionnaire);
    elements.continueFull.style.display = stats.quick.complete ? 'block' : 'none';
}

/**
 * Render the task list
 */
function renderTasks() {
    const tasks = getAllTasksWithStatus(state.questionnaire, state.completedTasks, state.dismissedTasks);

    if (tasks.length === 0) {
        elements.taskList.innerHTML = '';
        elements.emptyTasks.style.display = 'block';
        return;
    }

    elements.emptyTasks.style.display = 'none';

    const html = tasks.map(task => {
        const config = SEVERITY_CONFIG[task.severity];
        const completedClass = task.isCompleted ? 'task-completed' : '';
        const icon = task.isCompleted ? 'fa-check-circle text-success' : 'fa-circle-o';

        return `
            <div class="task-item ${completedClass}" data-task-id="${task.id}">
                <div class="task-status">
                    <i class="fa ${icon}"></i>
                </div>
                <div class="task-content">
                    <span class="badge" style="background-color: ${config.color}">${config.label}</span>
                    <h4 class="task-title">${task.title}</h4>
                    <p class="task-description">${task.description}</p>
                    <small class="text-muted"><i class="fa fa-clock-o"></i> ${task.estimatedTime}</small>
                </div>
                <div class="task-actions">
                    ${task.isCompleted
                        ? '<button class="btn btn-sm btn-default" disabled>Completed</button>'
                        : `<button class="btn btn-sm btn-primary task-start-btn" data-task-id="${task.id}">Start</button>`
                    }
                </div>
            </div>
        `;
    }).join('');

    elements.taskList.innerHTML = html;

    // Add click handlers
    elements.taskList.querySelectorAll('.task-start-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = btn.dataset.taskId;
            const task = SECURITY_TASKS.find(t => t.id === taskId);
            if (task) navigateToArticle(task);
        });
    });
}

/**
 * Navigate to the article page
 */
function navigateToArticle(task) {
    window.location.href = `article.html?article=${task.articleSlug}`;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
