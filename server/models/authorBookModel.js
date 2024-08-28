import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
    reader: { type: Schema.Types.ObjectId, ref: "Reader", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    message: { type: String, required: true },
    reviewDate: { type: Date, default: Date.now }
}, {
    _id: false
});

const authorBookSchema = new Schema({
    cover: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    publishDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    reviews: [reviewSchema]
}, {
    timestamps: true
});

const AuthorBook = mongoose.models.AuthorBook || mongoose.model("AuthorBook", authorBookSchema);
export default AuthorBook;
