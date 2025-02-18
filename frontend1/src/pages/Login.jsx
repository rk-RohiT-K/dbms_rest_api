import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { apiUrl } from "../config/config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(apiUrl + "/isLoggedIn", { credentials: "include" });
        if (response.status === 200) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();

    const credentials = { email, password };

    fetch(apiUrl+"/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "email": email, "password": password })
    })
      .then((response) => {
        if(response.status === 200){
          navigate("/dashboard");
          return;
        }
        return response.json();
      })
      .then((data) => {
        if(data){
          alert(data.message);
        }
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/signup">Sign up here</a>
      </p>
    </div>
  );
};

export default Login;
