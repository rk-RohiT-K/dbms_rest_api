const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: 'rohitkumar',
  host: 'localhost',
  database: 'ecommerce',
  password: 'jamesbond#007',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
// function isAuthenticated(req, res, next) {
//   if(!req.session.userId) {
//     res.redirect('/login');
//   } else {
//     next();
//   }
// }

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, email, password}
// use correct status codes and messages mentioned in the lab document
app.post('/signup', async (req, res) => {
  const {username,email, password} = req.body;
  try{
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if(user.rows.length > 0) {
      res.status(400).json({message: 'Error: Email is already registered.'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id', [username, email, hashedPassword]);
    res.status(200).json({message: 'User Registered Successfully'});
  }
  catch(error) {
    res.status(500).json({message: 'Error signing up'});
  }
});

// TODO: Implement user signup logic
// return JSON object with the following fields: {email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/login", async (req, res) => {
  try{
    const {email, password} = req.body;
    console.log(email);
    console.log(password);
    const user = await pool.query('SELECT * FROM users WHERE email = $1',[email]);
    if(user.rows.length == 0){
      return res.status(400).json({message: 'Invalid Credentials'});
    }
    const password_ret = user.rows[0].password_hash;
    const isMatch = await bcrypt.compare(password, password_ret);
    if (isMatch) {
        req.session.userId = user.rows[0].user_id;
        req.session.username = user.rows[0].username;
        await new Promise((resolve) => req.session.save(resolve));
        console.log("User logged in!!", req.session.userId);
        return res.status(200).json({ message: "Login successful" });
    }
    return res.status(400).json({ message: "Invalid Credentials" });
  }
  catch(error){
    console.log(error);
    return res.status(500).json({message: 'Error logging in'});
  }
});


// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
  console.log("login check");
  console.log(req.session.userId);
  console.log("Session: ", req.session);
  if(req.session.userId){
    return res.status(200).json({message: 'Logged in', username: req.session.username});
  }
  else{
    return res.status(400).json({message: 'Not logged in'});
  }
});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.post("/logout", (req, res) => {
  console.log("loggged out");
  try{
    req.session.destroy();
    return res.status(200).json({messgae: 'Logged out successfully'});
  }
  catch(error){
    return res.status(500).json({message: "Failed to log out"})
  }
});

////////////////////////////////////////////////////
// APIs for the products
// use correct status codes and messages mentioned in the lab document
// TODO: Fetch and display all products from the database
app.get("/list-products", async (req, res) => {
  try
  {
    if(!req.session.userId){
      return res.status(400).json({message: 'Unauthorized'});
    }
    const prods = await pool.query('SELECT * FROM products;');
    return res.status(200).json({message: 'Products fetched successfully',products: prods.rows});
  }
  catch(err)
  {
    return res.status(500).json({message: 'Error listing products'});
  }
});

// APIs for cart: add_to_cart, display-cart, remove-from-cart
// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", async (req, res) => {
  try
  {
    if(!req.session.userId){
      return res.status(400).json({message: 'Unauthorized'});
    }
    const {prodId, quantity} = req.body;
    const prod = await pool.query('SELECT * FROM products WHERE product_id = $1', [prodId]);
    if(prod.rows.length !== 1){
      return res.status(400).json({message: 'Invalid product ID'});
    }
    if(prod.rows[0].stock_quantity < quantity){
      return res.status(400).json({message: "Insufficient stock for ${prod.rows[0].name}."});
    }
    await pool.query('INSERT INTO cart (user_id, item_id, quantity) VALUES ($1,$2,$3)', [req.session.userId, prod.rows[0].product_id, quantity]);
    return res.status(200).json({ message: "Successfully added ${quantity} of ${prod.rows[0].name} to your cart."});

  }
  catch(err)
  {
    return res.status(500).json({message: 'Error adding to cart'});
  }
});

// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", async (req, res) => {
  try
  {
    if(!req.session.userId){
      return res.status(400).json({message: 'Unauthorized'});
    }
    const cart_matches = await pool.query('SELECT c.item_id,p.product_id, p.name, c.quantity, p.price, (c.quantity * p.price) AS total_item_price FROM cart c JOIN products p ON c.item_id = p.product_id AND c.user_id = $1 ',[res.session.userId]);
    const cart = cart_matches.rows;
    if(cart.length === 0){
      return res.status(200).json({ message: "No items in cart.", cart: [], totalPrice: 0})
    }
    let tot = 0;
    cart.forEach(item => {
      tot += item.total_item_price;
    });
    return res.status(200).json({ message: "Cart fetched successfully.", cart, totalPrice: tot})

    
  }
  catch(err)
  {
    return res.status(500).json({message: 'Error fetching cart.'});
  }
});

// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", async (req, res) => {
  try
  {
    if(!req.session.userId){
      return res.status(400).json({message: 'Unauthorized'});
    }
    const {productId} = req.body;
    const prod = await pool.query("SELECT * FROM cart WHERE item_id = $1 AND user_id=$2",[productId,req.session.userId]);
    if(!prod.rows.length > 0){
      return res.status(400).json({ message: "Item not present in your cart."});
    }
    await pool.query('DELETE FROM cart WHERE item_id = $1 AND user_id = $2', [productId,req.session.userId]);
    return res.status(200).json({ message: "Item removed from your cart successfully." });
  }
  catch(err)
  {
    return res.status(500).json({message: 'Error removing item from cart'});
  } 

});
// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", async (req, res) => {
  try
  {
    if(!req.session.userId){
      return res.status(400).json({message: 'Unauthorized'});
    }
    const {productId, quantity} = req.body;
    
    //get details of the product in the cart.
    const product = await pool.query('SELECT * FROM cart WHERE item_id = $1 AND user_id = $2', [productId,req.session.userId]);
    const product_list_item = await pool.query('SELECT * FROM products WHERE product_id = $1',[productId]);
    if(quantity === 0){
      return res.status(200).json({ message: "Cart updated successfully" });
    }
    if(product.rows.length > 0){
      const total_qt = product.rows[0].quantity + quantity;
      const qt_avail = product_list_item.rows[0].quantity;
      // update is needed and normal
      if(total_qt < qt_avail && total_qt> 0){
        await pool.query('UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3', [total_qt,req.sessionID.userId,productId]);
        return res.status(200).json({ message: "Cart updated successfully" });
      }
      // item should be removed
      else if(total_qt < 0){
        await pool.query('DELETE FROM cart WHERE user_id = $1 AND item_id = $2',[req.session.userId,productId]);
        return res.status(200).json({ message: "Cart updated successfully" });
      }
      // item demand exceeds availiblity
      else{
        return res.status(400).json( { message: "Requested quantity exceeds available stock"});
      }
    }
    else{
      // new item
      if(quantity < 0){
        throw "quantity negative for new item.";
      }
      await pool.query('INSERT INTO cart (item_id,user_id, quantity) VALUES ($1,$2,$3)',[productId,req.sessionID.userId]);
      return res.status(200).json({ message: "Cart updated successfully" });
    }
  }
  catch(err)
  {
    return res.status(500).json({message: 'Error updating cart'});
  }
});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", async (req, res) => {
  try
  {
    if(!req.session.userId){
      return res.status(400).json({message: 'Unauthorized'});
    }
    const order_items = await pool.query('SELECT c.item_id,p.product_id, p.name, c.quantity, p.price, p.stock_quantity FROM cart c JOIN products p ON c.item_id == p.product_id AND c.user_id = $1',[req.session.userId]);

    if(order_items.rows.length <= 0){
      return res.status(400).json( "Cart is empty");
    }

    let tot_amt = 0;
    order_items.rows.forEach(elem =>{
      tot_amt += elem.total_item_price;
      if(elem.quantity > elem.stock_quantity){
        return res.status(400).json({message: "Insufficient stock for ${elem.name}"});
      }
    });

    await pool.query('BEGIN');
    const orderId = await pool.query('INSERT INTO orders (user_id, order_date, total_amount) VALUES ($1,$2,$3) RETURNING order_id',[req.session.userId, new Date(),tot_amt]);
    // storing the order_id in session state
    // req.session.orderId = orderId;
    //initiate 
    await Promise.all(order_items.rows.map(elem => {
      pool.query('INSERT INTO orderitems (order_id, product_id,quantity,price) VALUES ($1,$2,$3,$4)', orderId,elem.product_id,elem.quantity,elem.price);
    }));
    await pool.query('COMMIT')
    return res.status(200).json({ message: "Order placed successfully"});
    
    
  }
  catch(err)
  {
    pool.query('ROLLBACK');
    return res.status(500).json({message: 'Error placing order'});
  }
});

// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", async (req, res) => {
  try
  {
    // assuming that order confirmation only occurs after order is placed.
    // storing the orderId in session 
    // othereise can user select * from orders where user_id = $1 ORDER BY order_dat DESC; and get the first row.
    // But it seems have to use the query only.
    const latest_order = await pool.query('select * from orders where user_id = $1 ORDER BY order_dat DESC LIMIT 1');
    if(!latest_order.rows.length > 0){
      return res.status(400).json({message: 'Order not found'});
    }
    const ordr = await pool.query('SELECT * FROM orders WHERE order_id = $1', [req.session.orderId]);
    const ordr_items = await pool.query('SELECT o.order_id, o.product_id, o.quantity, o.price, p.name AS product_name FROM order_items o JOIN products p ON o.product_id = p.product_id WHERE o.order_id = $1',[req.session.orderId]);
    // delete req.session.orderId;
    return res.status(200).json({message: 'Order fetch successfully',order:ordr.rows[0], orderItems: ordr_items.rows});
    

  }
  catch(err)
  {
    return res.status(500).json({message: 'Error fetching order details'});
  }
});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});