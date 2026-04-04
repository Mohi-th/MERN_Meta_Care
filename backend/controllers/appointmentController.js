import Appointment from '../models/Appointment.js';

const convertToDate = (date, time) => {
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":");
  hours = parseInt(hours);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const selectedDate = new Date(date);
  selectedDate.setHours(hours);
  selectedDate.setMinutes(parseInt(minutes));
  selectedDate.setSeconds(0);
  selectedDate.setMilliseconds(0);
  return selectedDate;
};

export const bookAppointment = async (req, res) => {
  const { patientId, docId, date, time } = req.body;

  try {
    const scheduleTime = convertToDate(date, time);

    // Prevent booking past slots
    if (scheduleTime < new Date()) {
      return res.status(400).json({
        message: 'Cannot book appointment in the past',
      });
    }

    // Check for existing appointment with same doctor, patient, date/time
    const existing = await Appointment.findOne({
      docId,
      scheduleTime,
      status: { $ne: 'cancelled' },
    });

    if (existing) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    const appointment = await Appointment.create({
      patientId,
      docId,
      scheduleTime,
      status: 'scheduled',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slot already booked' });
    }
    res.status(500).json({
      message: 'Booking failed',
      error: error.message,
    });
  }
};

export const getAvailableSlots = async (req, res) => {
  const { docId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  const FIXED_SLOTS = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

  try {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);

    const bookedAppointments = await Appointment.find({
      docId,
      scheduleTime: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    });

    const bookedTimes = bookedAppointments.map((a) =>
      a.scheduleTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    const availableSlots = FIXED_SLOTS.map((time) => ({
      time,
      isBooked: bookedTimes.includes(time),
    }));

    res.json({ success: true, availableSlots });
  } catch (error) {
    res.status(500).json({
      message: 'Could not fetch slots',
      error: error.message,
    });
  }
};

export const getAppointmentsForDoctor = async (req, res) => {
  try {
    const { docId } = req.params;
    const appointments = await Appointment.find({ docId })
      .populate('patientId', 'name phone')
      .populate('docId', 'name hospital')
      .sort({ scheduleTime: -1 });

    res.status(200).json({ appointments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
};

export const getAppointmentsByPatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    const appointments = await Appointment.find({ patientId })
      .populate('docId', 'name phone hospital experience')
      .populate('patientId', 'name phone')
      .sort({ scheduleTime: -1 });

    res.json({ appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch patient appointments' });
  }
};

export const completeAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'completed' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      success: true,
      message: 'Appointment marked as completed',
      appointment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete appointment', error: err.message });
  }
};
