import React from "react";
import { Routes, Route} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Dashboard1 from "./components/Dashboard1";
import Login from "./components/Login";
import Register from "./components/Register";
import SkillRequestForm from "./components/SkillRequestForm";
import SwapRequests from "./components/SwapRequests";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard1" element={<Dashboard1 />} />
      <Route path="/request" element={<SkillRequestForm />} />
      <Route path="/requests" element={<SwapRequests />} />
      {/* Add more routes as needed */}
      
    </Routes>
  );
}

export default App;