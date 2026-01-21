const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { readJSON, writeJSON } = require("./utils");

const router = express.Router();
const SALT_ROUNDS = 10; // Jo høyere tall, jo bedre, men jo lenger tid
const JWT_SECRET = "secret-web-token"; // bytt ut

// Registrer ny bruker
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate Input
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "All fiels must are required" });
    }

    if (!["client", "worker"]) {
      return res
        .status(400)
        .json({ error: 'Role must be either "client" or "worker"' });
    }

    const users = await readJSON("users.json");

    // Sjekk hvis bruker finnes allerede
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash passord
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Lag ny bruker
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toString(),
    };

    users.push(newUser);
    await writeJSON("users.json", users);

    // Lag ny token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = await readJSON("users.json");
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    // Lag token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login Successfull",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Verify Token (sjekk om bruker alerede er logget inn)
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No Token Provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid Token" });
      }
      res.json({ user });
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
