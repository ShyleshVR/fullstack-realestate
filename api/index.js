import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
dotenv.config();

mongoose.connect(process.env.MONGO).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB', err);
})

const app = express();
app.use(express.json());
app.use(cookieParser());
const port = 3000;

app.listen(port, () => {
    console.log("Server Running on Port Number : 3000")
    }
);

app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);

app.use((err,req,res,next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error Occured";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});