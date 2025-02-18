import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading state
  
    const userData = {
      username,
      email,
      password,
    };
  
    try {
      const response = await fetch(apiUrl+"/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password
        }),
      });
  
      const text = await response.text(); // Read the response as text first
      console.log("Response Text:", text); // Log the raw response
  
      let data;
      try {
        data = JSON.parse(text); // Parse the JSON if it is valid
      } catch (e) {
        console.error("Error parsing JSON:", e);
        setError("Server responded with invalid JSON.");
        return;
      }
  
      if (response.status === 200) {
        // If the signup is successful, navigate to dashboard
        navigate("/dashboard");
      } else {
        // If there's an error, set the error message
        setError(data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error signing up. Please try again later.");
    } finally {
      setLoading(false); // Stop loading state
    }
  };
  

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        <div>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Signup;
