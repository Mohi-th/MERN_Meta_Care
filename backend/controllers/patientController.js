import Patient from '../models/patient.js';

// Register Patient
export const registerPatient = async (req, res) => {
  console.log("hello")
  const { name, phone, password } = req.body;

  try {
    const exists = await Patient.findOne({ phone });
    if (exists) {
      return res.status(200).json({ message: 'Phone already registered' ,success:false});
    }

    const patient = await Patient.create({ name, phone, password });
    res.status(201).json({ message: 'Patient registered', patient ,success:true});
  } catch (err) {
    res.status(500).json({ error: err.message ,success:false});
  }
};

// Login Patient
export const loginPatient = async (req, res) => {
  const { phone, password } = req.body;

  console.log(req.body)

  try {
    const patient = await Patient.findOne({ phone, password });
    if (!patient) {
      return res.status(401).json({ message: 'Invalid phone or password' ,success:false});
    }

    res.json({ message: 'Login successful', patient ,success:true});
  } catch (err) {
    res.status(500).json({ error: err.message ,success:false});
  }
};
