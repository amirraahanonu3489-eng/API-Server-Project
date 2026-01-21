require("dotenv").config();
const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const USERS_FILE = "./users.json";
const CARDS_FILE = "./cards.json";

console.log("🔥 THIS SERVER.JS IS RUNNING 🔥");

function readJSON(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function writeJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ errorMessage: "Missing token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ errorMessage: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

//
app.post("/getToken", (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ errorMessage: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ successMessage: "Authentication successful", token });
});

// get all cards (filtering)
app.get("/cards", (req, res) => {
  let cards = readJSON(CARDS_FILE);

  for (let key in req.query) {
    cards = cards.filter(card => {
      if (!(key in card)) return false;

      if (typeof card[key] === "number") {
        return card[key] === Number(req.query[key]);
      }

      return card[key] === req.query[key];
    });
  }

  res.json({ successMessage: "Cards retrieved", cards });
});

// create card
app.post("/cards/create", authenticateToken, (req, res) => {
  const cards = readJSON(CARDS_FILE);
  const newCard = req.body;

  if (cards.some((c) => c.id === newCard.id)) {
    return res.status(400).json({ errorMessage: "Card ID must be unique" });
  }

  cards.push(newCard);
  writeJSON(CARDS_FILE, cards);

  res.json({ successMessage: "Card created", card: newCard });
});

// update card
app.put("/cards/:id", authenticateToken, (req, res) => {
  const cards = readJSON(CARDS_FILE);
  const id = parseInt(req.params.id);

  const index = cards.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(400).json({ errorMessage: "Card not found" });
  }

  if (
    req.body.id &&
    req.body.id !== id &&
    cards.some((c) => c.id === req.body.id)
  ) {
    return res.status(400).json({ errorMessage: "Card ID must be unique" });
  }

  cards[index] = { ...cards[index], ...req.body };
  writeJSON(CARDS_FILE, cards);

  res.json({ successMessage: "Card updated", card: cards[index] });
});

// delete card
app.delete("/cards/:id", authenticateToken, (req, res) => {
  let cards = readJSON(CARDS_FILE);
  const id = parseInt(req.params.id);

  const card = cards.find((c) => c.id === id);
  if (!card) {
    return res.status(400).json({ errorMessage: "Card not found" });
  }

  cards = cards.filter((c) => c.id !== id);
  writeJSON(CARDS_FILE, cards);

  res.json({ successMessage: "Card deleted", card });
});

// optional
app.get("/sets", (req, res) => {
  const cards = readJSON(CARDS_FILE);
  const sets = [...new Set(cards.map((c) => c.set))];
  res.json({ sets });
});

app.get("/types", (req, res) => {
  const cards = readJSON(CARDS_FILE);
  const types = [...new Set(cards.map((c) => c.type))];
  res.json({ types });
});

app.get("/rarities", (req, res) => {
  const cards = readJSON(CARDS_FILE);
  const rarities = [...new Set(cards.map((c) => c.rarity))];
  res.json({ rarities });
});

app.get("/cards/count", (req, res) => {
  const cards = readJSON(CARDS_FILE);
  res.json({ count: cards.length });
});

app.get("/cards/random", (req, res) => {
  const cards = readJSON(CARDS_FILE);
  const random = cards[Math.floor(Math.random() * cards.length)];
  res.json({ card: random });
});

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ errorMessage: "Server error" });
});

// ---------- START SERVER ----------
app.listen(3000, () => {
  console.log("API server running on port 3000");
});
