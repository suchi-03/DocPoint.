import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Connection options for better performance
        const options = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 2, // Maintain at least 2 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
        };

        // Disable mongoose buffering (commands fail immediately if not connected)
        mongoose.set('bufferCommands', false);

        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/docpoint`, options);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;