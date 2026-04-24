const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/members.json');

// Helper: Read members from file
function readMembers() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Write members to file
function writeMembers(members) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2));
}

// Helper: Auto-update member status based on expiry
function updateMemberStatus(member) {
  const today = new Date();
  const expiry = new Date(member.expiryDate);
  if (expiry < today && member.status !== 'Inactive') {
    member.status = 'Expired';
  }
  return member;
}

// GET /api/members — Get all members (with search/filter)
router.get('/', (req, res) => {
  try {
    let members = readMembers().map(updateMemberStatus);
    const { search, status, plan, paymentStatus } = req.query;

    if (search) {
      const s = search.toLowerCase();
      members = members.filter(m =>
        m.name.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        m.phone.includes(s)
      );
    }
    if (status) members = members.filter(m => m.status === status);
    if (plan) members = members.filter(m => m.membershipPlan === plan);
    if (paymentStatus) members = members.filter(m => m.paymentStatus === paymentStatus);

    res.json({ success: true, count: members.length, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/members/stats — Get dashboard statistics
router.get('/stats', (req, res) => {
  try {
    const members = readMembers().map(updateMemberStatus);
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);

    // Get all plans to ensure breakdown includes all tiers
    const plansFile = path.join(__dirname, '../data/plans.json');
    let allPlans = [];
    try {
      allPlans = JSON.parse(fs.readFileSync(plansFile, 'utf8'));
    } catch (e) {}

    const planBreakdown = {};
    allPlans.forEach(p => planBreakdown[p.name] = 0);
    members.forEach(m => {
      if (m.membershipPlan && planBreakdown.hasOwnProperty(m.membershipPlan)) {
        planBreakdown[m.membershipPlan]++;
      } else if (m.membershipPlan) {
        planBreakdown[m.membershipPlan] = (planBreakdown[m.membershipPlan] || 0) + 1;
      }
    });

    const stats = {
      total: members.length,
      active: members.filter(m => m.status === 'Active').length,
      expired: members.filter(m => m.status === 'Expired').length,
      inactive: members.filter(m => m.status === 'Inactive').length,
      paid: members.filter(m => m.paymentStatus === 'Paid').length,
      unpaid: members.filter(m => m.paymentStatus === 'Unpaid').length,
      expiringThisMonth: members.filter(m => {
        const exp = new Date(m.expiryDate);
        return exp >= today && exp <= thirtyDaysLater;
      }).length,
      planBreakdown: planBreakdown
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/members/:id — Get single member
router.get('/:id', (req, res) => {
  try {
    const members = readMembers();
    const member = members.find(m => m.id === req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: updateMemberStatus(member) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/members — Add new member
router.post('/', (req, res) => {
  try {
    const { name, email, phone, membershipPlan, joinDate, expiryDate, status, paymentStatus, age, gender, address } = req.body;

    if (!name || !email || !phone || !membershipPlan) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, and membership plan are required.' });
    }

    const members = readMembers();
    if (members.find(m => m.email === email)) {
      return res.status(409).json({ success: false, message: 'A member with this email already exists.' });
    }

    const newMember = {
      id: 'mem-' + uuidv4().slice(0, 8),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      membershipPlan,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '',
      status: status || 'Active',
      paymentStatus: paymentStatus || 'Unpaid',
      age: parseInt(age) || null,
      gender: gender || '',
      address: address || '',
      createdAt: new Date().toISOString()
    };

    members.push(newMember);
    writeMembers(members);

    res.status(201).json({ success: true, message: 'Member added successfully!', data: newMember });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PUT /api/members/:id — Update member
router.put('/:id', (req, res) => {
  try {
    const members = readMembers();
    const index = members.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Member not found' });

    // Prevent email duplication on update
    const { email } = req.body;
    if (email && email !== members[index].email) {
      const duplicate = members.find(m => m.email === email && m.id !== req.params.id);
      if (duplicate) return res.status(409).json({ success: false, message: 'Email already in use by another member.' });
    }

    const updatedMember = {
      ...members[index],
      ...req.body,
      id: members[index].id, // prevent id change
      updatedAt: new Date().toISOString()
    };

    members[index] = updatedMember;
    writeMembers(members);

    res.json({ success: true, message: 'Member updated successfully!', data: updatedMember });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// DELETE /api/members/:id — Delete member
router.delete('/:id', (req, res) => {
  try {
    const members = readMembers();
    const index = members.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Member not found' });

    const deleted = members.splice(index, 1)[0];
    writeMembers(members);

    res.json({ success: true, message: `Member "${deleted.name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
