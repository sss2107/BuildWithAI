/* ==========================================
   VOICE CALL WIDGET FUNCTIONALITY
   ========================================== */

class VoiceCall {
    constructor() {
        this.isOpen = false;
        this.isListening = false;
        this.isSpeaking = false;
        this.apiEndpoint = 'https://4ctco04k53.execute-api.us-east-1.amazonaws.com/Prod/chat';
        this.sessionId = this.getOrCreateSessionId();
        this.conversationHistory = [];
        
        // Speech recognition setup
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voicesLoaded = false;
        
        // Load voices
        this.loadVoices();
        
        this.init();
    }
    
    loadVoices() {
        // Voices need time to load
        const loadVoicesWhenAvailable = () => {
            const voices = this.synthesis.getVoices();
            if (voices.length > 0) {
                this.voicesLoaded = true;
                console.log('Voices loaded:', voices.length);
            } else {
                setTimeout(loadVoicesWhenAvailable, 100);
            }
        };
        
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => {
                this.voicesLoaded = true;
                console.log('Voices changed event fired');
            };
        }
        
        loadVoicesWhenAvailable();
    }
    
    getOrCreateSessionId() {
        let sessionId = localStorage.getItem('voicecall_session_id');
        if (!sessionId) {
            sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('voicecall_session_id', sessionId);
        }
        return sessionId;
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
        this.setupSpeechRecognition();
    }
    
    setupSpeechRecognition() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US'; // American English
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.handleVoiceInput(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.updateStatus('Sorry, I didn\'t catch that. Please try again.');
            this.stopListening();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateMicButton();
        };
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
                            <p id="voiceStatus">Press the mic to talk</p>
                        </div>
                    </div>
                    <button class="voicecall-close" id="voiceCallClose" aria-label="Close voice call">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Content Area -->
                <div class="voicecall-content">
                    <div class="voicecall-transcript" id="voiceTranscript">
                        <!-- Conversation will appear here -->
                    </div>
                    
                    <div class="voicecall-controls">
                        <button class="voicecall-mic-button" id="voiceMicButton" aria-label="Toggle microphone">
                            <i class="fas fa-microphone"></i>
                        </button>
                    </div>
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
        const voiceMicButton = document.getElementById('voiceMicButton');

        // Toggle voice call window
        voiceCallButton.addEventListener('click', () => this.toggleVoiceCall());
        voiceCallClose.addEventListener('click', () => this.closeVoiceCall());
        
        // Microphone button
        voiceMicButton.addEventListener('click', () => this.toggleListening());

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
            this.playIcebreaker();
        } else {
            voiceCallWindow.classList.remove('active');
        }
    }
    
    playIcebreaker() {
        // Only play if no conversation history
        if (this.conversationHistory.length === 0) {
            const icebreakers = [
                "Hey! How are you doing?",
                "Hey! What's up?",
                "Hi there! How can I help you today?",
                "Hello! What would you like to know?",
                "Hey! Feel free to ask me anything about Sahil's experience!"
            ];
            
            const randomIcebreaker = icebreakers[Math.floor(Math.random() * icebreakers.length)];
            
            console.log('Playing icebreaker:', randomIcebreaker);
            
            // Longer delay to ensure window is open and voices are loaded
            setTimeout(() => {
                this.addTranscriptMessage('assistant', randomIcebreaker);
                this.speak(randomIcebreaker);
            }, 800);
        }
    }

    closeVoiceCall() {
        const voiceCallWindow = document.getElementById('voiceCallWindow');
        voiceCallWindow.classList.remove('active');
        this.isOpen = false;
        this.stopListening();
        this.stopSpeaking();
    }
    
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startListening() {
        if (!this.recognition) {
            this.updateStatus('Voice not supported in this browser');
            return;
        }
        
        this.stopSpeaking(); // Stop any ongoing speech
        this.isListening = true;
        this.updateMicButton();
        this.updateStatus('Listening...');
        this.recognition.start();
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateMicButton();
        this.updateStatus('Press the mic to talk');
    }
    
    updateMicButton() {
        const button = document.getElementById('voiceMicButton');
        if (!button) return;
        
        if (this.isListening) {
            button.classList.add('listening');
        } else {
            button.classList.remove('listening');
        }
    }
    
    updateStatus(message) {
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.textContent = message;
        }
    }
    
    addTranscriptMessage(role, text) {
        const transcript = document.getElementById('voiceTranscript');
        if (!transcript) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `voice-message voice-message-${role}`;
        messageDiv.innerHTML = `
            <div class="voice-message-bubble">
                <strong>${role === 'user' ? 'You' : 'Assistant'}:</strong>
                <p>${text}</p>
            </div>
        `;
        
        transcript.appendChild(messageDiv);
        transcript.scrollTop = transcript.scrollHeight;
    }
    
    async handleVoiceInput(transcript) {
        this.stopListening();
        this.addTranscriptMessage('user', transcript);
        this.updateStatus('Processing...');
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: transcript,
                    session_id: this.sessionId,
                    conversation_history: this.conversationHistory
                })
            });
            
            const data = await response.json();
            
            if (data.answer) {
                this.conversationHistory.push({
                    role: 'user',
                    content: transcript
                });
                this.conversationHistory.push({
                    role: 'assistant',
                    content: data.answer
                });
                
                // Keep history limited
                if (this.conversationHistory.length > 10) {
                    this.conversationHistory = this.conversationHistory.slice(-10);
                }
                
                this.addTranscriptMessage('assistant', data.answer);
                this.speak(data.answer);
            } else {
                throw new Error(data.error || 'No response');
            }
        } catch (error) {
            console.error('Voice call error:', error);
            const errorMsg = 'Sorry, I encountered an issue. Please try again.';
            this.addTranscriptMessage('assistant', errorMsg);
            this.speak(errorMsg);
        }
    }
    
    speak(text) {
        console.log('Attempting to speak:', text);
        
        // Stop any ongoing speech
        this.stopSpeaking();
        
        // Ensure synthesis is ready
        if (this.synthesis.speaking) {
            console.log('Already speaking, cancelling...');
            this.synthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US'; // American English
        
        // Try to use an American English voice if available
        const voices = this.synthesis.getVoices();
        console.log('Available voices:', voices.length);
        
        const americanVoice = voices.find(voice => 
            voice.lang === 'en-US' && (voice.name.includes('Google') || voice.name.includes('Samantha'))
        ) || voices.find(voice => voice.lang === 'en-US') || voices[0];
        
        if (americanVoice) {
            utterance.voice = americanVoice;
            console.log('Using voice:', americanVoice.name);
        }
        
        utterance.onstart = () => {
            console.log('Speech started');
            this.isSpeaking = true;
            this.updateStatus('Speaking...');
        };
        
        utterance.onend = () => {
            console.log('Speech ended');
            this.isSpeaking = false;
            this.updateStatus('Press the mic to talk');
        };
        
        utterance.onerror = (event) => {
            console.error('Speech error:', event);
            this.isSpeaking = false;
            this.updateStatus('Press the mic to talk');
        };
        
        // Small delay to ensure synthesis is ready
        setTimeout(() => {
            this.synthesis.speak(utterance);
            console.log('Speech queued');
        }, 100);
    }
    
    stopSpeaking() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        this.isSpeaking = false;
    }
}

// Initialize voice call widget when page loads
const voiceCall = new VoiceCall();
