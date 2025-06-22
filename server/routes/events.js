import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = express.Router();

// Get all events
router.get('/', (req, res) => {
  const query = `
    SELECT 
      e.*,
      COUNT(ts.id) as total_slots,
      SUM(CASE WHEN ts.current_bookings < ts.max_bookings THEN 1 ELSE 0 END) as available_slots
    FROM events e
    LEFT JOIN time_slots ts ON e.id = ts.event_id
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get event by ID with slots
router.get('/:id', (req, res) => {
  const eventQuery = 'SELECT * FROM events WHERE id = ?';
  const slotsQuery = `
    SELECT 
      ts.*,
      (ts.max_bookings - ts.current_bookings) as available_spots
    FROM time_slots ts
    WHERE ts.event_id = ?
    ORDER BY ts.start_time ASC
  `;

  db.get(eventQuery, [req.params.id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.all(slotsQuery, [req.params.id], (err, slots) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ ...event, slots });
    });
  });
});

// Create new event
router.post('/', (req, res) => {
  const { title, description, timeSlots } = req.body;

  if (!title || !timeSlots || timeSlots.length === 0) {
    return res.status(400).json({ error: 'Title and time slots are required' });
  }

  const eventId = uuidv4();
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insert event
    db.run(
      'INSERT INTO events (id, title, description) VALUES (?, ?, ?)',
      [eventId, title, description],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        // Insert time slots
        const stmt = db.prepare(`
          INSERT INTO time_slots (id, event_id, start_time, max_bookings) 
          VALUES (?, ?, ?, ?)
        `);

        let completed = 0;
        const totalSlots = timeSlots.length;

        timeSlots.forEach(slot => {
          const slotId = uuidv4();
          stmt.run([slotId, eventId, slot.startTime, slot.maxBookings || 1], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }

            completed++;
            if (completed === totalSlots) {
              stmt.finalize();
              db.run('COMMIT');
              res.status(201).json({ id: eventId, message: 'Event created successfully' });
            }
          });
        });
      }
    );
  });
});

export default router;