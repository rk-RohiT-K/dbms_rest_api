import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/OrderConfirmation.css";

const OrderConfirmation = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.status !== 200) {
          navigate("/login");
        } else {
          fetchOrderConfirmation();
        }
      } catch (err) {
        console.error("Error checking login status:", err);
        setError("Failed to verify login status.");
      }
    };
    checkStatus();
  }, [navigate]);

  const fetchOrderConfirmation = async () => {
    try {
      const response = await fetch(`${apiUrl}/order-confirmation`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200) {
        setOrderDetails(data.order);
        setOrderItems(data.orderItems);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to fetch order details.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="order-confirmation-container">
        <h1>Order Confirmation</h1>
        {error ? (
          <p className="error-message">{error}</p>
        ) : orderDetails ? (
          <div className="order-details">
            <h2>Order ID: {orderDetails.order_id}</h2>
            <p>Order Date: {new Date(orderDetails.order_date).toLocaleDateString()}</p>
            <p>Total Amount: ${orderDetails.total_amount}</p>
            <h3>Items Ordered:</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Loading order details...</p>
        )}
      </div>
    </>
  );
};

export default OrderConfirmation;
