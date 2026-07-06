export class SidebarModule {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
    }
    
    toggle() {
        this.sidebar?.classList.toggle('open');
        this.sidebar?.classList.toggle('collapsed');
    }
    
    initTabs() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tab = btn.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(tab + 'Tab')?.classList.add('active');
            });
        });
    }
}