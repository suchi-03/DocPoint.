import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';


const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      available,
      fees,
      address,
      dob,
      gender,
      phone
    } = req.body;

    const imageFile = req.file;

    console.log("Received body for registration:", req.body);
    console.log("Received file for registration:", req.file);

    if (
      !name || !email || !password || !speciality || !degree || !experience ||
      !about || !fees || !address || !gender || !phone || !dob
    ) {
      return res.status(400).json({ success: false, message: "Please provide all required details" });
    }

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: "Doctor already exists with this email" });
    }
    const cloudinaryRes = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: 'image',
      folder: 'doctor_profiles'
    });

    const imageUrl = cloudinaryRes.secure_url;
    const hashedPassword = await bcrypt.hash(password, 10);

    let parsedAddress;
    try {
        parsedAddress = JSON.parse(address);
    } catch (parseError) {
        console.error("Error parsing address JSON:", parseError);
        return res.status(400).json({ success: false, message: "Invalid address format" });
    }

    const isAvailable = available === 'true';

    const newDoctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      speciality,
      degree,
      experience,
      about,
      available: isAvailable,
      fees,
      dob,
      gender,
      phone,
      address: parsedAddress,
      date: Date.now()
    });

    const savedDoctor = await newDoctor.save();

    const token = jwt.sign({ id: savedDoctor._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d'
    });

    res.status(201).json({ success: true, dtoken: token });
  } catch (error) {
    console.error("Doctor registration error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const loginDoctor = async (req, res) => {
    try {
      const { email, password } = req.body;
      const doctor = await doctorModel.findOne({ email });

      if (!doctor) {
          return res.status(400).json({ success: false, message: "Invalid Credentials" });
      }

      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch) {
          return res.status(400).json({ success: false, message: "Invalid Credentials" });
      }

      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
      res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const changeAvailability = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const docData = await doctorModel.findById(doctorId);

        if (!docData) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        await doctorModel.findByIdAndUpdate(doctorId, { available: !docData.available });
        res.json({ success: true, message: "Availability changed successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


const doctorList = async (req, res) => {
    try {
        const {
          speciality,
          available,
          page = 1,
          limit = 12,
        } = req.query;

        const query = {};
        if (speciality) query.speciality = speciality;
        if (typeof available !== 'undefined') {
          // Accept 'true'/'false' strings as booleans
          query.available = String(available) === 'true';
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

        const [total, doctors] = await Promise.all([
          doctorModel.countDocuments(query),
          doctorModel
            .find(query)
            .select('name image speciality degree experience fees available')
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean()
        ]);

        // Light caching for list responses
        res.set('Cache-Control', 'public, max-age=60');

        res.json({
          success: true,
          doctors,
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum) || 1,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const appointmentsDoctor = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { status, sortBy = 'date', sortOrder = 'desc' } = req.query;
        
        // Build query
        const query = { docId: doctorId };
        if (status === 'cancelled') {
            query.cancelled = true;
        } else if (status === 'active') {
            query.cancelled = false;
        }

        // Build sort
        const sort = {};
        if (sortBy === 'date') {
            sort.date = sortOrder === 'asc' ? 1 : -1;
        } else if (sortBy === 'slotDate') {
            sort.slotDate = sortOrder === 'asc' ? 1 : -1;
        } else {
            sort.date = -1; // Default
        }

        const appointments = await appointmentModel
            .find(query)
            .populate("userId", "name email phone image")
            .sort(sort)
            .lean();

        // Calculate statistics
        const stats = {
            total: appointments.length,
            active: appointments.filter(a => !a.cancelled).length,
            cancelled: appointments.filter(a => a.cancelled).length,
            totalEarnings: appointments
                .filter(a => !a.cancelled)
                .reduce((sum, a) => sum + (a.amount || 0), 0)
        };

        res.json({ 
            success: true, 
            appointments,
            stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


const getDoctorById = async (req, res) => {
  const doctorId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ success: false, message: "Invalid doctor ID" });
  }

  try {
    const doctor = await doctorModel.findById(doctorId).select("-password").lean();
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, doctor });

  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID" });
    }

    // Select only needed fields and use lean() for performance
    const doctor = await doctorModel
      .findById(doctorId)
      .select('-password')
      .lean();

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Cache profile data (short cache since it can change)
    res.set('Cache-Control', 'private, max-age=120');
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error("Error in getDoctorProfile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const updateFields = req.body; 

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, doctor: updatedDoctor });
  } catch (error) {
    console.error("Update Doctor Profile Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const cancelAppointmentByDoctor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doctorId = req.user.id;
    const appointmentId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Invalid appointment ID" 
      });
    }

    // Find appointment and verify ownership
    const appointment = await appointmentModel
      .findOne({ _id: appointmentId, docId: doctorId })
      .session(session);

    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found or you don't have permission" 
      });
    }

    // Mark as cancelled instead of deleting (preserve history)
    appointment.cancelled = true;
    await appointment.save({ session });

    // Release slot in doctor's slots_booked
    if (appointment.slotDate && appointment.slotTime) {
      await doctorModel.findByIdAndUpdate(
        doctorId,
        {
          $unset: {
            [`slots_booked.${appointment.slotDate}.${appointment.slotTime}`]: ""
          }
        },
        { session }
      );
    }

    await session.commitTransaction();

    res.json({ 
      success: true, 
      message: "Appointment cancelled successfully",
      appointment
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Doctor Cancel Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  } finally {
    session.endSession();
  }
};



export {
    registerDoctor,
    loginDoctor,
    changeAvailability,
    doctorList,
    appointmentsDoctor,
    getDoctorById,
    getDoctorProfile,
    updateDoctorProfile,
    cancelAppointmentByDoctor
};