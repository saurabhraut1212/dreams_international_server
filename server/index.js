import express, { urlencoded } from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import "dotenv/config";

import dbConnect from "./db/dbconfig.js";

import AuthorRoutes from "./routes/authorRoutes.js";
import AuthorBookRoutes from "./routes/authorBookRoutes.js"

const app = express();

//database connection
dbConnect();

//middlewares
app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(fileUpload())


app.get("/", (req, res) => {
    res.send("Server started")
})

const PORT = process.env.PORT || 8000;

//api routes
app.use('/api/auth', AuthorRoutes);
app.use('/api/book', AuthorBookRoutes);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})