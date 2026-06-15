let tabuleiro = [];
let pontos = 0;
let vidas = 3;
let jogadas = 0;
let barcosEncontrados = 0;
let totalBarcos = 10;

/* esse codigo eu faço a matriz aleatoria */

function criarMatriz(){

    tabuleiro = [];

    for(let i=0;i<8;i++){

        let linha=[];

        for(let j=0;j<8;j++){

            let sorteio=Math.random(); /* Cada posição recebe aleatoriamente barco, bomba ou água através do Math.random().*/

            if(sorteio < 0.15){
                linha.push("barco");
            }
            else if(sorteio < 0.25){
                linha.push("bomba");
            }
            else{
                linha.push("agua");
            }

        }

        tabuleiro.push(linha);
    }
}

/*esse daqui desenha o tabuleiro */

function desenharTabuleiro(){

    const area = document.getElementById("tabuleiro");

    area.innerHTML="";

    for(let i=0;i<8;i++){

        for(let j=0;j<8;j++){

            let div=document.createElement("div");

            div.classList.add("celula");

            div.dataset.linha=i;
            div.dataset.coluna=j;

            div.addEventListener("click", clicarCelula);

            area.appendChild(div);
        }
    }
}

/* esse é para o clicle na coluna */

function clicarCelula(){

    if(this.classList.contains("revelado")){
        return;
    }

    this.classList.add("revelado");

    let linha=this.dataset.linha;
    let coluna=this.dataset.coluna;

    let valor=tabuleiro[linha][coluna];

    jogadas++;

    if(valor==="barco"){
        pontos+=10;
        barcosEncontrados++;
        this.classList.add("barco");
        this.innerHTML="🚢";
    }

    else if(valor==="bomba"){
        vidas--;
        this.classList.add("bomba");
        this.innerHTML="💣";
    }

    else{
        this.classList.add("agua");
        this.innerHTML="🌊";
    }

    atualizarTela();
    verificarFim();
}


/* esse atualiza informações */

function atualizarTela(){

    document.getElementById("pontos").innerText=pontos;
    document.getElementById("vidas").innerText=vidas;
    document.getElementById("jogadas").innerText=jogadas;
}

/* esse faiz as vitorias e as derrotas */

function verificarFim(){

    if(vidas <= 0){

        document.getElementById("mensagem").innerText =
        "Você perdeu!";

    }

    if(barcosEncontrados >= totalBarcos){

        document.getElementById("mensagem").innerText =
        "Você venceu!";
    }
}


/* esse faiz um novo jogo */


function novoJogo(){

    pontos=0;
    vidas=3;
    jogadas=0;
    barcosEncontrados=0;

    criarMatriz();
    desenharTabuleiro();
    atualizarTela();

    document.getElementById("mensagem").innerText="";
}

/* inicia jogo */

novoJogo();



