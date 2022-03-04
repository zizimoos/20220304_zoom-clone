import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const sockets = [];
const makeMessage = (data) => {
  return JSON.parse(data);
};

wss.on("connection", (socket) => {
  console.log("New connection", sockets.length);
  socket["nickname"] = "Anonymous";
  sockets.push(socket);
  socket.send("Hello, world!");

  socket.on("message", (message) => {
    const data = makeMessage(message);
    switch (data.type) {
      case "nickname":
        socket["nickname"] = data.payload;
        break;
      case "message":
        sockets.forEach((s) => {
          s.send(`${socket["nickname"]}: ${data.payload}`);
        });
        break;
      default:
        console.log("Unknown message type:", data.type);
    }
  });

  socket.on("close", () => {
    console.log("Connection closed");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
