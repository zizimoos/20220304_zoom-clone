const socket = io();

const welcome = document.querySelector("#welcome");
const form = document.querySelector("form");
const room = document.querySelector("#room");

let roomName = "";

room.hidden = true;
const nickNameArea = room.querySelector("#name");
nickNameArea.hidden = false;

const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("#message input");
  const value = input.value;
  socket.emit("message", input.value, roomName, () => {
    addMessage(`${value}`, "You");
  });

  input.value = "";
};
const handleNameSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("Nickname", input.value);
  input.value = "";
  nickNameArea.hidden = true;
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName}`;
  addMessage("welcome to this room", "Server");

  const messageForm = room.querySelector("#message");
  messageForm.addEventListener("submit", handleMessageSubmit);

  const nameForm = room.querySelector("#name");
  nameForm.addEventListener("submit", handleNameSubmit);
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector("input");
  socket.emit("room", { payload: input.value }, showRoom);
  roomName = input.value;
  input.value = "";
};
form.addEventListener("submit", handleRoomSubmit);

const addMessage = (message, name) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = `${name} : ${message}`;
  ul.appendChild(li);
};

socket.on("welcome", (data, name, newCount) => {
  console.log("Welcome", data);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName} (${newCount}) `;
  addMessage("someone joined from system", "Server");
});

socket.on("message", (Nickname, data) => {
  console.log("Message", data);
  addMessage(data, Nickname);
});

socket.on("bye", (data, name, newCount) => {
  console.log("Bye", data);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName} (${newCount})`;
  addMessage("someone left from system", "Server");
});

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerText = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.appendChild(li);
  });
});
