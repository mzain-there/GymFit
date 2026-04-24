/* =====================================================
   members.js — Full CRUD for Member Management Page
===================================================== */

let allMembers = [];
let editingMemberId = null;
let currentPage = 1;
const PAGE_SIZE = 8;

/* ─── Load Members ─────────────────────────────────── */
async function loadMembers() {
  const search    = document.getElementById('searchInput')?.value || '';
  const status    = document.getElementById('statusFilter')?.value || '';
  const plan      = document.getElementById('planFilter')?.value || '';
  const payment   = document.getElementById('paymentFilter')?.value || '';

  let query = '?';
  if (search)  query += `search=${encodeURIComponent(search)}&`;
  if (status)  query += `status=${status}&`;
  if (plan)    query += `plan=${encodeURIComponent(plan)}&`;
  if (payment) query += `paymentStatus=${payment}&`;

  showTableLoading();

  try {
    const res = await API.get('/members', query);
    allMembers = res.data;
    renderTable(allMembers);
    updateMemberCount(res.count);
  } catch (err) {
    Toast.error('Failed to load members: ' + err.message);
    showTableEmpty('Failed to load members. Is the server running?');
  }
}

/* ─── Render Table ─────────────────────────────────── */
function renderTable(members) {
  const tbody = document.getElementById('membersTableBody');
  if (!tbody) return;

  // Pagination
  const total = members.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  currentPage = Math.min(currentPage, totalPages || 1);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = members.slice(start, start + PAGE_SIZE);

  if (paginated.length === 0) {
    showTableEmpty('No members found. Add your first member!');
    renderPagination(0, 0);
    return;
  }

  tbody.innerHTML = paginated.map((m, i) => {
    const days = Format.daysUntil(m.expiryDate);
    const expiryWarning = (days >= 0 && days <= 30) ? `<span title="Expires in ${days} days">⚠️</span>` : '';

    return `
    <tr class="animate-in" style="animation-delay:${i * 0.04}s">
      <td data-label="Member">
        <div class="member-info">
          <div class="table-avatar">${Format.initials(m.name)}</div>
          <div>
            <div class="member-name">${escapeHtml(m.name)}</div>
            <div class="member-email">${escapeHtml(m.email)}</div>
          </div>
        </div>
      </td>
      <td data-label="Phone">${escapeHtml(m.phone)}</td>
      <td data-label="Plan"><span class="badge ${Format.planBadgeClass(m.membershipPlan)}">${m.membershipPlan}</span></td>
      <td data-label="Status">
        <span class="badge ${Format.statusBadgeClass(m.status)}">${m.status}</span>
      </td>
      <td data-label="Payment"><span class="badge ${Format.paymentBadgeClass(m.paymentStatus)}">${m.paymentStatus}</span></td>
      <td data-label="Expiry Date">
        ${Format.date(m.expiryDate)} ${expiryWarning}
      </td>
      <td data-label="Actions">
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="viewMember('${m.id}')" title="View">👁️</button>
          <button class="btn btn-sm btn-outline btn-icon" onclick="openEditModal('${m.id}')" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="deleteMember('${m.id}', '${escapeHtml(m.name)}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  renderPagination(totalPages, currentPage);
}

/* ─── Pagination ───────────────────────────────────── */
function renderPagination(totalPages, page) {
  const el = document.getElementById('pagination');
  if (!el) return;
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goToPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goToPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>›</button>`;
  el.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderTable(allMembers);
}

/* ─── Loading / Empty States ───────────────────────── */
function showTableLoading() {
  const tbody = document.getElementById('membersTableBody');
  if (!tbody) return;
  tbody.innerHTML = Array.from({length: 5}).map(() => `
    <tr>
      ${Array.from({length: 7}).map(() => `<td><div class="skeleton" style="height:20px;border-radius:4px;"></div></td>`).join('')}
    </tr>
  `).join('');
}

function showTableEmpty(msg = 'No members found.') {
  const tbody = document.getElementById('membersTableBody');
  if (!tbody) return;
  tbody.innerHTML = `
    <tr>
      <td colspan="7">
        <div class="empty-state">
          <div class="empty-icon">🏋️</div>
          <h3>${msg}</h3>
          <p>Try adjusting your filters or add a new member.</p>
        </div>
      </td>
    </tr>`;
}

function updateMemberCount(count) {
  const el = document.getElementById('memberCount');
  if (el) el.textContent = `${count} member${count !== 1 ? 's' : ''}`;
}

/* ─── View Member ──────────────────────────────────── */
function viewMember(id) {
  const m = allMembers.find(m => m.id === id);
  if (!m) return;

  const days = Format.daysUntil(m.expiryDate);
  const expiryClass = days < 0 ? 'text-danger' : days <= 30 ? '' : '';
  const expiryText = days < 0 ? `Expired ${Math.abs(days)} days ago` : days <= 30 ? `Expires in ${days} days ⚠️` : Format.date(m.expiryDate);

  document.getElementById('viewModalContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;">
      <div class="table-avatar" style="width:56px;height:56px;font-size:22px;">${Format.initials(m.name)}</div>
      <div>
        <h2 style="font-size:22px;font-weight:800;">${escapeHtml(m.name)}</h2>
        <p style="color:var(--text-secondary);font-size:14px;">${m.id}</p>
      </div>
      <span class="badge ${Format.statusBadgeClass(m.status)}" style="margin-left:auto;">${m.status}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      ${viewField('📧 Email', m.email)}
      ${viewField('📞 Phone', m.phone)}
      ${viewField('🎂 Age', m.age ? m.age + ' years' : '—')}
      ${viewField('⚧ Gender', m.gender || '—')}
      ${viewField('💳 Plan', `<span class="badge ${Format.planBadgeClass(m.membershipPlan)}">${m.membershipPlan}</span>`)}
      ${viewField('💰 Payment', `<span class="badge ${Format.paymentBadgeClass(m.paymentStatus)}">${m.paymentStatus}</span>`)}
      ${viewField('📅 Joined', Format.date(m.joinDate))}
      ${viewField('⏰ Expires', `<span class="${expiryClass}">${expiryText}</span>`)}
      <div style="grid-column:1/-1;">${viewField('🏠 Address', m.address || '—')}</div>
    </div>
  `;
  Modal.open('viewMemberModal');
}

function viewField(label, value) {
  return `
    <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);padding:14px;">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${label}</div>
      <div style="font-size:14px;font-weight:600;">${value}</div>
    </div>`;
}

/* ─── Add Member Modal ─────────────────────────────── */
function openAddModal() {
  editingMemberId = null;
  document.getElementById('memberForm').reset();
  document.getElementById('memberId').value = '';
  document.getElementById('memberModalTitle').textContent = '➕ Add New Member';
  document.getElementById('submitMemberBtn').textContent = 'Add Member';

  // Set default join date to today
  document.getElementById('joinDate').value = new Date().toISOString().split('T')[0];
  Modal.open('memberModal');
}

/* ─── Edit Member Modal ────────────────────────────── */
function openEditModal(id) {
  const m = allMembers.find(m => m.id === id);
  if (!m) return;

  editingMemberId = id;
  document.getElementById('memberModalTitle').textContent = '✏️ Edit Member';
  document.getElementById('submitMemberBtn').textContent = 'Save Changes';
  document.getElementById('memberId').value = m.id;
  document.getElementById('memberName').value = m.name;
  document.getElementById('memberEmail').value = m.email;
  document.getElementById('memberPhone').value = m.phone;
  document.getElementById('memberAge').value = m.age || '';
  document.getElementById('memberGender').value = m.gender || '';
  document.getElementById('memberPlan').value = m.membershipPlan;
  document.getElementById('joinDate').value = m.joinDate || '';
  document.getElementById('expiryDate').value = m.expiryDate || '';
  document.getElementById('memberStatus').value = m.status;
  document.getElementById('paymentStatus').value = m.paymentStatus;
  document.getElementById('memberAddress').value = m.address || '';

  Modal.open('memberModal');
}

/* ─── Form Submit ──────────────────────────────────── */
async function submitMemberForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submitMemberBtn');
  const originalText = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span> Saving...';
  btn.disabled = true;

  const payload = {
    name:           document.getElementById('memberName').value.trim(),
    email:          document.getElementById('memberEmail').value.trim(),
    phone:          document.getElementById('memberPhone').value.trim(),
    age:            document.getElementById('memberAge').value,
    gender:         document.getElementById('memberGender').value,
    membershipPlan: document.getElementById('memberPlan').value,
    joinDate:       document.getElementById('joinDate').value,
    expiryDate:     document.getElementById('expiryDate').value,
    status:         document.getElementById('memberStatus').value,
    paymentStatus:  document.getElementById('paymentStatus').value,
    address:        document.getElementById('memberAddress').value.trim()
  };

  try {
    if (editingMemberId) {
      await API.put(`/members/${editingMemberId}`, payload);
      Toast.success('Member updated successfully!');
    } else {
      await API.post('/members', payload);
      Toast.success('New member added successfully!');
    }
    Modal.close('memberModal');
    await loadMembers();
  } catch (err) {
    Toast.error(err.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

/* ─── Delete Member ────────────────────────────────── */
function deleteMember(id, name) {
  showConfirm(
    'Delete Member',
    `Are you sure you want to delete <strong>${escapeHtml(name)}</strong>? This action cannot be undone.`,
    async () => {
      try {
        await API.delete(`/members/${id}`);
        Toast.success(`Member "${name}" deleted.`);
        await loadMembers();
      } catch (err) {
        Toast.error('Delete failed: ' + err.message);
      }
    }
  );
}

/* ─── Export CSV ───────────────────────────────────── */
function exportCSV() {
  if (!allMembers.length) { Toast.warning('No members to export.'); return; }
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'Plan', 'Status', 'Payment', 'Join Date', 'Expiry Date', 'Address'];
  const rows = allMembers.map(m => [
    m.id, m.name, m.email, m.phone, m.age || '', m.gender || '',
    m.membershipPlan, m.status, m.paymentStatus,
    m.joinDate, m.expiryDate, m.address || ''
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `gymfit-members-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
  Toast.success('Members exported as CSV!');
}

/* ─── XSS Helper ───────────────────────────────────── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ─── Search Debounce ──────────────────────────────── */
function debounce(fn, delay = 350) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

/* ─── Init ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadMembers();

  // Filter listeners
  const debouncedLoad = debounce(loadMembers);
  document.getElementById('searchInput')?.addEventListener('input', debouncedLoad);
  document.getElementById('statusFilter')?.addEventListener('change', () => { currentPage = 1; loadMembers(); });
  document.getElementById('planFilter')?.addEventListener('change', () => { currentPage = 1; loadMembers(); });
  document.getElementById('paymentFilter')?.addEventListener('change', () => { currentPage = 1; loadMembers(); });

  // Form submission
  document.getElementById('memberForm')?.addEventListener('submit', submitMemberForm);
});
