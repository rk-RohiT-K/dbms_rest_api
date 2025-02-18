import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/list-products", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Products fetched successfully") {
          setProducts(data.products);
        }
      });
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (productId, quantity) => {
    fetch("/add-to-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId, quantity }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => alert(data.message)); // Handle response (success/error)
  };

  return (
    <div>
      <Navbar />
      <h2>Products</h2>
      <input
        type="text"
        placeholder="Search products"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        {filteredProducts.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock}</p>
            <button onClick={() => handleAddToCart(product.id, 1)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
