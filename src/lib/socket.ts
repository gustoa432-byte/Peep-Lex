import { io } from "socket.io-client";

// In development, the socket connects to the same host/port automatically since they are served together.
// The namespace is usually just root "/"
export const socket = io();
