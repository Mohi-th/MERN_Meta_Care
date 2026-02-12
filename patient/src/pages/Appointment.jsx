import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { Calendar, Users } from 'lucide-react';
import ConnectedDoctors from "../components/Home/ConnectedDoctors";
import DoctorsList from "../components/Home/DoctorsList";

function Appointment({scheduleNotification}) {
  const { user } = useSelector((state) => state?.patient);

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
              <Calendar className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Appointments
              </h1>
              <p className="text-gray-600 mt-1">Manage your medical appointments and connect with doctors</p>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="w-full mb-6 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger 
                value="schedule" 
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <Calendar size={18} />
                <span className="font-semibold">Schedule Appointment</span>
              </TabsTrigger>
              <TabsTrigger 
                value="doctorsList"
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <Users size={18} />
                <span className="font-semibold">Doctors List</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="min-h-[400px]">
                <ConnectedDoctors patientId={user?._id} scheduleNotification={scheduleNotification}/>
              </div>
            </TabsContent>

            <TabsContent value="doctorsList" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="min-h-[400px]">
                <DoctorsList />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Appointment;