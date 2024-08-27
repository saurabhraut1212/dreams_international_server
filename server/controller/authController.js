import Author from "../models/authorModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


export const authorRegister = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const author = await Author.findOne({ email });
        if (author) {
            return res.status(400).json("Author with that email is already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAuthor = await Author.create({
            name,
            email,
            password: hashedPassword
        });

        await newAuthor.save();
        return res.status(201).json({ message: "Author registered successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const authorLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const author = await Author.findOne({ email });
        if (!author) {
            return res.status(400).json({ message: "Author with that email is not exists" });
        }
        const matchedPassword = await bcrypt.compare(password, author.password);
        if (!matchedPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const data = {
            id: author._id,
            email: author.email
        }

        const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '365d' });
        return res.status(200).json({ message: "Author logged in successfully", token, author })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
