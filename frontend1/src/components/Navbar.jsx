import React from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config/config";

const Navbar = () => {
  const handleLogout = () => {
    fetch(apiUrl+"/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Logged out successfully") {
          window.location.href = "/login";
        }
      });
  };

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/products">Products</Link>
      <Link to="/cart">Cart</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
