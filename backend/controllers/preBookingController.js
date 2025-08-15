const PreBooking = require('../models/PreBooking');
const Vehicle = require('../models/Vehicle.cjs');

// Generate the next bookingId in the format 'akr-01', 'akr-02', ...
async function generateBookingId() {
  // Find the latest booking by bookingId (descending)
  const latest = await PreBooking.findOne({ bookingId: /^akr-\d+$/i })
    .sort({ createdAt: -1 })
    .lean();
  let nextNum = 1;
  if (latest && latest.bookingId) {
    const match = latest.bookingId.match(/akr-(\d+)/i);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  // Pad with leading zeros if needed (akr-01, akr-02, ...)
  const padded = String(nextNum).padStart(2, '0');
  return `akr-${padded}`;
}

// Create a new pre-booking
exports.createPreBooking = async (req, res, next) => {
  try {
    const bookingId = await generateBookingId();
    const preBooking = new PreBooking({ ...req.body, bookingId });
    await preBooking.save();
    res.status(201).json(preBooking);
  } catch (err) {
    next(err);
  }
};

// Get all pre-bookings
exports.getAllPreBookings = async (req, res, next) => {
  try {
    const preBookings = await PreBooking.find().sort({ createdAt: -1 });
    res.json(preBookings);
  } catch (err) {
    next(err);
  }
};

// Update a pre-booking by ID
exports.updatePreBooking = async (req, res, next) => {
  try {
    const { status, ...updateData } = req.body;
    
    // Get the current pre-booking to check if status is changing to 'Confirmed'
    const currentPreBooking = await PreBooking.findById(req.params.id);
    if (!currentPreBooking) {
      return res.status(404).json({ message: 'Pre-booking not found' });
    }

    // If status is being changed to 'Confirmed', reduce stock quantity
    if (status === 'Confirmed' && currentPreBooking.status !== 'Confirmed') {
      if (currentPreBooking.vehicle) {
        const vehicle = await Vehicle.findById(currentPreBooking.vehicle);
        if (vehicle) {
          if (vehicle.stockQuantity > 0) {
            vehicle.stockQuantity -= 1;
            await vehicle.save();
          } else {
            return res.status(400).json({ message: 'No stock available for this vehicle' });
          }
        }
      }
      
      // Set order date when confirming
      updateData.orderDate = new Date();
    }
    
    // If status is being changed from 'Confirmed' to something else, restore stock
    if (currentPreBooking.status === 'Confirmed' && status !== 'Confirmed') {
      if (currentPreBooking.vehicle) {
        const vehicle = await Vehicle.findById(currentPreBooking.vehicle);
        if (vehicle) {
          vehicle.stockQuantity += 1;
          await vehicle.save();
        }
      }
    }

    const preBooking = await PreBooking.findByIdAndUpdate(
      req.params.id,
      { $set: { ...updateData, status } },
      { new: true, runValidators: true }
    );
    
    res.json(preBooking);
  } catch (err) {
    next(err);
  }
}; 