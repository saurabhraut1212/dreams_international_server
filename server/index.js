import express, { urlencoded } from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import "dotenv/config";
import path from "path";

import dbConnect from "./db/dbconfig.js";

import AuthorRoutes from "./routes/authorRoutes.js";
import AuthorBookRoutes from "./routes/authorBookRoutes.js";
import ReaderRoutes from "./routes/readerRoutes.js"
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//database connection
dbConnect();


//middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(urlencoded({ extended: false }));
app.use(fileUpload());
app.use('/public/images', express.static(path.join(__dirname, 'public/images')));


app.get("/", (req, res) => {
    res.send("Server started")
})

const PORT = process.env.PORT || 8000;

//api routes
app.use('/api/auth', AuthorRoutes);
app.use('/api/book', AuthorBookRoutes);
app.use("/api/reader", ReaderRoutes)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})