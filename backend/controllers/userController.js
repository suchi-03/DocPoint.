import validator from 'validator';
import bcrypt from 'bcrypt'; 
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !password || !email) {
            return res.status(400).json({ success: false, message: "Please provide all the details" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please provide a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password should be at least 8 characters long" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }

        const newUser = new userModel({ name, email, password: hashedPassword });
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);

        res.status(201).json({ success: true, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
        res.status(200).json({ success: true, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



const getProfile = async (req, res) => {
  try {
    // Use lean() for better performance and select only needed fields
    const userData = await userModel
      .findById(req.user.id)
      .select('name email image address gender dob phone')
      .lean();
    
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Set cache headers for profile data (short cache since it can change)
    res.set('Cache-Control', 'private, max-age=60');
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


import { v2 as cloudinary } from "cloudinary";

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const userId = req.user.id;
    const imageFile = req.file;

    if (!name || !phone || !address || !dob || !gender) {
      return res.status(400).json({ success: false, message: "Data Missing" });
    }

    const parsedAddress = typeof address === "string" ? JSON.parse(address) : address;

    const updateData = {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    };

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: 'image',
        folder: 'avatars',
      });
      updateData.image = imageUpload.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    res.status(200).json({ success: true, message: "Profile updated", user: updatedUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export { registerUser, loginUser ,getProfile,updateProfile};