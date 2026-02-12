import Doctor from '../models/doctor.js';

// Register Doctor
export const registerDoctor = async (req, res) => {
  const { name, phone, password, experience, hospital } = req.body;

  try {
    const exists = await Doctor.findOne({ phone });
    if (exists) { 
      return res.status(400).json({ message: 'Phone already registered' });
    }

    const doctor = await Doctor.create({ name, phone, password, experience, hospital });
    res.status(201).json({ message: 'Doctor registered', doctor,success:true });
  } catch (err) {
    res.status(500).json({ error: err.message,success:false });
  }
};

// Login Doctor
export const loginDoctor = async (req, res) => {
  const { phone, password } = req.body;
  console.log(req.body)

  try {
    const doctor = await Doctor.findOne({ phone, password });
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    res.json({ message: 'Login successful', doctor,success:true });
  } catch (err) { 
    res.status(500).json({ error: err.message ,success:false});
  }
};


export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json({ doctors ,success:true});
  } catch (err) {
    res.status(500).json({ message: "Error fetching doctors", error: err.message ,success:false});
  }
};