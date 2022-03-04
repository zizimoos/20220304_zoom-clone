const messageList = document.querySelector("ul");
const nicknameForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
  const li = document.createElement("li");
  li.textContent = message.data;
  messageList.appendChild(li);
});

socket.addEventListener("close", () => {
  console.log("Connection closed");
});

const makeMessage = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
};

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("message", input.value));
  input.value = "";
});

nicknameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  input.value = "";
});
