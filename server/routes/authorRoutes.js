import express from "express";
import { authorLogin, authorRegister } from "../controller/authController.js";

const router = express.Router();

router.post("/authorRegister", authorRegister);
router.post("/authorLogin", authorLogin)


export default router;