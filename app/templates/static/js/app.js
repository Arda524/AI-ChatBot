import { ChatApp } from './core/ChatApp.js';

// Initialize app when DOM is ready
let chatApp;

document.addEventListener('DOMContentLoaded', () => {
    chatApp = new ChatApp();
});

window.sendMessage = (message) => chatApp?.sendMessage(message);
window.sendQuickMessage = (message) => chatApp?.sendMessage(message);
window.handleKeyPress = (e) => chatApp?.handleKeyPress(e);
window.toggleVoice = () => chatApp?.toggleVoice();
window.stopRecording = () => chatApp?.stopRecording();
window.toggleSidebar = () => chatApp?.toggleSidebar();
window.startNewChat = () => chatApp?.clearHistory();
window.clearHistory = () => chatApp?.clearHistory();
window.toggleTTS = () => chatApp?.toggleTTS();
window.toggleDarkMode = () => chatApp?.toggleDarkMode();
window.toggleTimestamps = () => chatApp?.toggleTimestamps();
window.toggleFullscreen = () => {
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
};
window.exportChat = () => chatApp?.exportChat();
window.attachFile = () => chatApp?.notifications.show('Info', 'File attachment coming soon', 'info');
window.autoResize = (textarea) => chatApp?.autoResize(textarea);
window.updateCharCount = () => chatApp?.updateCharCount();