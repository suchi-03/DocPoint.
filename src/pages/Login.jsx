import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";

const Login = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("Sign Up");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const endpoint =
      mode === "Sign Up" ? "/api/user/register" : "/api/user/login";

    const payload =
      mode === "Sign Up"
        ? form
        : { email: form.email, password: form.password };

    try {
      const { data } = await axios.post(`${BASE_URL}${endpoint}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!data.success) {
        setErrorMsg(data.message || "Something went wrong");
      } else {
        localStorage.setItem("token", data.token);
        setSuccessMsg(`${mode} successful!`);
        setForm({ name: "", email: "", password: "" });

        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Server error – please try again later";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="min-h-[80vh] flex items-center">
        <div className="flex flex-col gap-3 m-auto items-start p-8 
                        min-w-[340px] sm:min-w-96 border rounded-xl
                        text-zinc-600 text-sm shadow-lg">

          <p className="text-2xl font-semibold">
            {mode === "Sign Up" ? "Create Account" : "Login"}
          </p>
          <p>
            Please {mode === "Sign Up" ? "sign up " : "log in "}to book appointment
          </p>

          {mode === "Sign Up" && (
            <div className="w-full">
              <p>Full Name</p>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                required
              />
            </div>
          )}

          <div className="w-full">
            <p>Email</p>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              required
            />
          </div>

          <div className="w-full">
            <p>Password</p>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              required
            />
          </div>

          {errorMsg && <p className="text-red-600 text-xs mt-1">{errorMsg}</p>}
          {successMsg && <p className="text-green-600 text-xs mt-1">{successMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="text-white bg-primary text-center w-full py-2 rounded-md
                       text-base hover:opacity-90 disabled:opacity-60">
            {loading
              ? mode === "Sign Up" ? "Signing up…" : "Logging in…"
              : mode === "Sign Up" ? "Create Account" : "Login"}
          </button>

          {mode === "Sign Up" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setMode("Login")}
                className="text-primary underline cursor-pointer">
                Login here
              </span>
            </p>
          ) : (
            <p>
              Create a new account?{" "}
              <span
                onClick={() => setMode("Sign Up")}
                className="text-primary underline cursor-pointer">
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
