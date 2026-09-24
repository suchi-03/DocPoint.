import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import mongoose from "mongoose";

export const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      docId,
      slotDate,
      slotTime,
      amount
    } = req.body;

    // Validate input
    if (!docId || !slotDate || !slotTime || !amount) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // STEP 1: Check if doctor exists and is available
    const doctor = await doctorModel.findById(docId).session(session);
    if (!doctor) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    if (!doctor.available) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Doctor is not available for appointments" 
      });
    }

    // STEP 2: Check if slot is already booked in doctor's slots_booked
    if (doctor.slots_booked?.[slotDate]?.[slotTime]) {
      await session.abortTransaction();
      return res.status(409).json({ 
        success: false, 
        message: "This time slot is already booked. Please select another time." 
      });
    }

    // STEP 3: Check if an active appointment already exists for this slot
    // This is a critical check to prevent race conditions
    const existingAppointment = await appointmentModel.findOne({
      docId: new mongoose.Types.ObjectId(docId),
      slotDate,
      slotTime,
      cancelled: false
    }).session(session);

    if (existingAppointment) {
      await session.abortTransaction();
      return res.status(409).json({ 
        success: false, 
        message: "This time slot is already booked. Please select another time." 
      });
    }

    // STEP 4: Create appointment (within transaction)
    const newAppointment = new appointmentModel({
      userId: req.user.id, 
      docId: new mongoose.Types.ObjectId(docId),
      slotDate,
      slotTime,
      amount,
      date: Date.now(),
      cancelled: false
    });

    await newAppointment.save({ session });

    // STEP 5: Mark slot as booked in doctor's record (within transaction)
    await doctorModel.findByIdAndUpdate(
      docId,
      {
        $set: {
          [`slots_booked.${slotDate}.${slotTime}`]: true
        }
      },
      { 
        session,
        upsert: false // Don't create if doesn't exist
      }
    );

    // STEP 6: Commit transaction (all operations succeed or all fail)
    await session.commitTransaction();
    
    res.status(201).json({ 
      success: true, 
      message: "Appointment booked successfully",
      appointment: newAppointment
    });
  } catch (err) {
    // Rollback transaction on any error
    await session.abortTransaction();
    
    console.error("Error creating appointment:", err);
    
    // Handle duplicate key error (from unique index)
    if (err.code === 11000 || err.name === 'MongoServerError') {
      return res.status(409).json({ 
        success: false, 
        message: "This time slot was just booked by another user. Please select another time." 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: err.message || "Internal server error" 
    });
  } finally {
    // Always end the session
    session.endSession();
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ userId: req.user.id })
      .populate("docId", "name image speciality")
      .sort({ date: -1 });

    res.status(200).json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ docId: req.user.id })
      .populate("userId", "name image phone")
      .sort({ date: -1 });

    res.status(200).json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { appointmentId } = req.params;

    // Find appointment within transaction
    const appointment = await appointmentModel
      .findById(appointmentId)
      .session(session);

    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    // Check if already cancelled
    if (appointment.cancelled) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Appointment is already cancelled" 
      });
    }

    // Mark as cancelled
    appointment.cancelled = true;
    await appointment.save({ session });

    // Release slot in doctor's slots_booked (within transaction)
    if (appointment.docId && appointment.slotDate && appointment.slotTime) {
      await doctorModel.findByIdAndUpdate(
        appointment.docId,
        {
          $unset: {
            [`slots_booked.${appointment.slotDate}.${appointment.slotTime}`]: ""
          }
        },
        { session }
      );
    }

    // Commit transaction
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Cancel appointment error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Internal server error" 
    });
  } finally {
    session.endSession();
  }
};

export const getDoctorEarnings = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid doctor ID" 
      });
    }

    const earnings = await appointmentModel.aggregate([
      {
        $match: {
          docId: new mongoose.Types.ObjectId(req.user.id),
          cancelled: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEarnings = earnings.length > 0 ? earnings[0].total : 0;
    const appointmentCount = earnings.length > 0 ? earnings[0].count : 0;

    res.status(200).json({ 
      success: true, 
      totalEarnings,
      appointmentCount
    });
  } catch (err) {
    console.error("Earnings Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
