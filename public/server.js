const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Serve client files

let calledNumbers = [];

io.on("connection", (socket) => {
    console.log("A player connected");

    // Send already called numbers to new players
    socket.emit("updateNumbers", calledNumbers);

    socket.on("callNumber", () => {
        if (calledNumbers.length >= 75) return;

        let newNumber;
        do {
            newNumber = Math.floor(Math.random() * 75) + 1;
        } while (calledNumbers.includes(newNumber));

        calledNumbers.push(newNumber);
        io.emit("updateNumbers", calledNumbers);
    });

    socket.on("resetGame", () => {
        calledNumbers = [];
        io.emit("updateNumbers", calledNumbers);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});