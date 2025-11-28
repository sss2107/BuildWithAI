/* ==========================================
   CHATBOT FUNCTIONALITY
   ========================================== */

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.apiEndpoint = 'https://4ctco04k53.execute-api.us-east-1.amazonaws.com/Prod/chat';
        this.sessionId = this.getOrCreateSessionId();
        this.conversationHistory = this.loadHistoryFromStorage();
        this.init();
    }
    
    getOrCreateSessionId() {
        // Check if session ID exists in localStorage
        let sessionId = localStorage.getItem('chatbot_session_id');
        if (!sessionId) {
            // Generate new session ID (timestamp + random)
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('chatbot_session_id', sessionId);
        }
        return sessionId;
    }
    
    loadHistoryFromStorage() {
        try {
            const stored = localStorage.getItem(`chatbot_history_${this.sessionId}`);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading history:', e);
            return [];
        }
    }
    
    saveHistoryToStorage() {
        try {
            localStorage.setItem(
                `chatbot_history_${this.sessionId}`,
                JSON.stringify(this.conversationHistory)
            );
        } catch (e) {
            console.error('Error saving history:', e);
        }
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createChatbotHTML();
        this.attachEventListeners();
        
        // Display welcome or restore conversation
        if (this.conversationHistory.length > 0) {
            this.restoreConversation();
        } else {
            this.displayWelcomeMessage();
        }
        
        // Auto-open chatbot after a short delay
        setTimeout(() => {
            this.toggleChatbot();
        }, 800);
    }
    
    restoreConversation() {
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.innerHTML = '';
        
        // Render all messages from history
        this.conversationHistory.forEach(msg => {
            this.addMessageToUI(msg.content, msg.role);
        });
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <!-- Chatbot Button -->
            <button class="chatbot-button" id="chatbotButton" aria-label="Open chatbot">
                <i class="fas fa-comments"></i>
            </button>
            
            <!-- Green Call Button (slides up when chat opens) -->
            <button class="call-button" id="callButton" aria-label="Call Sahil">
                <i class="fas fa-phone-alt"></i>
            </button>

            <!-- Chatbot Window -->
            <div class="chatbot-window" id="chatbotWindow">
                <!-- Header -->
                <div class="chatbot-header">
                    <div class="chatbot-header-content">
                        <div class="chatbot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="chatbot-info">
                            <h3>Sahil's AI Assistant</h3>
                            <p>Ask about my experience & projects</p>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbotClose" aria-label="Close chatbot">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Messages Area -->
                <div class="chatbot-messages" id="chatbotMessages">
                    <!-- Messages will be added here -->
                </div>

                <!-- Input Area -->
                <div class="chatbot-input-area">
                    <div class="chatbot-input-wrapper">
                        <input 
                            type="text" 
                            class="chatbot-input" 
                            id="chatbotInput" 
                            placeholder="Ask me anything..." 
                        >
                        <button class="chatbot-send-button" id="chatbotSend">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Append to body
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        const chatbotButton = document.getElementById('chatbotButton');
        const chatbotClose = document.getElementById('chatbotClose');
        const chatbotWindow = document.getElementById('chatbotWindow');
        const chatbotInput = document.getElementById('chatbotInput');
        const chatbotSend = document.getElementById('chatbotSend');
        const chatbotMessages = document.getElementById('chatbotMessages');
        const callButton = document.getElementById('callButton');

        // Toggle chatbot window
        chatbotButton.addEventListener('click', () => this.toggleChatbot());
        chatbotClose.addEventListener('click', () => this.closeChatbot());
        
        // Call button - show voice feature message
        callButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showVoiceMessage();
        });

        // Prevent scroll propagation to parent page
        chatbotMessages.addEventListener('wheel', (e) => {
            const isScrollable = chatbotMessages.scrollHeight > chatbotMessages.clientHeight;
            if (isScrollable) {
                e.stopPropagation();
            }
        });

        // Prevent touchmove propagation on mobile
        chatbotMessages.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        }, { passive: true });

        // Handle input (for future functionality)
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !chatbotInput.disabled) {
                this.sendMessage();
            }
        });

        chatbotSend.addEventListener('click', () => {
            if (!chatbotSend.disabled) {
                this.sendMessage();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !chatbotWindow.contains(e.target) && 
                !chatbotButton.contains(e.target)) {
                this.closeChatbot();
            }
        });
    }

    toggleChatbot() {
        const chatbotWindow = document.getElementById('chatbotWindow');
        const callButton = document.getElementById('callButton');
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            chatbotWindow.classList.add('active');
            callButton.classList.add('visible');
        } else {
            chatbotWindow.classList.remove('active');
            callButton.classList.remove('visible');
        }
    }

    closeChatbot() {
        const chatbotWindow = document.getElementById('chatbotWindow');
        const callButton = document.getElementById('callButton');
        
        chatbotWindow.classList.remove('active');
        callButton.classList.remove('visible');
        this.isOpen = false;
    }
    
    showVoiceMessage() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'bot-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>Voice Conversations Coming Soon! 🎙️</strong>
                <p>I'm learning to talk! Voice chat feature will be available soon. For now, feel free to ask me anything via text.</p>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    displayWelcomeMessage() {
        const messagesContainer = document.getElementById('chatbotMessages');
        
        const welcomeHTML = `
            <div class="welcome-message">
                <i class="fas fa-robot"></i>
                <h4>Hi there! 👋</h4>
                <p>I'm Sahil's AI assistant powered by advanced RAG architecture and Gemini 2.5 Flash.</p>
                <p style="font-size: 13px; margin-top: 16px;">
                    Ask me about:<br>
                    • Work experience & projects<br>
                    • Technical skills & expertise<br>
                    • Awards & achievements<br>
                    • Education & background
                </p>
            </div>
        `;
        
        messagesContainer.innerHTML = welcomeHTML;
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const sendButton = document.getElementById('chatbotSend');
        const message = input.value.trim();
        
        if (message) {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: message,
                timestamp: Date.now()
            });
            
            // Display user message
            this.addMessageToUI(message, 'user');
            input.value = '';
            
            // Save to localStorage
            this.saveHistoryToStorage();
            
            // Disable input while processing
            input.disabled = true;
            sendButton.disabled = true;
            
            // Add typing indicator
            this.addTypingIndicator();
            
            try {
                // Get last 3 Q&A pairs (6 messages) for context
                const recentHistory = this.conversationHistory.slice(-6);
                
                // Call Lambda API with history and session ID
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        question: message,
                        history: recentHistory,
                        sessionId: this.sessionId
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Remove typing indicator
                this.removeTypingIndicator();
                
                // Add bot response to history
                this.conversationHistory.push({
                    role: 'assistant',
                    content: data.answer,
                    timestamp: Date.now()
                });
                
                // Display bot response
                this.addMessageToUI(data.answer, 'bot');
                
                // Save to localStorage
                this.saveHistoryToStorage();
                
            } catch (error) {
                console.error('Error:', error);
                this.removeTypingIndicator();
                const errorMsg = 'Sorry, I encountered an error. Please try again.';
                this.conversationHistory.push({
                    role: 'assistant',
                    content: errorMsg,
                    timestamp: Date.now()
                });
                this.addMessageToUI(errorMsg, 'bot');
                this.saveHistoryToStorage();
            } finally {
                // Re-enable input
                input.disabled = false;
                sendButton.disabled = false;
                input.focus();
            }
        }
    }

    addTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const agenticHTML = `
            <div class="agentic-workflow" id="agenticWorkflow">
                <div class="workflow-step" id="step1">
                    <span class="step-icon">🔍</span>
                    <span class="step-text">Retriever agent analyzing query...</span>
                </div>
                <div class="workflow-step hidden" id="step2">
                    <span class="step-icon">📄</span>
                    <span class="step-text">Reading <span id="sectionCount">0</span> relevant sections...</span>
                </div>
                <div class="workflow-step hidden" id="step3">
                    <span class="step-icon">✨</span>
                    <span class="step-text">Summarizer agent processing response...</span>
                </div>
                <div class="workflow-step hidden" id="step4">
                    <span class="step-icon">✓</span>
                    <span class="step-text">Validating response accuracy...</span>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', agenticHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Animate workflow steps
        this.animateAgenticSteps();
    }
    
    animateAgenticSteps() {
        const steps = [
            { id: 'step1', delay: 0 },
            { id: 'step2', delay: 800, action: () => {
                // Simulate section count (random 2-5 sections)
                const count = Math.floor(Math.random() * 4) + 2;
                document.getElementById('sectionCount').textContent = count;
            }},
            { id: 'step3', delay: 1600 },
            { id: 'step4', delay: 2200 }
        ];
        
        steps.forEach(step => {
            setTimeout(() => {
                const element = document.getElementById(step.id);
                if (element) {
                    element.classList.remove('hidden');
                    element.classList.add('active');
                    if (step.action) step.action();
                }
            }, step.delay);
        });
    }

    removeTypingIndicator() {
        const agenticWorkflow = document.getElementById('agenticWorkflow');
        if (agenticWorkflow) {
            // Fade out and remove
            agenticWorkflow.style.opacity = '0';
            setTimeout(() => agenticWorkflow.remove(), 300);
        }
    }

    addMessageToUI(text, sender = 'bot') {
        const messagesContainer = document.getElementById('chatbotMessages');
        
        // Remove welcome message if exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        const messageHTML = `
            <div class="message ${sender}">
                ${text}
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Legacy method for compatibility
    addMessage(text, sender = 'bot') {
        this.addMessageToUI(text, sender);
    }
}

// Initialize chatbot when page loads
const chatbot = new Chatbot();
