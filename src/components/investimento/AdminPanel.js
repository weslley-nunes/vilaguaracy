"use client";
import React, { useState } from "react";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Megaphone,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Award,
  Coins,
  Lightbulb,
  Send,
  Sliders,
  Newspaper,
  Trophy,
  AlertTriangle,
  Clock,
  Trash2,
} from "lucide-react";
import { INITIAL_STOCKS, MARKET_SCENARIOS, NEWS_CHANNELS } from "./marketData";

export default function AdminPanel({
  marketState,
  players,
  onStartMarket,
  onPauseMarket,
  onEndMarket,
  onResetMarket,
  onTriggerScenario,
  onCustomNews,
  onAdjustStock,
  onPayDividends,
  onUpdateSettings,
  onCloseAdminView,
}) {
  const [activeTab, setActiveTab] = useState("cenarios"); // 'cenarios' | 'empresas' | 'criar_noticia' | 'ranking'
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // Estado para notícia personalizada do professor
  const [customChannel, setCustomChannel] = useState("G10");
  const [customTitle, setCustomTitle] = useState("");
  const [customSummary, setCustomSummary] = useState("");
  const [customTip, setCustomTip] = useState("");
  const [customImpacts, setCustomImpacts] = useState({});

  const categories = [
    "Todos",
    "Macroeconomia & Juros",
    "Energia, Mineração & Agro",
    "Empresas, Varejo & Tecnologia",
    "Crises & Eventos Globais",
  ];

  const filteredScenarios =
    selectedCategory === "Todos"
      ? MARKET_SCENARIOS
      : MARKET_SCENARIOS.filter((s) => s.category === selectedCategory);

  const sortedPlayers = [...players].sort((a, b) => (b.netWorth || 10000) - (a.netWorth || 10000));
  const winners = sortedPlayers.filter((p) => (p.netWorth || 10000) >= 10000);
  const losers = [...sortedPlayers]
    .filter((p) => (p.netWorth || 10000) < 10000)
    .sort((a, b) => (a.netWorth || 10000) - (b.netWorth || 10000));

  const handleSendCustomNews = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    onCustomNews({
      channel: customChannel,
      title: customTitle.trim(),
      summary:
        customSummary.trim() ||
        "O mercado financeiro reage imediatamente às novas informações divulgadas agora há pouco.",
      educationalNote:
        customTip.trim() ||
        "💡 Analise quais empresas são impactadas por este fato relevante e ajuste sua carteira!",
      impacts: customImpacts,
    });
    setCustomTitle("");
    setCustomSummary("");
    setCustomTip("");
    setCustomImpacts({});
  };

  const toggleImpact = (ticker, val) => {
    setCustomImpacts((prev) => {
      const next = { ...prev };
      if (next[ticker] === val) {
        delete next[ticker];
      } else {
        next[ticker] = val;
      }
      return next;
    });
  };

  const formatBRL = (v) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Cabeçalho do Painel do Professor */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                Modo Professor Administrador
              </span>
              <span className="text-xs text-slate-400">
                • {players.length} investidor(es) na sala
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Mesa Diretora do Banco Vila & Banco Central
            </h2>
          </div>
        </div>

        {/* Botões Principais de Controle do Pregão */}
        <div className="flex flex-wrap items-center gap-2">
          {marketState?.status !== "pregao_aberto" ? (
            <button
              onClick={onStartMarket}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {marketState?.status === "pausado" ? "Retomar Pregão" : "Iniciar Pregão (30 min)"}
            </button>
          ) : (
            <button
              onClick={onPauseMarket}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              Pausar Pregão
            </button>
          )}

          <button
            onClick={onEndMarket}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            Encerrar & Ver Ranking Final
          </button>

          <button
            onClick={() => onPayDividends(0.03)}
            title="Paga 3% de dividendos em dinheiro para todos os alunos que têm ações na carteira agora"
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4 text-amber-300" />
            Pagar Dividendos (+3%)
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  "Deseja reiniciar o pregão? Todos os alunos voltarão para R$ 10.000,00 e as ações voltarão ao preço inicial."
                )
              ) {
                onResetMarket(false);
              }
            }}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Resetar Dia
          </button>

          {onCloseAdminView && (
            <button
              onClick={onCloseAdminView}
              className="px-3 py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Ocultar Painel
            </button>
          )}
        </div>
      </div>

      {/* Barra de Configurações Rápidas do Dia (30 min, Velocidade, Notícias Automáticas, Dicas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300">Duração do Dia:</span>
          </div>
          <div className="flex gap-1">
            {[15, 20, 30].map((mins) => {
              const active = Math.round((marketState?.durationSeconds || 1800) / 60) === mins;
              return (
                <button
                  key={mins}
                  onClick={() => onUpdateSettings({ durationSeconds: mins * 60 })}
                  className={`px-2 py-1 rounded text-xs font-bold cursor-pointer ${
                    active
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {mins}m
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300">Velocidade:</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((spd) => {
              const active = (marketState?.speed || 1) === spd;
              return (
                <button
                  key={spd}
                  onClick={() => onUpdateSettings({ speed: spd })}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                    active
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">Notícias Automáticas:</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ autoNews: !marketState?.autoNews })}
            className={`px-3 py-1 rounded-md text-xs font-extrabold cursor-pointer transition-all ${
              marketState?.autoNews
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {marketState?.autoNews ? "ATIVADO" : "MANUAL"}
          </button>
        </div>

        <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-300">Dica Pedagógica:</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ showTips: !marketState?.showTips })}
            className={`px-3 py-1 rounded-md text-xs font-extrabold cursor-pointer transition-all ${
              marketState?.showTips !== false
                ? "bg-purple-500 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {marketState?.showTips !== false ? "VISÍVEL" : "OCULTA"}
          </button>
        </div>
      </div>

      {/* Abas do Painel do Professor */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("cenarios")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "cenarios"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Simular Situações do Dia a Dia ({MARKET_SCENARIOS.length})
        </button>

        <button
          onClick={() => setActiveTab("criar_noticia")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "criar_noticia"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Send className="w-4 h-4" />
          Criar Notícia Personalizada
        </button>

        <button
          onClick={() => setActiveTab("empresas")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "empresas"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Controlar Preços das Empresas
        </button>

        <button
          onClick={() => setActiveTab("ranking")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "ranking"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Auditoria & Ranking dos Alunos ({players.length})
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: CENÁRIOS DO DIA A DIA */}
      {activeTab === "cenarios" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-200 text-slate-950"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredScenarios.map((scen) => {
              const ch = NEWS_CHANNELS[scen.channel] || NEWS_CHANNELS.G10;
              return (
                <div
                  key={scen.id}
                  className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ch.bgBadge}`}>
                        {ch.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{scen.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug mb-1.5">
                      {scen.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{scen.summary}</p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(scen.impacts).map(([tk, pct]) => (
                        <span
                          key={tk}
                          className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                            pct > 0
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {tk} {pct > 0 ? `+${Math.round(pct * 100)}%` : `${Math.round(pct * 100)}%`}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => onTriggerScenario(scen)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      Disparar Notícia na Tela dos Alunos
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: CRIAR NOTÍCIA PERSONALIZADA */}
      {activeTab === "criar_noticia" && (
        <form onSubmit={handleSendCustomNews} className="space-y-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Canal de Imprensa Brasileira:
              </label>
              <select
                value={customChannel}
                onChange={(e) => setCustomChannel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {Object.values(NEWS_CHANNELS).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.inspiredBy})
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Manchete Urgente (aparecerá no Plantão dos alunos):
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Greve de transporte paralisa entregas ou Descoberta de ouro no Tocantins!"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Resumo da Reportagem (Opcional):
              </label>
              <input
                type="text"
                placeholder="Detalhes da situação econômica..."
                value={customSummary}
                onChange={(e) => setCustomSummary(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Explicação / Dica do Analista (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: 💡 Isso beneficia exportadoras e prejudica o varejo..."
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Escolha o impacto desta notícia nas ações (clique para marcar):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {INITIAL_STOCKS.map((st) => {
                const currentImpact = customImpacts[st.ticker] || 0;
                return (
                  <div
                    key={st.ticker}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">
                        {st.icon} {st.ticker}
                      </span>
                      {currentImpact !== 0 && (
                        <span
                          className={`text-[10px] font-bold ${
                            currentImpact > 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {currentImpact > 0
                            ? `+${Math.round(currentImpact * 100)}%`
                            : `${Math.round(currentImpact * 100)}%`}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: "-15%", val: -0.15, cls: "bg-rose-950 text-rose-300 border-rose-700" },
                        { label: "-8%", val: -0.08, cls: "bg-rose-900/50 text-rose-300 border-rose-800" },
                        { label: "+8%", val: 0.08, cls: "bg-emerald-900/50 text-emerald-300 border-emerald-800" },
                        { label: "+15%", val: 0.15, cls: "bg-emerald-950 text-emerald-300 border-emerald-700" },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => toggleImpact(st.ticker, btn.val)}
                          className={`py-1 rounded text-[10px] font-bold border cursor-pointer ${
                            currentImpact === btn.val
                              ? "ring-2 ring-amber-400 bg-amber-500 text-slate-950"
                              : btn.cls
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            Publicar Plantão Personalizado Agora
          </button>
        </form>
      )}

      {/* CONTEÚDO DA ABA 3: CONTROLAR PREÇOS DAS EMPRESAS INDIVIDUALMENTE */}
      {activeTab === "empresas" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {INITIAL_STOCKS.map((info) => {
            const live = marketState?.stocks?.[info.ticker] || {
              price: info.initialPrice,
              changePct: 0,
            };
            const isUp = (live.changePct || 0) >= 0;
            return (
              <div
                key={info.ticker}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">
                      {info.icon} {info.ticker}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                        isUp ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {isUp ? "+" : ""}
                      {Number(live.changePct || 0).toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{info.name}</p>
                  <p className="text-lg font-black text-white mt-1">{formatBRL(live.price)}</p>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => onAdjustStock(info.ticker, -0.15)}
                    className="py-1.5 rounded bg-rose-600/20 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/30 text-xs font-extrabold cursor-pointer transition-all"
                  >
                    -15%
                  </button>
                  <button
                    onClick={() => onAdjustStock(info.ticker, -0.05)}
                    className="py-1.5 rounded bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-300 border border-rose-500/20 text-xs font-bold cursor-pointer transition-all"
                  >
                    -5%
                  </button>
                  <button
                    onClick={() => onAdjustStock(info.ticker, 0.05)}
                    className="py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/20 text-xs font-bold cursor-pointer transition-all"
                  >
                    +5%
                  </button>
                  <button
                    onClick={() => onAdjustStock(info.ticker, 0.15)}
                    className="py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold cursor-pointer transition-all"
                  >
                    +15%
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONTEÚDO DA ABA 4: AUDITORIA & RANKING DE QUEM MAIS GANHOU E QUEM MAIS PERDEU */}
      {activeTab === "ranking" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Acompanhe em tempo real quem está lucrando mais e quem está tendo prejuízo na carteira.
            </p>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Deseja remover todos os jogadores da lista e reiniciar a sala limpa?"
                  )
                ) {
                  onResetMarket(true);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar Lista de Jogadores
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Coluna 1: Maiores Ganhadores */}
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-4">
              <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                Quem Mais Ganhou (Lucro / Acima de R$ 10.000)
              </h3>
              {winners.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Nenhum aluno com saldo positivo ainda.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {winners.map((p, idx) => {
                    const diff = (p.netWorth || 10000) - 10000;
                    const pct = ((diff / 10000) * 100).toFixed(2);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-slate-900/90 px-3 py-2.5 rounded-lg border border-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 text-center font-black text-amber-400 text-sm">
                            {idx + 1}º
                          </span>
                          <span className="text-xl">{p.avatar || "🦈"}</span>
                          <div>
                            <p className="text-sm font-bold text-white leading-none">
                              {p.name}{" "}
                              <span className="text-[11px] text-slate-400 font-normal">
                                ({p.turma || "Geral"})
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Caixa: {formatBRL(p.cash)} • {p.tradesCount || 0} ordens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">{formatBRL(p.netWorth)}</p>
                          <p className="text-xs font-bold text-emerald-400">
                            +{formatBRL(diff)} (+{pct}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Coluna 2: Quem Mais Perdeu */}
            <div className="bg-slate-950/90 border border-rose-500/30 rounded-xl p-4">
              <h3 className="text-sm font-black text-rose-400 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Quem Mais Perdeu (Prejuízo / Abaixo de R$ 10.000)
              </h3>
              {losers.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Nenhum aluno está no prejuízo neste momento! 🎉
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {losers.map((p, idx) => {
                    const diff = (p.netWorth || 10000) - 10000;
                    const pct = ((diff / 10000) * 100).toFixed(2);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-slate-900/90 px-3 py-2.5 rounded-lg border border-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 text-center font-black text-rose-400 text-sm">
                            {idx + 1}º
                          </span>
                          <span className="text-xl">{p.avatar || "🦈"}</span>
                          <div>
                            <p className="text-sm font-bold text-white leading-none">
                              {p.name}{" "}
                              <span className="text-[11px] text-slate-400 font-normal">
                                ({p.turma || "Geral"})
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Caixa: {formatBRL(p.cash)} • {p.tradesCount || 0} ordens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">{formatBRL(p.netWorth)}</p>
                          <p className="text-xs font-bold text-rose-400">
                            {formatBRL(diff)} ({pct}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
