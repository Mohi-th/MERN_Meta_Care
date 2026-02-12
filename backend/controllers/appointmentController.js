import Appointment from '../models/Appointment.js';

const convertToDate = (date, time) => {
  const [timePart, modifier] = time.split(" "); // ["09:00", "AM"]

  let [hours, minutes] = timePart.split(":");

  hours = parseInt(hours);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

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
    // ✅ Safer date + time combination (ISO format)
    // Example: 2026-02-10T15:30:00
    console.log(date,time,"hello");
    const scheduleTime = convertToDate(date,time);

    console.log(scheduleTime,"schedule");

    // ❗ Optional: prevent booking past slots
    if (scheduleTime < new Date()) {
      return res.status(400).json({
        message: 'Cannot book appointment in the past'
      });
    }

    // ✅ Create appointment directly
    // (double booking handled by UNIQUE index)
    const appointment = await Appointment.create({
      patientId,
      docId,
      scheduleTime,
      roomId: null
    });

    // ✅ Use appointment _id as roomId
    appointment.roomId = appointment._id.toString();
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });

  } catch (error) {

    // ❌ Slot already booked (unique index violation)
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Slot already booked'
      });
    }

    res.status(500).json({
      message: 'Booking failed',
      error: error.message
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
    const start = new Date(`${date} 00:00:00`);
    const end = new Date(`${date} 23:59:59`);

    const bookedAppointments = await Appointment.find({
      docId,
      scheduleTime: { $gte: start, $lte: end }
    });

    const bookedTimes = bookedAppointments.map(a =>
      a.scheduleTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const availableSlots = FIXED_SLOTS.map(time => ({
      time,
      isBooked: bookedTimes.includes(time)
    }));

    res.json({ success: true, availableSlots });
  } catch (error) {
    res.status(500).json({
      message: 'Could not fetch slots',
      error: error.message
    });
  }
};



// GET /api/appointments/doctor/:docId

export const getAppointmentsForDoctor = async (req, res) => {
  try {
    const { docId } = req.params;

    const appointments = await Appointment.find({ docId })
      .populate('patientId', 'name phone')   // only show name and phone of patient
      .populate('docId', 'name hospital');   // optional: include doctor info

    res.status(200).json({ appointments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
};

export const getAppointmentsByPatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    const appointments = await Appointment.find({ patientId })
      .populate('docId', 'name phone hospital') // Optional
      .populate('patientId', 'name phone');     // Optional

    res.json({ appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch patient appointments' });
  }
};

