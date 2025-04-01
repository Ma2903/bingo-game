const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const v4 = require("uuid").v4;

const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors())

let HOST = {
    NOME : "Host",
    SENHA : "29030401"
}

const palavrasDeProgramacao = [
    "Algoritmo", "Variável", "Função", "Array", "Objeto", "Condicional", "Push", "Pop","Async", "Await",
    "Classe", "Construtor", "Import", "Export", "Sprint", "Event", "Listener", "API", "Back-end","REST",
    "CRUD", "JSON", "Commit", "DotNet", "Response","POO", "Front-end", "Full-stack", "Herança", "Encapsulamento", 
    "Polimorfismo", "TypeScript", "Node.js","React", "Vue", "Framework", "Model", "Git","GitHub", "DevOps",
    "Busca Binária", "Merge Sort", "Quick Sort","Div", "PHP", "Pilha", "Fila", "Árvore", "RESTful", "Controller", 
    "BD", "SQL", "NoSQL", "MongoDB", "MySQL", "SQLite", "Kanban", "Express", "Laravel", "Trello",
    "Loop", "View", "C#", "Python", "IA", "Framework","Bulma", "Cloud", "AWS", "Azure", 
    "Tailwind", "XML", "HTML", "CSS", "JavaScript",
];
  

let calledNumbers = [];
let chamado = ''
let players = {};


io.on("connection", (socket) => {
    // Send already called numbers to new players
    socket.emit("updateNumbers", calledNumbers);

    socket.on("callNumber", () => {
        // Shuffle the array of words
        palavrasDeProgramacao.sort(() => Math.random() - 0.5);

        // Filter out the already called numbers
        let remainingWords = palavrasDeProgramacao.filter(word => !calledNumbers.includes(word));

        // If there are no remaining words, reset the game
        if (remainingWords.length === 0) {
            calledNumbers = [];
            remainingWords = palavrasDeProgramacao.slice();
        }

        // Select a new word from the remaining words
        let newWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];

        // Add the new word to the called numbers
        calledNumbers.push(newWord);

        // Emit the updated called numbers to all clients
        io.emit("sortedNumber", newWord);
    });

    socket.on("confirmNumber", () => {
        io.emit("showNumber",calledNumbers)
        socket.emit("updateNumbers", calledNumbers);
    })

    socket.on("checkBingo", () => {
        let player = Object.values(players).find(player => player.socketId === socket.id);
        if(!player) return;

        let cartela = player.cartela;
        let bingo = true;
        cartela.forEach(word => {
            if(!calledNumbers.includes(word)){
                bingo = false;
                return;
            }
        });

        if(bingo){
            io.emit("bingo", player.nome);
        }
    })

    socket.on("resetGame", () => {
        calledNumbers = [];
        io.emit("updateNumbers", calledNumbers);
    });
});

app.post('/entrar', (req, res) => {
    if(req.body.nome === HOST.NOME && typeof req.body.password === "undefined"){
        res.send({error : false, isHost : true});
        return;
    }

    if(req.body.password === HOST.SENHA && req.body.nome === HOST.NOME){
        HOST.TOKEN = v4();
        res.send({error : false, isHost : true, token : HOST.TOKEN});
        return;
    }

    if(players[req.body.nome]){
        res.send({error : true, token : players[req.body.nome].token});
        return;
    }

    players[req.body.nome] = {
        token : v4(),
        cartela : gerarCartela()
    }
    res.send({error : false,token : players[req.body.nome].token});
});

app.get('/getTable', (req, res) => {
    let player = Object.values(players).find(player => player.token === req.query.token);
    if(!player){
        res.send({error : true});
        return;
    }
    res.send({error : false, cartela : player.cartela});
});

app.post('/checkAdmin', (req, res) => {
    if(req.body.token === HOST.TOKEN){
        res.send({error : false, isHost : true});
        return;
    }
    res.send({error : true});
});

app.get('/data',(req,res) => {
    res.send({
        calledNumbers : calledNumbers,
        players : players,
        HOST : HOST
    });
})

server.listen(3333, () => {
    console.log("Server running on http://localhost:3333");
});

function gerarCartela(){
    let cartela = [];

    let i = 0
    while(i < 25){
        let numero = palavrasDeProgramacao[Math.floor((Math.random() * palavrasDeProgramacao.length))];
        if(cartela.includes(numero)) continue;
        cartela.push(numero);
        i++;
    }
    return cartela;
}