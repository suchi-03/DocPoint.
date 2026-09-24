import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate('/login');
  };

  const handleDoctorLoginClick = () => {
    navigate('/doctor-login');
  };

  return (
    <div className='flex flex-col md:flex-row bg-primary rounded-lg px-5 sm:px-6 md:px-10 lg:px-20'>
      {/* Left Side */}
      <div className='w-full md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 md:py-[10vw]'>
        <p className='text-3xl sm:text-4xl lg:text-5xl text-white font-semibold leading-snug sm:leading-tight'>
          Book Appointment<br />With Trusted Doctors
        </p>

        <div className='flex flex-col sm:flex-row items-center gap-3 text-white text-sm font-light'>
          <img className='w-28' src={assets.group_profiles} alt="Group Profiles" />
          <p className='text-center sm:text-left'>
            "Explore our network of trusted doctors,<br className='hidden sm:block' />
            book your appointment seamlessly in moments!"
          </p>
        </div>

        {/* Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center sm:justify-start'>
          <button
            onClick={handleBookClick}
            className='flex items-center justify-center gap-2 bg-white px-6 py-3 rounded-full text-sm text-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-md'
          >
            Book Appointment
            <img className='w-3' src={assets.arrow_icon} alt="Arrow Icon" />
          </button>

          <button
            onClick={handleDoctorLoginClick}
            className='flex items-center justify-center bg-white border border-white px-6 py-3 rounded-full text-sm text-black transition-all duration-300 hover:bg-gray-200 hover:shadow-md'
          >
            Doctor Login
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className='w-full md:w-1/2 mt-10 md:mt-0 relative'>
        <img
          className='w-full h-auto max-h-[400px] object-contain md:absolute md:bottom-0 rounded-lg'
          src={assets.header_img}
          alt="Header Illustration"
        />
      </div>
    </div>
  );
};

export default Header;
