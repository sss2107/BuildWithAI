/* ==========================================
   VOICE CALL WIDGET FUNCTIONALITY
   ========================================== */

console.log('🎙️ VoiceCall script loaded');

class VoiceCall {
    constructor() {
        console.log('🎙️ VoiceCall constructor called');
        this.isOpen = false;
        this.isListening = false;
        this.isSpeaking = false;
        this.apiEndpoint = 'https://4ctco04k53.execute-api.us-east-1.amazonaws.com/Prod/chat';
        this.sessionId = this.getOrCreateSessionId();
        this.conversationHistory = [];
        
        // Multi-language support
        this.currentLanguage = 'en-US'; // Default to English
        this.supportedLanguages = {
            'en': { code: 'en-US', name: 'English' },
            'hi': { code: 'hi-IN', name: 'Hindi' },
            'zh': { code: 'zh-CN', name: 'Chinese' },
            'fr': { code: 'fr-FR', name: 'French' },
            'ru': { code: 'ru-RU', name: 'Russian' }
        };
        
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
        this.recognition.lang = this.currentLanguage;
        this.recognitionActive = false; // Track if recognition is running
        
        this.recognition.onstart = () => {
            console.log('🎤 Recognition actually started');
            this.recognitionActive = true;
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const detectedLang = this.detectLanguage(transcript);
            console.log('🎤 Heard:', transcript, '| Detected:', detectedLang);
            
            // Switch language if different
            if (detectedLang && detectedLang !== this.currentLanguage) {
                this.currentLanguage = detectedLang;
                this.recognition.lang = detectedLang;
                console.log('🌍 Switched to:', this.getSupportedLanguages()[detectedLang]?.name || detectedLang);
            }
            
            this.handleVoiceInput(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('🎤 Recognition error:', event.error);
            this.recognitionActive = false;
            if (event.error === 'not-allowed') {
                this.updateStatus('Microphone access denied. Please allow microphone.');
            } else if (event.error === 'no-speech') {
                this.updateStatus('No speech detected. Click mic to try again.');
            } else {
                this.updateStatus('Error: ' + event.error + '. Click mic to try again.');
            }
            this.stopListening();
        };
        
        this.recognition.onend = () => {
            console.log('🎤 Recognition ended');
            this.recognitionActive = false;
            this.isListening = false;
            this.updateMicButton();
        };
    }
    
    detectLanguage(text) {
        // Simple language detection based on character patterns
        // Chinese characters
        if (/[\u4e00-\u9fa5]/.test(text)) {
            return 'zh-CN';
        }
        // Hindi Devanagari script
        if (/[\u0900-\u097F]/.test(text)) {
            return 'hi-IN';
        }
        // Cyrillic (Russian)
        if (/[\u0400-\u04FF]/.test(text)) {
            return 'ru-RU';
        }
        // French common words
        if (/\b(je|tu|il|elle|nous|vous|ils|elles|le|la|les|de|du|des|un|une|et|ou|mais|bonjour|merci)\b/i.test(text)) {
            return 'fr-FR';
        }
        // Default to English
        return 'en-US';
    }
    
    getSupportedLanguages() {
        const langs = {};
        for (let key in this.supportedLanguages) {
            langs[this.supportedLanguages[key].code] = this.supportedLanguages[key];
        }
        return langs;
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
                            <p id="voiceStatus">Muted - Click mic to talk</p>
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
                        <button class="voicecall-mic-button muted" id="voiceMicButton" aria-label="Toggle microphone">
                            <i class="fas fa-microphone-slash"></i>
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
                
                // Wait for voices to be fully loaded
                const speakWhenReady = () => {
                    const voices = this.synthesis.getVoices();
                    if (voices.length > 0) {
                        console.log('Voices ready, speaking icebreaker');
                        this.speak(randomIcebreaker);
                    } else {
                        console.log('Waiting for voices...');
                        setTimeout(speakWhenReady, 200);
                    }
                };
                speakWhenReady();
            }, 1000);
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
        console.log('Toggle listening clicked, current state:', this.isListening);
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
            this.playUnmuteSound();
        }
    }
    
    playUnmuteSound() {
        // Play a short beep sound when unmuting (like Teams)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Higher pitch beep
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    startListening() {
        if (!this.recognition) {
            this.updateStatus('Voice not supported in this browser');
            return;
        }
        
        // If already listening, abort and restart
        if (this.recognitionActive) {
            console.log('🎤 Aborting existing recognition');
            this.recognition.abort();
            this.recognitionActive = false;
        }
        
        this.stopSpeaking(); // Stop any ongoing speech
        this.isListening = true;
        this.updateMicButton();
        this.updateStatus('Listening...');
        
        try {
            console.log('🎤 Starting recognition...');
            this.recognition.start();
        } catch (error) {
            console.error('🎤 Recognition start error:', error);
            this.isListening = false;
            this.recognitionActive = false;
            this.updateMicButton();
            this.updateStatus('Error starting microphone: ' + error.message);
        }
    }
    
    stopListening() {
        if (this.recognition && this.recognitionActive) {
            console.log('🎤 Stopping recognition');
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('🎤 Error stopping recognition:', error);
            }
        }
        this.isListening = false;
        this.recognitionActive = false;
        this.updateMicButton();
        this.updateStatus('Muted - Click mic to talk');
    }
    
    updateMicButton() {
        const button = document.getElementById('voiceMicButton');
        if (!button) {
            console.error('Mic button not found!');
            return;
        }
        
        const icon = button.querySelector('i');
        if (!icon) {
            console.error('Mic icon not found!');
            return;
        }
        
        console.log('Updating mic button, isListening:', this.isListening);
        
        if (this.isListening) {
            button.classList.remove('muted');
            button.classList.add('listening');
            icon.className = 'fas fa-microphone';
            console.log('Mic set to LISTENING (yellow, unmuted)');
        } else {
            button.classList.add('muted');
            button.classList.remove('listening');
            icon.className = 'fas fa-microphone-slash';
            console.log('Mic set to MUTED (red, muted)');
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
                    conversation_history: this.conversationHistory,
                    source: 'voice'
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
        console.log('Volume check:', this.synthesis.speaking, 'Paused:', this.synthesis.paused);
        
        // Stop any ongoing speech
        this.stopSpeaking();
        
        // Ensure synthesis is ready
        if (this.synthesis.speaking) {
            console.log('Already speaking, cancelling...');
            this.synthesis.cancel();
        }
        
        // Resume if paused (some browsers pause by default)
        if (this.synthesis.paused) {
            console.log('Synthesis was paused, resuming...');
            this.synthesis.resume();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US'; // American English
        
        // Try to use an American English voice if available
        const voices = this.synthesis.getVoices();
        console.log('Available voices:', voices.length);
        
        // Get language prefix (e.g., 'en' from 'en-US')
        const langPrefix = this.currentLanguage.split('-')[0];
        
        // Try to find best voice for current language
        const selectedVoice = voices.find(voice => 
            voice.lang === this.currentLanguage && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        ) || voices.find(voice => voice.lang === this.currentLanguage)
          || voices.find(voice => voice.lang.startsWith(langPrefix))
          || voices[0];
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = this.currentLanguage;
            console.log('🔊 Using voice:', selectedVoice.name, '| Lang:', selectedVoice.lang);
        } else {
            console.log('⚠️ No suitable voice found for', this.currentLanguage, ', using default');
        }
        
        utterance.onstart = () => {
            console.log('✅ Speech started successfully');
            this.isSpeaking = true;
            this.updateStatus('Speaking...');
        };
        
        utterance.onend = () => {
            console.log('Speech ended');
            this.isSpeaking = false;
            this.updateStatus('Muted - Click mic to talk');
        };
        
        utterance.onerror = (event) => {
            console.error('❌ Speech error:', event.error, event);
            this.isSpeaking = false;
            this.updateStatus('Muted - Click mic to talk');
        };
        
        // Immediate speak without delay
        console.log('📢 Calling synthesis.speak()...');
        
        // Mobile Safari/iOS workaround - ensure synthesis is ready
        if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            console.log('📱 Mobile browser detected - using workaround');
            // Force a small delay for mobile browsers
            setTimeout(() => {
                this.synthesis.speak(utterance);
            }, 50);
        } else {
            this.synthesis.speak(utterance);
        }
        
        // Check if it actually started
        setTimeout(() => {
            if (!this.synthesis.speaking && !this.isSpeaking) {
                console.error('⚠️ Speech did not start! Browser may be blocking autoplay.');
                console.log('Try clicking the mic button first to enable audio.');
                // Try to restart speech
                this.synthesis.cancel();
                setTimeout(() => {
                    console.log('🔄 Retrying speech...');
                    this.synthesis.speak(utterance);
                }, 100);
            }
        }, 300);
    }
    
    stopSpeaking() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        this.isSpeaking = false;
    }
}

// Initialize voice call widget when page loads
console.log('🎙️ About to initialize VoiceCall...');
const voiceCall = new VoiceCall();
console.log('🎙️ VoiceCall initialized:', voiceCall);
