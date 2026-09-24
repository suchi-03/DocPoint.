import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import BASE_URL from '../config';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    cancelled: 0,
    totalEarnings: 0
  });
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, cancelled
  const [sortBy, setSortBy] = useState('date'); // date, slotDate
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  const fetchProfileAndAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("dtoken");
      if (!token) {
        toast.error("Please login first");
        navigate("/doctor-login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch profile and appointments in parallel
      const [profileRes, appointmentsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/doctor/get-profile`, { headers }),
        axios.get(`${BASE_URL}/api/doctor/appointments?status=${filterStatus}&sortBy=${sortBy}&sortOrder=${sortOrder}`, { headers })
      ]);

      const doctorData = profileRes.data.doctor;
      setDoctor(doctorData);
      setFormData(doctorData);

      const appointmentsData = appointmentsRes.data;
      setAppointments(appointmentsData.appointments || []);
      setStats(appointmentsData.stats || {
        total: 0,
        active: 0,
        cancelled: 0,
        totalEarnings: 0
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("dtoken");
        navigate("/doctor-login");
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndAppointments();
  }, [filterStatus, sortBy, sortOrder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("dtoken");
      const { data } = await axios.post(`${BASE_URL}/api/doctor/update-profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (data.success) {
        toast.success("Profile updated successfully");
        setDoctor(data.doctor);
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Profile update failed");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("dtoken");
      const { data } = await axios.delete(
        `${BASE_URL}/api/doctor/cancel/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Appointment cancelled successfully");
        fetchProfileAndAppointments(); // Refresh data
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const token = localStorage.getItem("dtoken");
      const { data } = await axios.post(
        `${BASE_URL}/api/doctor/change-availability`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(`Availability ${!doctor.available ? 'enabled' : 'disabled'}`);
        fetchProfileAndAppointments();
      }
    } catch (err) {
      toast.error("Failed to change availability");
    }
  };

  const handleDoctorLogout = () => {
    localStorage.removeItem("dtoken");
    toast.success("Logged out successfully");
    navigate("/doctor-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load doctor profile</p>
          <button
            onClick={handleDoctorLogout}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, Dr. {doctor.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleToggleAvailability}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  doctor.available
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                {doctor.available ? '✓ Available' : '✗ Unavailable'}
              </button>
              <button
                onClick={handleDoctorLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Appointments</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cancelled</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelled}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                    <input
                      type="text"
                      name="speciality"
                      value={formData.speciality || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      value={formData.degree || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      name="fees"
                      value={formData.fees || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                    <textarea
                      name="about"
                      value={formData.about || ''}
                      onChange={handleChange}
                      rows="3"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleUpdate}
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.speciality}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900 font-medium">{doctor.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Degree:</span>
                      <span className="text-gray-900 font-medium">{doctor.degree}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="text-gray-900 font-medium">{doctor.experience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fees:</span>
                      <span className="text-gray-900 font-medium">₹{doctor.fees}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-gray-600 mb-1">About:</p>
                      <p className="text-gray-900 text-xs">{doctor.about}</p>
                    </div>
                    {doctor.address && (
                      <div className="pt-2 border-t">
                        <p className="text-gray-600 mb-1">Address:</p>
                        <p className="text-gray-900 text-xs">
                          {[doctor.address?.line1, doctor.address?.line2, doctor.address?.city]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appointments Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
                <div className="flex flex-wrap gap-2">
                  {/* Filter Buttons */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split('-');
                      setSortBy(by);
                      setSortOrder(order);
                    }}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="slotDate-desc">Upcoming First</option>
                    <option value="slotDate-asc">Past First</option>
                  </select>
                </div>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600">No appointments found</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {appointments.map((app) => (
                    <div
                      key={app._id}
                      className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                        app.cancelled
                          ? 'bg-gray-50 border-gray-200 opacity-75'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            {app.userId?.image && (
                              <img
                                src={app.userId.image}
                                alt={app.userId.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {app.userId?.name || 'Unknown Patient'}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    app.cancelled
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {app.cancelled ? 'Cancelled' : 'Confirmed'}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>
                                    {dayjs(app.slotDate).format('dddd, MMMM D, YYYY')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{app.slotTime}</span>
                                </div>
                                {app.userId?.phone && (
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{app.userId.phone}</span>
                                  </div>
                                )}
                                {app.userId?.email && (
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs">{app.userId.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className="text-lg font-bold text-indigo-600">₹{app.amount}</p>
                          </div>
                          {!app.cancelled && (
                            <button
                              onClick={() => handleCancelAppointment(app._id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          )}
                          <p className="text-xs text-gray-500">
                            Booked: {dayjs(app.createdAt).format('MMM D, YYYY')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
