import express from "express";
import { addReview, readerLogin, readerRegister } from "../controller/readerController.js";
import verifyReader from "../middleware/verifyReader.js";

const router = express.Router();

router.post("/readerRegister", readerRegister);
router.post("/readerLogin", readerLogin);
router.post("/addReview", verifyReader, addReview);

export default router;