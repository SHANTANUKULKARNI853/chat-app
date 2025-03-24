import { io } from "socket.io-client";

const socket = io("https://chat-app-h1gr.onrender.com"); // Update with your backend URL
export default socket;
