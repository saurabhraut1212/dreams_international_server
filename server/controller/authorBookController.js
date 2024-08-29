import AuthorBook from "../models/authorBookModel.js";
import { imageValidator, generateRandomNumber, removeImage } from "../utils/helper.js";
import path from "path";
import fs from "fs";

export const addAuthorBook = async (req, res) => {
    try {
        const { title, description, publishDate, price, tags, status } = req.body;
        const authorId = req.user.id;

        if (!req.files || !req.files.cover) {
            return res.status(400).json({ message: "Cover image is required" });
        }

        const coverImage = req?.files?.cover;


        const validationMessage = imageValidator(coverImage.size, coverImage.mimetype);
        if (validationMessage !== null) {
            return res.status(400).json({ message: validationMessage });
        }


        const imgExt = coverImage.name.split(".").pop();
        const imageName = generateRandomNumber() + "." + imgExt;
        const uploadPath = path.join(process.cwd(), "/public/images/", imageName);


        coverImage.mv(uploadPath, async (err) => {
            if (err) {
                console.error("File upload error:", err);
                return res.status(500).json({ message: "Cover image upload failed" });
            }

            console.log("Cover image successfully uploaded to", uploadPath);


            const newBook = await AuthorBook.create({
                cover: imageName,
                title,
                description,
                author: authorId,
                publishDate,
                price,
                tags,
                status: status || 'draft'
            });

            await newBook.save();
            return res.status(201).json({ message: "Book added successfully", book: newBook });
        });

    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getBookById = async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await AuthorBook.findById(bookId);
        if (!book) {
            return res.status(400).json({ message: "Book with that id does not exists" });
        }
        return res.status(200).json({ book });
    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const updateAuthorBook = async (req, res) => {
    try {
        const { title, description, publishDate, price, tags, status } = req.body;
        const { bookId } = req.params;
        const user = req.user;

        const book = await AuthorBook.findById(bookId);

        if (!book) {
            return res.status(400).json({ message: "Book with that id does not exist" });
        }

        if (user.id !== book.author.toString()) {
            return res.status(403).json({ message: "Unauthorized user" });
        }

        let imageName = book.cover; // Default to the current cover


        const cover = req?.files?.cover;
        if (cover) {
            const validationMessage = imageValidator(cover.size, cover.mimetype);
            if (validationMessage !== null) {
                return res.status(400).json({ message: validationMessage });
            }

            const imgExt = cover.name.split(".").pop();
            imageName = generateRandomNumber() + "." + imgExt;
            const uploadPath = path.join(process.cwd(), "/public/images/", imageName);

            await cover.mv(uploadPath);


            if (book.cover) {
                removeImage(book.cover);
            }
        }


        book.title = title || book.title;
        book.description = description || book.description;
        book.publishDate = publishDate || book.publishDate;
        book.price = price || book.price;
        book.tags = tags || book.tags;
        book.status = status || book.status;
        book.cover = imageName;

        await book.save();


        const baseURL = `${req.protocol}://${req.get('host')}`;
        const coverImageUrl = `${baseURL}/public/images/${book.cover}`;

        return res.status(200).json({
            message: "Book updated successfully",
            book: {
                ...book._doc,
                coverImageUrl
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getBooksByAuthor = async (req, res) => {
    try {
        const { authorId } = req.params;
        const { page = 1, limit = 10, search = '', status = '', sortByDate = '', sortByRatings = '' } = req.query;

        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        if (pageNumber < 1 || pageSize < 1) {
            return res.status(400).json({ message: "Invalid pagination parameters" });
        }

        const skip = (pageNumber - 1) * pageSize;
        const filter = { author: authorId };

        if (search) {
            filter.title = { $regex: search.trim(), $options: 'i' };
        }

        if (status) {
            filter.status = status;
        }

        const sortOptions = {};
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


        if (sortByRatings === 'asc') {
            booksWithAverageRating.sort((a, b) => a.averageRating - b.averageRating);
        } else if (sortByRatings === 'desc') {
            booksWithAverageRating.sort((a, b) => b.averageRating - a.averageRating);
        }


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
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllBooks = async (req, res) => {
    try {
        const books = await AuthorBook.find({});
        if (!books) {
            return res.status(400).json({ message: "Books not found" })
        }
        return res.status(200).json(books);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteAuthorBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const authorId = req.user.id;

        const book = await AuthorBook.findById(bookId);
        if (!book) {
            return res.status(400).json({ message: "Book not found" });
        }

        if (authorId !== book.author.toString()) {
            return res.status(400).json({ message: "Unauthorized user" });
        }

        const coverImagePath = path.join(process.cwd(), '/public/images/', book.cover);

        await AuthorBook.findByIdAndDelete(bookId);

        if (fs.existsSync(coverImagePath)) {
            fs.unlink(coverImagePath, (err) => {
                if (err) {
                    console.error("Error deleting cover image:", err);
                    return res.status(500).json({ message: "Error deleting cover image" });
                }
                console.log("Cover image deleted successfully");
            });
        }

        return res.status(200).json({ message: "Book deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};