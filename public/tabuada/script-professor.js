const socket = io();

// Elementos da UI
const btnIniciar = document.getElementById('btnIniciar');
const btnProxima = document.getElementById('btnProxima');
const btnEncerrar = document.getElementById('btnEncerrar');
const pontosAmarela = document.getElementById('pontosAmarela');
const pontosVerde = document.getElementById('pontosVerde');
const statusRodada = document.getElementById('statusRodada');
const perguntaAtualProf = document.getElementById('perguntaAtualProf');
const listaJogadores = document.getElementById('listaJogadores');

// Botões de Ação
btnIniciar.addEventListener('click', () => {
    socket.emit('iniciarJogo');
});

btnProxima.addEventListener('click', () => {
    socket.emit('proximaPergunta');
});

btnEncerrar.addEventListener('click', () => {
    socket.emit('encerrarJogo');
});

// Atualização de Estado
socket.on('estadoAtualizado', (state) => {
    // Placar
    pontosAmarela.innerText = state.pontuacao.amarela;
    pontosVerde.innerText = state.pontuacao.verde;
    
    // Controles e Textos
    if (state.isJogando) {
        btnIniciar.classList.add('hidden');
        btnProxima.classList.remove('hidden');
        btnEncerrar.classList.remove('hidden');
        statusRodada.innerText = `Rodada ${state.rodadaAtual}`;
        perguntaAtualProf.innerText = state.perguntaTexto ? state.perguntaTexto : "Prepara!";
    } else {
        btnIniciar.classList.remove('hidden');
        btnProxima.classList.add('hidden');
        btnEncerrar.classList.add('hidden');
        statusRodada.innerText = "Aguardando início...";
        perguntaAtualProf.innerText = "";
    }

    // Lista de Jogadores
    listaJogadores.innerHTML = "";
    state.jogadores.forEach(j => {
        const div = document.createElement('div');
        div.className = `jogador-badge ${j.equipe === 'amarela' ? 'badge-amarela' : 'badge-verde'} ${j.respondidoNestaRodada ? 'respondido' : ''}`;
        div.innerText = `${j.nome} (${j.pontos} pts)`;
        listaJogadores.appendChild(div);
    });
});

socket.on('novaPergunta', () => {
    // Efeito sutil ao lançar pergunta
});

socket.on('jogoEncerrado', (data) => {
    statusRodada.innerText = "FIM DE JOGO!";
    perguntaAtualProf.innerText = `Vencedor:\n${data.vencedor}`;
    dispararConfetes(data.vencedor);
});

// Efeitos
function dispararConfetes(vencedor) {
    let colors = ['#ffffff'];
    if(vencedor.includes('Amarela')) colors = ['#FFD166'];
    if(vencedor.includes('Verde')) colors = ['#06D6A0'];

    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, colors: colors };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, { particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
    }, 250);
}
