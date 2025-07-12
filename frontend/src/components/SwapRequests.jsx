import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Reusable skill badge
const SkillBadge = ({ skill, color }) => (
  <span
    className={`text-xs font-medium px-2 py-1 rounded-full bg-${color}-100 text-${color}-800 border border-${color}-300 mr-2 mb-1`}
  >
    {skill}
  </span>
);

const SwapRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("Token");

  // Fetch all swap requests
  const fetchRequests = async () => {
    try {
      const response = await fetch("http://localhost:8080/getAllreqest", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch swap requests");

      const result = await response.json();
      setRequests(result);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Token not found.");
      setLoading(false);
    } else {
      fetchRequests();
    }
  }, []);

  // Accept request
  const handleAccept = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/acceptRequest/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to accept request");

      alert("✅ Request accepted!");
      fetchRequests(); // Refresh list
    } catch (err) {
      console.error("❌ Accept Error:", err);
      alert("Failed to accept request.");
    }
  };

  // Reject request
  const handleReject = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/declineRequest/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to reject request");

      alert("❌ Request declined!");
      fetchRequests(); // Refresh list
    } catch (err) {
      console.error("❌ Reject Error:", err);
      alert("Failed to reject request.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="w-full bg-blue-500 text-white flex items-center justify-between px-4 py-2">
        <button onClick={() => navigate(-1)} className="text-sm">
          &lt; Back
        </button>
        <h2 className="text-lg font-semibold">
          Skill<span className="font-light">Swap</span>
        </h2>
        <img
          src="/images/avatar.png"
          alt="profile"
          className="w-6 h-6 rounded-full border"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 mt-6">
        <div className="flex items-center space-x-3">
      
          <h2 className="text-2xl font-bold text-blue-700">
            Swap <span className="text-green-500">Request</span>
          </h2>
        </div>
        <div className="space-x-4">
          <select className="border border-gray-300 rounded px-3 py-1 text-sm">
            <option>Availability</option>
          </select>
          <button className="border border-gray-300 rounded px-3 py-1 text-sm">
            Filter
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-center text-red-500 font-medium mt-4">{error}</p>
      )}

      {/* Request Cards */}
      <div className="mt-6 px-6 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="flex items-start bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <img
                src="/images/avatar.png"
                alt="avatar"
                className="w-12 h-12 rounded-full border mr-4"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    

                    <div className="text-sm text-gray-600 mt-1">
                      Skill Offered:
                    </div>
                    <div className="flex flex-wrap mb-1">
                      <SkillBadge
                        skill={req.offered_skill || "N/A"}
                        color="green"
                      />
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                      Skill Wanted:
                    </div>
                    <div className="flex flex-wrap">
                      <SkillBadge
                        skill={req.wanted_skill || "N/A"}
                        color="yellow"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600 font-medium">
                      Status
                    </div>
                    <div className="text-base font-semibold text-yellow-600">
                      {req.status || "Pending"}
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <button
                        className="text-green-600 font-medium text-sm hover:underline"
                        onClick={() => handleAccept(req.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="text-red-500 font-medium text-sm hover:underline"
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 pb-8 space-x-3 text-sm text-gray-600">
        <span>&lt;&lt;</span>
        <span className="border border-gray-300 px-3 py-1 rounded">Page 1</span>
        <span>&gt;&gt;</span>
      </div>
    </div>
  );
};

export default SwapRequests;
