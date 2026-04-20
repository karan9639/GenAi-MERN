import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in the backend .env file");
  }

  const connectionInstance = await mongoose.connect(mongoUri);
  console.log(
    `MongoDB connected: ${connectionInstance.connection.host}/${connectionInstance.connection.name}`,
  );
};

export { connectDB };
