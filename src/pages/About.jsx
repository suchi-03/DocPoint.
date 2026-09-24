import React from 'react';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className="px-6 sm:px-8 md:px-12 py-10 bg-primary text-white rounded-lg shadow-md">
      <h2 className="text-center text-3xl font-bold mb-10">About DocPoint</h2>

      <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6 md:gap-10">
        {/* Image */}
        <img
          className="w-64 sm:w-72 md:w-80 lg:w-96 rounded-lg"
          src={assets.about_image}
          alt="About DocPoint"
        />

        {/* Info */}
        <div className="flex-1 text-base leading-relaxed text-center md:text-left">
          <p className="mb-4">
            <strong>DocPoint</strong> is a modern and user-friendly platform designed to connect patients with trusted doctors for seamless appointment booking. Whether you’re seeking specialized medical care or need a quick consultation,simplifies the process by offering a comprehensive directory of highly qualified doctors across various specialties.
          </p>

          <p className="mb-4">
            Our goal is to bridge the gap between patients and healthcare professionals, ensuring convenience, reliability, and efficiency in healthcare services. By leveraging technology, DocPoint empowers both patients and doctors to manage their appointments effortlessly.
          </p>

          <p className="mt-6 text-lg font-semibold">Our Vision</p>
          <p>
            At <strong>DocPoint</strong>, our vision is to revolutionize the healthcare experience by making it accessible, transparent, and stress-free for everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
