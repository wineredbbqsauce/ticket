const fs = require("fs").promises;
const path = require("path");
const { app: electronApp } = require("electron");
const { getDefaultResultOrder } = require("dns");

// hent data directory path (Electron user data folder)
function getDataPath() {
  const userDataPath = electronApp.getPath("userData");
  return path.join(userDataPath, "data");
}

// Les JSON fil
async function readJSON(filename) {
  try {
    const dataPath = getDataPath;
    const filePath = path.join(dataPath, filename);
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Skriv JSON fil
async function writeJSON(filename, data) {
  try {
    const dataPath = getDataPath;
    const filePath = path.join(dataPath, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

// Initialize data files
async function initializeDataFiles() {
  const dataPath = getDataPath();

  try {
    await fs.mkdir(dataPath, { recursive: true });

    // initialize user.json
    const usersPath = path.join(dataPath, "user.json");
    try {
      await fs.access(usersPath);
    } catch {
      await fs.writeFile(usersPath, JSON.stringify([], null, 2));
      console.log("Created users.json");
    }

    // initialize tickets.json
    const ticketsPath = path.join(dataPath, "tickets.json");
    try {
      await fs.access(ticketsPath);
    } catch {
      await fs.writeFile(ticketsPath, JSON.stringify([], null, 2));
      console.log("Created tickets.json");
    }
  } catch (error) {
    console.error("Error initializing data files:", error);
  }
}

module.exports = {
  getDataPath,
  readJSON,
  writeJSON,
  initializeDataFiles,
};
