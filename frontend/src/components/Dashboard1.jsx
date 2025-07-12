import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const SkillBadge = ({ skill, color }) => (
  <span className={`text-xs px-3 py-1 rounded-full bg-${color}-100 text-${color}-800 font-medium mr-2 mb-1 shadow-sm border border-${color}-300`}>
    {skill}
  </span>
);

const Dashboard = () => {
    const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("Token");

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/users/public", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error fetching public users");

      const result = await response.json();
      const uniqueUsers = Array.from(
        new Map((result.users || result).map(user => [user.id, user])).values()
      );
      setUsers(uniqueUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return fetchUsers(); // fallback to default

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8080/users/search?skill=${encodeURIComponent(searchTerm)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Search failed");

      const result = await response.json();
      setUsers(result.users || result);
    } catch (err) {
      setError(`Search failed. Try again. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
    } else {
      fetchUsers();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center bg-blue-600 text-white px-8 py-4 shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">
          Task<span className="text-green-300">Swap</span>
        </h1>
        <div className="space-x-4">
          <Link to="/"><button className="hover:text-green-200 transition">Home</button></Link>
          <Link to="/requests"><button className="hover:text-green-200 transition">Requests</button></Link>
        </div>
      </header>

      {/* Search Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center py-14 px-6 gap-12">
        <div className="text-center lg:text-left max-w-md">
          <img src="/images/swap.jpeg" alt="SkillSwap" className="w-80 h-auto mx-auto lg:mx-0 mb-6 drop-shadow" />
          <h2 className="text-3xl font-semibold mb-4">🎯 Find Your Perfect Task</h2>
          <input
            type="text"
            placeholder="Search for Photoshop, Excel..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={searchUsers}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition shadow"
          >
            Check Availability
          </button>
        </div>
        <img src="/images/vector.jpeg" alt="Illustration" className="w-96 drop-shadow-xl" />
      </section>

      {/* Available Swaps */}
      <main className="px-6 md:px-16 pb-12">
        <h3 className="text-green-600 font-semibold text-2xl mb-6">Available Swaps</h3>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading && <p className="text-center text-gray-500">Loading users...</p>}

        {users.length === 0 && !loading && !error && (
          <p className="text-center text-gray-500">No users found.</p>
        )}

        {users.map((user, index) => (
          <div
            key={user.id}
            className={`border ${index === 0 ? 'border-blue-400' : 'border-gray-200'} rounded-xl bg-white p-6 mb-6 shadow-sm hover:shadow-md transition`}
          >
            <div className="flex items-start space-x-6">
              <img
                src="/images/avatar.png"
                alt="avatar"
                className="w-16 h-16 rounded-full border-2 border-blue-500 shadow-sm"
              />
              <div className="flex-1">
                <div className="text-xl font-semibold mb-1 flex items-center justify-between">
                  {user.name || "Unnamed"}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    Rating: {user.rating || "N/A"}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-2">{user.location}</div>
                <div className="text-sm text-blue-700 mb-2">
                  Availability: {user.availability || "Not provided"}
                </div>

                <div className="mt-3">
                  <div className="font-medium text-sm mb-1">Skills Offered:</div>
                  <div className="flex flex-wrap">
                    {user.skills_offered?.map(skill => (
                      <SkillBadge key={skill.id} skill={skill.name} color="green" />
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="font-medium text-sm mb-1">Skills Wanted:</div>
                  <div className="flex flex-wrap">
                    {user.skills_wanted?.map(skill => (
                      <SkillBadge key={skill.id} skill={skill.name} color="yellow" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-2 lg:mt-0">
                <button
  onClick={() => navigate("/request", { state: { receiver_id: user.id } })}
  className="border border-blue-500 text-blue-600 px-5 py-2 rounded-full font-medium hover:bg-blue-50 transition"
>
  Request
</button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Dashboard;
