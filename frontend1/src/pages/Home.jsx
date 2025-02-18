import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    fetch(apiUrl+"/isLoggedIn", { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          // If the response is not ok (status code not 200-299), throw an error
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Check if data and the expected 'message' property are present
        if (data?.message === "Logged in") {
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      })
      .catch((error) => {
        // Log any error (e.g., network issues or invalid JSON)
        console.error("Error during fetch:", error);
        navigate("/login"); // Redirect to login page if there's an error
      });
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Home;
