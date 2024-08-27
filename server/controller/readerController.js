import { Reader, Review } from "../models/readerModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthorBook from "../models/authorBookModel.js";

export const readerRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const reader = await Reader.findOne({ email });

        if (reader) {
            return res.status(400).json({ message: "Reader with that email id is already exists" });

        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newReader = await Reader.create({
            name,
            email,
            password: hashedPassword

        })
        await newReader.save();
        return res.status(201).json({ message: "Reader registered successfully", newReader })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const readerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const reader = await Reader.findOne({ email });

        if (!reader) {
            return res.status(400).json({ message: "Reader with that email id does not exists" });
        }
        const isMatchedPassword = await bcrypt.compare(password, reader.password);

        if (!isMatchedPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const data = {
            id: reader._id,
            email: reader.email
        }

        const token = jwt.sign(data, process.env.READER_JWT_SECRET, { expiresIn: '365d' });
        return res.status(200).json({ message: "Reader logged in successfully", token, reader })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const addReview = async (req, res) => {
    try {
        const { rating, message, bookId } = req.body;
        const { id: readerId } = req.user;

        const book = await AuthorBook.findOne(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }

        const newReview = new Review({
            book: bookId,
            reader: readerId,
            rating,
            message
        });

        await newReview.save();

        //add review to the readers document
        await Reader.findByIdAndUpdate(readerId, { $push: { reviews: newReview } });

        return res.status(201).json({ message: "New review added successfully", review: newReview })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
