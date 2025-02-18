import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Cart.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState({ street: "", city: "", state: "", pincode: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${apiUrl}/isLoggedIn`, { credentials: "include" });
        const data = await res.json();
        if (res.status !== 200) {
          navigate("/login");
        } else {
          fetchCart();
        }
      } catch (err) {
        setError("Error checking login status");
      }
    };
    checkStatus();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${apiUrl}/display-cart`, { credentials: "include" });
      console.log("Flag 1\n");
      const data = await res.json();
      console.log("Flag 2\n");
      if (res.status === 200) {
        setCart(data.cart);
        setTotalPrice(data.totalPrice);
        console.log("Flag 3\n");

      } else {
        setMessage(data.message);
        console.log(data.message);

      }
    } catch (err) {
      setError("Error fetching cart");
    }
  };

  const updateQuantity = async (productId, change, currentQuantity, stockQuantity) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1 || newQuantity > stockQuantity) return;
    try {
      const res = await fetch(`${apiUrl}/update-cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: change }),
      });
      const data = await res.json();
      if (res.status === 200) fetchCart();
      else setMessage(data.message);
    } catch (err) {
      setError("Error updating cart");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`${apiUrl}/remove-from-cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      if (res.status === 200) fetchCart();
      else setMessage(data.message);
    } catch (err) {
      setError("Error removing item from cart");
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(`${apiUrl}/place-order`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      const data = await res.json();
      if (res.status === 200) {
        navigate("/order-confirmation");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setError("Error placing order");
    }
  };

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {message && <div className="cart-message">{message}</div>}
      {error && <div className="cart-error">{error}</div>}

      {cart.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.item_id}>
                  <td>{item.product_name}</td>
                  <td>${item.unit_price}</td>
                  <td>{item.stock}</td>
                  <td>
                    <button onClick={() => updateQuantity(item.product_id, -1, item.quantity, item.stock)}>-</button>
                    {item.quantity}
                    <button onClick={() => updateQuantity(item.product_id, 1, item.quantity, item.stock)}>+</button>
                  </td>
                  <td>${item.total_item_price}</td>
                  <td>
                    <button onClick={() => removeFromCart(item.product_id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <form>
            <label>Pincode: <input type="text" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} /></label>
            <label>Street: <input type="text" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} /></label>
            <label>City: <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></label>
            <label>State: <input type="text" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></label>
          </form>

          <div className="cart-total">
            <h3>Total: ${totalPrice}</h3>
            <button onClick={handleCheckout} disabled={cart.length === 0}>Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
