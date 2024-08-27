import mongoose, { Schema } from "mongoose";

const authorBookSchema = new Schema({
    cover: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    publishDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" }
}, {
    timestamps: true
})

const AuthorBook = mongoose.models.AuthBookModel || mongoose.model("AuthorBook", authorBookSchema);
export default AuthorBook;