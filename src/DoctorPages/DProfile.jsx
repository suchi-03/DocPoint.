import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import BASE_URL from '../config';

const DProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedTime, setSelectedTime] = useState(null);

    const timeSlots = [
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
        "04:00 PM", "04:30 PM", "05:00 PM",
    ];

    const next7Days = Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day'));

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/doctor/${id}`);
                if (res.data.success) {
                    setDoctor(res.data.doctor);
                }
            } catch (err) {
                console.error("Error fetching doctor:", err);
                toast.error("Failed to load doctor profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id]);

    const handleBook = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            toast.warn("You need to log in to book an appointment.");
            return navigate("/login");
        }

        if (!selectedDate || !selectedTime) {
            return toast.warn("Please select both date and time.");
        }

        const bookingDetails = {
            docId: id,
            slotDate: selectedDate.format("YYYY-MM-DD"),
            slotTime: selectedTime,
            amount: doctor.fees || 500,
        };

        try {
            const res = await axios.post(
                `${BASE_URL}/api/appointment/create`,
                bookingDetails,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                toast.success("Appointment booked successfully!");
                // Refetch doctor data to update slots
                const updatedDoctor = await axios.get(`${BASE_URL}/api/doctor/${id}`);
                if (updatedDoctor.data.success) {
                    setDoctor(updatedDoctor.data.doctor);
                }
                setSelectedTime(null); // Reset selected time
            } else {
                toast.error(res.data.message || "Failed to book appointment.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Something went wrong.");
        }
    };

    if (loading) return <div className="p-6">Loading doctor profile...</div>;
    if (!doctor) return <div className="p-6 text-red-600">Doctor not found.</div>;
    
    // Helper to check if a slot is booked
    const isSlotBooked = (slot) => {
        const date = selectedDate.format("YYYY-MM-DD");
        return doctor.slots_booked && doctor.slots_booked[date] && doctor.slots_booked[date][slot];
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start bg-white shadow-lg rounded-lg p-6 border border-blue-200">
                <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full md:w-60 h-60 object-cover rounded-md border"
                />
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-1">{doctor.name} <span className="text-blue-600">✔️</span></h1>
                    <p className="text-primary font-semibold mb-2">{doctor.speciality}</p>
                    <p className="text-gray-700">{doctor.degree}</p>
                    <p className="text-gray-600 mt-1">{doctor.experience} years experience</p>
                    <p className="text-blue-700 font-semibold">Fees: ₹{doctor.fees}</p>
                    <p className="text-sm text-gray-800 mt-4">{doctor.about}</p>
                    <p className="mt-2">
                        <span className="font-semibold">Availability:</span>{" "}
                        {doctor.available ? (
                            <span className="text-green-600">Available</span>
                        ) : (
                            <span className="text-red-500">Not Available</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Booking Slots */}
            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-3">Booking Slots</h2>

                <div className="flex gap-3 overflow-x-auto mb-4 p-2">
                    {next7Days.map((day) => (
                        <button
                            key={day.format("YYYY-MM-DD")}
                            onClick={() => {
                                setSelectedDate(day);
                                setSelectedTime(null); // Reset time when date changes
                            }}
                            className={`px-4 py-2 rounded-full border min-w-[60px] transition-colors ${
                                day.isSame(selectedDate, "day")
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-gray-800 hover:bg-blue-100"
                            }`}
                        >
                            <div className="text-xs font-medium uppercase">{day.format("ddd")}</div>
                            <div className="text-sm">{day.format("D")}</div>
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    {timeSlots
  .filter((slot) => {
    if (!selectedDate.isSame(dayjs(), "day")) return true;
    const slotTime = dayjs(`${selectedDate.format("YYYY-MM-DD")} ${slot}`, "YYYY-MM-DD hh:mm A");
    return slotTime.isAfter(dayjs());
  })
  .map((slot) => {
    const isBooked = isSlotBooked(slot);
    return (
      <button
        key={slot}
        disabled={isBooked}
        onClick={() => setSelectedTime(slot)}
        className={`px-4 py-2 rounded-full border transition-colors ${
          isBooked
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : selectedTime === slot
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-800 hover:bg-blue-100"
        }`}
      >
        {slot}
      </button>
    );
  })}

                </div>

                <button
                    onClick={handleBook}
                    disabled={!selectedTime}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Book Appointment
                </button>
            </div>
        </div>
    );
};

export default DProfile;