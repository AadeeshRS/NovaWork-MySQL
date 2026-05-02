
(function () {
    function createToastContainer() {
        const existing = document.getElementById('nw-toast-container');
        if (existing) return existing;

        const container = document.createElement('div');
        container.id = 'nw-toast-container';
        container.style.cssText = `
            position: fixed;
            top: 1.25rem;
            right: 1.25rem;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.625rem;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    const COLORS = {
        success: { bg: '#10b981', icon: '✅' },
        error:   { bg: '#ef4444', icon: '❌' },
        info:    { bg: '#3b82f6', icon: 'ℹ️'  },
        warning: { bg: '#f59e0b', icon: '⚠️'  }
    };

    /**
     * Show a toast notification.
     * @param {string} message
     * @param {'success'|'error'|'info'|'warning'} [type='info']
     * @param {number} [duration=3500] ms
     */
    window.showToast = function (message, type = 'info', duration = 3500) {
        const container = createToastContainer();
        const { bg, icon } = COLORS[type] || COLORS.info;

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${bg};
            color: white;
            padding: 0.875rem 1.25rem;
            border-radius: 10px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            font-size: 0.9375rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.625rem;
            min-width: 220px;
            max-width: 380px;
            pointer-events: all;
            opacity: 0;
            transform: translateX(40px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        `;
        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            });
        });

        // Auto-remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            setTimeout(() => toast.remove(), 320);
        }, duration);
    };
})();

(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        document.querySelectorAll('.nav-links a, .admin-nav a, .employee-nav a').forEach(link => {
            try {
                const href = new URL(link.href).pathname;
                if (href !== '/' && path.startsWith(href)) {
                    link.classList.add('active');
                }
            } catch (_) {}
        });
    });
})();
