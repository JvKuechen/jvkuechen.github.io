// Chat Widget with Groq API Integration
// Connects to Cloudflare Worker proxy to keep API key secure

(function() {
    'use strict';

    // Configuration
    var CONFIG = {
        // Cloudflare Worker endpoint (update after deploying worker)
        apiEndpoint: 'https://groq-proxy.jvkuechen.workers.dev/chat',
        // System prompt for the AI guide
        systemPrompt: 'You are a helpful AI guide for Jeff Kuechenmeister\'s portfolio site. ' +
            'CATEGORIES: Games: DungeonLLM (LLM-enhanced RPG in Godot), Asteroids, TheMerchant. ' +
            'AI/LLM: Smart Swarm LLM (multi-agent coordination), Graph RAG, ChatCompare. ' +
            'Graphics/Streaming: RenderStream (GPU to WebRTC streaming), Vulkan Streaming (NVENC encoding). ' +
            'Infrastructure: AutoHomeLab (NixOS homelab), proxmox-config. ' +
            'Tools: ScriptGoblin (VS Code code visualization). ' +
            'ARTICLES: LLM Integration Patterns, Declarative Homelab with NixOS, GPU Streaming Pipelines. ' +
            'NAVIGATION: Main site (/) has featured projects. Wiki (/wiki/) has full documentation. ' +
            'Keep responses concise (2-3 sentences). Guide users to specific project pages or articles. ' +
            'Use links like /wiki/#/projects/DungeonLLM for projects.',
        // Max conversation history to send (to manage token limits)
        maxHistoryMessages: 10
    };

    // Conversation history
    var conversationHistory = [];

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        var consentGiven = localStorage.getItem('cookieConsent');
        if (!consentGiven) {
            showCookieConsentPopup();
        } else {
            initializeChat();
        }
    });

    // Show cookie consent popup
    function showCookieConsentPopup() {
        var chatWidget = document.getElementById('chat-widget');
        chatWidget.classList.add('expanded');
        chatWidget.classList.add('cookie-consent');

        var chatHeader = document.getElementById('chat-header');
        chatHeader.style.display = 'none';

        var chatWindowTitle = document.getElementById('chat-window-title');
        chatWindowTitle.innerText = 'Cookie Consent';

        document.getElementById('cookie-consent-message').style.display = 'block';
        document.getElementById('chat-content').style.display = 'none';
    }

    // Accept cookies
    window.acceptCookies = function() {
        localStorage.setItem('cookieConsent', 'true');
        initializeChat();
    };

    // Reject cookies
    window.rejectCookies = function() {
        localStorage.setItem('cookieConsent', 'false');
        initializeChat();
    };

    // Initialize chat
    function initializeChat() {
        var consentGiven = localStorage.getItem('cookieConsent');
        var chatWidget = document.getElementById('chat-widget');
        chatWidget.classList.remove('cookie-consent');

        var chatWindowTitle = document.getElementById('chat-window-title');
        chatWindowTitle.innerText = 'AI Guide';

        document.getElementById('cookie-consent-message').style.display = 'none';
        document.getElementById('chat-content').style.display = 'flex';

        // Show warning if cookies rejected
        if (consentGiven === 'false') {
            document.getElementById('cookie-warning').style.display = 'block';
        } else {
            document.getElementById('cookie-warning').style.display = 'none';
        }

        // Restore chat header
        var chatHeader = document.getElementById('chat-header');
        chatHeader.style.display = 'flex';

        // Collapse chat window
        chatWidget.classList.remove('expanded');

        // Load chat history
        loadChatHistory();

        // Set up Enter key listener
        document.getElementById('chat-input').addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });

        // Add welcome message if no history
        if (conversationHistory.length === 0) {
            addMessage('bot', 'Hi! I can help you explore projects across games, AI, graphics, infrastructure and more.', false);
            showQuickActions();
        }
    }

    // Toggle chat window
    window.toggleChat = function() {
        var chatWidget = document.getElementById('chat-widget');
        var consentGiven = localStorage.getItem('cookieConsent');

        if (!consentGiven) {
            return;
        }

        if (chatWidget.classList.contains('expanded')) {
            chatWidget.classList.remove('expanded');
        } else {
            chatWidget.classList.add('expanded');
            var chatMessages = document.getElementById('chat-messages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
            document.getElementById('chat-input').focus();
            // Refresh quick actions when opening
            showQuickActions();
        }
    };

    // Send message
    window.sendMessage = function() {
        var input = document.getElementById('chat-input');
        var message = input.value.trim();
        if (message === '') return;

        // Hide quick actions while processing
        hideQuickActions();

        // Add user message
        addMessage('user', message);
        input.value = '';

        // Show typing indicator
        var typingId = addTypingIndicator();

        // Call Groq API via worker
        callGroqAPI(message)
            .then(function(response) {
                removeTypingIndicator(typingId);
                addMessage('bot', response);
                showQuickActions();
            })
            .catch(function(error) {
                removeTypingIndicator(typingId);
                console.error('Chat error:', error);
                addMessage('bot', 'Sorry, I\'m having trouble connecting right now. Please try again later.');
                showQuickActions();
            });
    };

    // Handle quick action click
    window.handleQuickAction = function(actionId) {
        if (!window.QuickActions) return;

        var response = window.QuickActions.execute(actionId);
        if (response) {
            // Find the action label for user message
            var actions = window.QuickActions.getActions();
            var action = actions.find(function(a) { return a.id === actionId; });
            var label = action ? action.label : 'Quick action';

            // Add as user message (the label) and bot response
            addMessage('user', label);
            addMessage('bot', response);

            // Refresh quick actions
            showQuickActions();
        }
    };

    // Show quick action buttons
    function showQuickActions() {
        if (!window.QuickActions) return;

        var actionsContainer = document.getElementById('quick-actions');
        if (!actionsContainer) return;

        // Clear existing
        actionsContainer.innerHTML = '';

        var actions = window.QuickActions.getActions();
        if (actions.length === 0) {
            actionsContainer.style.display = 'none';
            return;
        }

        actions.forEach(function(action) {
            var btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            btn.innerText = action.label;
            btn.onclick = function() { handleQuickAction(action.id); };
            actionsContainer.appendChild(btn);
        });

        actionsContainer.style.display = 'flex';
    }

    // Hide quick action buttons
    function hideQuickActions() {
        var actionsContainer = document.getElementById('quick-actions');
        if (actionsContainer) {
            actionsContainer.style.display = 'none';
        }
    }

    // Call Groq API through Cloudflare Worker
    function callGroqAPI(userMessage) {
        // Build messages array for API
        var messages = [
            { role: 'system', content: CONFIG.systemPrompt }
        ];

        // Add conversation history (limited)
        var historyStart = Math.max(0, conversationHistory.length - CONFIG.maxHistoryMessages);
        for (var i = historyStart; i < conversationHistory.length; i++) {
            messages.push(conversationHistory[i]);
        }

        // Add current user message
        messages.push({ role: 'user', content: userMessage });

        // Store in history
        conversationHistory.push({ role: 'user', content: userMessage });

        return fetch(CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: messages })
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('API request failed: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            var assistantMessage = data.choices[0].message.content;
            // Store assistant response in history
            conversationHistory.push({ role: 'assistant', content: assistantMessage });
            return assistantMessage;
        });
    }

    // Parse simple markdown to HTML
    function parseMarkdown(text) {
        // Links: [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        // Bold: **text**
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // Line breaks
        text = text.replace(/\n/g, '<br>');
        return text;
    }

    // Add message to chat
    function addMessage(sender, text, saveToHistory) {
        if (saveToHistory === undefined) saveToHistory = true;

        var chatMessages = document.getElementById('chat-messages');
        var messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);

        var messageText = document.createElement('div');
        messageText.classList.add('message-text');

        // Parse markdown for bot messages
        if (sender === 'bot') {
            messageText.innerHTML = parseMarkdown(text);
        } else {
            messageText.innerText = text;
        }

        messageDiv.appendChild(messageText);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (saveToHistory) {
            saveMessageToStorage(sender, text);
        }
    }

    // Add typing indicator
    function addTypingIndicator() {
        var chatMessages = document.getElementById('chat-messages');
        var messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', 'bot', 'typing-indicator');
        messageDiv.id = 'typing-' + Date.now();

        var messageText = document.createElement('div');
        messageText.classList.add('message-text');
        messageText.innerText = '...';

        messageDiv.appendChild(messageText);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return messageDiv.id;
    }

    // Remove typing indicator
    function removeTypingIndicator(id) {
        var indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }

    // Save message to localStorage
    function saveMessageToStorage(sender, text) {
        var consentGiven = localStorage.getItem('cookieConsent');
        if (consentGiven === 'true') {
            var chatHistory = getChatHistoryFromStorage();
            chatHistory.push({ sender: sender, text: text });
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        }
    }

    // Load chat history from localStorage
    function loadChatHistory() {
        var consentGiven = localStorage.getItem('cookieConsent');
        if (consentGiven === 'true') {
            var chatHistory = getChatHistoryFromStorage();
            for (var i = 0; i < chatHistory.length; i++) {
                addMessage(chatHistory[i].sender, chatHistory[i].text, false);
                // Rebuild conversation history for API
                var role = chatHistory[i].sender === 'user' ? 'user' : 'assistant';
                conversationHistory.push({ role: role, content: chatHistory[i].text });
            }
        }
    }

    // Get chat history from localStorage
    function getChatHistoryFromStorage() {
        var history = localStorage.getItem('chatHistory');
        return history ? JSON.parse(history) : [];
    }

})();
