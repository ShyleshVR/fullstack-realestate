import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
dotenv.config();

mongoose.connect(process.env.MONGO).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB', err);
})

const app = express();
const port = 3000;

app.listen(port, () => {
    console.log("Server Running on Port Number : 3000")
    }
);

app.use('/api/user',userRouter);