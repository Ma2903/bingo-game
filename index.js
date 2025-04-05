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

let palavrasDeProgramacao = [
    "API", "Algoritmo", "Array", "Async", "Await", "AWS", "Azure", "Back-end", "BD", "Boostrap", 
    "Bulma", "Bug", "C#", "Classe", "Cloud", "Commit","Construtor","Controller", "CRUD", "CSS", 
    "C++", "DevOps", "Div", "DotNet", "Encapsulamento", "Event", "Express", "Export", "Fila", "Framework", 
    "Front-end","Função", "Full-stack", "Git", "GitHub", "Herança", "HTML", "IA", "Import","JavaScript", 
    "JSON","Kanban", "Laravel", "Listener", "Loop", "Merge Sort", "Model", "MongoDB", "MySQL", "Node.js", 
    "NoSQL", "NPM", "Objeto", "PHP", "Pilha", "Polimorfismo", "POO", "Pop", "Push", "Python", 
    "Quick Sort", "React", "REST", "RESTful", "Response", "SQLite", "Sprint", "SQL", "Tailwind", "Trello", 
    "TypeScript", "Variável", "View", "Vue", "XML",
];
  

let calledNumbers = [];
let chamado = ''
let players = {};


io.on("connection", (socket) => {
    // Send already called numbers to new players
    socket.emit("updateNumbers", calledNumbers);

    socket.on("callNumber", () => {

        // Filter out the already called numbers
        let remainingWords = palavrasDeProgramacao.filter(word => !calledNumbers.includes(word));

        // If there are no remaining words, reset the game
        if (remainingWords.length === 0) {
            calledNumbers = [];
            remainingWords = palavrasDeProgramacao.slice();
        }

        // Select a new word from the remaining words
        let numberNewWord = Math.floor(Math.random() * remainingWords.length)
        let newWord = remainingWords[numberNewWord];
        
        console.log(numberNewWord + "esse é o número do array")
        if(numberNewWord < 15){
            numberNewWord = "B";
        }
        if(numberNewWord < 30 && numberNewWord > 14){
            numberNewWord = "I";
        }
        if(numberNewWord < 45 && numberNewWord > 29){
            numberNewWord = "N";
        }
        if(numberNewWord < 60 && numberNewWord > 44){
            numberNewWord = "G";
        }
        if(numberNewWord < 75 && numberNewWord > 59){
            numberNewWord = "O";
        }
        
        // Add the new word to the called numbers
        console.log(numberNewWord +  "-" + newWord);
        calledNumbers.push(newWord);
        // Emit the updated called numbers to all clients
        io.emit("sortedNumber", {
            number: newWord,
            letterOfThisNumber: numberNewWord,
        });
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

console.log(palavrasDeProgramacao.length)
function gerarCartela() {

    // Criar uma cópia do array e ordenar alfabeticamente
    const palavrasOrdenadas = [...palavrasDeProgramacao];

    // Dividir em grupos de 15 palavras
    const grupos = {
        B: palavrasOrdenadas.slice(0, 15),
        I: palavrasOrdenadas.slice(15, 30),
        N: palavrasOrdenadas.slice(30, 45),
        G: palavrasOrdenadas.slice(45, 60),
        O: palavrasOrdenadas.slice(60, 75)
    };

    let cartela = [];

    // Selecionar 5 palavras aleatórias de cada grupo e manter em ordem
    for (let letra of ['B', 'I', 'N', 'G', 'O']) {
        let palavrasColuna = new Set();
        while (palavrasColuna.size < 5) {
            let palavra = grupos[letra][Math.floor(Math.random() * grupos[letra].length)];
            palavrasColuna.add(palavra);
        }
        cartela.push(...palavrasColuna);
    }

    return cartela;
}

