import express from "express";

const router = express.Router();
import verifyToken from "../middleware/verifyToken.js";
import { addAuthorBook } from "../controller/authorBookController.js";

router.post("/addAuthorBook", verifyToken, addAuthorBook)
export default router;