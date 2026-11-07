"use client";
import React from "react";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, RotateCcw, Play } from "lucide-react";
import { INITIAL_STOCKS, INITIAL_CASH } from "./marketData";

export default function FinalRankingModal({
  players,
  marketState,
  isAdmin,
  onRestartGame,
  onResumeGame,
}) {
  const sorted = [...players].sort((a, b) => (b.netWorth || INITIAL_CASH) - (a.netWorth || INITIAL_CASH));
  const winners = sorted.filter((p) => (p.netWorth || INITIAL_CASH) >= INITIAL_CASH);
  const losers = [...sorted]
    .filter((p) => (p.netWorth || INITIAL_CASH) < INITIAL_CASH)
    .sort((a, b) => (a.netWorth || INITIAL_CASH) - (b.netWorth || INITIAL_CASH));

  const stocksList = INITIAL_STOCKS.map((info) => {
    const live = marketState?.stocks?.[info.ticker] || {
      price: info.initialPrice,
      changePct: 0,
    };
    return { ...info, ...live };
  }).sort((a, b) => (b.changePct || 0) - (a.changePct || 0));

  const bestStock = stocksList[0];
  const worstStock = stocksList[stocksList.length - 1];

  const formatBRL = (v) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-5xl w-full p-5 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Cabeçalho do Encerramento */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest">
            🔔 Sino de Fechamento da Bolsa B3V — Pregão Encerrado
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Resultado Oficial — <span className="text-amber-400">Banco Vila Corretora</span>
          </h1>
          <p className="text-sm text-slate-400">
            Capital Inicial de cada investidor: <strong className="text-white">R$ 10.000,00</strong>
          </p>
        </div>

        {/* Pódio Top 3 */}
        {sorted.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sorted.slice(0, 3).map((p, idx) => {
              const diff = (p.netWorth || INITIAL_CASH) - INITIAL_CASH;
              const pct = ((diff / INITIAL_CASH) * 100).toFixed(2);
              const medals = [
                {
                  title: "1º LUGAR • LOBO DA VILA",
                  bg: "bg-gradient-to-b from-amber-500/25 to-slate-900 border-amber-400",
                  icon: <Trophy className="w-8 h-8 text-amber-400" />,
                },
                {
                  title: "2º LUGAR • VICE-CAMPEÃO",
                  bg: "bg-gradient-to-b from-slate-400/20 to-slate-900 border-slate-400",
                  icon: <Medal className="w-8 h-8 text-slate-300" />,
                },
                {
                  title: "3º LUGAR • DESTAQUE B3V",
                  bg: "bg-gradient-to-b from-amber-700/25 to-slate-900 border-amber-700",
                  icon: <Award className="w-8 h-8 text-amber-600" />,
                },
              ][idx];

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border-2 p-5 flex flex-col items-center text-center shadow-xl ${medals.bg}`}
                >
                  {medals.icon}
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 mt-2">
                    {medals.title}
                  </span>
                  <div className="text-3xl my-2">{p.avatar || "🦈"}</div>
                  <h3 className="text-lg font-black text-white">{p.name}</h3>
                  <span className="text-xs text-slate-400 mb-3">Turma: {p.turma || "Geral"}</span>
                  <div className="text-2xl font-black text-white">{formatBRL(p.netWorth)}</div>
                  <div
                    className={`text-sm font-extrabold mt-1 ${
                      diff >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {diff >= 0 ? `+${formatBRL(diff)}` : formatBRL(diff)} ({diff >= 0 ? "+" : ""}
                    {pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resumo das Ações do Dia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestStock && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-400">
                  🚀 Maior Alta do Pregão
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {bestStock.icon} {bestStock.ticker} — {bestStock.name}
                </h4>
                <p className="text-xs text-slate-400">
                  De {formatBRL(bestStock.openPrice)} para {formatBRL(bestStock.price)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-400">
                  +{Number(bestStock.changePct || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {worstStock && (
            <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-rose-400">
                  📉 Maior Queda do Pregão
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {worstStock.icon} {worstStock.ticker} — {worstStock.name}
                </h4>
                <p className="text-xs text-slate-400">
                  De {formatBRL(worstStock.openPrice)} para {formatBRL(worstStock.price)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-rose-400">
                  {Number(worstStock.changePct || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Duas Colunas: Quem Mais Ganhou x Quem Mais Perdeu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maiores Ganhadores */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4">
            <h3 className="text-base font-black text-emerald-400 flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" />
              Ranking: Quem Mais Ganhou ({winners.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {winners.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Nenhum investidor terminou acima de R$ 10.000,00.
                </p>
              ) : (
                winners.map((p, i) => {
                  const diff = (p.netWorth || INITIAL_CASH) - INITIAL_CASH;
                  const pct = ((diff / INITIAL_CASH) * 100).toFixed(2);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-black text-amber-400 text-sm w-6">{i + 1}º</span>
                        <span className="text-xl">{p.avatar || "🦈"}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{p.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {p.turma || "Geral"} • {p.tradesCount || 0} negociações
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white">{formatBRL(p.netWorth)}</p>
                        <p className="text-xs font-extrabold text-emerald-400">
                          +{formatBRL(diff)} (+{pct}%)
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quem Mais Perdeu */}
          <div className="bg-slate-950 border border-rose-500/30 rounded-2xl p-4">
            <h3 className="text-base font-black text-rose-400 flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5" />
              Ranking: Quem Mais Perdeu ({losers.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {losers.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Ninguém terminou no prejuízo hoje! Todos protegeram o patrimônio! 🎉
                </p>
              ) : (
                losers.map((p, i) => {
                  const diff = (p.netWorth || INITIAL_CASH) - INITIAL_CASH;
                  const pct = ((diff / INITIAL_CASH) * 100).toFixed(2);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-black text-rose-400 text-sm w-6">{i + 1}º</span>
                        <span className="text-xl">{p.avatar || "🦈"}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{p.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {p.turma || "Geral"} • {p.tradesCount || 0} negociações
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white">{formatBRL(p.netWorth)}</p>
                        <p className="text-xs font-extrabold text-rose-400">
                          {formatBRL(diff)} ({pct}%)
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Botões do Professor para Reiniciar ou Continuar */}
        {isAdmin && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={onResumeGame}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Reabrir Pregão (Continuar Partida)
            </button>
            <button
              onClick={() => onRestartGame(false)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Iniciar Novo Dia (Resetar todos para R$ 10.000)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
