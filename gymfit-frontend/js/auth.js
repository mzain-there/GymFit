/* =====================================================
   auth.js — Multi-account authentication system
   Stores accounts in localStorage with profile settings
===================================================== */

const Auth = {
  STORAGE_KEY: 'gymfit-accounts',
  ACTIVE_KEY: 'gymfit-active-account',

  /* ─── Data Access ─────────────────────────────── */
  getAccounts() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch { return []; }
  },

  saveAccounts(accounts) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
  },

  getActiveAccount() {
    const id = localStorage.getItem(this.ACTIVE_KEY);
    if (!id) return null;
    return this.getAccounts().find(a => a.id === id) || null;
  },

  setActiveAccount(id) {
    localStorage.setItem(this.ACTIVE_KEY, id);
    localStorage.setItem('loggedIn', 'true');
  },

  /* ─── Account Actions ─────────────────────────── */
  createAccount(email, username) {
    const accounts = this.getAccounts();
    
    // Check if email already exists
    const existing = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please sign in instead.' };
    }

    const account = {
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      email: email.trim(),
      username: username.trim(),
      avatar: null, // null means use initials
      avatarColor: this.generateAvatarColor(),
      createdAt: new Date().toISOString()
    };

    accounts.push(account);
    this.saveAccounts(accounts);
    this.setActiveAccount(account.id);
    return { success: true, account };
  },

  signIn(email) {
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      return { success: false, message: 'No account found with this email. Please sign up first.' };
    }
    this.setActiveAccount(account.id);
    return { success: true, account };
  },

  updateProfile(updates) {
    const accounts = this.getAccounts();
    const activeId = localStorage.getItem(this.ACTIVE_KEY);
    const idx = accounts.findIndex(a => a.id === activeId);
    if (idx === -1) return false;

    if (updates.username !== undefined) accounts[idx].username = updates.username.trim();
    if (updates.avatar !== undefined) accounts[idx].avatar = updates.avatar;
    if (updates.avatarColor !== undefined) accounts[idx].avatarColor = updates.avatarColor;

    this.saveAccounts(accounts);
    return true;
  },

  deleteAccount(id) {
    let accounts = this.getAccounts();
    accounts = accounts.filter(a => a.id !== id);
    this.saveAccounts(accounts);
    
    const activeId = localStorage.getItem(this.ACTIVE_KEY);
    if (activeId === id) {
      localStorage.removeItem(this.ACTIVE_KEY);
      localStorage.removeItem('loggedIn');
    }
    return accounts.length;
  },

  logout() {
    localStorage.removeItem(this.ACTIVE_KEY);
    localStorage.removeItem('loggedIn');
  },

  switchAccount(id) {
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.id === id);
    if (!account) return false;
    this.setActiveAccount(account.id);
    return true;
  },

  /* ─── Helpers ──────────────────────────────────── */
  generateAvatarColor() {
    const colors = [
      '#00e599', '#6366f1', '#f59e0b', '#ec4899', '#a855f7',
      '#14b8a6', '#ef4444', '#3b82f6', '#8b5cf6', '#f97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  },

  getAvatarHTML(account, size = 36) {
    if (!account) return `<div class="topbar-avatar" style="width:${size}px;height:${size}px;">?</div>`;
    
    if (account.avatar) {
      return `<img src="${account.avatar}" alt="Avatar" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:2px solid var(--primary);cursor:pointer;">`;
    }
    
    const initials = this.getInitials(account.username);
    return `<div class="topbar-avatar" style="width:${size}px;height:${size}px;background:${account.avatarColor};font-size:${Math.round(size * 0.4)}px;">${initials}</div>`;
  },

  /* ─── Profile Dropdown (Injected into all admin pages) ── */
  renderProfileDropdown() {
    const account = this.getActiveAccount();
    const accounts = this.getAccounts();
    const otherAccounts = accounts.filter(a => a.id !== account?.id);

    const profileDropdownEl = document.getElementById('profileDropdown');
    const avatarTrigger = document.getElementById('profileAvatarTrigger');
    
    if (!profileDropdownEl || !avatarTrigger) return;

    // Update avatar trigger
    avatarTrigger.innerHTML = this.getAvatarHTML(account, 36);

    // Build dropdown content
    let dropdownHTML = '';

    if (account) {
      dropdownHTML += `
        <div class="dropdown-header" style="display:flex;align-items:center;gap:10px;padding:12px 16px;">
          ${this.getAvatarHTML(account, 40)}
          <div>
            <div style="font-weight:700;color:var(--text-primary);font-size:14px;">${this.escapeHtml(account.username)}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${this.escapeHtml(account.email)}</div>
          </div>
        </div>
        <a href="#" id="profileSettingsBtn" onclick="Auth.openProfileModal(); return false;">
          <span style="margin-right:6px;">⚙️</span> Profile Settings
        </a>`;
    }

    // Other accounts (switch)
    if (otherAccounts.length > 0) {
      dropdownHTML += `<div class="dropdown-divider"></div>`;
      dropdownHTML += `<div style="padding:6px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);font-weight:700;">Switch Account</div>`;
      otherAccounts.forEach(acc => {
        dropdownHTML += `
          <a href="#" onclick="Auth.switchAccount('${acc.id}'); location.reload(); return false;" style="display:flex;align-items:center;gap:8px;">
            ${this.getAvatarHTML(acc, 24)}
            <span style="font-size:13px;">${this.escapeHtml(acc.username)}</span>
          </a>`;
      });
    }

    dropdownHTML += `<div class="dropdown-divider"></div>`;
    dropdownHTML += `<a href="#" onclick="Auth.openAddAccountModal(); return false;"><span style="margin-right:6px;">➕</span> Add New Account</a>`;
    
    if (account) {
      dropdownHTML += `<a href="#" onclick="Auth.confirmDeleteAccount(); return false;" style="color:var(--danger);"><span style="margin-right:6px;">🗑️</span> Delete Account</a>`;
      dropdownHTML += `<div class="dropdown-divider"></div>`;
      dropdownHTML += `<a href="#" onclick="Auth.performLogout(); return false;"><span style="margin-right:6px;">🚪</span> Logout</a>`;
    }

    profileDropdownEl.innerHTML = dropdownHTML;
  },

  /* ─── Profile Settings Modal ───────────────────── */
  openProfileModal() {
    // Close dropdowns
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    
    const account = this.getActiveAccount();
    if (!account) return;

    // Remove existing modal if any
    const existing = document.getElementById('profileSettingsModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'profileSettingsModal';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal" style="max-width:480px;">
        <div class="modal-header">
          <span class="modal-title">⚙️ Profile Settings</span>
          <button class="modal-close" onclick="document.getElementById('profileSettingsModal').remove()">✕</button>
        </div>
        <div class="modal-body">
          <div style="text-align:center;margin-bottom:28px;">
            <div id="profileAvatarPreview" style="position:relative;display:inline-block;cursor:pointer;" onclick="document.getElementById('avatarFileInput').click()">
              ${this.getAvatarHTML(account, 90)}
              <div style="position:absolute;bottom:0;right:0;width:28px;height:28px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid var(--bg-card);box-shadow:0 2px 8px rgba(0,0,0,0.3);">📷</div>
            </div>
            <input type="file" id="avatarFileInput" accept="image/*" style="display:none;" onchange="Auth.handleAvatarUpload(event)">
            <p style="font-size:12px;color:var(--text-muted);margin-top:8px;">Click avatar to change photo</p>
            ${account.avatar ? `<button class="btn btn-sm btn-secondary" style="margin-top:6px;font-size:11px;" onclick="Auth.removeAvatar()">Remove Photo</button>` : ''}
          </div>

          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label">Username</label>
            <input type="text" id="profileUsername" class="form-control" value="${this.escapeHtml(account.username)}" placeholder="Your display name" style="width:100%;" />
          </div>

          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" value="${this.escapeHtml(account.email)}" disabled style="width:100%;opacity:0.6;cursor:not-allowed;" />
            <small style="font-size:11px;color:var(--text-muted);">Email cannot be changed</small>
          </div>

          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label">Avatar Color</label>
            <div id="colorPickerGrid" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
              ${['#00e599','#6366f1','#f59e0b','#ec4899','#a855f7','#14b8a6','#ef4444','#3b82f6','#8b5cf6','#f97316'].map(c => `
                <div onclick="Auth.selectAvatarColor('${c}')" 
                  style="width:32px;height:32px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${c === account.avatarColor ? 'var(--text-primary)' : 'transparent'};transition:all 0.2s;box-shadow:${c === account.avatarColor ? '0 0 12px ' + c + '66' : 'none'};"
                  class="color-option" data-color="${c}"></div>
              `).join('')}
            </div>
          </div>

          <div style="padding:16px;background:var(--bg-input);border-radius:var(--radius);border:1px solid var(--border);margin-top:8px;">
            <div style="font-size:12px;color:var(--text-muted);">Account created</div>
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-top:2px;">${new Date(account.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('profileSettingsModal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="Auth.saveProfileSettings()">💾 Save Changes</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  },

  selectAvatarColor(color) {
    document.querySelectorAll('#colorPickerGrid .color-option').forEach(el => {
      const c = el.getAttribute('data-color');
      el.style.border = c === color ? '3px solid var(--text-primary)' : '3px solid transparent';
      el.style.boxShadow = c === color ? `0 0 12px ${c}66` : 'none';
    });
    // Store temporarily
    this._selectedColor = color;
    
    // Update preview avatar if using initials
    const account = this.getActiveAccount();
    if (account && !account.avatar) {
      const preview = document.getElementById('profileAvatarPreview');
      if (preview) {
        const tempAccount = { ...account, avatarColor: color };
        const avatarEl = preview.querySelector('.topbar-avatar');
        if (avatarEl) avatarEl.style.background = color;
      }
    }
  },

  handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Toast.error('Image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this._pendingAvatar = dataUrl;
      
      // Update preview
      const preview = document.getElementById('profileAvatarPreview');
      if (preview) {
        const img = preview.querySelector('img') || document.createElement('img');
        img.src = dataUrl;
        img.alt = 'Avatar';
        img.style.cssText = 'width:90px;height:90px;border-radius:50%;object-fit:cover;border:2px solid var(--primary);';
        
        const existing = preview.querySelector('.topbar-avatar');
        if (existing) existing.replaceWith(img);
      }
      Toast.info('Photo selected. Click Save to apply.');
    };
    reader.readAsDataURL(file);
  },

  removeAvatar() {
    this._pendingAvatar = 'REMOVE';
    const preview = document.getElementById('profileAvatarPreview');
    const account = this.getActiveAccount();
    if (preview && account) {
      const tempAccount = { ...account, avatar: null };
      const existingImg = preview.querySelector('img');
      if (existingImg) {
        const div = document.createElement('div');
        div.className = 'topbar-avatar';
        div.style.cssText = `width:90px;height:90px;background:${account.avatarColor};font-size:36px;`;
        div.textContent = this.getInitials(account.username);
        existingImg.replaceWith(div);
      }
    }
    Toast.info('Photo removed. Click Save to apply.');
  },

  saveProfileSettings() {
    const username = document.getElementById('profileUsername')?.value?.trim();
    if (!username) {
      Toast.error('Username cannot be empty');
      return;
    }

    const updates = { username };
    
    if (this._selectedColor) updates.avatarColor = this._selectedColor;
    if (this._pendingAvatar === 'REMOVE') {
      updates.avatar = null;
    } else if (this._pendingAvatar) {
      updates.avatar = this._pendingAvatar;
    }

    this.updateProfile(updates);
    this._selectedColor = null;
    this._pendingAvatar = null;

    document.getElementById('profileSettingsModal')?.remove();
    Toast.success('Profile updated successfully!');
    
    // Refresh the topbar
    this.renderProfileDropdown();
    this.updateWelcomeMessage();
  },

  updateWelcomeMessage() {
    const account = this.getActiveAccount();
    const welcomeEl = document.querySelector('.page-header-left p');
    if (welcomeEl && account && window.location.pathname.includes('dashboard')) {
      welcomeEl.textContent = `Welcome back, ${account.username}! Here's what's happening at your gym.`;
    }
  },

  /* ─── Add Account Modal ────────────────────────── */
  openAddAccountModal() {
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    
    const existing = document.getElementById('addAccountModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'addAccountModal';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal" style="max-width:440px;">
        <div class="modal-header">
          <span class="modal-title">➕ Add New Account</span>
          <button class="modal-close" onclick="document.getElementById('addAccountModal').remove()">✕</button>
        </div>
        <div class="modal-body">
          <p style="color:var(--text-muted);font-size:13px;margin-bottom:20px;">Create a new admin account. You can switch between accounts from the profile menu.</p>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Gmail / Email *</label>
            <input type="email" id="newAccountEmail" class="form-control" placeholder="admin@gmail.com" required style="width:100%;" />
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Username *</label>
            <input type="text" id="newAccountUsername" class="form-control" placeholder="Your display name" required style="width:100%;" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('addAccountModal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="Auth.handleAddAccount()">Create Account</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    modal.querySelector('#newAccountEmail').focus();
  },

  handleAddAccount() {
    const email = document.getElementById('newAccountEmail')?.value?.trim();
    const username = document.getElementById('newAccountUsername')?.value?.trim();

    if (!email || !username) {
      Toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Toast.error('Please enter a valid email address');
      return;
    }

    const result = this.createAccount(email, username);
    if (result.success) {
      document.getElementById('addAccountModal')?.remove();
      Toast.success(`Account "${username}" created! Switching to it now...`);
      setTimeout(() => location.reload(), 800);
    } else {
      Toast.error(result.message);
    }
  },

  /* ─── Delete Account ───────────────────────────── */
  confirmDeleteAccount() {
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    
    const account = this.getActiveAccount();
    if (!account) return;

    const existing = document.getElementById('deleteAccountModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'deleteAccountModal';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal" style="max-width:420px;">
        <div class="modal-body" style="text-align:center;padding:36px 32px;">
          <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
          <h3 style="margin-bottom:8px;color:var(--danger);">Delete Account?</h3>
          <p style="color:var(--text-muted);font-size:13px;margin-bottom:6px;">This will permanently delete the account:</p>
          <p style="font-weight:700;font-size:15px;color:var(--text-primary);margin-bottom:4px;">${this.escapeHtml(account.username)}</p>
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:24px;">${this.escapeHtml(account.email)}</p>
          <p style="font-size:12px;color:var(--danger);font-weight:600;">This action cannot be undone!</p>
        </div>
        <div class="modal-footer" style="justify-content:center;gap:12px;">
          <button class="btn btn-secondary" onclick="document.getElementById('deleteAccountModal').remove()">Cancel</button>
          <button class="btn btn-danger" onclick="Auth.performDeleteAccount('${account.id}')">🗑️ Delete Forever</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  },

  performDeleteAccount(id) {
    const remaining = this.deleteAccount(id);
    document.getElementById('deleteAccountModal')?.remove();
    Toast.success('Account deleted permanently.');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
  },

  /* ─── Logout ───────────────────────────────────── */
  performLogout() {
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    this.logout();
    
    // Animate out
    document.body.style.opacity = '0.5';
    document.body.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 300);
  },

  escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
