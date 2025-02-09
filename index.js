import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from './routes/user.route.js'
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use("/api/user", userRoute);


mongoose.connect(process.env.MONGO).then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log(err);
})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
