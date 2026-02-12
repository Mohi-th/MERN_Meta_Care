import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import {
  User,
  Award,
  Building,
  Send,
  Stethoscope,
  CheckCircle,
} from "lucide-react";

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [requestStatus, setRequestStatus] = useState({});
  const { user } = useSelector((state) => state?.patient);

  /* ---------------------------
     Fetch all doctors
  ---------------------------- */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/doctor/all`
        );
        setDoctors(res.data.doctors || []);
      } catch (err) {
        console.error("Failed to load doctors:", err);
      }
    };

    fetchDoctors();
  }, []);

  /* ---------------------------
     Fetch patient's connection requests
     (docId is populated object)
  ---------------------------- */
  useEffect(() => {
    if (!user?._id) return;

    const fetchPatientRequests = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/connection/patient/${user._id}`
        );

        const statusMap = {};
        res.data.requests.forEach((req) => {
          // IMPORTANT FIX 👇
          statusMap[req.docId._id] = req.status;
        });

        setRequestStatus(statusMap);
      } catch (err) {
        console.error("Failed to fetch connection requests:", err);
      }
    };

    fetchPatientRequests();
  }, [user?._id]);

  /* ---------------------------
     Send connection request
  ---------------------------- */
  const sendRequest = async (docId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/connection/send`, {
        patientId: user?._id,
        docId,
      });

      setRequestStatus((prev) => ({
        ...prev,
        [docId]: "pending",
      }));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send request");
    }
  };

  /* ---------------------------
     Empty state
  ---------------------------- */
  if (doctors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="text-indigo-600" size={48} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          No Doctors Available
        </h3>
        <p className="text-gray-600">
          Check back later for available doctors
        </p>
      </div>
    );
  }

  /* ---------------------------
     UI
  ---------------------------- */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {doctors.map((doc) => {
        const status = requestStatus[doc._id];

        return (
          <div
            key={doc._id}
            className="bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-100 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6"
          >
            {/* Doctor Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {doc.name}
                </h3>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium">
                      {doc.experience} years experience
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Building size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium">
                      {doc.hospital}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialization */}
            {doc.specialization && (
              <div className="mb-4 flex items-center gap-2">
                <Stethoscope size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Specialization:
                </span>
                <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                  {doc.specialization}
                </span>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={() => sendRequest(doc._id)}
              disabled={status === "pending" || status === "accepted"}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                status === "accepted"
                  ? "bg-green-600"
                  : status === "pending"
                  ? "bg-yellow-500"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105"
              }`}
            >
              {status === "accepted" ? (
                <>
                  <CheckCircle size={20} />
                  Connected
                </>
              ) : status === "pending" ? (
                <>
                  <CheckCircle size={20} />
                  Request Pending
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Connection Request
                </>
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default DoctorsList;
