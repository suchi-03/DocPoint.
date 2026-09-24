import React, { useState, useEffect } from "react";
import axios from "axios";
import { assets } from "../assets/assets";
import docpoint_logo from "../assets/docpoint_logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import BASE_URL from "../config";

const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(defaultImage);

  const isDoctorLoggedIn = !!localStorage.getItem("dtoken");
  if (isDoctorLoggedIn) return null;

  useEffect(() => {
    // Debounce profile image fetch to avoid excessive API calls
    let timeoutId;
    const fetchProfileImage = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setProfileImage(defaultImage);
          return;
        }

        // Check if we have cached image in localStorage
        const cachedImage = localStorage.getItem('userProfileImage');
        const cacheTime = localStorage.getItem('userProfileImageTime');
        
        // Use cached image if less than 5 minutes old
        if (cachedImage && cacheTime && Date.now() - parseInt(cacheTime) < 300000) {
          setProfileImage(cachedImage);
          return;
        }

        const { data } = await axios.get(`${BASE_URL}/api/user/get-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const imageUrl = data.user.image || defaultImage;
        setProfileImage(imageUrl);
        
        // Cache the image URL
        localStorage.setItem('userProfileImage', imageUrl);
        localStorage.setItem('userProfileImageTime', Date.now().toString());
      } catch (err) {
        console.error("Failed to load avatar:", err);
        setProfileImage(defaultImage);
      }
    };

    if (isLoggedIn) {
      // Debounce to prevent multiple calls
      timeoutId = setTimeout(fetchProfileImage, 100);
    } else {
      setProfileImage(defaultImage);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  return (
    <>
      <div className="flex items-center justify-between py-4 text-sm border-b mb-5 border-b-gray-500 px-5 md:px-10">
        <img
          onClick={() => navigate("/")}
          src={docpoint_logo}
          alt="logo"
          className="cursor-pointer w-32"
        />

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-start gap-5 font-medium">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-primary" : ""}>
            <li className="py-1">Home</li>
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => isActive ? "text-primary" : ""}>
            <li className="py-1">All Doctors</li>
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "text-primary" : ""}>
            <li className="py-1">About</li>
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "text-primary" : ""}>
            <li className="py-1">Contact</li>
          </NavLink>
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-4 relative">
          {!isLoggedIn ? (
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-6 py-2 rounded-full hidden md:block"
            >
              Create Account
            </button>
          ) : (
            <div className="relative">
              <img
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full object-cover cursor-pointer border"
                src={profileImage}
                alt="User"
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-md z-50">
                  <button
                    onClick={handleProfile}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/appointments");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    My Appointments
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger Menu */}
          <img
            onClick={() => setShowMenu(!showMenu)}
            className="w-6 md:hidden cursor-pointer"
            src={assets.menu_icon}
            alt="menu"
          />
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {showMenu && (
        <div className="md:hidden px-5 pb-4 space-y-2 text-sm font-medium border-b border-gray-300">
          <NavLink to="/" onClick={() => setShowMenu(false)}>
            <div className="py-1">Home</div>
          </NavLink>
          <NavLink to="/doctors" onClick={() => setShowMenu(false)}>
            <div className="py-1">All Doctors</div>
          </NavLink>
          <NavLink to="/about" onClick={() => setShowMenu(false)}>
            <div className="py-1">About</div>
          </NavLink>
          <NavLink to="/contact" onClick={() => setShowMenu(false)}>
            <div className="py-1">Contact</div>
          </NavLink>

          {!isLoggedIn ? (
            <button
              onClick={() => {
                setShowMenu(false);
                navigate("/login");
              }}
              className="w-full bg-primary text-white px-4 py-2 rounded-full mt-2"
            >
              Create Account
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
                className="block w-full text-left px-2 py-2 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/appointments");
                }}
                className="block w-full text-left px-2 py-2 hover:bg-gray-100"
              >
                My Appointments
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleLogout();
                }}
                className="block w-full text-left px-2 py-2 hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
