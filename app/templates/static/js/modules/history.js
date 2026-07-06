export class HistoryModule {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    
    async loadHistory() {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            if (data.user_id) {
                const el = document.getElementById('sessionId');
                if (el) el.textContent = data.user_id.substring(0, 8) + '...';
            }
            return data.history || [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }
    
    async clearHistory() {
        if (!confirm('Are you sure you want to clear all chat history?')) return false;
        
        try {
            const response = await fetch('/api/history/clear', { method: 'DELETE' });
            return response.ok;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
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
    }
}