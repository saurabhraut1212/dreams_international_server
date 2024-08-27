import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Connected to the database");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default dbConnect;