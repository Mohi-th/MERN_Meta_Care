import ConnectionRequest from '../models/ConnectionRequest.js';
import PatientDoctorConnection from '../models/PatientDoctorConnection.js';

let io; // To store socket instance

export const setIO = (socketIO) => {
  io = socketIO;
};

export const sendConnectionRequest = async (req, res) => {
  const { patientId, docId } = req.body;
  console.log(patientId, docId);

  try {
    // Check for duplicate
    const existingRequest = await ConnectionRequest.findOne({ patientId, docId });
    if (existingRequest) {
      return res.status(400).json({ message: 'Connection request already sent' });
    }

    // Save new request
    let newRequest = await ConnectionRequest.create({
      patientId,
      docId,
      status: 'pending',
    });

    // ✅ Populate patient data before emitting
    newRequest = await newRequest.populate('patientId');

    // Emit real-time event to the doctor
    io.to(docId).emit('new-connection-request', {
      message: 'You have a new connection request',
      request: newRequest,
    });

    res.status(201).json({ message: 'Connection request sent', request: newRequest });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send request', error: err.message });
  }
};

export const getPatientConnectionRequests = async (req, res) => {
  const { patientId } = req.params;

  try {
    const requests = await ConnectionRequest.find({ patientId })
      .populate('docId', 'name phone experience hospital')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient connection requests',
      error: err.message,
    });
  }
};




export const updateConnectionRequestStatus = async (req, res) => {
  const { requestId, status } = req.body;

  try {
    let updated = await ConnectionRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // If accepted, create a new patient-doctor connection
    if (status === 'accepted') {
      await PatientDoctorConnection.create({
        patientId: updated.patientId,
        docId: updated.docId,
      });
    }

    console.log("pat id" ,String(updated.patientId))

    // ✅ Emit to the patient room using string ID
    io.to(String(updated.patientId)).emit('connection-response', {
      message: `Doctor has ${status} your connection request`,
      status,
      requestId,
      patientId: updated.patientId,
      docId: updated.docId,
    });

    res.status(200).json({
      message: `Connection request ${status}`,
      request: updated,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error updating connection request',
      error: err.message,
    });
  }
};


export const getDoctorConnectionRequests = async (req, res) => {
  const { docId } = req.params;

  try {
    const requests = await ConnectionRequest.find({ docId }).populate('patientId', 'name phone');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching connection requests', error: err.message });
  }
};

export const getConnectedDoctors = async (req, res) => {
  const { patientId } = req.params;

  try {
    const connections = await PatientDoctorConnection.find({ patientId }).populate('docId', 'name phone experience hospital');
    const doctors = connections.map(conn => conn.docId); // extract doctor info

    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch connected doctors', error: err.message });
  }
};


