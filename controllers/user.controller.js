import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists" 
      });
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "User not created" 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        name: user.name, 
        email: user.email
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res
      .cookie('access_token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour in milliseconds
      })
      .status(201)
      .json({
        success: true,
        user: {
          _id: user._id,
          username: user.name,
          email: user.email,
        },
        timestamp: new Date().toISOString()
      });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error creating user", 
      error: error.message 
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        name: user.name, 
        email: user.email
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res
      .cookie('access_token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 
      })
      .status(200)
      .json({
        success: true,
        user: {
          _id: user._id,
          username: user.name,
          email: user.email,
        },
        timestamp: new Date().toISOString()
      });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error logging in", 
      error: error.message 
    });
  }
};