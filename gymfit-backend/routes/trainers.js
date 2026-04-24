const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/trainers.json');

function readTrainers() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return []; }
}

function writeTrainers(trainers) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(trainers, null, 2));
}

// GET /api/trainers
router.get('/', (req, res) => {
  try {
    let trainers = readTrainers();
    const { search, status, specialization } = req.query;

    if (search) {
      const s = search.toLowerCase();
      trainers = trainers.filter(t =>
        t.name.toLowerCase().includes(s) ||
        t.email.toLowerCase().includes(s) ||
        t.specialization.toLowerCase().includes(s)
      );
    }
    if (status) trainers = trainers.filter(t => t.status === status);
    if (specialization) trainers = trainers.filter(t => t.specialization === specialization);

    res.json({ success: true, count: trainers.length, data: trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/trainers/:id
router.get('/:id', (req, res) => {
  try {
    const trainer = readTrainers().find(t => t.id === req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    res.json({ success: true, data: trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/trainers
router.post('/', (req, res) => {
  try {
    const { name, email, phone, specialization, experience, salary, schedule } = req.body;
    if (!name || !email || !specialization) {
      return res.status(400).json({ success: false, message: 'Name, email, and specialization are required.' });
    }

    const trainers = readTrainers();
    if (trainers.find(t => t.email === email)) {
      return res.status(409).json({ success: false, message: 'A trainer with this email already exists.' });
    }

    const newTrainer = {
      id: 'trainer-' + uuidv4().slice(0, 8),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      specialization,
      experience: parseInt(experience) || 0,
      rating: 5.0,
      status: 'Active',
      salary: parseFloat(salary) || 0,
      joinDate: new Date().toISOString().split('T')[0],
      clients: 0,
      certifications: req.body.certifications || [],
      schedule: schedule || '',
      createdAt: new Date().toISOString()
    };

    trainers.push(newTrainer);
    writeTrainers(trainers);
    res.status(201).json({ success: true, message: 'Trainer added successfully!', data: newTrainer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PUT /api/trainers/:id
router.put('/:id', (req, res) => {
  try {
    const trainers = readTrainers();
    const index = trainers.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Trainer not found' });

    const updatedTrainer = { ...trainers[index], ...req.body, id: trainers[index].id, updatedAt: new Date().toISOString() };
    trainers[index] = updatedTrainer;
    writeTrainers(trainers);
    res.json({ success: true, message: 'Trainer updated successfully!', data: updatedTrainer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// DELETE /api/trainers/:id
router.delete('/:id', (req, res) => {
  try {
    const trainers = readTrainers();
    const index = trainers.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Trainer not found' });

    const deleted = trainers.splice(index, 1)[0];
    writeTrainers(trainers);
    res.json({ success: true, message: `Trainer "${deleted.name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
