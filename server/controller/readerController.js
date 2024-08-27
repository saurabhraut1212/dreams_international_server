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

        const book = await AuthorBook.findById(bookId);
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
        await Reader.findByIdAndUpdate(readerId, { $push: { reviews: newReview._id } });

        return res.status(201).json({ message: "New review added successfully", review: newReview })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getTopRatedBooks = async (req, res) => {
    try {
        const books = await AuthorBook.find({ status: "published" }).sort({ rating: -1 }).limit(10);
        if (!books) {
            return res.status(400).json({ message: "No top rated books" })
        }
        return res.status(200).json(books);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

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

export const searchBooksByTitle = async (req, res) => {
    const { title } = req.query;
    try {
        const books = await AuthorBook.find({ title: { $regex: title, $options: 'i' }, status: 'published' });
        if (!books) {
            return res.status(400).json({ message: "No books with that title" })
        }
        return res.status(200).json(books);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const filterBooks = async (req, res) => {
    const { minPrice, maxPrice, tags, minRating } = req.query;

    let query = { status: 'published' };

    if (minPrice || maxPrice) {
        query.price = { $gte: minPrice || 0, $lte: maxPrice || infinity }
    }

    if (tags) {
        query.tags = { $in: tags.split(",") };
    }

    if (minRating) {
        query.rating = { $gte: minRating };
    }

    try {
        const books = await AuthorBook.find(query);
        if (!books) {
            return res.status(400).json({ message: "No books with that provided criteria" })
        }
        return res.status(200).json(books);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const sortBooks = async (req, res) => {
    const { sortBy } = req.query;

    let sortCriteria;
    switch (sortBy) {
        case "price-asc":
            sortCriteria = { price: 1 };
            break;
        case "price-desc":
            sortCriteria = { price: -1 };
            break;
        case "publish-date-asc":
            sortCriteria = { publishDate: 1 };
            break;
        case "publish-date-desc":
            sortCriteria = { publishDate: -1 };
            break;
        case "rating-asc":
            sortCriteria = { rating: 1 };
            break;
        case "rating-desc":
            sortCriteria = { rating: -1 };
            break;
        default:
            sortCriteria = {};
    }

    try {
        const books = await AuthorBook.find({ status: "published" }).sort(sortCriteria);
        return res.status(200).json(books);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getBookDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const book = await AuthorBook.findById(id).populate("author", "name");
        if (!book || !book.published) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json(book);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

