// main.js
document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector("#username");
    const button = document.querySelector("button");

    button.addEventListener("click", async () => {
        const username = input.value.trim();
        if (username) {
            await entrar(username);
        } else {
            alert("Por favor, insira um nome de usuário.");
        }
    });
});

async function entrar(username) {
    try {
        const response = await fetch('./entrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (response.ok) {
            const data = await response.json();
            // Lógica para redirecionar ou atualizar a interface com os dados recebidos
            console.log("Usuário entrou:", data);
        } else {
            alert("Erro ao entrar. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro na conexão. Tente novamente.");
    }
}