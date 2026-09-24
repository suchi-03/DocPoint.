import express from "express";
import {
  registerDoctor,
  loginDoctor,
  doctorList,
  appointmentsDoctor,
  changeAvailability,
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
  cancelAppointmentByDoctor

} from "../controllers/doctorController.js";
import authDoctor from "../middleware/authDoctor.js";
import upload from "../middleware/multer.js";
const doctorRouter = express.Router();

doctorRouter.post('/register', upload.single("image"), registerDoctor);
doctorRouter.post('/login', loginDoctor);
doctorRouter.get('/get-profile', authDoctor, getDoctorProfile);
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile);

doctorRouter.get('/list', doctorList);
doctorRouter.get('/appointments', authDoctor, appointmentsDoctor);
doctorRouter.post('/change-availability', authDoctor, changeAvailability);
doctorRouter.get('/:id', getDoctorById);
doctorRouter.delete('/cancel/:id', authDoctor, cancelAppointmentByDoctor);


export default doctorRouter;