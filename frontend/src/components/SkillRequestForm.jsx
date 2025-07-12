import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SkillRequestForm = () => {
  const [offeredSkill, setOfferedSkill] = useState('');
  const [wantedSkill, setWantedSkill] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const receiverId = location.state?.receiver_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiverId) {
      alert("Receiver ID not found.");
      return;
    }

    const token = localStorage.getItem("Token");

    try {
      const response = await fetch("http://localhost:8080/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          offered_skill: offeredSkill,
          wanted_skill: wantedSkill,
          message,
        }),
      });

      if (!response.ok) throw new Error("Request failed");

      const result = await response.json();
      console.log("✅ Request sent:", result);
      alert("Request submitted!");
      navigate("/dashboard1"); // Navigate to dashboard1 after submission
    } catch (error) {
      console.error("❌ Submission error:", error);
      alert("Failed to submit request.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full bg-blue-500 text-white flex items-center justify-between px-4 py-2">
        <button onClick={() => navigate(-1)} className="text-sm">&lt; Back</button>
        <h2 className="text-lg font-semibold">Skill<span className="text-white font-light">Swap</span></h2>
        <img src="/images/avatar.png" alt="profile" className="w-6 h-6 rounded-full border" />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mt-12 w-full max-w-md shadow-sm">
        <div className="flex justify-center mb-4">
          
          <h1 className="text-3xl font-bold text-gray-700">Skill<span className="text-blue-500">Swap</span></h1>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium text-gray-700">Offered skills</label>
          <input
            type="text"
            value={offeredSkill}
            onChange={(e) => setOfferedSkill(e.target.value)}
            placeholder="Enter offered skill..."
            className="w-full border border-gray-300 px-3 py-2 rounded mb-4"
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">Wanted skills</label>
          <input
            type="text"
            value={wantedSkill}
            onChange={(e) => setWantedSkill(e.target.value)}
            placeholder="Enter wanted skill..."
            className="w-full border border-gray-300 px-3 py-2 rounded mb-4"
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={4}
            className="w-full border border-gray-300 px-3 py-2 rounded mb-6"
          ></textarea>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded shadow"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default SkillRequestForm;
