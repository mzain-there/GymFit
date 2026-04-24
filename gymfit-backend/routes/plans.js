const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/plans.json');

function readPlans() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function writePlans(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET /api/plans
router.get('/', (req, res) => {
  try {
    const plans = readPlans();
    res.json({ success: true, count: plans.length, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/plans/:id
router.get('/:id', (req, res) => {
  try {
    const plan = readPlans().find(p => p.id === req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/plans
router.post('/', (req, res) => {
  try {
    const plans = readPlans();
    const { name, description, price, duration, billingCycle, features, popular, color } = req.body;
    
    // Basic validation
    if (!name || price === undefined || !duration || !billingCycle || !features) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const { v4: uuidv4 } = require('uuid');
    const newPlan = {
      id: uuidv4(),
      name,
      description: description || '',
      price: Number(price),
      duration,
      billingCycle,
      features: Array.isArray(features) ? features : features.split(',').map(f => f.trim()),
      popular: !!popular,
      color: color || '#primary',
      createdAt: new Date().toISOString()
    };

    plans.push(newPlan);
    writePlans(plans);

    res.status(201).json({ success: true, message: 'Plan added successfully', data: newPlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
