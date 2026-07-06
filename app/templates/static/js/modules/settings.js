export class SettingsModule {
    load() {
        document.getElementById('ttsToggle').checked = localStorage.getItem('ttsEnabled') === 'true';
        document.getElementById('timestampToggle').checked = localStorage.getItem('showTimestamps') !== 'false';
        
        const darkMode = localStorage.getItem('darkMode') !== 'false';
        document.getElementById('darkModeToggle').checked = darkMode;
        if (!darkMode) {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
    
    toggle(key, value) {
        localStorage.setItem(key, value);
    }
    
    toggleTTS() {
        const enabled = document.getElementById('ttsToggle').checked;
        this.toggle('ttsEnabled', enabled);
        return enabled;
    }
    
    toggleDarkMode() {
        const darkMode = document.getElementById('darkModeToggle').checked;
        this.toggle('darkMode', darkMode);
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        return darkMode;
    }
    
    toggleTimestamps() {
        const show = document.getElementById('timestampToggle').checked;
        this.toggle('showTimestamps', show);
        return show;
    }
}