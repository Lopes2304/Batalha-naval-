function entrarNoJogo() {
    let nome = document.getElementById("nomeUsuario").value;

    if(nome.trim() === "") {
        alert("Digite seu nome!");
        return;
    }

    localStorage.setItem("nomeUsuario", nome);

    document.body.style.opacity = "0";

    setTimeout(() => {
        window.location.href = "jogo.html";
    }, 1000);
}

function criartabela() {
  const tabela = document.createElement('table');
  const cenario = document.getElementById('tabuleiro-jogo');
  let contador = 0;

  for (let i = 0; i < 10; i++) {
    const linha = document.createElement('tr');
    tabela.appendChild(linha);

    for (let j = 0; j < 10; j++) {
      const celula = document.createElement('td');
      linha.appendChild(celula);

      const imgSegunda = document.createElement('img');
      imgSegunda.src = galeria[contador];
      contador += 1;
      imgSegunda.classList.add('tile-tras', 'oculto');
      celula.appendChild(imgSegunda);

      const imgPrimeira = document.createElement('img');
      imgPrimeira.src = 'img/Fire-icon.png';
      imgPrimeira.id = `${i}-${j}`;
      imgPrimeira.classList.add('tile-frente');
      imgPrimeira.addEventListener('click', () => {
        imgPrimeira.classList.add('oculto');
        imgSegunda.classList.remove('oculto');

        let id = document.getElementById("jogadas");
        contador_jogadas+= 1;
        id_botao = document.getElementById("btn-resetar");
        id.innerText = "Jogadas: "+ contador_jogadas;
        id_botao.addEventListener('click', () =>{
          contador_jogadas = 0
          id.innerText = "Jogadas: "+ contador_jogadas;
        })
      });
      celula.appendChild(imgPrimeira);
    }
  }

  cenario.appendChild(tabela);
}






















