const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let ranking = [];

io.on("connection", (socket) => {
  console.log("Nuevo jugador conectado:", socket.id);

  socket.on("nuevoJugador", (nombre) => {
    socket.data.nombre = nombre;
    socket.data.puntos = 0;
    io.emit("rankingActualizado", ranking);
  });

  socket.on("actualizarPuntos", (puntos) => {
    socket.data.puntos = puntos;
    ranking = ranking.filter(j => j.nombre !== socket.data.nombre);
    ranking.push({ nombre: socket.data.nombre, puntos });
    ranking.sort((a, b) => b.puntos - a.puntos);
    ranking = ranking.slice(0, 10);
    io.emit("rankingActualizado", ranking);
  });

  socket.on("disconnect", () => {
    ranking = ranking.filter(j => j.nombre !== socket.data.nombre);
    io.emit("rankingActualizado", ranking);
    console.log("Jugador desconectado:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
