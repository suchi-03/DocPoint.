import jwt from "jsonwebtoken";

const authDoctor = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized – no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = { id: decoded.id };  

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token", error: error.message });
  }
};

export default authDoctor;
