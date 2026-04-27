/* =====================================================
   app.js — Shared utilities, sidebar, theme, toasts
===================================================== */

// Set API_BASE dynamically based on the current hostname
// IMPORTANT: Replace the production URL below with your actual Render backend URL once deployed!
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocalhost ? 'http://localhost:3000/api' : 'https://gymfit-backend.up.railway.app/api';

// Authentication Check — Only protect admin pages
const currentPath = window.location.pathname;
const protectedPages = ['dashboard.html', 'members.html', 'trainers.html', 'plans.html'];
const isProtectedPage = protectedPages.some(page => currentPath.includes(page));
if (isProtectedPage && localStorage.getItem('loggedIn') !== 'true') {
  window.location.href = 'login.html';
}

// Dropdown Toggler
function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  const isShowing = dropdown.classList.contains('show');

  // Close all other dropdowns
  document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));

  // Toggle the selected one
  if (!isShowing) dropdown.classList.add('show');
}

// Close dropdowns if clicked outside
window.onclick = function (event) {
  if (!event.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
  }
}


/* ─── Theme Management ─────────────────────────────── */
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('gymfit-theme') || 'dark';
    this.apply(saved);
  },
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gymfit-theme', theme);
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.classList.toggle('active', theme === 'light');
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    this.apply(current === 'dark' ? 'light' : 'dark');
  }
};

/* ─── Toast Notifications ──────────────────────────── */
const Toast = {
  container: null,
  init() {
    if (!document.getElementById('toastContainer')) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toastContainer');
    }
  },
  show(message, type = 'success') {
    if (!this.container) this.init();
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
    `;
    this.container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};

/* ─── Sidebar ──────────────────────────────────────── */
const Sidebar = {
  el: null,
  mainContent: null,
  isCollapsed: false,
  isMobileOpen: false,

  init() {
    this.el = document.getElementById('sidebar');
    this.mainContent = document.getElementById('mainContent');
    if (!this.el) return;

    const saved = localStorage.getItem('gymfit-sidebar-collapsed') === 'true';
    if (saved && window.innerWidth > 768) this.collapse();

    this.setActiveLink();
    this.setupMobileOverlay();
  },

  collapse() {
    this.isCollapsed = true;
    this.el.classList.add('collapsed');
    this.mainContent?.classList.add('expanded');
    localStorage.setItem('gymfit-sidebar-collapsed', 'true');
    const icon = document.getElementById('sidebarToggleIcon');
    if (icon) icon.textContent = '→';
  },

  expand() {
    this.isCollapsed = false;
    this.el.classList.remove('collapsed');
    this.mainContent?.classList.remove('expanded');
    localStorage.setItem('gymfit-sidebar-collapsed', 'false');
    const icon = document.getElementById('sidebarToggleIcon');
    if (icon) icon.textContent = '←';
  },

  toggle() {
    if (window.innerWidth <= 768) {
      this.toggleMobile();
    } else {
      this.isCollapsed ? this.expand() : this.collapse();
    }
  },

  toggleMobile() {
    this.isMobileOpen = !this.isMobileOpen;
    this.el.classList.toggle('mobile-open', this.isMobileOpen);
    document.getElementById('mobileOverlay')?.classList.toggle('active', this.isMobileOpen);
  },

  setupMobileOverlay() {
    let overlay = document.getElementById('mobileOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'mobileOverlay';
      overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999;
        display:none;backdrop-filter:blur(4px);transition:opacity 0.3s;
      `;
      overlay.addEventListener('click', () => this.toggleMobile());
      document.body.appendChild(overlay);
    }
    // Make overlay actually toggle display
    const orig = overlay.classList.toggle.bind(overlay);
    overlay.classList.toggle = (cls, force) => {
      orig(cls, force);
      overlay.style.display = overlay.classList.contains('active') ? 'block' : 'none';
    };
  },

  setActiveLink() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href') || '';
      if (href.includes(page) || (page === '' && href.includes('index.html'))) {
        item.classList.add('active');
      }
    });
  }
};

/* ─── Modal ────────────────────────────────────────── */
const Modal = {
  open(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('active');
  },
  close(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('active');
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }
};

// Close modals on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) Modal.closeAll();
});

/* ─── API Helper ───────────────────────────────────── */
const API = {
  async request(method, endpoint, body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Request failed');
    return data;
  },
  get: (ep, query = '') => API.request('GET', ep + query),
  post: (ep, body) => API.request('POST', ep, body),
  put: (ep, body) => API.request('PUT', ep, body),
  delete: (ep) => API.request('DELETE', ep)
};

/* ─── Format Helpers ───────────────────────────────── */
const Format = {
  date(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  currency(n) {
    return `$${parseFloat(n).toFixed(2)}`;
  },
  daysUntil(dateStr) {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
  initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  },
  planBadgeClass(plan) {
    const map = { Basic: 'badge-info', Premium: 'badge-success', Elite: 'badge-warning', 'Annual Basic': 'badge-purple' };
    return map[plan] || 'badge-muted';
  },
  statusBadgeClass(status) {
    const map = { Active: 'badge-success', Expired: 'badge-danger', Inactive: 'badge-muted', 'On Leave': 'badge-warning' };
    return map[status] || 'badge-muted';
  },
  paymentBadgeClass(status) {
    return status === 'Paid' ? 'badge-success' : 'badge-danger';
  }
};

/* ─── Counter Animation ────────────────────────────── */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const from = 0;
  const step = (timestamp) => {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ─── Confirm Dialog ───────────────────────────────── */
function showConfirm(title, message, onConfirm) {
  const existingModal = document.getElementById('confirmModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'confirmModal';
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal" style="max-width:400px;">
      <div class="modal-body">
        <div class="confirm-dialog">
          <div class="confirm-icon">🗑️</div>
          <h3>${title}</h3>
          <p>${message}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="document.getElementById('confirmModal').remove()">Cancel</button>
        <button class="btn btn-danger" id="confirmBtn">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('confirmBtn').addEventListener('click', () => {
    modal.remove();
    onConfirm();
  });
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/* ─── Init ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Toast.init();
  Sidebar.init();
});
