const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/payments.json');

// Helper: Read payments
function readPayments() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Write payments
function writePayments(payments) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(payments, null, 2));
}

// Helper: Read Plans (to get prices)
function getPlanPrice(planName) {
  try {
    const plansFile = path.join(__dirname, '../data/plans.json');
    const plans = JSON.parse(fs.readFileSync(plansFile, 'utf8'));
    const plan = plans.find(p => p.name === planName);
    return plan ? plan.price : 0;
  } catch (err) {
    return 0;
  }
}

// Helper to record payment when member is created/updated
router.recordPayment = (member, amount = null) => {
  const payments = readPayments();
  const price = amount !== null ? amount : getPlanPrice(member.membershipPlan);
  
  // Check if there's already a payment for this member today, to avoid duplicates?
  // Let's just create a new record.
  const record = {
    id: 'pay-' + uuidv4().slice(0, 8),
    memberId: member.id,
    memberName: member.name,
    memberEmail: member.email,
    plan: member.membershipPlan,
    amount: price,
    status: member.paymentStatus, // 'Paid' or 'Unpaid'
    date: new Date().toISOString()
  };
  
  payments.push(record);
  writePayments(payments);
  return record;
};

// Helper to delete payments for a member
router.deletePaymentsByMember = (memberId) => {
  const payments = readPayments();
  const filtered = payments.filter(p => p.memberId !== memberId);
  if (filtered.length !== payments.length) {
    writePayments(filtered);
  }
};

// GET /api/payments - Get all payments + stats
router.get('/', (req, res) => {
  try {
    const payments = readPayments();
    
    // Stats calculation
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    payments.forEach(p => {
      if (p.status === 'Paid') {
        const amt = parseFloat(p.amount) || 0;
        totalRevenue += amt;
        
        const d = new Date(p.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          monthlyRevenue += amt;
        }
      }
    });
    
    // Sort payments newest first
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: payments,
      stats: {
        totalRevenue: totalRevenue.toFixed(2),
        monthlyRevenue: monthlyRevenue.toFixed(2),
        totalTransactions: payments.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PUT /api/payments/:id/status - Update payment status
router.put('/:id/status', (req, res) => {
  try {
    const payments = readPayments();
    const { status } = req.body;
    const index = payments.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    payments[index].status = status;
    writePayments(payments);
    
    // Ideally we should also update member payment status, but we keep them loosely coupled for now.
    
    res.json({ success: true, message: 'Status updated', data: payments[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
