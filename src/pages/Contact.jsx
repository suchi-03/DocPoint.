import React from 'react';
import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div className="px-6 sm:px-8 md:px-12 py-10 text-white bg-primary rounded-lg shadow-md">
      <h2 className="text-center text-3xl font-bold mb-10">Contact Me</h2>

      <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6 md:gap-10">
        {/* Image */}
        <img
          className="w-32 sm:w-36 md:w-40 lg:w-48 rounded-lg"
          src={assets.profile}
          alt="Contact"
        />

        {/* Contact Info */}
        <div className="flex-1 text-base leading-relaxed text-center md:text-left">
          <div className="mb-6">
            <p className="text-lg font-semibold mb-2">Get in Touch</p>
            <p className="mb-1">Sarat Kumar</p>
            <p className="mb-1">Visakhapatnam, India</p>
            <p className="mb-1">Student at IIIT Kottayam, CSE</p>
            <p className="mb-1">
              Email:{' '}
              <a
                href="mailto:saratkumarkalagara2398s@gmail.com"
                className="text-blue-200 underline hover:text-white"
              >
                saratkumarkalagara2398s@gmail.com
              </a>
            </p>
          </div>

          <p className="text-sm text-gray-200">
            Feel free to reach out for collaborations, discussions, or opportunities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
