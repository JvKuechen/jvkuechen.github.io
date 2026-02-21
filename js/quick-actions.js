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
            response: 'Here are some featured projects:\n\n' +
                '- **DungeonLLM** - LLM-enhanced RPG in Godot [View](/wiki/#/projects/DungeonLLM)\n' +
                '- **Smart Swarm LLM** - Multi-agent coordination [View](/wiki/#/projects/Smart-Swarm-LLM)\n' +
                '- **RenderStream** - GPU to WebRTC streaming [View](/wiki/#/projects/W)\n' +
                '- **AutoHomeLab** - NixOS declarative homelab [View](/wiki/#/projects/AutoHomeLab)\n\n' +
                'See all projects in the [Wiki](/wiki/).',
            condition: function() { return true; }
        },
        'show-articles': {
            label: 'Show articles',
            response: 'Technical articles available:\n\n' +
                '- [LLM Integration Patterns](/wiki/#/articles/llm-integration-patterns)\n' +
                '- [Declarative Homelab with NixOS](/wiki/#/articles/declarative-homelab)\n' +
                '- [GPU Streaming Pipeline](/wiki/#/articles/gpu-streaming-pipeline)\n' +
                '- [Vulkan to WebRTC Graphics](/wiki/#/articles/vulkan-webrtc-graphics)\n' +
                '- [Code Visualization Tools](/wiki/#/articles/code-visualization-tools)',
            condition: function() { return true; }
        },
        'security-status': {
            label: 'My security status',
            response: function() {
                var state = getSecurityState();
                if (!state || !state.questionnaire || Object.keys(state.questionnaire).length === 0) {
                    return 'You haven\'t completed a security assessment yet. ' +
                        'Visit the [Security Dashboard](/tools/security-dashboard/) to check your security posture.';
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
                    response += 'Visit the [Security Dashboard](/tools/security-dashboard/) to see recommended actions.';
                } else if (good.length > 0) {
                    response += 'Great job! Your basic security is in good shape.';
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
                        return 'This is a security guide article. Read through the steps, and click "Mark Complete" when you\'re done.';
                    }
                    return 'This is the Security Dashboard. Answer the questions on the left to get your security score.';
                }

                if (path.includes('/wiki/')) {
                    if (hash.includes('/projects/')) {
                        return 'This is a project documentation page. Use the sidebar to browse other projects or articles.';
                    }
                    if (hash.includes('/articles/')) {
                        return 'This is a technical article. Check the sidebar for more articles and project documentation.';
                    }
                    return 'This is the documentation wiki. Use the sidebar to browse projects, articles, and guides.';
                }

                return 'This is the portfolio homepage. Scroll down to see featured projects, articles, and demos. ' +
                    'Click "Wiki" in the nav for full documentation.';
            },
            condition: function() { return true; }
        },
        'show-ai-projects': {
            label: 'AI/LLM projects',
            response: 'AI and LLM projects:\n\n' +
                '- [Smart Swarm LLM](/wiki/#/projects/Smart-Swarm-LLM) - Multi-agent coordination\n' +
                '- [DungeonLLM](/wiki/#/projects/DungeonLLM) - LLM-enhanced RPG\n' +
                '- [Graph RAG App](/wiki/#/projects/graph-rag-app) - Knowledge graph RAG\n' +
                '- [ChatCompare](/wiki/#/projects/ChatCompare) - LLM comparison tool',
            condition: function() { return true; }
        },
        'show-graphics-projects': {
            label: 'Graphics projects',
            response: 'Graphics and streaming projects:\n\n' +
                '- [RenderStream (W)](/wiki/#/projects/W) - GPU to WebRTC streaming\n' +
                '- [Vulkan Streaming](/wiki/#/projects/vulkan-streaming) - NVENC encoding pipeline\n' +
                '- [Vulkan WebRTC Triangle](/wiki/#/projects/vulkan-webrtc-triangle) - Cross-platform graphics',
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

    function hasSecurityState() {
        var state = getSecurityState();
        return state && state.questionnaire && Object.keys(state.questionnaire).length > 0;
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
            priorityOrder = ['security-status', 'explain-page', 'show-projects', 'show-articles'];
        } else {
            priorityOrder = ['show-projects', 'show-articles', 'explain-page', 'show-ai-projects'];
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
