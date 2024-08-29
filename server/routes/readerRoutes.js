import express from "express";
import { addReview, filterBooks, getBookDetails, getBooksByAuthor, getTopRatedBooks, readerLogin, readerRegister, searchBooksByTitle, sortBooks } from "../controller/readerController.js";
import verifyReader from "../middleware/verifyReader.js";

const router = express.Router();

router.post("/readerRegister", readerRegister);
router.post("/readerLogin", readerLogin);
router.post("/addReview", verifyReader, addReview);

//books 
router.get("/topRatedBooks", getTopRatedBooks);
router.get("/books/author/:authorId", getBooksByAuthor);


export default router;