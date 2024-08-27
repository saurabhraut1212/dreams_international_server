import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    const headerToken = req.headers.authorization;

    if (!headerToken || !headerToken.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = headerToken.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token verification failed" });
        };
        req.user = user;
        next();
    })

}

export default verifyToken;