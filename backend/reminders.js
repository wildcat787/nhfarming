const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all reminders for the current user
router.get('/', authMiddleware, (req, res) => {
  const query = `
    SELECT 
      r.*,
      v.name as vehicle_name,
      v.registration_number,
      v.make,
      v.model
    FROM reminders r
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.user_id = ?
    ORDER BY r.reminder_date ASC
  `;
  
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get upcoming reminders (within next 30 days)
router.get('/upcoming', authMiddleware, (req, res) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const query = `
    SELECT 
      r.*,
      v.name as vehicle_name,
      v.registration_number,
      v.make,
      v.model
    FROM reminders r
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.user_id = ? 
    AND r.reminder_date <= ? 
    AND r.sent = 0
    ORDER BY r.reminder_date ASC
  `;
  
  db.all(query, [req.user.id, thirtyDaysFromNow.toISOString().split('T')[0]], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Mark reminder as sent
router.put('/:id/sent', authMiddleware, (req, res) => {
  const reminderId = req.params.id;
  
  db.run(
    'UPDATE reminders SET sent = 1, sent_date = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [reminderId, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Reminder not found' });
      res.json({ success: true });
    }
  );
});

// Create reminders for a vehicle's expiry dates
router.post('/create-for-vehicle', authMiddleware, (req, res) => {
  const { vehicle_id, registration_expiry_date, insurance_expiry_date, service_due_date } = req.body;
  
  if (!vehicle_id) {
    return res.status(400).json({ error: 'vehicle_id is required' });
  }
  
  const reminders = [];
  
  // Helper function to create reminder dates
  const createReminderDates = (expiryDate, reminderType) => {
    if (!expiryDate) return;
    
    const expiry = new Date(expiryDate);
    const oneMonthBefore = new Date(expiry);
    oneMonthBefore.setMonth(expiry.getMonth() - 1);
    
    const oneFortnightBefore = new Date(expiry);
    oneFortnightBefore.setDate(expiry.getDate() - 14);
    
    // Only create reminders for future dates
    const now = new Date();
    
    if (oneMonthBefore > now) {
      reminders.push({
        vehicle_id,
        reminder_type: `${reminderType}_1month`,
        expiry_date: expiryDate,
        reminder_date: oneMonthBefore.toISOString().split('T')[0],
        message: `${reminderType} expires in 1 month`
      });
    }
    
    if (oneFortnightBefore > now) {
      reminders.push({
        vehicle_id,
        reminder_type: `${reminderType}_2weeks`,
        expiry_date: expiryDate,
        reminder_date: oneFortnightBefore.toISOString().split('T')[0],
        message: `${reminderType} expires in 2 weeks`
      });
    }
  };
  
  // Create reminders for each expiry date
  createReminderDates(registration_expiry_date, 'Registration');
  createReminderDates(insurance_expiry_date, 'Insurance');
  createReminderDates(service_due_date, 'Service');
  
  if (reminders.length === 0) {
    return res.json({ message: 'No future reminders to create' });
  }
  
  // Insert reminders
  let completed = 0;
  const results = [];
  
  reminders.forEach(reminder => {
    db.run(
      `INSERT INTO reminders (user_id, vehicle_id, reminder_type, expiry_date, reminder_date, message) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, reminder.vehicle_id, reminder.reminder_type, reminder.expiry_date, reminder.reminder_date, reminder.message],
      function (err) {
        if (err) {
          console.error('Error creating reminder:', err);
        } else {
          results.push({ id: this.lastID, ...reminder });
        }
        completed++;
        
        if (completed === reminders.length) {
          res.json({ 
            message: `Created ${results.length} reminders`,
            reminders: results
          });
        }
      }
    );
  });
});

// Get reminders for all users (admin only)
router.get('/all', authMiddleware, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const query = `
    SELECT 
      r.*,
      v.name as vehicle_name,
      v.registration_number,
      v.make,
      v.model,
      u.username,
      u.email
    FROM reminders r
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.reminder_date ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Delete old sent reminders (older than 30 days)
router.delete('/cleanup', authMiddleware, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  db.run(
    'DELETE FROM reminders WHERE sent = 1 AND sent_date < ?',
    [thirtyDaysAgo.toISOString()],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ 
        message: `Deleted ${this.changes} old reminders`,
        deletedCount: this.changes
      });
    }
  );
});

module.exports = router;
