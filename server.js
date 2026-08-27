const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server);

  // === LÓGICA DO JOGO BATALHA DE TABUADA ===
  let state = {
      players: {},
      pontuacao: { amarela: 0, verde: 0 },
      rodadaAtual: 0,
      perguntaAtual: null,
      tempoInicioPergunta: null,
      isJogando: false
  };

  function gerarPergunta() {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const respostaCorreta = num1 * num2;
      let alternativas = [respostaCorreta];
      while(alternativas.length < 4) {
          let falsa = (Math.floor(Math.random() * 10) + 1) * (Math.floor(Math.random() * 10) + 1);
          if(!alternativas.includes(falsa)) alternativas.push(falsa);
      }
      alternativas.sort(() => Math.random() - 0.5);
      return { texto: `${num1} x ${num2}`, respostaCorreta, alternativas };
  }

  function calcularPontos(tempoDeResposta) {
      const tempoMaximo = 10000;
      const tempoBase = 10;
      if (tempoDeResposta > tempoMaximo) return tempoBase;
      const bonus = Math.floor(5 * (1 - (tempoDeResposta / tempoMaximo)));
      return tempoBase + Math.max(0, bonus);
  }

  function emitirEstadoAtual() {
      io.emit('estadoAtualizado', {
          pontuacao: state.pontuacao,
          rodadaAtual: state.rodadaAtual,
          isJogando: state.isJogando,
          perguntaTexto: state.perguntaAtual ? state.perguntaAtual.texto : null,
          jogadores: Object.values(state.players)
      });
  }

  io.on('connection', (socket) => {
      socket.on('entrarJogo', ({ nome, equipe }) => {
          state.players[socket.id] = { id: socket.id, nome, equipe, pontos: 0, respondidoNestaRodada: false };
          socket.join(equipe);
          socket.emit('entradaSucesso');
          emitirEstadoAtual();
      });

      socket.on('iniciarJogo', () => {
          state.pontuacao = { amarela: 0, verde: 0 };
          for (let p in state.players) {
              state.players[p].pontos = 0;
              state.players[p].respondidoNestaRodada = false;
          }
          state.rodadaAtual = 0;
          state.isJogando = true;
          io.emit('jogoIniciado');
          emitirEstadoAtual();
      });

      socket.on('proximaPergunta', () => {
          state.rodadaAtual++;
          state.perguntaAtual = gerarPergunta();
          state.tempoInicioPergunta = Date.now();
          for (let p in state.players) state.players[p].respondidoNestaRodada = false;
          io.emit('novaPergunta', {
              texto: state.perguntaAtual.texto,
              alternativas: state.perguntaAtual.alternativas,
              rodada: state.rodadaAtual
          });
          emitirEstadoAtual();
      });

      socket.on('encerrarJogo', () => {
          state.isJogando = false;
          let vencedor = "Empate";
          if (state.pontuacao.amarela > state.pontuacao.verde) vencedor = "Equipe Amarela";
          if (state.pontuacao.verde > state.pontuacao.amarela) vencedor = "Equipe Verde";
          io.emit('jogoEncerrado', { vencedor, pontuacao: state.pontuacao });
          emitirEstadoAtual();
      });

      socket.on('enviarResposta', (resposta) => {
          const player = state.players[socket.id];
          if (!player || !state.isJogando || !state.perguntaAtual || player.respondidoNestaRodada) return;
          player.respondidoNestaRodada = true;
          const tempoDeResposta = Date.now() - state.tempoInicioPergunta;
          let acertou = false, pontosGanhos = 0;

          if (parseInt(resposta) === state.perguntaAtual.respostaCorreta) {
              acertou = true;
              pontosGanhos = calcularPontos(tempoDeResposta);
              player.pontos += pontosGanhos;
              if (player.equipe === 'amarela') state.pontuacao.amarela += pontosGanhos;
              if (player.equipe === 'verde') state.pontuacao.verde += pontosGanhos;
          }
          socket.emit('resultadoResposta', { acertou, pontosGanhos });
          emitirEstadoAtual();
      });

      socket.on('disconnect', () => {
          if (state.players[socket.id]) {
              delete state.players[socket.id];
              emitirEstadoAtual();
          }
      });
  });

  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Servidor unificado (Next.js + Socket.IO) pronto em http://0.0.0.0:${port}`);
  });
});
