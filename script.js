let contador_jogadas = 0;

function entrarNoJogo() {
    let nome = document.getElementById("nomeUsuario").value;

    if(nome.trim() === "") {
        alert("Digite seu nome!");
        return;
    }

    localStorage.setItem("nomeUsuario", nome);
}

function criarTabuleiro() {

    const tabela = document.getElementById("tabuleiro");

    tabela.innerHTML = "";

    for(let i = 0; i < 10; i++){

        const linha = document.createElement("tr");

        for(let j = 0; j < 10; j++){

            const celula = document.createElement("td");

            celula.addEventListener("click", function(){

                if(celula.classList.contains("clicado")) return;

                celula.classList.add("clicado");

                contador_jogadas++;

                document.getElementById("jogadas").innerText =
                "Jogadas: " + contador_jogadas;
            });

            linha.appendChild(celula);
        }

        tabela.appendChild(linha);
    }

    document.getElementById("btn-resetar").onclick = function(){
        contador_jogadas = 0;
        document.getElementById("jogadas").innerText =
        "Jogadas: 0";

        criarTabuleiro();
    };
}