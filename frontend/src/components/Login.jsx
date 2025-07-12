import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [login, setLogin] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setLogin((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      localStorage.setItem("Token", result.token);
      alert("✅ Login successful!");
      navigate("/dashboard1"); // ✅ Navigate after login
    } catch (error) {
      console.error("❌ Login failed:", error);
      setError("Invalid credentials or server error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-400 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-blue-100"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Login to Task<span className="text-green-500">Swap</span>
        </h2>

        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}

        <input
          className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="email"
          type="email"
          placeholder="Email"
          value={login.email}
          onChange={handleChange}
          required
        />

        <input
          className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="password"
          type="password"
          placeholder="Password"
          value={login.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
