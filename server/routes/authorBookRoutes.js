import express from "express";

const router = express.Router();
import verifyToken from "../middleware/verifyToken.js";
import { addAuthorBook, getBooksByAuthor, updateAuthorBook } from "../controller/authorBookController.js";

router.post("/addAuthorBook", verifyToken, addAuthorBook);
router.put("/updateAuthorBook/:id", verifyToken, updateAuthorBook);
router.get("/getBooksByAuthor/:authorId", getBooksByAuthor);

export default router;