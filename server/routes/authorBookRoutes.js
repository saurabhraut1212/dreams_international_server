import express from "express";

const router = express.Router();
import verifyToken from "../middleware/verifyToken.js";
import { addAuthorBook, updateAuthorBook } from "../controller/authorBookController.js";

router.post("/addAuthorBook", verifyToken, addAuthorBook);
router.put("/updateAuthorBook/:id", verifyToken, updateAuthorBook);
export default router;