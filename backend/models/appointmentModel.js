import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  docId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true
  },
  slotDate: {
    type: String,
    required: true
  },
  slotTime: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Number,
    required: true
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  payment: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


// Indexes for performance optimization
appointmentSchema.index({ userId: 1, slotDate: 1 }); // User appointments by date
appointmentSchema.index({ docId: 1, slotDate: 1 }); // Doctor appointments by date
appointmentSchema.index({ docId: 1, cancelled: 1, date: -1 }); // Doctor active appointments sorted
appointmentSchema.index({ userId: 1, cancelled: 1, date: -1 }); // User active appointments sorted
appointmentSchema.index({ cancelled: 1, payment: 1, isCompleted: 1 }); // Status filtering
appointmentSchema.index({ date: -1 }); // General sorting by booking date

// Unique index to prevent double-booking: Only one active appointment per doctor-slot combination
appointmentSchema.index(
  { docId: 1, slotDate: 1, slotTime: 1 },
  { 
    unique: true,
    partialFilterExpression: { cancelled: false }
  }
);

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);
export default appointmentModel;
