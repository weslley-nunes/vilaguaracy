const socket = io();

// Elementos da UI
const telaAguardando = document.getElementById('telaAguardando');
const telaJogo = document.getElementById('telaJogo');
const bemVindoTxt = document.getElementById('bemVindoTxt');
const infoJogador = document.getElementById('infoJogador');
const meusPontosTxt = document.getElementById('meusPontos');
const numRodadaTxt = document.getElementById('numRodada');
const textoPerguntaTxt = document.getElementById('textoPergunta');
const boxAlternativas = document.getElementById('boxAlternativas');
const feedback = document.getElementById('feedback');

// Dados do Jogador
const nome = localStorage.getItem('nomeJogador');
const equipe = localStorage.getItem('equipeJogador');

if (!nome || !equipe) {
    window.location.href = 'index.html';
}

// Configuração Inicial da UI
bemVindoTxt.innerText = `Olá, ${nome}!`;
infoJogador.innerText = `👤 ${nome} | ${equipe === 'amarela' ? '💛 Amarela' : '💚 Verde'}`;
document.body.style.backgroundColor = equipe === 'amarela' ? '#fff9e6' : '#e6fff5';

// Conectar ao jogo
socket.emit('entrarJogo', { nome, equipe });

socket.on('entradaSucesso', () => {
    console.log('Entrou com sucesso');
});

// Eventos do Jogo
socket.on('jogoIniciado', () => {
    meusPontosTxt.innerText = "Pontos: 0";
    telaAguardando.classList.add('hidden');
    telaJogo.classList.remove('hidden');
    textoPerguntaTxt.innerText = "Prepare-se!";
    boxAlternativas.innerHTML = "";
    feedback.classList.add('hidden');
});

socket.on('novaPergunta', (data) => {
    telaAguardando.classList.add('hidden');
    telaJogo.classList.remove('hidden');
    
    numRodadaTxt.innerText = data.rodada;
    textoPerguntaTxt.innerText = data.texto;
    feedback.classList.add('hidden');
    
    // Gerar botões de alternativas
    boxAlternativas.innerHTML = "";
    data.alternativas.forEach(alt => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-alt';
        btn.innerText = alt;
        btn.onclick = () => responder(alt);
        boxAlternativas.appendChild(btn);
    });
});

function responder(valor) {
    // Desabilitar botões
    const botoes = boxAlternativas.querySelectorAll('button');
    botoes.forEach(b => b.disabled = true);
    
    socket.emit('enviarResposta', valor);
}

socket.on('resultadoResposta', (data) => {
    feedback.classList.remove('hidden');
    if (data.acertou) {
        feedback.innerText = `🎉 Acertou! +${data.pontosGanhos} pts`;
        feedback.className = 'acertou';
        
        // Atualizar pontos locais visualmente
        const pontosAtuais = parseInt(meusPontosTxt.innerText.split(': ')[1]);
        meusPontosTxt.innerText = `Pontos: ${pontosAtuais + data.pontosGanhos}`;
    } else {
        feedback.innerText = `❌ Errou! Que pena.`;
        feedback.className = 'errou';
    }
});

socket.on('jogoEncerrado', (data) => {
    telaJogo.classList.add('hidden');
    telaAguardando.classList.remove('hidden');
    bemVindoTxt.innerText = `Fim de Jogo!`;
    document.querySelector('#telaAguardando p').innerText = `Vencedor: ${data.vencedor}`;
});
