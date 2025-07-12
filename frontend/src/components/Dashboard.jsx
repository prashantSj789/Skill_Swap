import React from 'react';
import { Link } from 'react-router-dom';
const users = [
  {
    id: 1,
    name: 'Marc Demo',
    rating: '3.8/5',
    skillsOffered: ['Javascript', 'Java', 'Excel'],
    skillsWanted: ['Python', 'UI/UX', 'Photoshop'],
  },
  {
    id: 2,
    name: 'Marc Demo',
    rating: '3.8/5',
    skillsOffered: ['Javascript', 'Java', 'Excel'],
    skillsWanted: ['Python', 'UI/UX', 'Photoshop'],
  },
  {
    id: 3,
    name: 'Marc Demo',
    rating: '3.9/5',
    skillsOffered: ['Javascript', 'Java', 'Excel'],
    skillsWanted: ['Python', 'UI/UX', 'Photoshop'],
  },
  {
    id: 4,
    name: 'Marc Demo',
    rating: '3.9/5',
    skillsOffered: ['Javascript', 'Java', 'Excel'],
    skillsWanted: ['Python', 'UI/UX', 'Photoshop'],
  },
];

const SkillBadge = ({ skill, color }) => (
  <span className={`text-xs px-3 py-1 rounded-full bg-${color}-100 text-${color}-800 font-medium mr-2 mb-1 shadow-sm border border-${color}-300`}>{skill}</span>
);

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center bg-blue-600 text-white px-8 py-4 shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Task<span className="text-green-300">Swap</span></h1>
        <div className="space-x-4">
          <button className="hover:text-green-200 transition">Home</button>
          <Link to="/register">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-full shadow hover:bg-blue-100 transition">Register</button>
          </Link>
          <Link to="/login">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-full shadow hover:bg-blue-100 transition">Login</button>
          </Link>
        </div>
      </header>

      {/* Search Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center py-14 px-6 gap-12">
        <div className="text-center lg:text-left max-w-md">
          <img
            src="/images/swap.jpeg"
            alt="SkillSwap"
            className="w-80 h-auto mx-auto lg:mx-0 mb-6 drop-shadow"
          />
          <h2 className="text-3xl font-semibold mb-4">🎯 Find Your Perfect Task</h2>
          <input
            type="text"
            placeholder="Search for Photoshop, Excel..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition shadow">Check Availability</button>
        </div>
        <img
          src="/images/vector.jpeg"
          alt="Illustration"
          className="w-96 drop-shadow-xl"
        />
      </section>

      {/* Available Swaps */}
      <main className="px-6 md:px-16 pb-12">
        <h3 className="text-green-600 font-semibold text-2xl mb-6">Available Swaps</h3>

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
                  {user.name} <span className="text-sm font-normal text-gray-500">Rating: {user.rating}</span>
                </div>
                <div className="mt-3">
                  <div className="font-medium text-sm mb-1">Skills Offered:</div>
                  <div className="flex flex-wrap">
                    {user.skillsOffered.map(skill => (
                      <SkillBadge key={skill} skill={skill} color="green" />
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="font-medium text-sm mb-1">Skills Wanted:</div>
                  <div className="flex flex-wrap">
                    {user.skillsWanted.map(skill => (
                      <SkillBadge key={skill} skill={skill} color="yellow" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 lg:mt-0">
                <button className="border border-blue-500 text-blue-600 px-5 py-2 rounded-full font-medium hover:bg-blue-50 transition">Request</button>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          <button className="px-4 py-1 text-sm border rounded hover:bg-gray-100">← Prev</button>
          <span className="text-sm">Page 1</span>
          <button className="px-4 py-1 text-sm border rounded hover:bg-gray-100">Next →</button>
        </div>
      </main>
    </div>
  );
};

export default App;
