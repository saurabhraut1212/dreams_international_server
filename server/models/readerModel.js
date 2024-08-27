import mongoose, { Schema } from "mongoose";


const reviewSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: "AuthorBook", required: true },
    reader: { type: Schema.Types.ObjectId, ref: "Reader", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    message: { type: String, required: true },
    reviewDate: { type: Date, default: Date.now }
}, {
    timestamps: true
})
const readerSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]

}, {
    timestamps: true
})

const Reader = mongoose.models.Reader || mongoose.model("Reader", readerSchema);
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export { Reader, Review };