import { createElement, getById } from '../utils/dom.js';
import { getCurrentTime } from '../utils/time.js';

export class MessageModule {
    constructor(chatMessages, eventBus) {
        this.chatMessages = chatMessages;
        this.eventBus = eventBus;
    }
    
    addMessage(role, text, source = null) {
        const messageDiv = createElement('div', `message ${role}`);
        
        // Avatar
        const avatar = createElement('div', 'message-avatar');
        avatar.innerHTML = role === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';
        
        // Content
        const content = createElement('div', 'message-content');
        
        // Source badge for bot
        if (role === 'bot' && source) {
            const header = createElement('div', 'message-header');
            const badge = createElement('span', `source-badge ${source === 'faq' ? 'faq' : 'ai'}`);
            badge.textContent = source === 'faq' ? '📚 FAQ' : '🤖 GPT-4';
            header.appendChild(badge);
            content.appendChild(header);
        }
        
        // Message text
        const textDiv = createElement('div', 'message-text');
        textDiv.textContent = text;
        content.appendChild(textDiv);
        
        // Timestamp
        if (localStorage.getItem('showTimestamps') !== 'false') {
            const timeDiv = createElement('div', 'message-time');
            timeDiv.textContent = getCurrentTime();
            content.appendChild(timeDiv);
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
        this.eventBus.emit('messageAdded');
    }
    
    showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const indicator = createElement('div', 'message bot');
        indicator.id = id;
        indicator.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(indicator);
        this.scrollToBottom();
        return id;
    }
    
    removeTypingIndicator(id) {
        const indicator = getById(id);
        if (indicator) {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }
    }
    
    removeWelcomeScreen() {
        const welcomeScreen = getById('welcomeScreen');
        if (welcomeScreen?.parentNode) {
            welcomeScreen.style.opacity = '0';
            setTimeout(() => welcomeScreen.parentNode && welcomeScreen.remove(), 300);
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}