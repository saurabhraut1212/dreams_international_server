import AuthorBook from "../models/authorBookModel.js";
import { imageValidator, generateRandomNumber, removeImage } from "../utils/helper.js";
import path from "path";

export const addAuthorBook = async (req, res) => {
    try {
        const { title, description, author, publishDate, price, tags, status } = req.body;


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
                author,
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

export const updateAuthorBook = async (req, res) => {
    try {
        const { title, description, author, publishDate, price, tags, status } = req.body;
        const { id } = req.params;
        const user = req.user;


        const book = await AuthorBook.findById(id);

        if (!book) {
            return res.status(400).json({ message: "Book with that id does not exist" });
        }

        if (user.id !== book.author.toString()) {
            return res.status(403).json({ message: "Unauthorized user" });
        }

        const cover = req?.files?.cover;
        if (cover) {
            const validationMessage = imageValidator(cover.size, cover.mimetype);
            if (validationMessage !== null) {
                return res.status(400).json({ message: validationMessage });
            }

            const imgExt = cover.name.split(".").pop();
            const imageName = generateRandomNumber() + "." + imgExt;
            const uploadPath = path.join(process.cwd(), "/public/images/", imageName);

            cover.mv(uploadPath, async (err) => {
                if (err) {
                    console.error("File upload error:", err);
                    return res.status(500).json({ message: "Cover image upload failed" });
                }


            });
            removeImage(book.cover);
        }

        book.title = title || book.title;
        book.description = description || book.description;
        book.author = author || book.author;
        book.publishDate = publishDate || book.publishDate;
        book.price = price || book.price;
        book.tags = tags || book.tags;
        book.status = status || book.status;

        await book.save();
        return res.status(200).json({ message: "Book updated successfully", book });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getBooksByAuthor = async (req, res) => {
    try {
        const { authorId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        if (pageNumber < 1 || pageSize < 1) {
            return res.status(400).json({ message: "Invalid pagination parameters" });
        }

        const skip = (pageNumber - 1) * pageSize;


        const books = await AuthorBook.find({ author: authorId }).skip(skip).limit(pageSize);
        const totalBooks = await AuthorBook.countDocuments({ author: authorId });

        return res.status(200).json({
            books,
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
}

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
