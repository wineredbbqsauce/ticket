const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());

// Routes, bcrypt logic, JSON storage:

function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
      resolve(server);
    });
  });
}
