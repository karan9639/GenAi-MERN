import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';

const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`MongoDB Connected !!! Host: ${connectionInstance.connection.host} / ${connectionInstance.connection.name}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export {connectDB};