import { EventBus } from './EventBus.js';
import { MessageModule } from '../modules/messages.js';
import { VoiceModule } from '../modules/voice.js';
import { HistoryModule } from '../modules/history.js';
import { SettingsModule } from '../modules/settings.js';
import { NotificationModule } from '../modules/notifications.js';
import { SidebarModule } from '../modules/sidebar.js';
import { getById } from '../utils/dom.js';
import { getTimeDiff } from '../utils/time.js';
import { isValidMessage, sanitizeInput } from '../utils/validators.js';

export class ChatApp {
    constructor() {
        // Core
        this.eventBus = new EventBus();
        
        // DOM Elements
        this.messageInput = getById('messageInput');
        this.chatMessages = getById('chatMessages');
        this.sendBtn = getById('sendBtn');
        this.loadingScreen = getById('loadingScreen');
        
        // Modules
        this.messages = new MessageModule(this.chatMessages, this.eventBus);
        this.voice = new VoiceModule(this.eventBus);
        this.history = new HistoryModule(this.eventBus);
        this.settings = new SettingsModule();
        this.notifications = new NotificationModule();
        this.sidebar = new SidebarModule();
        
        // State
        this.sessionStartTime = new Date();
        
        this.init();
    }
    
    init() {
        // Hide loading screen
        setTimeout(() => this.loadingScreen?.classList.add('hidden'), 1000);
        
        // Event listeners
        this.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.messageInput?.addEventListener('input', () => this.updateSendButton());
        this.messageInput?.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Event bus listeners
        this.eventBus.on('voiceMessage', (text) => this.sendMessage(text));
        this.eventBus.on('messageAdded', () => this.updateStats());
        
        // Initialize modules
        this.loadChatHistory();
        this.settings.load();
        this.sidebar.initTabs();
        this.updateSessionTimer();
        
        // Focus input
        setTimeout(() => this.messageInput?.focus(), 1500);
    }
    
    async sendMessage(message = null) {
        const text = message || this.messageInput?.value || '';
        const sanitized = sanitizeInput(text);
        
        if (!isValidMessage(sanitized) || this.sendBtn?.disabled) return;
        
        // Clear input
        if (!message) {
            this.messageInput.value = '';
            this.updateSendButton();
            this.autoResize(this.messageInput);
        }
        
        this.sendBtn.disabled = true;
        this.messages.removeWelcomeScreen();
        this.messages.addMessage('user', sanitized);
        
        const typingId = this.messages.showTypingIndicator();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: sanitized })
            });
            
            const data = await response.json();
            this.messages.removeTypingIndicator(typingId);
            
            if (data.error) {
                this.messages.addMessage('bot', 'Sorry, I encountered an error.');
                this.notifications.show('Error', data.error, 'error');
            } else {
                this.messages.addMessage('bot', data.response, data.source);
                if (localStorage.getItem('ttsEnabled') === 'true') {
                    this.voice.speakText(data.response);
                }
            }
        } catch (error) {
            this.messages.removeTypingIndicator(typingId);
            this.messages.addMessage('bot', 'Network error. Please check your connection.');
            this.notifications.show('Error', 'Could not connect to server', 'error');
        }
        
        this.sendBtn.disabled = false;
        this.messageInput?.focus();
    }
    
    async loadChatHistory() {
        const history = await this.history.loadHistory();
        if (history.length > 0) {
            this.messages.removeWelcomeScreen();
            history.forEach(msg => this.messages.addMessage(msg.role, msg.content, msg.source));
        }
    }
    
    async clearHistory() {
        const success = await this.history.clearHistory();
        if (success) {
            this.notifications.show('Success', 'Chat history cleared', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            this.notifications.show('Error', 'Failed to clear history', 'error');
        }
    }
    
    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    updateSendButton() {
        const text = this.messageInput?.value || '';
        if (this.sendBtn) this.sendBtn.disabled = !text.trim();
        this.updateCharCount();
    }
    
    updateCharCount() {
        const counter = getById('charCounter');
        if (!counter || !this.messageInput) return;
        const count = this.messageInput.value.length;
        counter.textContent = `${count}/500`;
        counter.style.color = count > 450 ? 'var(--error)' : 'var(--text-muted)';
    }
    
    autoResize(textarea) {
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    updateStats() {
        const messages = document.querySelectorAll('.message');
        const botMessages = document.querySelectorAll('.message.bot');
        const totalEl = getById('totalMessages');
        const aiEl = getById('aiResponses');
        if (totalEl) totalEl.textContent = messages.length;
        if (aiEl) aiEl.textContent = botMessages.length;
    }
    
    updateSessionTimer() {
        setInterval(() => {
            const el = getById('sessionTime');
            if (el) el.textContent = getTimeDiff(this.sessionStartTime);
        }, 1000);
    }
    
    // Exposed methods for global functions
    toggleVoice() { this.voice.toggle(); }
    stopRecording() { this.voice.stopRecording(); }
    toggleSidebar() { this.sidebar.toggle(); }
    toggleTTS() { this.settings.toggleTTS(); }
    toggleDarkMode() { this.settings.toggleDarkMode(); }
    toggleTimestamps() { this.settings.toggleTimestamps(); }
    exportChat() { this.history.exportChat(); }
}