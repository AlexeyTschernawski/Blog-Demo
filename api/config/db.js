import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 1,
        };

        mongoose.connection.on('connected', () => {
            console.log("Database Connected");
        });

        mongoose.connection.on('error', (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log("MongoDB disconnected");
        });

        await mongoose.connect(`${process.env.MONGODB_URL}/blog`, options);
        
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        
        setTimeout(connectDB, 5000); // Retry after 5 sec
    }
}

export default connectDB;