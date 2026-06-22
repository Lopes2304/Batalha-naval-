// Carrega os arquivos de áudio na memória do jogo
const somExplosao = new Audio('explosao.mp3');
const somAgua = new Audio('agua.mp3');
const somVitoria = new Audio('vitoria.mp3');

// =========================================================================
// 🚀 VARIÁVEIS GLOBAIS
// =========================================================================

let matriz = [];               // Armazena a grade 10x10 com a posição de barcos, água e bombas
let barcosRestantes = 30;      // Mantém a contagem de quantos barcos ainda precisam ser afundados
let contadorJogadas = 0;       // Conta quantos cliques (tiros) o jogador realizou na partida
let vidasAtuais = 5;           // Guarda a quantidade de erros permitidos antes do Game Over
let tempoRestante = 300;       // Contador dinâmico dos segundos que vão decrescendo
let tempoEscolhido = 300;      // Guarda o tempo total inicial baseado na dificuldade escolhida
let cronometro;                // Guarda a referência do setInterval para podermos pará-lo depois
let jogadorAtual = "";         // Guarda o nome digitado pelo usuário para registrar no histórico
let partidaIniciada = false;   // Controla se o jogador já clicou no botão COMEÇAR
let avisoTempoDisparado = false; // Controla para o aviso de 10 segundos só aparecer uma vez por partida

// Guarda a vida interna de cada um dos 10 navios (cada um ocupa 3 quadradinhos)
let integridadeNavios = {
    "B1": 3, "B2": 3, "B3": 3, "B4": 3, "B5": 3,
    "B6": 3, "B7": 3, "B8": 3, "B9": 3, "B10": 3
};

// Puxa o histórico do LocalStorage do navegador ou cria uma lista vazia se for a primeira vez
let historico = JSON.parse(localStorage.getItem("historicoBatalha")) || [];

// =========================================================================
// 🧩 SISTEMA DE CRIAÇÃO E SORTEIO DO TABULEIRO
// =========================================================================

function criarMatriz() {
    matriz = []; 
    let elementos = []; 

    // Reinicia a vida de cada navio para nova partida
    for (let i = 1; i <= 10; i++) {
        integridadeNavios[`B${i}`] = 3;
    }

    // Adiciona 10 navios únicos (totalizando 30 partes)
    for (let i = 1; i <= 10; i++) {
        elementos.push(`B${i}`, `B${i}`, `B${i}`);
    }
    for(let i = 0; i < 35; i++){ elementos.push("bomba"); }
    for(let i = 0; i < 35; i++){ elementos.push("agua"); }

    elementos.sort(() => Math.random() - 0.5);

    let indice = 0; 
    
    for(let linha = 0; linha < 10; linha++){
        matriz[linha] = []; 
        for(let coluna = 0; coluna < 10; coluna++){
            matriz[linha][coluna] = elementos[indice]; 
            indice++; 
        }
    }
}

function criarTabuleiro() {
    const tabela = document.getElementById("tabuleiro"); 
    tabela.innerHTML = ""; 

    for(let i = 0; i < 10; i++) {
        const linha = document.createElement("tr"); 
        
        for(let j = 0; j < 10; j++) {
            const celula = document.createElement("td"); 
            celula.dataset.linha = i;   
            celula.dataset.coluna = j;  
            celula.addEventListener("click", clicarCelula); 
            linha.appendChild(celula); 
        }
        tabela.appendChild(linha); 
    }
}

// =========================================================================
// 📡 LOGICA DO RADAR DETECTOR DE NAVIOS
// =========================================================================

function verificarRadar(linha, coluna) {
    const vizinhos = [
        { l: linha - 1, c: coluna },
        { l: linha + 1, c: coluna },
        { l: linha, c: coluna - 1 },
        { l: linha, c: coluna + 1 }
    ];

    for (let v of vizinhos) {
        if (v.l >= 0 && v.l < 10 && v.c >= 0 && v.c < 10) {
            const valorVizinho = matriz[v.l][v.c];
            if (valorVizinho.startsWith("B") && valorVizinho !== "bomba") {
                return true;
            }
        }
    }
    return false;
}

// =========================================================================
// INTERAÇÃO DO JOGADOR (Mecânica de Cliques e Tiros)
// =========================================================================

function clicarCelula() {
    if(!partidaIniciada) {
        mostrarAvisoCustomizado("Clique no botão COMEÇAR para começar o jogo!", "normal");
        return;
    }

    if(this.classList.contains("clicado") || vidasAtuais <= 0) return;

    this.classList.add("clicado"); 

    const linha = Number(this.dataset.linha);   
    const coluna = Number(this.dataset.coluna); 

    contadorJogadas++; 
    document.getElementById("jogadas").innerText = "🎯 Jogadas: " + contadorJogadas; 

    const valor = matriz[linha][coluna]; 

    // Verifica se acertou um Navio
    if(valor.startsWith("B") && valor !== "bomba") {
        if (somVitoria) {
            somVitoria.currentTime = 0;
            somVitoria.play().catch(() => {});
        }

        let numeroNavio = parseInt(valor.replace("B", ""));
        let tipoImagem = (numeroNavio % 3) + 1; 
        this.innerHTML = `<img src="imagens/barco${tipoImagem}.png" width="45">`; 
        
        barcosRestantes--; 
        integridadeNavios[valor]--; 

        // SISTEMA DE GANHAR VIDAS: Recupera 1 vida encontrando parte do barco
        if (vidasAtuais < 20) {
            vidasAtuais += 1;
            atualizarInterfaceVidas();
        }

        // Se o navio inteiro afundou (Bônus de +3 vidas)
        if (integridadeNavios[valor] === 0) {
            if (vidasAtuais < 20) {
                vidasAtuais += 3;
                if (vidasAtuais > 20) vidasAtuais = 20;
                atualizarInterfaceVidas();
            }
            setTimeout(() => {
                mostrarAvisoCustomizado("⚓ CAPITÃO! Um navio inteiro foi destruído! +3 Vidas!", "normal");
            }, 200);
        }
    }
    else if(valor === "bomba") {
        if (somExplosao) {
            somExplosao.currentTime = 0;
            somExplosao.play().catch(() => {});
        }

        this.innerHTML = '<img src="imagens/bomba.png" width="45">'; 
        
        // SISTEMA DE PERDER VIDAS: Bomba tira 2 vidas de uma vez
        if (vidasAtuais > 0) {
            vidasAtuais -= 2; 
            if (vidasAtuais < 0) vidasAtuais = 0;
            atualizarInterfaceVidas(); 
        }
    }
    else {
        // Jogador errou e bateu na água
        if (somAgua) {
            somAgua.currentTime = 0;
            somAgua.play().catch(() => {});
        }

        if (verificarRadar(linha, coluna)) {
            this.innerHTML = '<img src="imagens/onda.png" width="45">';
            this.style.backgroundColor = "rgba(255, 165, 0, 0.4)"; 
        } else {
            this.innerHTML = '<img src="imagens/onda.png" width="45">'; 
        }
    }

    document.getElementById("barcos").innerText = "🚢 Barcos restantes: " + barcosRestantes; 

    // VERIFICAÇÃO DE VITÓRIA
    if(barcosRestantes === 0 && vidasAtuais > 0){
        clearInterval(cronometro); 
        salvarJogada("Vitória");    
        mostrarAvisoCustomizado("🏆 VOCÊ VENCEU!", "normal");
    }

    // VERIFICAÇÃO DE DERROTA POR VIDA
    if(vidasAtuais === 0){
        clearInterval(cronometro);   
        salvarJogada("Derrota (Vidas)"); 
        mostrarAvisoCustomizado("💥 GAME OVER! Você perdeu todas as vidas.", "gameover"); 
    }
}

function atualizarInterfaceVidas() {
    const elementoVidas = document.getElementById("vidas"); 
    let coracoesHTML = ""; 
    
    // Renderiza a imagem do seu coração animado (coracao.gif)
    for (let i = 1; i <= vidasAtuais; i++) {
        if (i <= 10) { // Mostra no máximo 10 corações enfileirados para não quebrar o layout
            coracoesHTML += '<img src="imagens/coracao.gif" width="28" style="margin-right: 3px; vertical-align: middle;">'; 
        }
    }
    
    if (vidasAtuais > 10) {
        elementoVidas.innerHTML = `<img src="imagens/coracao.gif" width="28" style="vertical-align: middle;"> x${vidasAtuais}`;
    } else if (vidasAtuais === 0) {
        elementoVidas.innerHTML = "🖤 SEM VIDAS";
    } else {
        elementoVidas.innerHTML = coracoesHTML; 
    }
}

// =========================================================================
// ⏱️ SISTEMA DE RELÓGIO E TEMPO
// =========================================================================

function formatarTempo(segundos){
    let minutos = Math.floor(segundos / 60); 
    let resto = segundos % 60; 
    return minutos + ":" + resto.toString().padStart(2,"0"); 
}

function iniciarCronometro(segundos){
    tempoRestante = segundos; 
    avisoTempoDisparado = false; 
    document.getElementById("tempo").innerText = "⏰ " + formatarTempo(tempoRestante); 
    clearInterval(cronometro); 

    cronometro = setInterval(() => {
        tempoRestante--; 
        document.getElementById("tempo").innerText = "⏰ " + formatarTempo(tempoRestante); 

        if (tempoRestante === 10 && !avisoTempoDisparado) {
            avisoTempoDisparado = true;
            mostrarAvisoCustomizado("⚠️ CAPITÃO!\nO tempo está acabando! Você tem apenas 10 segundos!", "normal");
        }

        if(tempoRestante <= 0){
            clearInterval(cronometro); 
            salvarJogada("Derrota (Tempo)"); 
            mostrarAvisoCustomizado("💥 GAME OVER! O tempo esgotou.", "gameover"); 
        }
    }, 1000);
}

// =========================================================================
// CONTROLE DE FLUXO E INICIALIZAÇÃO DO JOGO
// =========================================================================

function iniciarJogo(){
    const nome = document.getElementById("nomeUsuario").value; 

    if(nome === ""){
        mostrarAvisoCustomizado("Digite seu nome!", "normal");
        return;
    }

    const nivel = document.getElementById("nivel").value; 
    
    if(nivel === "") {
        mostrarAvisoCustomizado("Escolha um nível antes de jogar!", "normal");
        return;
    }

    jogadorAtual = nome; 
    tempoEscolhido = 300; 

    if(nivel === "medio"){
        tempoEscolhido = 180;
    }
    if(nivel === "dificil"){
        tempoEscolhido = 90;
    }

    document.getElementById("tela-login").style.display = "none"; 
    document.getElementById("tela-jogo").style.display = "block";  
    document.getElementById("displayNome").innerText = nome;       

    barcosRestantes = 30;
    contadorJogadas = 0;
    vidasAtuais = 5;
    partidaIniciada = false; 

    document.getElementById("jogadas").innerText = "🎯 Jogadas: 0";
    document.getElementById("barcos").innerText = "🚢 Barcos restantes: 30";
    document.getElementById("tempo").innerText = "⏰ " + formatarTempo(tempoEscolhido);
    
    document.getElementById("btn-comecar").disabled = false; 

    atualizarInterfaceVidas(); 
    criarMatriz(); 
    criarTabuleiro(); 
    mostrarRanking(); 
}

function comecarPartida(){
    iniciarCronometro(tempoEscolhido); 
    document.getElementById("btn-comecar").disabled = true; 
    partidaIniciada = true; 
}

function reiniciarJogo() {
    clearInterval(cronometro); 

    contadorJogadas = 0;
    vidasAtuais = 5;
    barcosRestantes = 30;
    tempoRestante = tempoEscolhido;
    partidaIniciada = false; 
    avisoTempoDisparado = false;

    criarMatriz();
    criarTabuleiro();

    document.getElementById("jogadas").innerText = "🎯 Jogadas: 0";
    document.getElementById("barcos").innerText = "🚢 Barcos restantes: 30";
    document.getElementById("tempo").innerText = "⏰ " + formatarTempo(tempoEscolhido);
    
    document.getElementById("btn-comecar").disabled = false; 

    atualizarInterfaceVidas(); 
    mostrarRanking(); 

    mostrarAvisoCustomizado("🔁 Jogo reiniciado!", "normal"); 
}

// =========================================================================
// 💾 BANCO DE DADOS LOCAL E ARMAZENAMENTO DE RANKINGS (LocalStorage)
// =========================================================================

function calcularPontos() {
    let barcosEncontrados = 30 - barcosRestantes; 
    return (barcosEncontrados * 10) + (vidasAtuais * 20); 
}

function salvarJogada(status) {
    if (!jogadorAtual) return; 

    let pontos = calcularPontos();
    const nivelSelecionado = document.getElementById("nivel").value || "fácil";

    const agora = new Date();
    const dataHoraResumida = agora.toLocaleDateString() + " " + agora.getHours() + ":" + agora.getMinutes().toString().padStart(2, "0");

    let novaPartida = {
        nome: jogadorAtual,
        nivel: nivelSelecionado.toUpperCase(), 
        pontos: pontos,
        data: dataHoraResumida,
        status: status
    };

    historico.push(novaPartida);
    localStorage.setItem("historicoBatalha", JSON.stringify(historico));
    verificarRecorde(pontos);
}

function melhorPontuacao() {
    if (historico.length === 0) return 0; 
    return Math.max(...historico.map(h => h.pontos || 0)); 
}

function verificarRecorde(points) {
    let melhor = melhorPontuacao(); 

    if (points >= melhor && points > 0) { 
        setTimeout(() => {
            mostrarAvisoCustomizado("🔥 NOVO RECORDE!", "normal");
        }, 300);
    }
}

function top3() {
    return historico
        .sort((a, b) => (b.pontos || 0) - (a.pontos || 0)) 
        .slice(0, 3); 
}

function mostrarRanking() {
    let lista = document.getElementById("ranking"); 
    if (!lista) return; 

    lista.innerHTML = ""; 

    top3().forEach((item, index) => {
        let li = document.createElement("li"); 
        li.textContent = `${index + 1}º ${item.nome} - ${item.pontos} pts`; 
        lista.appendChild(li); 
    });
}

function limparHistorico() {
    localStorage.removeItem("historicoBatalha"); 
    historico = []; 
    
    let lista = document.getElementById("listaHistorico"); 
    if(lista) lista.innerHTML = "<li style='justify-content: center;'>Nenhuma partida registrada ainda.</li>"; 
    mostrarRanking(); 
}

function abrirHistorico() {
    let modal = document.getElementById("modalHistorico");
    let lista = document.getElementById("listaHistorico");

    historico = JSON.parse(localStorage.getItem("historicoBatalha")) || [];
    lista.innerHTML = "";

    if (historico.length === 0) {
        lista.innerHTML = "<li style='justify-content: center;'>Nenhuma partida registrada ainda.</li>";
    } else {
        historico.forEach((item) => {
            let li = document.createElement("li");
            
            li.innerHTML = `
                <span>${item.nome || "Jogador"}</span>
                <span>${item.nivel || "FÁCIL"}</span>
                <span>${item.pontos} pts</span>
                <span>${item.data}</span>
            `;
            
            lista.appendChild(li);
        });
    }

    modal.style.display = "flex";
}

function fecharHistorico() {
    document.getElementById("modalHistorico").style.display = "none"; 
}

// =========================================================================
// ☰ FUNÇÕES DE INTERFACE (SIDEBAR E POP-UPS CUSTOMIZADOS)
// =========================================================================

function alternarMenu() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("aberto");
}

function mostrarAvisoCustomizado(mensagem, tipo) {
    const modal = document.getElementById("modalAviso");
    const caixa = document.getElementById("conteudoAviso");
    const texto = document.getElementById("textoAviso");
    const espacoImagem = document.getElementById("espaco-imagem-aviso");

    caixa.classList.remove("modo-gameover");
    espacoImagem.innerHTML = "";
    
    texto.innerText = message = mensagem;

    if (tipo === "gameover") {
        caixa.classList.add("modo-gameover");
        espacoImagem.innerHTML = '<img src="imagens/coracao.gif" width="120" style="margin-bottom: 20px;">';
    }

    modal.style.display = "flex";
}

function fecharAvisoCustomizado() {
    document.getElementById("modalAviso").style.display = "none";
}