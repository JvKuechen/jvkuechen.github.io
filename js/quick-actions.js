/**
 * Quick Actions Library for Chat Widget
 * Deterministic responses based on context - no AI generation
 */

(function() {
    'use strict';

    var SECURITY_STORAGE_KEY = 'jvk_security_dashboard';

    /**
     * Quick action definitions
     */
    var QUICK_ACTIONS = {
        'show-projects': {
            label: 'Show projects',
            response: 'Public projects are loaded from GitHub and shown in the Projects section on the homepage. ' +
                'Each project links to its GitHub repo. Projects with wiki pages also link to documentation.\n\n' +
                'Browse all projects on [GitHub](https://github.com/jvkuechen) or in the [Wiki](/wiki/).',
            condition: function() { return true; }
        },
        'security-status': {
            label: 'Security status',
            response: function() {
                var state = getSecurityState();
                if (!state || !state.questionnaire || Object.keys(state.questionnaire).length === 0) {
                    return 'You haven\'t completed a security assessment yet. ' +
                        'The [Security Dashboard](/tools/security-dashboard/) is an educational tool ' +
                        'that helps you evaluate your personal security practices.';
                }

                var q = state.questionnaire;
                var issues = [];
                var good = [];

                if (q.passwordManager === 'yes' || q.passwordManager === 'dedicated') good.push('Password manager');
                else if (q.passwordManager === 'browser') good.push('Browser passwords');
                else if (q.passwordManager) issues.push('No password manager');

                var email2fa = q.emailTwoFactor || q.twoFactorEmail;
                if (email2fa === 'yes') good.push('Email 2FA');
                else if (email2fa) issues.push('Email 2FA not enabled');

                var fin2fa = q.financialTwoFactor || q.twoFactorBanking;
                if (fin2fa === 'yes' || fin2fa === 'all') good.push('Banking 2FA');
                else if (fin2fa === 'some') issues.push('Banking 2FA (only some accounts)');
                else if (fin2fa) issues.push('Banking 2FA not enabled');

                var updates = q.softwareUpdates || q.updates;
                if (updates === 'yes-auto' || updates === 'auto') good.push('Auto updates');
                else if (updates === 'yes-manual' || updates === 'prompt') good.push('Manual updates');
                else if (updates) issues.push('Software updates not regular');

                if (q.phoneLock === 'biometric' || q.phoneLock === 'pin') good.push('Phone lock');
                else if (q.phoneLock === 'none') issues.push('No phone lock');

                if (q.backupStatus === 'auto') good.push('Backups');
                else if (q.backupStatus === 'none' || q.backupStatus === 'some') issues.push('Backups incomplete');

                var response = '**Your Security Status:**\n\n';
                if (good.length > 0) {
                    response += 'Good: ' + good.join(', ') + '\n\n';
                }
                if (issues.length > 0) {
                    response += 'Needs attention: ' + issues.join(', ') + '\n\n';
                    response += 'Visit the [Security Dashboard](/tools/security-dashboard/) for recommended actions.';
                } else if (good.length > 0) {
                    response += 'Your basic security practices look solid.';
                }
                return response;
            },
            condition: function() { return true; }
        },
        'explain-page': {
            label: 'What is this page?',
            response: function() {
                var path = window.location.pathname;
                var hash = window.location.hash;

                if (path.includes('/tools/security-dashboard')) {
                    if (path.includes('article.html')) {
                        return 'This is a security guide article. Read through the steps, and click "Mark Complete" when done.';
                    }
                    return 'This is the Security Dashboard -- an educational tool for evaluating personal security practices. ' +
                        'Answer the questions on the left to get your security score and recommended actions.';
                }

                if (path.includes('/wiki/')) {
                    if (hash.includes('/projects/')) {
                        return 'This is a project documentation page. Use the sidebar to browse other projects.';
                    }
                    return 'This is the documentation wiki. Use the sidebar to browse project documentation.';
                }

                if (path.includes('/demos')) {
                    return 'This is the demos page. Interactive demonstrations are hosted on the homelab. ' +
                        'When the homelab is offline, demos show a status indicator.';
                }

                return 'This is the portfolio homepage. The About section covers professional background. ' +
                    'Projects are loaded from GitHub. The Wiki has detailed documentation.';
            },
            condition: function() { return true; }
        },
        'view-github': {
            label: 'View on GitHub',
            response: 'The source code for this site and all public projects are on ' +
                '[GitHub](https://github.com/jvkuechen). ' +
                'Project descriptions there are the source of truth for what appears in the Projects section.',
            condition: function() { return true; }
        }
    };

    function getSecurityState() {
        try {
            var saved = localStorage.getItem(SECURITY_STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    function isOnSecurityPage() {
        var path = window.location.pathname;
        var hash = window.location.hash;
        return path.includes('/security-dashboard') || hash.includes('/security/');
    }

    function getQuickActions() {
        var actions = [];
        var maxActions = 4;

        var priorityOrder;

        if (isOnSecurityPage()) {
            priorityOrder = ['security-status', 'explain-page', 'show-projects', 'view-github'];
        } else {
            priorityOrder = ['show-projects', 'explain-page', 'security-status', 'view-github'];
        }

        for (var i = 0; i < priorityOrder.length && actions.length < maxActions; i++) {
            var id = priorityOrder[i];
            var action = QUICK_ACTIONS[id];
            if (action && action.condition()) {
                actions.push({
                    id: id,
                    label: action.label,
                    response: typeof action.response === 'function' ? action.response() : action.response
                });
            }
        }

        return actions;
    }

    function executeAction(actionId) {
        var action = QUICK_ACTIONS[actionId];
        if (!action) return null;
        return typeof action.response === 'function' ? action.response() : action.response;
    }

    // Export to window
    window.QuickActions = {
        getActions: getQuickActions,
        execute: executeAction
    };

})();
