import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import BASE_URL from '../config';

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch user appointments
  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view appointments.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/appointment/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch appointments on component mount
  useEffect(() => {
    let isCancelled = false;
    
    const loadAppointments = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view appointments.");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/api/appointment/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        });

        if (!isCancelled && res.data.success) {
          setAppointments(res.data.appointments);
        }
      } catch (err) {
        if (!isCancelled) {
          toast.error(err.response?.data?.message || "Failed to fetch appointments.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    
    loadAppointments();
    
    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  // Function to handle appointment cancellation
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `${BASE_URL}/api/appointment/cancel/${appointmentId}`,
        {}, // PUT request might not need a body, but an empty object is good practice
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        // Update the state to reflect the cancellation without a full refetch
        setAppointments(prev =>
          prev.map(app =>
            app._id === appointmentId ? { ...app, cancelled: true } : app
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading your appointments...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">My Appointments</h1>

      {appointments.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">You have no appointments scheduled.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((app) => (
            <div key={app._id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col md:flex-row gap-4 items-start">
              <img 
                src={app.docId.image} 
                alt={app.docId.name} 
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-200"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                }}
              />
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-700">{app.docId.name}</h2>
                    <p className="text-gray-600">{app.docId.speciality}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full text-white ${
                      app.cancelled ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  >
                    {app.cancelled ? 'Cancelled' : 'Confirmed'}
                  </span>
                </div>
                <div className="mt-4 text-sm text-gray-700 space-y-2">
                    <p><strong>Date:</strong> {dayjs(app.slotDate).format('dddd, MMMM D, YYYY')}</p>
                    <p><strong>Time:</strong> {app.slotTime}</p>
                    <p><strong>Booked on:</strong> {dayjs(app.createdAt).format('MMMM D, YYYY h:mm A')}</p>
                </div>
              </div>
              <div className="w-full md:w-auto mt-4 md:mt-0 self-center">
                {!app.cancelled && (
                  <button
                    onClick={() => handleCancel(app._id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAppointments;