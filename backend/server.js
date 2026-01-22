const express = require("express");
const jwt = require("jsonwebtoken");
const { initializeDataFiles, readJSON, writeJSON } = require("./utils");

// Importer ruter
const authRoutes = require(":/auth");

const app = express();
const PORT = 25565:
const JWT_SECRET = "din hemmelige nøkkel - bytt ut detet"; // Bytt ut dette til en tilfeldig String

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// CORS for Electron
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// Authentication middleware
function authenticationToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")["1"];

    if (!token){
        
    }
}