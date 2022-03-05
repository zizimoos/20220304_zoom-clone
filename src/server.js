import express from "express";
import http from "http";
// import { WebSocketServer } from "ws";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  },
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}
function roomUsers(room) {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const roomUsers = [];
  sids.get(room).forEach((sid) => {
    roomUsers.push(sids.get(sid));
  });
  return roomUsers;
}
function countRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  console.log("New connection", socket.id);
  socket["Nickname"] = "Anonymous";

  socket.on("room", (data, done) => {
    done();
    const roomName = data.payload;
    socket.join(roomName);
    socket
      .to(roomName)
      .emit("welcome", roomName, socket.Nickname, countRoom(roomName));
    io.sockets.emit("room_change", publicRooms());
  });

  socket.on("Nickname", (Nickname) => {
    socket["Nickname"] = Nickname;
  });

  socket.on("message", (data, roomName, done) => {
    socket.to(roomName).emit("message", socket.Nickname, data);
    done();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", room, socket.Nickname, countRoom(room) - 1);
    });
  });

  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
