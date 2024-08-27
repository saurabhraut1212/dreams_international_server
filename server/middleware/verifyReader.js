import jwt from "jsonwebtoken";

const verifyReader = (req, res, next) => {
    const readerHeader = req.headers.authorization;
    if (!readerHeader || !readerHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const token = readerHeader.split(" ")[1];
    jwt.verify(token, process.env.READER_JWT_SECRET, (err, reader) => {
        if (err) {
            return res.status(403).json({ message: "Token verification failed" });
        }
        req.reader = reader;
        next();
    })
}

export default verifyReader;