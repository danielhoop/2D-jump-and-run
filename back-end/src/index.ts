import * as ws from "ws";

const port = 8000;
const server = new ws.Server({ port: port });

server.on("connection", function(socket) {
    console.log("Connection established.");
})

console.log("Server is running.");
console.log("Listening to port: " + port);