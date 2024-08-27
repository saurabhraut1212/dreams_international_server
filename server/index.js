import express, { urlencoded } from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: false }));


app.get("/", (req, res) => {
    res.send("Server started")
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})