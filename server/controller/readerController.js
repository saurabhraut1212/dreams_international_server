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
        const { id: readerId } = req.reader;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const book = await AuthorBook.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        const result = await book.updateOne({
            $push: {
                reviews: {
                    reader: readerId,
                    rating,
                    message,
                    reviewDate: new Date()
                }
            }
        });


        if (!result) {
            return res.status(500).json({ message: "Failed to add the review" });
        }

        return res.status(201).json({ message: "Review added successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const getTopRatedBooks = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status, sortByDate = '', sortByRating = '' } = req.query;

        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        if (pageNumber < 1 || pageSize < 1) {
            return res.status(400).json({ message: "Invalid pagination parameters" });
        }

        const skip = (pageNumber - 1) * pageSize;

        const filter = { status: 'published' };

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        if (status) {
            filter.status = status;
        }

        const sortOptions = {};
        if (sortByRating === 'asc') {
            sortOptions.averageRating = 1;
        } else if (sortByRating === 'desc') {
            sortOptions.averageRating = -1;
        } else {
            sortOptions.averageRating = -1;
        }

        if (sortByDate === 'asc') {
            sortOptions.publishDate = 1;
        } else if (sortByDate === 'desc') {
            sortOptions.publishDate = -1;
        }

        const books = await AuthorBook.find(filter)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'reader',
                    select: 'name email'
                }
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);

        console.log(books, "fetched books");

        const booksWithAverageRating = books.map(book => {
            const totalReviews = book.reviews.length;
            const averageRating = totalReviews > 0
                ? (book.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
                : '0.0';

            return {
                ...book._doc,
                averageRating: averageRating,
                coverImageUrl: `${req.protocol}://${req.get('host')}/public/images/${book.cover}`
            };
        });

        const totalBooks = await AuthorBook.countDocuments(filter);

        return res.status(200).json({
            books: booksWithAverageRating,
            pagination: {
                currentPage: pageNumber,
                pageSize,
                totalBooks,
                totalPages: Math.ceil(totalBooks / pageSize)
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const getBooksByAuthor = async (req, res) => {
    const { authorId } = req.params;
    try {
        const books = await AuthorBook.find({ author: authorId, status: "published" });
        if (!books) {
            return res.status(400).json({ message: "No books with that author id" })
        }
        return res.status(200).json(books);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}


