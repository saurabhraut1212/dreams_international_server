import express from "express";
import { addReview, getBooksByAuthor, getTopRatedBooks, readerLogin, readerRegister } from "../controller/readerController.js";
import verifyReader from "../middleware/verifyReader.js";

const router = express.Router();

router.post("/readerRegister", readerRegister);
router.post("/readerLogin", readerLogin);
router.post("/addReview", verifyReader, addReview);

//books 
router.get("/topRatedBooks", getTopRatedBooks);
router.get("/books/author/:authorId", getBooksByAuthor);


export default router;