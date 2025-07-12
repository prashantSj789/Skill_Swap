import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate(); // ← hook for redirect

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    is_public: false,
    availability: "",
    skills_offered: [],
    skills_wanted: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillChange = (e, field) => {
    const value = e.target.value.split(",").map((s) => s.trim());
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Registration successful:", result);
      alert("✅ Registration successful!");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("❌ Registration failed:", error);
      alert("❌ Registration failed. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-400 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl px-10 py-8 w-full max-w-lg border border-blue-100"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Create Your Profile
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location (Optional)"
            value={form.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />

          <input
            type="text"
            name="availability"
            placeholder="Availability (e.g., weekends, evenings)"
            value={form.availability}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
            required
          />

          <input
            type="text"
            placeholder="Skills Offered (comma-separated)"
            value={form.skills_offered.join(", ")}
            onChange={(e) => handleSkillChange(e, "skills_offered")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
            required
          />

          <input
            type="text"
            placeholder="Skills Wanted (comma-separated)"
            value={form.skills_wanted.join(", ")}
            onChange={(e) => handleSkillChange(e, "skills_wanted")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-yellow-300 focus:outline-none"
            required
          />

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              name="is_public"
              checked={form.is_public}
              onChange={handleChange}
              className="form-checkbox rounded text-blue-600"
            />
            <span>Make Profile Public</span>
          </label>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full w-full shadow-md transition"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
