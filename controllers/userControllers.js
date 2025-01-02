const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prismaClient");
const { signUpSchema, signInSchema } = require("../utils/schemaValidation");

const JWT_SECRET = process.env.JWT_SECRET || "jwt";
const SALT_ROUNDS = process.env.SALT_ROUNDS || 5;

// User Sign-Up
exports.signUp = async (req, res) => {
  try {
    const { error } = signUpSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email is already registered." });

    const hashedPassword = await bcrypt.hash(password,parseInt(SALT_ROUNDS));

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// User Sign-In
exports.logIn = async (req, res) => {
  try {
    const { error } = signInSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(404).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.userID, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
