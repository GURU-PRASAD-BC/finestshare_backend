require("dotenv").config(); 
const express = require("express");
const session = require('express-session');
const passport = require('passport');
require('./config/passportSetup');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const prisma = require("./config/prismaClient"); 
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(express.json()); 
app.use(cors());        
app.use(session({ secret: 'iambatman', resave: false, saveUninitialized: true })); 
// app.use(helmet());       
// app.use(morgan("dev"));  

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/auth', userRoutes);

//checking
// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Splitwise backend is running!" });
// });

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); 
  }
});
