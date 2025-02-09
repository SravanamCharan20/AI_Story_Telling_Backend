import express from "express";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        if (!user) {
            return res.status(400).json({ message: "User not created" });
        }
        res.status(201).json({message: "User created successfully", user});
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }
        res.status(200).json({message: "User logged in successfully", user});
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});

export default router;