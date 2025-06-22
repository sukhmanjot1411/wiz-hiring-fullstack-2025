import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = express.Router();

// Book a time slot
router.post('/', (req, res) => {
  const { slotId, eventId, name, email } = req.body;

  if (!slotId || !eventId || !name || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Check if slot is available and not already booked by this email
    const checkQuery = `
      SELECT 
        ts.max_bookings,
        ts.current_bookings,
        EXISTS(SELECT 1 FROM bookings WHERE slot_id = ? AND email = ?) as already_booked
      FROM time_slots ts
      WHERE ts.id = ?
    `;

    db.get(checkQuery, [slotId, email, slotId], (err, slot) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }

      if (!slot) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Time slot not found' });
      }

      if (slot.already_booked) {
        db.run('ROLLBACK');
        return res.status(409).json({ error: 'You have already booked this time slot' });
      }

      if (slot.current_bookings >= slot.max_bookings) {
        db.run('ROLLBACK');
        return res.status(409).json({ error: 'Time slot is fully booked' });
      }

      // Create booking
      const bookingId = uuidv4();
      db.run(
        'INSERT INTO bookings (id, slot_id, event_id, name, email) VALUES (?, ?, ?, ?, ?)',
        [bookingId, slotId, eventId, name, email],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          // Update slot booking count
          db.run(
            'UPDATE time_slots SET current_bookings = current_bookings + 1 WHERE id = ?',
            [slotId],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }

              db.run('COMMIT');
              res.status(201).json({ 
                id: bookingId, 
                message: 'Booking created successfully' 
              });
            }
          );
        }
      );
    });
  });
});

// Get bookings by email
router.get('/user/:email', (req, res) => {
  const query = `
    SELECT 
      b.*,
      e.title as event_title,
      e.description as event_description,
      ts.start_time
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    JOIN time_slots ts ON b.slot_id = ts.id
    WHERE b.email = ?
    ORDER BY ts.start_time ASC
  `;

  db.all(query, [req.params.email], (err, bookings) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(bookings);
  });
});

export default router;