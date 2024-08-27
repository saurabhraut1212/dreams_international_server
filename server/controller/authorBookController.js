import AuthorBook from "../models/authorBookModel.js";
import { imageValidator, generateRandomNumber } from "../utils/helper.js";
import path from "path";

export const addAuthorBook = async (req, res) => {
    try {
        const { title, description, author, publishDate, price, tags } = req.body;


        if (!req.files || !req.files.cover) {
            return res.status(400).json({ message: "Cover image is required" });
        }

        const coverImage = req.files.cover;


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
                tags
            });

            await newBook.save();
            return res.status(201).json({ message: "Book added successfully", book: newBook });
        });

    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
