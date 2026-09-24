import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
import BASE_URL from "../config";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    phone: "",
    gender: "Not Selected",
    dob: "",
    address: { line1: "", line2: "" },
    image: ""
  });

  const [preview, setPreview] = useState(defaultImage);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("view");

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${BASE_URL}/api/user/get-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetched = data.user;
      const addr = fetched.address || { line1: "", line2: "" };
      setUser({ ...fetched, address: addr, image: "" }); 
      setPreview(fetched.image || defaultImage);
    } catch (err) {
      console.error("Fetch profile failed:", err.response?.data || err.message);
      toast.error("Failed to load profile.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "line1" || name === "line2") {
      setUser((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value }
      }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser((prev) => ({ ...prev, image: file })); 
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", user.name);
      fd.append("phone", user.phone);
      fd.append("gender", user.gender);
      fd.append("dob", user.dob);
      fd.append("address", JSON.stringify(user.address)); 
      
  
      if (user.image instanceof File) {
        fd.append("image", user.image);
      }

      const token = localStorage.getItem("token");

      const { data } = await axios.post(`${BASE_URL}/api/user/update-profile`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
       
        }
      });

     
      const updated = data.user;
      setUser({ ...updated, image: "", address: updated.address || { line1: "", line2: "" } });
      setPreview(updated.image || defaultImage);
      setMode("view");
      toast.success("Profile updated successfully.");

    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded-xl shadow text-base text-zinc-800">
      <h2 className="text-3xl font-bold mb-6">My Profile</h2>

      <div className="flex items-center gap-6 mb-6">
        <img
          src={preview}
          alt="avatar"
          className="w-32 h-32 rounded-full object-cover border"
        />
        {mode === "edit" && (
          <input type="file" accept="image/*" onChange={handleImageChange} />
        )}
      </div>

      {mode === "view" ? (
        <div className="space-y-3">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Gender:</strong> {user.gender}</p>
          <p><strong>Date of Birth:</strong> {user.dob}</p>
          <p><strong>Address Line 1:</strong> {user.address.line1}</p>
          <p><strong>Address Line 2:</strong> {user.address.line2}</p>
          <button
            className="mt-5 bg-primary text-white py-2 px-6 rounded hover:opacity-90"
            onClick={() => setMode("edit")}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Name</label>
            <input
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label>Gender</label>
            <select
              name="gender"
              value={user.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="Not Selected">Not Selected</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={user.dob !== "Not Selected" ? user.dob : ""}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label>Address Line 1</label>
            <input
              name="line1"
              value={user.address.line1}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label>Address Line 2</label>
            <input
              name="line2"
              value={user.address.line2}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-2 px-6 rounded hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="bg-gray-300 text-black py-2 px-6 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;