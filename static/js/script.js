// ===========================================
// AI Chatbot - Main Application
// ===========================================

class ChatApp {
    constructor() {
        // DOM Elements
        this.messageInput = document.getElementById('messageInput');
        this.chatMessages = document.getElementById('chatMessages');
        this.sendBtn = document.getElementById('sendBtn');
        this.charCounter = document.getElementById('charCounter');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.voiceOverlay = document.getElementById('voiceOverlay');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.sidebar = document.getElementById('sidebar');
        
        // State
        this.isRecording = false;
        this.recognition = null;
        this.sessionStartTime = new Date();
        
        // Initialize
        this.init();
    }
    
    init() {
        // Hide loading screen
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
        }, 1000);
        
        // Event Listeners
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('input', () => this.updateSendButton());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Initialize features
        this.initVoiceRecognition();
        this.loadChatHistory();
        this.loadSettings();
        this.updateSessionTimer();
        this.initSidebarTabs();
        
        // Focus input
        setTimeout(() => this.messageInput.focus(), 1500);
    }
    
    // ===========================================
    // Message Handling
    // ===========================================
    
    async sendMessage(message = null) {
        const text = message || this.messageInput.value.trim();
        
        if (!text || this.sendBtn.disabled) return;
        
        // Clear input
        if (!message) {
            this.messageInput.value = '';
            this.updateSendButton();
            this.autoResize(this.messageInput);
        }
        
        // Disable send button
        this.sendBtn.disabled = true;
        
        // Remove welcome screen
        this.removeWelcomeScreen();
        
        // Add user message
        this.addMessage('user', text);
        
        // Show typing indicator
        const typingId = this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            
            const data = await response.json();
            
            this.removeTypingIndicator(typingId);
            
            if (data.error) {
                this.addMessage('bot', 'Sorry, I encountered an error. Please try again.');
                this.showNotification('Error', data.error, 'error');
            } else {
                this.addMessage('bot', data.response, data.source);
                
                // Text-to-speech if enabled
                if (localStorage.getItem('ttsEnabled') === 'true') {
                    this.speakText(data.response);
                }
            }
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessage('bot', 'Network error. Please check your connection.');
            this.showNotification('Network Error', 'Could not connect to server', 'error');
        }
        
        // Enable send button
        this.sendBtn.disabled = false;
        this.messageInput.focus();
        this.scrollToBottom();
        this.updateStats();
    }
    
    addMessage(role, text, source = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = role === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';
        
        // Content
        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Header with source badge
        if (role === 'bot' && source) {
            const header = document.createElement('div');
            header.className = 'message-header';
            
            const badge = document.createElement('span');
            badge.className = `source-badge ${source === 'faq' ? 'faq' : 'ai'}`;
            badge.textContent = source === 'faq' ? '📚 FAQ' : '🤖 GPT-4';
            
            header.appendChild(badge);
            content.appendChild(header);
        }
        
        // Message text
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;
        content.appendChild(textDiv);
        
        // Timestamp
        if (localStorage.getItem('showTimestamps') !== 'false') {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = this.getCurrentTime();
            content.appendChild(timeDiv);
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        this.chatMessages.appendChild(messageDiv);
        
        // Animate
        messageDiv.style.animation = 'messageSlide 0.3s ease';
        
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const indicator = document.createElement('div');
        indicator.className = 'message bot';
        indicator.id = id;
        
        indicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
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
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }
    }
    
    removeWelcomeScreen() {
        if (this.welcomeScreen && this.welcomeScreen.parentNode) {
            this.welcomeScreen.style.opacity = '0';
            setTimeout(() => {
                if (this.welcomeScreen.parentNode) {
                    this.welcomeScreen.remove();
                }
            }, 300);
        }
    }
    
    // ===========================================
    // Voice Recognition
    // ===========================================
    
    initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.updateSendButton();
                
                // Auto-send on final result
                if (event.results[0].isFinal) {
                    setTimeout(() => this.sendMessage(), 500);
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopRecording();
                this.showNotification('Voice Error', 'Could not recognize speech', 'error');
            };
            
            this.recognition.onend = () => {
                this.stopRecording();
            };
        } else {
            if (this.voiceBtn) {
                this.voiceBtn.style.display = 'none';
            }
        }
    }
    
    toggleVoice() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        if (this.recognition) {
            this.isRecording = true;
            this.voiceBtn.classList.add('active');
            this.voiceOverlay.classList.add('active');
            this.recognition.start();
            this.messageInput.placeholder = 'Listening...';
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        this.voiceBtn.classList.remove('active');
        this.voiceOverlay.classList.remove('active');
        this.messageInput.placeholder = 'Type your message here...';
        if (this.recognition) {
            this.recognition.stop();
        }
    }
    
    // ===========================================
    // Text to Speech
    // ===========================================
    
    speakText(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    }
    
    // ===========================================
    // History
    // ===========================================
    
    async loadChatHistory() {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            
            if (data.history && data.history.length > 0) {
                this.removeWelcomeScreen();
                
                data.history.forEach(msg => {
                    this.addMessage(msg.role, msg.content, msg.source);
                });
                
                this.scrollToBottom();
            }
            
            // Update session ID display
            if (data.user_id) {
                const sessionIdEl = document.getElementById('sessionId');
                if (sessionIdEl) {
                    sessionIdEl.textContent = data.user_id.substring(0, 8) + '...';
                }
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }
    
    async clearHistory() {
        if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
            try {
                const response = await fetch('/api/history/clear', {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.showNotification('Success', 'Chat history cleared', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    this.showNotification('Error', 'Failed to clear history', 'error');
                }
            } catch (error) {
                console.error('Error clearing history:', error);
                this.showNotification('Error', 'Could not clear history', 'error');
            }
        }
    }
    
    // ===========================================
    // Settings
    // ===========================================
    
    loadSettings() {
        // Load TTS setting
        const ttsEnabled = localStorage.getItem('ttsEnabled') === 'true';
        document.getElementById('ttsToggle').checked = ttsEnabled;
        
        // Load dark mode
        const darkMode = localStorage.getItem('darkMode') !== 'false';
        document.getElementById('darkModeToggle').checked = darkMode;
        if (!darkMode) {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        
        // Load timestamps
        const showTimestamps = localStorage.getItem('showTimestamps') !== 'false';
        document.getElementById('timestampToggle').checked = showTimestamps;
    }
    
    toggleTTS() {
        const enabled = document.getElementById('ttsToggle').checked;
        localStorage.setItem('ttsEnabled', enabled);
        this.showNotification('Settings', `Voice output ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }
    
    toggleDarkMode() {
        const darkMode = document.getElementById('darkModeToggle').checked;
        localStorage.setItem('darkMode', darkMode);
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        this.showNotification('Settings', `${darkMode ? 'Dark' : 'Light'} mode activated`, 'info');
    }
    
    toggleTimestamps() {
        const showTimestamps = document.getElementById('timestampToggle').checked;
        localStorage.setItem('showTimestamps', showTimestamps);
        this.showNotification('Settings', `Timestamps ${showTimestamps ? 'shown' : 'hidden'}`, 'info');
        // Reload to apply changes
        setTimeout(() => location.reload(), 1000);
    }
    
    // ===========================================
    // Sidebar
    // ===========================================
    
    initSidebarTabs() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tab = btn.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tab + 'Tab').classList.add('active');
            });
        });
    }
    
    // ===========================================
    // Statistics
    // ===========================================
    
    updateStats() {
        const messages = document.querySelectorAll('.message');
        const userMessages = document.querySelectorAll('.message.user');
        const botMessages = document.querySelectorAll('.message.bot');
        
        document.getElementById('totalMessages').textContent = messages.length;
        document.getElementById('aiResponses').textContent = botMessages.length;
    }
    
    updateSessionTimer() {
        setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - this.sessionStartTime) / 1000);
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            document.getElementById('sessionTime').textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }
    
    // ===========================================
    // Notifications
    // ===========================================
    
    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
    
    // ===========================================
    // Utility Functions
    // ===========================================
    
    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    updateSendButton() {
        const text = this.messageInput.value.trim();
        this.sendBtn.disabled = !text;
        this.updateCharCount();
    }
    
    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCounter.textContent = `${count}/500`;
        this.charCounter.style.color = count > 450 ? 'var(--error)' : 'var(--text-muted)';
    }
    
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    getCurrentTime() {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    exportChat() {
        const messages = [];
        document.querySelectorAll('.message').forEach(msg => {
            const text = msg.querySelector('.message-text');
            if (text) {
                messages.push({
                    role: msg.classList.contains('user') ? 'User' : 'Assistant',
                    content: text.textContent,
                    time: msg.querySelector('.message-time')?.textContent || ''
                });
            }
        });
        
        const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showNotification('Success', 'Chat exported successfully', 'success');
    }
}

// ===========================================
// Global Functions
// ===========================================

let chatApp;

document.addEventListener('DOMContentLoaded', () => {
    chatApp = new ChatApp();
});

function sendMessage(message = null) {
    if (chatApp) chatApp.sendMessage(message);
}

function sendQuickMessage(message) {
    if (chatApp) chatApp.sendMessage(message);
}

function handleKeyPress(e) {
    if (chatApp) chatApp.handleKeyPress(e);
}

function toggleVoice() {
    if (chatApp) chatApp.toggleVoice();
}

function stopRecording() {
    if (chatApp) chatApp.stopRecording();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
    sidebar.classList.toggle('collapsed');
}

function startNewChat() {
    if (chatApp) chatApp.clearHistory();
}

function clearHistory() {
    if (chatApp) chatApp.clearHistory();
}

function toggleTTS() {
    if (chatApp) chatApp.toggleTTS();
}

function toggleDarkMode() {
    if (chatApp) chatApp.toggleDarkMode();
}

function toggleTimestamps() {
    if (chatApp) chatApp.toggleTimestamps();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function exportChat() {
    if (chatApp) chatApp.exportChat();
}

function attachFile() {
    // Future implementation
    chatApp.showNotification('Info', 'File attachment coming soon', 'info');
}

function autoResize(textarea) {
    if (chatApp) chatApp.autoResize(textarea);
}

function updateCharCount() {
    if (chatApp) chatApp.updateCharCount();
}