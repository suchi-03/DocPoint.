import React from 'react';
import { Link } from 'react-router-dom';
import docpoint_logo from "../assets/docpoint_logo.png";

const Footer = () => {
  return (
    <footer className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm px-5 md:px-10">

      {/* Left */}
      <div>
        <img className="mb-5 w-40" src={docpoint_logo} alt="Company Logo" />
        <p className="w-full md:w-2/3 text-gray-600 leading-6">
          DocPoint is a modern and user-friendly doctor appointment booking platform that bridges the gap between patients and healthcare providers. With just a few clicks, users can discover doctors based on their specialization, check availability, and book appointments online—anytime, anywhere.
        </p>
      </div>

      {/* Middle */}
      <div>
        <h2 className="text-xl font-medium mb-5">Company</h2>
        <ul className="flex flex-col gap-2 text-gray-600">
          <li><Link to="/" className="hover:text-gray-800">Home</Link></li>
          <li><Link to="/about" className="hover:text-gray-800">About Us</Link></li>
          <li><Link to="/contact" className="hover:text-gray-800">Contact Us</Link></li>
          <li><Link to="/" className="hover:text-gray-800">Privacy Policy</Link></li>
        </ul>
      </div>

      {/* Right */}
      <div>
        <h2 className="text-xl font-medium mb-5">Get In Touch</h2>
        <ul className="flex flex-col gap-2 text-gray-600">
          <li className="cursor-pointer hover:text-gray-800">+91 8688632729</li>
          <li className="cursor-pointer hover:text-gray-800">saratkumarkalagara2398s@gmail.com</li>
        </ul>
      </div>

      {/* Bottom */}
      <div className="col-span-full">
        <hr className="border-gray-300" />
        <p className="py-5 text-sm text-center text-gray-600">
          &copy; 2025 DocPoint - All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
