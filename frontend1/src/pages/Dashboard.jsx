import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(apiUrl+"/isLoggedIn", { credentials: "include" })
      .then((response) => {
        if(response.status !== 200){
          navigate("/login");
          return;
        }
        else{
          return response.json();
        }
      })
      .then(
        (data) => {
          if(data){
            setUsername(data.username);
          }
        }
      );
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Welcome, {username}</h2>
      {/* Additional Dashboard content goes here */}
    </div>
  );
};

export default Dashboard;
