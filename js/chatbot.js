/* ==========================================
   CHATBOT FUNCTIONALITY
   ========================================== */

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.init();
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
        this.displayWelcomeMessage();
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <!-- Chatbot Button -->
            <button class="chatbot-button" id="chatbotButton" aria-label="Open chatbot">
                <i class="fas fa-comments"></i>
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
                            placeholder="Coming soon..." 
                            disabled
                        >
                        <button class="chatbot-send-button" id="chatbotSend" disabled>
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

        // Toggle chatbot window
        chatbotButton.addEventListener('click', () => this.toggleChatbot());
        chatbotClose.addEventListener('click', () => this.closeChatbot());

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
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            chatbotWindow.classList.add('active');
        } else {
            chatbotWindow.classList.remove('active');
        }
    }

    closeChatbot() {
        const chatbotWindow = document.getElementById('chatbotWindow');
        chatbotWindow.classList.remove('active');
        this.isOpen = false;
    }

    displayWelcomeMessage() {
        const messagesContainer = document.getElementById('chatbotMessages');
        
        const welcomeHTML = `
            <div class="welcome-message">
                <i class="fas fa-robot"></i>
                <h4>Hi there! 👋</h4>
                <p>Soon, you'll be able to "chat" with Sahil's resume.</p>
                <p style="font-size: 13px; margin-top: 16px;">
                    Ask questions about:<br>
                    • Work experience & projects<br>
                    • Technical skills & expertise<br>
                    • Awards & achievements<br>
                    • Conference talks & more
                </p>
                <span class="coming-soon-badge">🚀 COMING SOON</span>
            </div>
        `;
        
        messagesContainer.innerHTML = welcomeHTML;
    }

    sendMessage() {
        // Placeholder for future RAG implementation
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (message) {
            console.log('Message sent:', message);
            input.value = '';
            // Future: Call RAG backend here
        }
    }

    addMessage(text, sender = 'bot') {
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
}

// Initialize chatbot when page loads
const chatbot = new Chatbot();
