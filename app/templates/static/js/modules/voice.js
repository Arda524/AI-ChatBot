export class VoiceModule {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.isRecording = false;
        this.recognition = null;
        this.voiceBtn = document.getElementById('voiceBtn');
        this.voiceOverlay = document.getElementById('voiceOverlay');
        this.messageInput = document.getElementById('messageInput');
        this.init();
    }
    
    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                if (event.results[0].isFinal) {
                    this.eventBus.emit('voiceMessage', transcript);
                }
            };
            
            this.recognition.onerror = () => this.stopRecording();
            this.recognition.onend = () => this.stopRecording();
        } else if (this.voiceBtn) {
            this.voiceBtn.style.display = 'none';
        }
    }
    
    toggle() {
        this.isRecording ? this.stopRecording() : this.startRecording();
    }
    
    startRecording() {
        if (this.recognition) {
            this.isRecording = true;
            this.voiceBtn?.classList.add('active');
            this.voiceOverlay?.classList.add('active');
            this.recognition.start();
            if (this.messageInput) this.messageInput.placeholder = 'Listening...';
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        this.voiceBtn?.classList.remove('active');
        this.voiceOverlay?.classList.remove('active');
        if (this.messageInput) this.messageInput.placeholder = 'Type your message here...';
        if (this.recognition) this.recognition.stop();
    }
    
    speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    }
}