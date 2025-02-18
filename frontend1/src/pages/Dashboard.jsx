import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/isLoggedIn", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Logged in") {
          setUsername(data.username);
        } else {
          navigate("/login");
        }
      });
  }, [navigate]);

  return (
    <div>
      <Navbar />
      <h2>Welcome, {username}</h2>
      {/* Additional Dashboard content goes here */}
    </div>
  );
};

export default Dashboard;
