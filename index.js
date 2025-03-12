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
    NOME : "Manu",
    SENHA : "1234"
}

const palavrasDeProgramacao = [
    "Algoritmo", "Variável", "Função", "Array", "Objeto", "Laço", "Condicional", "Push", "Pop", "Shift",
    "Unshift", "Callback", "Promise", "Async", "Await", "Classe", "Construtor", "Prototype", "Módulo",
    "Import", "Export", "Map", "Filter", "Reduce", "Evento", "Listener", "API", "REST", "CRUD", "JSON",
    "DOM", "ES6", "Arrow Function", "Desestruturamento", "Spread", "Rest", "Fechamento", "Escopo", "Hoisting", "Callback Hell",
    "POO", "Herança", "Encapsulamento", "Abstração", "Polimorfismo", "TypeScript", "Node.js", "React", "Vue", "Angular",
    "Framework", "Biblioteca", "Webpack", "Babel", "Git", "GitHub", "Versionamento", "Refatoração", "Debugger", "Ponto de Interrupção",
    "Recursão", "Iteração", "Complexidade", "Algoritmo de Busca", "Algoritmo de Ordenação", "Busca Binária", "Merge Sort", "Quick Sort",
    "Hashmap", "Tabela Hash", "Pilha", "Fila", "Lista Encadeada", "Grafo", "Árvore", "Heap", "Recursividade", "API RESTful",
    "Token", "JWT", "OAuth", "CORS", "BD", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "SQLite", "GraphQL", "Esquema", "Mutação",
    "Consulta", "Roteador", "Middleware", "Express", "NestJS", "Vuex", "Redux", "Gerenciamento de Estado", "Componente", "JSX", "DOM Virtual",
    "Loop de Eventos", "Concorrência", "Thread", "Mutex", "Semáforo", "Deadlock", "Condição de Corrida", "Testes Unitários", "TDD", "CI/CD",
    "Docker", "Kubernetes", "Cloud", "AWS", "Azure", "Heroku", "Vercel", "Pipeline de CI", "Pipeline de CD", "Pw", "Back-end", "Front-end", "Full-stack"
];
  

let calledNumbers = [];
let players = {};


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

app.post('/entrar', (req, res) => {
    if(req.body.nome == HOST.NOME){
        res.send({error : false, isHost : true});
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

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
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