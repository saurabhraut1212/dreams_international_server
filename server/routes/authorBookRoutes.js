import express from "express";

const router = express.Router();
import verifyToken from "../middleware/verifyToken.js";
import { addAuthorBook, deleteAuthorBook, getBookById, getBooksByAuthor, updateAuthorBook } from "../controller/authorBookController.js";

router.post("/addAuthorBook", verifyToken, addAuthorBook);
router.put("/updateAuthorBook/:bookId", verifyToken, updateAuthorBook);
router.get("/getBooksByAuthor/:authorId", verifyToken, getBooksByAuthor);
router.get("/getBook/:bookId", verifyToken, getBookById);
router.delete("/deleteAuthorBook/:bookId", verifyToken, deleteAuthorBook);

export default router;