/**
 * Petopia Unified Auth Sync
 * Ensures navigation and user state are consistent across all pages.
 */

window.PetopiaAuth = {
    version: "2.2.0",

    // Sync UI based on current auth state
    sync: async function () {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole') || 'client';

        console.log(`[PetopiaAuth] Syncing... Token: ${token ? 'Present' : 'Missing'}, Role: ${role}`);

        const authLinks = document.querySelector('.auth-links');
        const authMobile = document.getElementById('auth-mobile');

        if (token) {
            // Logged In state
            const profileLinks = `
                <a href="/profile.html">Profile</a>
                ${role === 'admin' ? ` <span style="color: var(--primary);">|</span> <a href="/admin.html">Admin Panel</a>` : ''}
                <span style="color: var(--primary);">|</span> <a href="#" onclick="PetopiaAuth.logout()">Logout</a>
            `;

            if (authLinks) {
                authLinks.innerHTML = profileLinks;
                authLinks.classList.add('is-authenticated');
            }

            if (authMobile) {
                authMobile.innerHTML = profileLinks.replace(/\|/g, '<span style="color:#444">|</span>');
                authMobile.classList.add('is-authenticated');
            }

            // Fetch latest profile to sync role (silent update)
            this.updateProfile(token);
        } else {
            // Logged Out state
            const loginLinks = `<a href="/login.html">Login</a> <span style="color: var(--primary);">|</span> <a href="/register.html">Register</a>`;

            if (authLinks && !authLinks.classList.contains('no-auto-sync')) {
                authLinks.innerHTML = loginLinks;
                authLinks.classList.remove('is-authenticated');
            }

            if (authMobile) {
                authMobile.style.display = 'none';
                authMobile.classList.remove('is-authenticated');
            }
        }
    },

    // Fetch latest role and update localStorage
    updateProfile: async function (token) {
        try {
            const apiUrl = (window.API_BASE_URL || '') + '/api/profile';
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const user = await response.json();
                const oldRole = localStorage.getItem('userRole');

                // Update storage
                localStorage.setItem('userName', user.name);
                localStorage.setItem('userRole', user.role || 'client');

                // If role changed, re-sync UI
                if (user.role !== oldRole) {
                    console.log(`[PetopiaAuth] Role changed from ${oldRole} to ${user.role}. Re-syncing...`);
                    this.sync();
                }
            } else if (response.status === 401) {
                console.warn('[PetopiaAuth] Token expired or invalid. Logging out.');
                this.logout();
            }
        } catch (error) {
            console.error('[PetopiaAuth] Profile sync error:', error);
        }
    },

    logout: function () {
        console.log('[PetopiaAuth] Logging out...');
        localStorage.clear();
        window.location.href = '/index.html';
    },

    toggleMenu: function () {
        const navLinks = document.getElementById('navLinks');
        if (navLinks) {
            navLinks.classList.toggle('active');
        }
    }
};

// Global handlers (for onclick compatibility)
window.handleLogout = PetopiaAuth.logout;
window.toggleMenu = PetopiaAuth.toggleMenu;

// Auto-run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PetopiaAuth.sync());
} else {
    PetopiaAuth.sync();
}
