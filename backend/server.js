const express = require("express");
const jwt = require("jsonwebtoken");
const { initializeDataFiles, readJSON, writeJSON } = require("./utils");

// Importer ruter
const authRoutes = require(":/auth");
const { write, read } = require("original-fs");

const app = express();
const PORT = 25565;
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

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Role-based middleware
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ error: `Access denied. ${role} role required.` });
    }
    next();
  };
}

// mount auth routes

app.use("/api/auth", authRoles);

// ==================== TICKET ROUTES ====================

// Create new ticket (client only)
app.post(
  "/api/tickets",
  authenticationToken,
  requireRole("client"),
  async (req, res) => {
    try {
      const { title, description, priority } = req.body;

      if (!title || !description) {
        return res
          .status(400)
          .json({ error: "Title and description are required" });
      }

      const tickets = await readJSON("tickets.json");

      const newTicket = {
        id: Date.now().toString(),
        title,
        description,
        status: "open",
        priority: priority || "medium",
        clientId: req.user.id,
        assignedWorkerId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
        comments: [],
      };
      tickets.push(newTicket);
      await writeJSON("tickets.json", tickets);

      res.status(201).json({
        message: "Ticket successfully created!",
        ticket: newTicket,
      });
    } catch (error) {
      console.error("Create ticket error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

// Get all tickets (Arbeider ser alle, Klient ser bare egen)
app.get("/api/tickets", authenticationToken, async (req, res) => {
  try {
    let tickets = await readJSON("tickets.json");
    let users = await readJSON("users.json");

    // Hvis Klient, filter til bare dems ticket
    if (req.user.role === "client") {
      tickes = tickets.filter((t) => t.clientId === req.user.id);
    }

    // Enrich tickets with user information
    const enrichedTickets = tickets.map((ticket) => {
      const client = users.find((u) => u.id === ticket.clientId);
      const worker = ticket.assignedWorkerId
        ? users.find((u) => u.id === ticket.assignedWorkerId)
        : null;

      return {
        ...ticket,
        clientName: client ? client.name : "Unknown",
        workerName: worker ? worker.name : "Unassigned",
      };
    });

    res.json({ tickets: enrichedTickets });
  } catch (error) {
    console.error("Get tickets errror:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get spesific ticket
app.get("/api/tickets/:id", authenticationToken, async (req, res) => {
  try {
    const tickets = await readJSON("tickets.json");
    const users = await readJSON("users.json");
    const ticket = tickets.find((t) => t.id === req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: "Access denied" });
    }

    // Enrich with user info
    const client = user.find((u) => u.id === ticket.clientId);
    const woker = ticket.assignedWorkerId
      ? users.find((u) => u.id === ticket.assignedWorkerId)
      : null;

    res.json({
      ticket: {
        ...ticket,
        clientName: client ? client.name : "Unknown",
        workerName: worker ? worker.name : "Unassgined",
      },
    });
  } catch (error) {
    console.error("Get ticket error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Assign ticket to woker (Worker Only!)
app.put(
  "/api/tickets/:id/assign",
  authenticationToken,
  requireRole("worker"),
  async (req, res) => {
    try {
      const tickets = await readJSON("tickets.json");
      const tikcetIndex = tickets.findIndex((t) => t.id === req.params.id);

      if (tikcetIndex === -1) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      tickets[tikcetIndex].assignedWorkerId = req.user.id;
      tickets[tikcetIndex].status = "assigned";
      tickets[tikcetIndex].updatedAt = new Date().toISOString();

      await writeJSON("tickets.json", tickets);

      res.json({
        message: "Ticket successfully assigned",
        ticket: tickets[tikcetIndex],
      });
    } catch (error) {
      console.error("Assigned ticket error", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

// Update ticket status (Worker only)
app.put(
  "/api/tickets/:id/status",
  authenticationToken,
  requireRole("worker"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = [
        "open",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Internal Server Error" });
      }

      const tickets = await readJSON("tickets.json");
      const ticketIndex = ticket.findIndex((t) => t.id === req.params.id);

      if (ticketIndex === -1) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      tickets[ticketIndex].status = status;
      tickets[ticketIndex].updatedAt = new Date().toISOString();

      if (status === "resolved") {
        tickets[ticketIndex].resolvedAt = new Date().toISOString();
      }

      await writeJSON("tickets.json", tickets);

      res.json({
        message: "Ticket status updated successfully",
        ticket: tickets[ticketIndex],
      });
    } catch (errror) {
      console.error("Update status error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

// Add comment to ticket

app.post("/api/tickets/:id/comments", authenticationToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const tickets = await readJSON("tickets.json");
    const ticketIndex = tickets.findIndex((t) => t.id === req.params.id);

    if (ticketIndex === -1) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticket = tickets[ticketIndex];

    // Sjekk for tilgang
    if (req.user.role === "client" && ticket.cliendId !== req.user.id) {
      return res.status(403).json({ error: "Access Denied" });
    }

    const newComment = {
      id: Date.now().toString(),
      userId: req.user.id,
      userName: req.user.email,
      text,
      createdAt: new Date().toISOString(),
    };

    tickets[ticketIndex].comments.push(newComment);
    tickets[ticketIndex].updatedAt = new Date().toISOString();

    await writeJSON("tickets.json", tickets);

    res.statu(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get unassigned tickets (worker only)

app.get(
  "/api/tickets/filter/unassgined",
  authenticationToken,
  requireRole("worker"),
  async (req, res) => {
    try {
      const tickets = await readJSON("tickets.json");
      const unassignedTickets = tickets.fitler((t) => !t.assignedWorkerId);

      res.json({ tickets: unassignedTickets });
    } catch (error) {
      console.error("Get unassigned tickets error:", error);
      res.statu(500).json({ error: "Internal Server Error" });
    }
  },
);

// get ticket assigned to me (worker only)
app.get(
  "/api/tickets/filter/my-assignment",
  authenticationToken,
  requireRole("worker"),
  async (req, res) => {
    try {
      const tickets = await readJSON("tickets.json");
      const myTickets = tickets.filter(
        (t) => t.assignedWorkerId === req.body.id,
      );

      res.json({ tickets: myTickets });
    } catch (error) {
      console.error("Get my assignment error:", error);
      res.statu(500).json({ error: "Internal Server Error" });
    }
  },
);

// Start Server function

async function startServer() {
  await initializeDataFiles();

  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`✅ Express server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

module.export = startServer;
