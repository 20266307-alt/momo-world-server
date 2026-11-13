const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 10000;
const MAX_PLAYERS = 10;
const WORLD_LIMIT = 95;
const players = new Map();

app.get("/", (_req, res) => {
  res.type("text").send("Momo World multiplayer server is running.");
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    game: "Momo World",
    players: players.size,
    maxPlayers: MAX_PLAYERS
  });
});

function cleanName(value) {
  if (typeof value !== "string") return "친구";
  const name = value.trim().replace(/[<>]/g, "").slice(0, 18);
  return name || "친구";
}

function publicPlayers() {
  return Array.from(players.values()).map(player => ({
    id: player.id,
    name: player.name,
    x: player.x,
    z: player.z,
    rotation: player.rotation
  }));
}

function broadcastState() {
  const list = publicPlayers();
  io.emit("state", { players: list });
  io.emit("player-count", list.length);
}

io.on("connection", socket => {
  // The Canva game sends "join" after the Socket.IO connection is established.
  socket.on("join", data => {
    if (players.has(socket.id)) return;

    if (players.size >= MAX_PLAYERS) {
      socket.emit("room-full");
      socket.disconnect(true);
      return;
    }

    players.set(socket.id, {
      id: socket.id,
      name: cleanName(data && data.name),
      x: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 8,
      rotation: 0,
      lastMoveAt: 0
    });

    broadcastState();
  });

  // The current Canva game sends absolute world coordinates.
  // Clamp values on the server so clients cannot leave the playable area.
  socket.on("move", data => {
    const player = players.get(socket.id);
    if (!player || !data) return;

    const x = Number(data.x);
    const z = Number(data.z);
    const rotation = Number(data.rotation);

    if (!Number.isFinite(x) || !Number.isFinite(z)) return;

    const now = Date.now();
    if (now - player.lastMoveAt < 35) return;
    player.lastMoveAt = now;

    player.x = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, x));
    player.z = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, z));
    if (Number.isFinite(rotation)) {
      player.rotation = Math.max(-Math.PI * 4, Math.min(Math.PI * 4, rotation));
    }
  });

  socket.on("disconnect", () => {
    if (players.delete(socket.id)) broadcastState();
  });
});

// Send a fresh snapshot regularly so all connected browsers see movement.
setInterval(broadcastState, 100);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Momo World server listening on port ${PORT}`);
});

