/* ==========================================
   VOICE CALL WIDGET FUNCTIONALITY
   ========================================== */

class VoiceCall {
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
        this.createVoiceCallHTML();
        this.attachEventListeners();
    }

    createVoiceCallHTML() {
        const voiceCallHTML = `
            <!-- Voice Call Button -->
            <button class="voicecall-button" id="voiceCallButton" aria-label="Open voice call">
                <i class="fas fa-phone"></i>
            </button>

            <!-- Voice Call Window -->
            <div class="voicecall-window" id="voiceCallWindow">
                <!-- Header -->
                <div class="voicecall-header">
                    <div class="voicecall-header-content">
                        <div class="voicecall-avatar">
                            <i class="fas fa-microphone"></i>
                        </div>
                        <div class="voicecall-info">
                            <h3>Voice Assistant</h3>
                            <p>Talk with Sahil's AI</p>
                        </div>
                    </div>
                    <button class="voicecall-close" id="voiceCallClose" aria-label="Close voice call">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Content Area -->
                <div class="voicecall-content">
                    <div class="voicecall-icon">
                        <i class="fas fa-microphone-alt"></i>
                    </div>
                    <h4>Voice Conversations Coming Soon! 🎙️</h4>
                    <p>Soon, you'll be able to speak to Sahil's AI assistant.</p>
                    
                    <div class="voicecall-features">
                        <p>What's coming:</p>
                        <div class="voicecall-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Natural voice conversations</span>
                        </div>
                        <div class="voicecall-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Real-time AI responses</span>
                        </div>
                        <div class="voicecall-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Ask about experience & projects</span>
                        </div>
                    </div>
                    
                    <span class="voicecall-coming-soon-badge">🚀 COMING SOON</span>
                </div>
            </div>
        `;

        // Append to body
        document.body.insertAdjacentHTML('beforeend', voiceCallHTML);
    }

    attachEventListeners() {
        const voiceCallButton = document.getElementById('voiceCallButton');
        const voiceCallClose = document.getElementById('voiceCallClose');
        const voiceCallWindow = document.getElementById('voiceCallWindow');
        const voiceCallContent = document.querySelector('.voicecall-content');

        // Toggle voice call window
        voiceCallButton.addEventListener('click', () => this.toggleVoiceCall());
        voiceCallClose.addEventListener('click', () => this.closeVoiceCall());

        // Prevent scroll propagation to parent page
        if (voiceCallContent) {
            voiceCallContent.addEventListener('wheel', (e) => {
                const isScrollable = voiceCallContent.scrollHeight > voiceCallContent.clientHeight;
                if (isScrollable) {
                    e.stopPropagation();
                }
            });

            // Prevent touchmove propagation on mobile
            voiceCallContent.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            }, { passive: true });
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !voiceCallWindow.contains(e.target) && 
                !voiceCallButton.contains(e.target)) {
                this.closeVoiceCall();
            }
        });
    }

    toggleVoiceCall() {
        const voiceCallWindow = document.getElementById('voiceCallWindow');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            voiceCallWindow.classList.add('active');
        } else {
            voiceCallWindow.classList.remove('active');
        }
    }

    closeVoiceCall() {
        const voiceCallWindow = document.getElementById('voiceCallWindow');
        voiceCallWindow.classList.remove('active');
        this.isOpen = false;
    }
}

// Initialize voice call widget when page loads
const voiceCall = new VoiceCall();
