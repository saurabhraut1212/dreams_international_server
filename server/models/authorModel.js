import mongoose, { Schema } from "mongoose";

const authorSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, {
    timestamps: true
})

const Author = mongoose.models.Author || mongoose.model("Author", authorSchema);
export default Author;