"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { doc, collection, onSnapshot } from "firebase/firestore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Newspaper,
  Trophy,
  Clock,
  Volume2,
  VolumeX,
  BookOpen,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Sliders,
  LogOut,
  CheckCircle2,
  Activity,
  Building2,
  X,
} from "lucide-react";

import {
  INITIAL_STOCKS,
  INITIAL_CASH,
  DEFAULT_DURATION_SECONDS,
  NEWS_CHANNELS,
  GLOSSARY_ITEMS,
  AVATARS,
} from "@/components/investimento/marketData";
import { soundFX } from "@/components/investimento/soundEffects";
import AdminPanel from "@/components/investimento/AdminPanel";
import FinalRankingModal from "@/components/investimento/FinalRankingModal";

function createLocalInitialMarketState() {
  const stocksMap = {};
  const firstPoint = {
    step: 0,
    timeLabel: "10:00",
  };

  INITIAL_STOCKS.forEach((s) => {
    stocksMap[s.ticker] = {
      ticker: s.ticker,
      price: s.initialPrice,
      openPrice: s.initialPrice,
      prevPrice: s.initialPrice,
      highPrice: s.initialPrice,
      lowPrice: s.initialPrice,
      changePct: 0,
      lastTickDelta: 0,
      momentum: 0,
    };
    firstPoint[s.ticker] = s.initialPrice;
  });

  return {
    resetId: 0,
    status: "pregao_aberto",
    durationSeconds: DEFAULT_DURATION_SECONDS,
    elapsedSeconds: 0,
    speed: 1,
    autoNews: true,
    showTips: true,
    sessionCode: "VILA-B3",
    stocks: stocksMap,
    priceHistory: [firstPoint],
    newsFeed: [
      {
        id: "abertura_bolsa",
        channel: "INFOGRANA",
        title: "🔔 SINO DE ABERTURA: Bolsa de Valores do Banco Vila (B3V) aberta para negociações!",
        summary:
          "Cada investidor inicia com R$ 10.000,00 na conta da Corretora Banco Vila. Analise os gráficos, leia as notícias em tempo real e monte sua carteira de ações!",
        educationalNote:
          "💡 DICA INICIAL: Diversifique sua carteira comprando empresas de setores diferentes e deixe uma reserva em caixa para aproveitar notícias urgentes!",
        impacts: {},
        timestamp: Date.now(),
        marketTime: "10:00",
      },
    ],
    orderTape: [],
    dividendEvents: [],
    updatedAt: 0,
  };
}

export default function InvestimentoPage() {
  const { user: authUser } = useAuth();

  // Identificação do Jogador ou Professor Admin
  const [player, setPlayer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [loginTab, setLoginTab] = useState("aluno"); // 'aluno' | 'professor'

  // Formulário de Entrada do Aluno
  const [inputName, setInputName] = useState("");
  const [inputTurma, setInputTurma] = useState("7º Ano");
  const [inputAvatar, setInputAvatar] = useState("🐂");

  // Formulário de Entrada do Professor Admin
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  // Estado Global do Mercado e Jogadores Online
  const [marketState, setMarketState] = useState(() => createLocalInitialMarketState());
  const [players, setPlayers] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState("PETV4");
  const [tradeQty, setTradeQty] = useState(10);
  const [rightTab, setRightTab] = useState("noticias"); // 'noticias' | 'ranking' | 'carteira'
  const [isMuted, setIsMuted] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [toast, setToast] = useState(null);
  const [breakingBanner, setBreakingBanner] = useState(null);

  const lastSeenNewsIdRef = useRef("abertura_bolsa");
  const lastDividendTimestampRef = useRef(0);
  const lastResetIdRef = useRef(null);

  const showToastMsg = useCallback((type, title, subtitle) => {
    setToast({ type, title, subtitle, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Restaurar sessão salva no navegador
  useEffect(() => {
    try {
      const savedPlayer = localStorage.getItem("bv_invest_player");
      if (savedPlayer) {
        const parsed = JSON.parse(savedPlayer);
        if (parsed && parsed.id && parsed.name) {
          setPlayer({
            ...parsed,
            cash: typeof parsed.cash === "number" ? parsed.cash : INITIAL_CASH,
            holdings: parsed.holdings || {},
            tradesCount: parsed.tradesCount || 0,
            tradeHistory: parsed.tradeHistory || [],
          });
          if (parsed.lastDividendTimestamp) {
            lastDividendTimestampRef.current = parsed.lastDividendTimestamp;
          }
          if (parsed.resetId) {
            lastResetIdRef.current = parsed.resetId;
          }
        }
      }
      const savedAdmin = localStorage.getItem("bv_invest_admin");
      if (savedAdmin === "true") {
        setIsAdmin(true);
        setShowAdminPanel(true);
      }
    } catch (e) {}
  }, []);

  // Se o professor já estiver autenticado no Portal Vila Guaracy, libera botão Admin
  useEffect(() => {
    if (
      authUser &&
      (authUser.role === "gestao" ||
        authUser.role === "coordenador" ||
        authUser.role === "professor")
    ) {
      setIsAdmin(true);
    }
  }, [authUser]);

  // Sincronização Centralizada com o Servidor (/api/investimento)
  const fetchMarketViaApi = useCallback(async () => {
    try {
      const res = await fetch("/api/investimento", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.marketState && data.marketState.stocks) {
        setMarketState(data.marketState);
      }
      if (Array.isArray(data.players)) {
        setPlayers(data.players);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchMarketViaApi();

    let unsubMarket = null;
    let unsubPlayers = null;

    try {
      unsubMarket = onSnapshot(
        doc(db, "investimento_sala", "mercado_principal"),
        (docSnap) => {
          if (docSnap.exists()) {
            const remoteData = docSnap.data();
            if (remoteData && remoteData.stocks) {
              setMarketState(remoteData);
            }
          }
        },
        () => {}
      );

      unsubPlayers = onSnapshot(
        collection(db, "investimento_jogadores"),
        (querySnap) => {
          const list = [];
          querySnap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          if (list.length > 0) {
            setPlayers(list);
          }
        },
        () => {}
      );
    } catch (e) {}

    // O polling a cada 2.5s também aciona o tick centralizado no servidor para todos os alunos!
    const pollInterval = setInterval(fetchMarketViaApi, 2500);

    return () => {
      if (unsubMarket) unsubMarket();
      if (unsubPlayers) unsubPlayers();
      clearInterval(pollInterval);
    };
  }, [fetchMarketViaApi]);

  // Detectar chegada de Nova Notícia (Plantão) e tocar efeito sonoro
  useEffect(() => {
    const latestNews = marketState?.newsFeed?.[0];
    if (!latestNews) return;

    if (!lastSeenNewsIdRef.current) {
      lastSeenNewsIdRef.current = latestNews.id;
      return;
    }

    if (latestNews.id !== lastSeenNewsIdRef.current) {
      lastSeenNewsIdRef.current = latestNews.id;
      setBreakingBanner(latestNews);
      soundFX.playBreakingNews();
    }
  }, [marketState?.newsFeed]);

  // Detectar EXCLUSIVAMENTE quando o Professor clica em "Resetar Dia" (mudança real de marketState.resetId)
  useEffect(() => {
    const serverResetId = marketState?.resetId;
    if (!serverResetId || !player?.id) return;

    if (lastResetIdRef.current === null) {
      lastResetIdRef.current = serverResetId;
      return;
    }

    if (serverResetId !== lastResetIdRef.current) {
      lastResetIdRef.current = serverResetId;
      const resetP = {
        ...player,
        resetId: serverResetId,
        cash: INITIAL_CASH,
        holdings: {},
        tradesCount: 0,
        tradeHistory: [],
      };
      setPlayer(resetP);
      try {
        localStorage.setItem("bv_invest_player", JSON.stringify(resetP));
      } catch (e) {}
      showToastMsg(
        "info",
        "🔄 Novo Dia de Pregão Iniciado pelo Professor!",
        "Sua conta foi reiniciada com R$ 10.000,00."
      );
    }
  }, [marketState?.resetId, player, showToastMsg]);

  // Detectar pagamento de Dividendos pelo Professor
  useEffect(() => {
    if (!player?.id || players.length === 0) return;
    const remoteMe = players.find((p) => p.id === player.id);
    if (!remoteMe?.lastDividend?.timestamp) return;

    if (remoteMe.lastDividend.timestamp > lastDividendTimestampRef.current) {
      const divTs = remoteMe.lastDividend.timestamp;
      const divAmount = Number(remoteMe.lastDividend.amount || 0);
      lastDividendTimestampRef.current = divTs;

      if (divAmount > 0) {
        setPlayer((prev) => {
          if (!prev) return prev;
          const newCash = Number((Number(prev.cash || 0) + divAmount).toFixed(2));
          const updated = {
            ...prev,
            cash: newCash,
            lastDividendTimestamp: divTs,
          };
          try {
            localStorage.setItem("bv_invest_player", JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        soundFX.playBuy();
        showToastMsg(
          "success",
          `💰 Dividendos Recebidos: +R$ ${divAmount.toFixed(2)}`,
          "O valor já foi somado ao seu Saldo Livre no Banco Vila!"
        );
      }
    }
  }, [players, player?.id, showToastMsg]);

  // Cálculo em tempo real do Patrimônio do Aluno com base nos preços atuais da Bolsa
  const portfolioMetrics = useMemo(() => {
    const cash = Number(player?.cash ?? INITIAL_CASH);
    const holdings = player?.holdings || {};
    const stocksMap = marketState?.stocks || {};

    let investedMarketValue = 0;
    let totalCostBasis = 0;
    const positions = [];

    INITIAL_STOCKS.forEach((info) => {
      const pos = holdings[info.ticker];
      const qty = Number(pos?.qty || 0);
      const avgPrice = Number(pos?.avgPrice || 0);
      const currentPrice = Number(stocksMap[info.ticker]?.price ?? info.initialPrice);

      if (qty > 0) {
        const marketVal = Number((qty * currentPrice).toFixed(2));
        const costVal = Number((qty * avgPrice).toFixed(2));
        const profitVal = Number((marketVal - costVal).toFixed(2));
        const profitPct = costVal > 0 ? (profitVal / costVal) * 100 : 0;

        investedMarketValue += marketVal;
        totalCostBasis += costVal;

        positions.push({
          ...info,
          qty,
          avgPrice,
          currentPrice,
          marketVal,
          profitVal,
          profitPct,
        });
      }
    });

    const netWorth = Number((cash + investedMarketValue).toFixed(2));
    const totalProfit = Number((netWorth - INITIAL_CASH).toFixed(2));
    const totalProfitPct = Number(((totalProfit / INITIAL_CASH) * 100).toFixed(2));

    return {
      cash: Number(cash.toFixed(2)),
      investedMarketValue: Number(investedMarketValue.toFixed(2)),
      totalCostBasis: Number(totalCostBasis.toFixed(2)),
      netWorth,
      totalProfit,
      totalProfitPct,
      positions,
    };
  }, [player, marketState?.stocks]);

  // Garantir que o jogador atual sempre apareça com seu saldo exato na lista de jogadores
  const allPlayersWithMe = useMemo(() => {
    if (!player?.id) return players;
    const myLiveEntry = {
      ...player,
      cash: portfolioMetrics.cash,
      netWorth: portfolioMetrics.netWorth,
      profit: portfolioMetrics.totalProfit,
      profitPct: portfolioMetrics.totalProfitPct,
    };
    const others = players.filter((p) => p.id !== player.id);
    return [myLiveEntry, ...others];
  }, [players, player, portfolioMetrics]);

  // Sincronizar carteira do aluno com o servidor periodicamente (para o ranking de todos ficar atualizado)
  useEffect(() => {
    if (!player?.id) return;
    const payload = {
      id: player.id,
      name: player.name,
      turma: player.turma,
      avatar: player.avatar,
      cash: portfolioMetrics.cash,
      holdings: player.holdings || {},
      netWorth: portfolioMetrics.netWorth,
      profit: portfolioMetrics.totalProfit,
      profitPct: portfolioMetrics.totalProfitPct,
      tradesCount: player.tradesCount || 0,
      tradeHistory: player.tradeHistory || [],
    };

    const timer = setTimeout(() => {
      fetch("/api/investimento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "syncPlayer",
          playerId: player.id,
          playerData: payload,
        }),
      }).catch(() => {});
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    player?.id,
    player?.name,
    player?.turma,
    player?.avatar,
    player?.holdings,
    player?.tradesCount,
    player?.tradeHistory,
    portfolioMetrics.cash,
    portfolioMetrics.netWorth,
    portfolioMetrics.totalProfit,
    portfolioMetrics.totalProfitPct,
  ]);

  const formatSimulatedClock = (elapsed, duration) => {
    const ratio = Math.min(1, Math.max(0, elapsed / (duration || DEFAULT_DURATION_SECONDS)));
    const totalSimMinutes = Math.floor(ratio * 420);
    const hours = 10 + Math.floor(totalSimMinutes / 60);
    const mins = totalSimMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // ============================================================================
  // AÇÕES DO JOGADOR (ENTRAR, COMPRAR E VENDER AÇÕES COM ATUALIZAÇÃO GARANTIDA)
  // ============================================================================
  const handleJoinAsStudent = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanName = (inputName || "").trim() || "Investidor";

    const existingId =
      player?.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const currentResetId = marketState?.resetId || Date.now();
    lastResetIdRef.current = currentResetId;

    const newPlayer = {
      id: existingId,
      resetId: currentResetId,
      name: cleanName,
      turma: inputTurma || "7º Ano",
      avatar: inputAvatar || "🐂",
      cash: INITIAL_CASH,
      holdings: {},
      netWorth: INITIAL_CASH,
      profit: 0,
      profitPct: 0,
      tradesCount: 0,
      tradeHistory: [],
      lastSeen: Date.now(),
      online: true,
      createdAt: Date.now(),
    };

    setPlayer(newPlayer);
    try {
      localStorage.setItem("bv_invest_player", JSON.stringify(newPlayer));
    } catch (err) {}

    soundFX.playBuy();
    showToastMsg(
      "success",
      `Bem-vindo(a) ao Banco Vila, ${cleanName}!`,
      "Você recebeu R$ 10.000,00 para investir na Bolsa B3V."
    );

    fetch("/api/investimento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "joinPlayer",
        playerId: existingId,
        name: cleanName,
        turma: inputTurma,
        avatar: inputAvatar,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.marketState?.resetId) {
          lastResetIdRef.current = data.marketState.resetId;
        }
      })
      .catch(() => {});
  };

  const handleLoginAdmin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const pwd = adminPassword.trim().toLowerCase();
    if (
      pwd === "vila@123" ||
      pwd === "admin" ||
      pwd === "professor" ||
      pwd === "guaracy" ||
      pwd === "123456"
    ) {
      setIsAdmin(true);
      setShowAdminPanel(true);
      setAdminError("");
      try {
        localStorage.setItem("bv_invest_admin", "true");
      } catch (err) {}
      if (!player) {
        const profPlayer = {
          id: "prof_admin_vila",
          resetId: marketState?.resetId || Date.now(),
          name: "Prof. Administrador",
          turma: "Mesa Diretora",
          avatar: "👑",
          cash: INITIAL_CASH,
          holdings: {},
          tradesCount: 0,
          tradeHistory: [],
        };
        lastResetIdRef.current = profPlayer.resetId;
        setPlayer(profPlayer);
        try {
          localStorage.setItem("bv_invest_player", JSON.stringify(profPlayer));
        } catch (err) {}
      }
      showToastMsg(
        "success",
        "Acesso de Professor Liberado!",
        "Controle o pregão e dispare notícias."
      );
    } else {
      setAdminError("Senha incorreta. Dica: use Vila@123 ou professor.");
    }
  };

  const selectedStockInfo = useMemo(
    () => INITIAL_STOCKS.find((s) => s.ticker === selectedTicker) || INITIAL_STOCKS[0],
    [selectedTicker]
  );

  const selectedStockLive = useMemo(() => {
    const live = marketState?.stocks?.[selectedTicker];
    return (
      live || {
        ticker: selectedTicker,
        price: selectedStockInfo.initialPrice,
        openPrice: selectedStockInfo.initialPrice,
        highPrice: selectedStockInfo.initialPrice,
        lowPrice: selectedStockInfo.initialPrice,
        changePct: 0,
      }
    );
  }, [marketState?.stocks, selectedTicker, selectedStockInfo]);

  const currentHolding = useMemo(() => {
    return player?.holdings?.[selectedTicker] || { qty: 0, avgPrice: 0 };
  }, [player?.holdings, selectedTicker]);

  const maxAffordableQty = useMemo(() => {
    const price = Number(selectedStockLive?.price || 0);
    const availableCash = Number(player?.cash ?? INITIAL_CASH);
    if (price <= 0) return 0;
    return Math.floor((availableCash + 0.0001) / price);
  }, [player?.cash, selectedStockLive?.price]);

  const handleExecuteTrade = async (type) => {
    if (!player) return;
    if (marketState?.status === "encerrado") {
      showToastMsg("error", "Pregão Encerrado!", "O sino de fechamento já tocou.");
      return;
    }

    const rawQty = Math.max(1, Math.floor(Number(tradeQty) || 1));
    const price = Number(selectedStockLive.price);
    const currentCash = Number(player.cash ?? INITIAL_CASH);
    const holdings = { ...(player.holdings || {}) };
    const pos = holdings[selectedTicker] || { qty: 0, avgPrice: 0 };

    if (type === "BUY") {
      // Se o aluno digitou mais ações do que o saldo permite, ajusta ou avisa claramente
      if (maxAffordableQty <= 0) {
        showToastMsg(
          "error",
          "Saldo Insuficiente no Banco Vila!",
          `Seu saldo livre é R$ ${currentCash.toFixed(2)} e 1 ação de ${selectedTicker} custa R$ ${price.toFixed(2)}.`
        );
        return;
      }

      const qtyToBuy = rawQty > maxAffordableQty ? maxAffordableQty : rawQty;
      const totalCost = Number((qtyToBuy * price).toFixed(2));

      const oldQty = Number(pos.qty || 0);
      const oldAvg = Number(pos.avgPrice || 0);
      const newQty = oldQty + qtyToBuy;
      const newAvgPrice = Number(((oldQty * oldAvg + totalCost) / newQty).toFixed(2));

      holdings[selectedTicker] = { qty: newQty, avgPrice: newAvgPrice };
      const newCash = Math.max(0, Number((currentCash - totalCost).toFixed(2)));

      const tradeRecord = {
        id: Date.now(),
        type: "BUY",
        ticker: selectedTicker,
        qty: qtyToBuy,
        price,
        total: totalCost,
        time:
          marketState?.priceHistory?.[marketState.priceHistory.length - 1]?.timeLabel || "Agora",
      };

      const updatedPlayer = {
        ...player,
        cash: newCash,
        holdings,
        tradesCount: Number(player.tradesCount || 0) + 1,
        tradeHistory: [tradeRecord, ...(player.tradeHistory || [])].slice(0, 30),
      };

      setPlayer(updatedPlayer);
      try {
        localStorage.setItem("bv_invest_player", JSON.stringify(updatedPlayer));
      } catch (e) {}

      soundFX.playBuy();
      showToastMsg(
        "success",
        `✅ Compra Confirmada: +${qtyToBuy}x ${selectedTicker}`,
        `Investido: R$ ${totalCost.toFixed(2)} • Novo Saldo Livre: R$ ${newCash.toFixed(2)}`
      );

      try {
        const res = await fetch("/api/investimento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "syncPlayer",
            playerId: updatedPlayer.id,
            playerData: updatedPlayer,
            tradeOrder: tradeRecord,
          }),
        });
        const data = await res.json();
        if (data?.marketState) setMarketState(data.marketState);
      } catch (e) {}
    } else if (type === "SELL") {
      const ownedQty = Number(pos.qty || 0);
      if (ownedQty <= 0) {
        showToastMsg(
          "error",
          "Você não possui esta ação!",
          `Compre ações de ${selectedTicker} antes de vender.`
        );
        return;
      }

      const qtyToSell = rawQty > ownedQty ? ownedQty : rawQty;
      const totalSaleValue = Number((qtyToSell * price).toFixed(2));
      const profitOnSale = Number(((price - Number(pos.avgPrice || price)) * qtyToSell).toFixed(2));
      const newQty = ownedQty - qtyToSell;

      if (newQty <= 0) {
        delete holdings[selectedTicker];
      } else {
        holdings[selectedTicker] = { qty: newQty, avgPrice: pos.avgPrice };
      }

      const newCash = Number((currentCash + totalSaleValue).toFixed(2));
      const tradeRecord = {
        id: Date.now(),
        type: "SELL",
        ticker: selectedTicker,
        qty: qtyToSell,
        price,
        total: totalSaleValue,
        profitOnSale,
        time:
          marketState?.priceHistory?.[marketState.priceHistory.length - 1]?.timeLabel || "Agora",
      };

      const updatedPlayer = {
        ...player,
        cash: newCash,
        holdings,
        tradesCount: Number(player.tradesCount || 0) + 1,
        tradeHistory: [tradeRecord, ...(player.tradeHistory || [])].slice(0, 30),
      };

      setPlayer(updatedPlayer);
      try {
        localStorage.setItem("bv_invest_player", JSON.stringify(updatedPlayer));
      } catch (e) {}

      soundFX.playSell();
      showToastMsg(
        profitOnSale >= 0 ? "success" : "info",
        `💰 Venda Confirmada: -${qtyToSell}x ${selectedTicker} (+R$ ${totalSaleValue.toFixed(2)})`,
        `Novo Saldo Livre: R$ ${newCash.toFixed(2)} (${
          profitOnSale >= 0 ? `Lucro: +R$ ${profitOnSale.toFixed(2)}` : `Resultado: R$ ${profitOnSale.toFixed(2)}`
        })`
      );

      try {
        const res = await fetch("/api/investimento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "syncPlayer",
            playerId: updatedPlayer.id,
            playerData: updatedPlayer,
            tradeOrder: tradeRecord,
          }),
        });
        const data = await res.json();
        if (data?.marketState) setMarketState(data.marketState);
      } catch (e) {}
    }
  };

  // ============================================================================
  // FUNÇÕES ADMINISTRATIVAS DO PROFESSOR (SINCRONIZADAS NO SERVIDOR)
  // ============================================================================
  const sendAdminPatch = async (patch) => {
    setMarketState((prev) => ({ ...prev, ...patch, updatedAt: Date.now() }));
    try {
      const res = await fetch("/api/investimento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adminUpdateMarket",
          marketPatch: patch,
        }),
      });
      const data = await res.json();
      if (data?.marketState) setMarketState(data.marketState);
    } catch (e) {}
  };

  const handleAdminStartMarket = async () => {
    soundFX.playBell();
    await sendAdminPatch({ status: "pregao_aberto", lastTickAt: Date.now() });
    showToastMsg(
      "success",
      "🔔 Pregão Iniciado!",
      "O relógio de 30 minutos e os gráficos estão rodando para toda a turma."
    );
  };

  const handleAdminPauseMarket = async () => {
    await sendAdminPatch({ status: "pausado" });
    showToastMsg("info", "⏸️ Pregão Pausado", "As cotações estão temporariamente congeladas.");
  };

  const handleAdminEndMarket = async () => {
    soundFX.playBell();
    await sendAdminPatch({ status: "encerrado" });
  };

  const handleAdminResetMarket = async (clearPlayers = false) => {
    try {
      const res = await fetch("/api/investimento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adminResetGame",
          clearPlayers,
        }),
      });
      const data = await res.json();
      if (data?.marketState) {
        setMarketState(data.marketState);
        lastResetIdRef.current = data.marketState.resetId;
      }
      if (player) {
        const resetP = {
          ...player,
          resetId: data?.marketState?.resetId || Date.now(),
          cash: INITIAL_CASH,
          holdings: {},
          tradesCount: 0,
          tradeHistory: [],
        };
        setPlayer(resetP);
        try {
          localStorage.setItem("bv_invest_player", JSON.stringify(resetP));
        } catch (e) {}
      }
      fetchMarketViaApi();
      showToastMsg(
        "success",
        "🔄 Mercado Reiniciado!",
        "Todos os alunos voltaram para R$ 10.000,00."
      );
    } catch (e) {}
  };

  const handleAdminTriggerScenario = async (scenario) => {
    const now = Date.now();
    const simClock = formatSimulatedClock(
      marketState?.elapsedSeconds || 0,
      marketState?.durationSeconds || DEFAULT_DURATION_SECONDS
    );

    const nextStocks = { ...(marketState?.stocks || {}) };
    const latestPoint = {
      ...(marketState?.priceHistory?.[marketState.priceHistory.length - 1] || {
        step: 1,
        timeLabel: simClock,
      }),
      step: (marketState?.priceHistory?.length || 0) + 1,
      timeLabel: simClock,
    };

    Object.entries(scenario.impacts || {}).forEach(([tk, pct]) => {
      if (nextStocks[tk]) {
        const st = { ...nextStocks[tk] };
        const newPrice = Math.max(1.5, Number((st.price * (1 + pct * 0.55)).toFixed(2)));
        st.prevPrice = st.price;
        st.price = newPrice;
        st.highPrice = Math.max(st.highPrice || newPrice, newPrice);
        st.lowPrice = Math.min(st.lowPrice || newPrice, newPrice);
        st.changePct = Number((((newPrice - st.openPrice) / st.openPrice) * 100).toFixed(2));
        st.momentum = Number(((st.momentum || 0) + pct * 0.45).toFixed(4));
        nextStocks[tk] = st;
        latestPoint[tk] = newPrice;
      }
    });

    const newsItem = {
      id: `scen_${now}`,
      channel: scenario.channel || "G10",
      title: scenario.title,
      summary: scenario.summary,
      educationalNote: scenario.educationalNote,
      impacts: scenario.impacts || {},
      timestamp: now,
      marketTime: simClock,
    };

    const nextHistory = [...(marketState?.priceHistory || []), latestPoint].slice(-80);
    const nextNewsFeed = [newsItem, ...(marketState?.newsFeed || [])].slice(0, 30);

    await sendAdminPatch({
      stocks: nextStocks,
      priceHistory: nextHistory,
      newsFeed: nextNewsFeed,
    });
    showToastMsg("success", "📢 Plantão Disparado para a Turma!", scenario.title);
  };

  const handleAdminAdjustStock = async (ticker, pctDelta) => {
    if (!marketState?.stocks?.[ticker]) return;
    const simClock = formatSimulatedClock(
      marketState.elapsedSeconds || 0,
      marketState.durationSeconds || DEFAULT_DURATION_SECONDS
    );

    const nextStocks = { ...marketState.stocks };
    const st = { ...nextStocks[ticker] };
    const newPrice = Math.max(1.5, Number((st.price * (1 + pctDelta)).toFixed(2)));
    st.prevPrice = st.price;
    st.price = newPrice;
    st.highPrice = Math.max(st.highPrice || newPrice, newPrice);
    st.lowPrice = Math.min(st.lowPrice || newPrice, newPrice);
    st.changePct = Number((((newPrice - st.openPrice) / st.openPrice) * 100).toFixed(2));
    nextStocks[ticker] = st;

    const latestPoint = {
      ...(marketState.priceHistory?.[marketState.priceHistory.length - 1] || {}),
      step: (marketState.priceHistory?.length || 0) + 1,
      timeLabel: simClock,
      [ticker]: newPrice,
    };

    await sendAdminPatch({
      stocks: nextStocks,
      priceHistory: [...(marketState.priceHistory || []), latestPoint].slice(-80),
    });
  };

  const handleAdminPayDividends = async (yieldPct = 0.03) => {
    try {
      const res = await fetch("/api/investimento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adminPayDividends",
          yieldPct,
        }),
      });
      const data = await res.json();
      if (data?.marketState) setMarketState(data.marketState);
      fetchMarketViaApi();
      showToastMsg(
        "success",
        "💰 Dividendos Distribuídos!",
        `${data?.totalPaidPlayers || 0} investidor(es) com ações na carteira receberam +3% em dinheiro!`
      );
    } catch (e) {}
  };

  const handleAdminUpdateSettings = async (patch) => {
    await sendAdminPatch(patch);
  };

  const formatBRL = (val) =>
    Number(val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const remainingSeconds = Math.max(
    0,
    (marketState?.durationSeconds || DEFAULT_DURATION_SECONDS) -
      (marketState?.elapsedSeconds || 0)
  );
  const remMins = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const remSecs = String(remainingSeconds % 60).padStart(2, "0");
  const simulatedTime = formatSimulatedClock(
    marketState?.elapsedSeconds || 0,
    marketState?.durationSeconds || DEFAULT_DURATION_SECONDS
  );

  const sortedPlayers = useMemo(() => {
    return [...allPlayersWithMe].sort(
      (a, b) => (b.netWorth || INITIAL_CASH) - (a.netWorth || INITIAL_CASH)
    );
  }, [allPlayersWithMe]);

  // ============================================================================
  // TELA DE ENTRADA (SE O ALUNO/PROFESSOR AINDA NÃO ENTROU NA CORRETORA)
  // ============================================================================
  if (!player) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="relative z-10 bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-black text-emerald-400">
            <Building2 className="w-4 h-4" />
            <span>BANCO VILA CORRETORA • BOLSA B3V</span>
          </div>
          <Link href="/" className="text-slate-400 hover:text-white font-semibold">
            ← Voltar ao Portal Vila Guaracy
          </Link>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-center gap-10 my-auto">
          <div className="max-w-xl space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Educação Financeira na Prática • Pregão de 30 Minutos
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 text-slate-950 font-black text-3xl">
                BV
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  Banco <span className="text-emerald-400">Vila</span>
                </h1>
                <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">
                  Home Broker & Bolsa de Valores Escolar
                </p>
              </div>
            </div>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Você acaba de receber{" "}
              <strong className="text-emerald-400 font-black">R$ 10.000,00</strong> na sua conta do{" "}
              <strong className="text-white">Banco Vila</strong>! Analise os gráficos, acompanhe os
              plantões da <span className="text-rose-400 font-semibold">G10 Economia</span>,{" "}
              <span className="text-emerald-400 font-semibold">Valor da Vila</span> e{" "}
              <span className="text-blue-400 font-semibold">InfoGrana</span>, e compre e venda ações
              em tempo real!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-emerald-400 font-black text-lg">R$ 10.000,00</div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Capital inicial na sua conta da corretora
                </p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-amber-400 font-black text-lg">10 Empresas</div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Baseadas nas gigantes reais da Bolsa do Brasil
                </p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-cyan-400 font-black text-lg">Ao Vivo</div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {players.length} investidor(es) conectado(s) agora
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => setLoginTab("aluno")}
                className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                  loginTab === "aluno"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🎓 Sou Aluno Investidor
              </button>
              <button
                type="button"
                onClick={() => setLoginTab("professor")}
                className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                  loginTab === "professor"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                👑 Sou Professor (Admin)
              </button>
            </div>

            {loginTab === "aluno" ? (
              <form onSubmit={handleJoinAsStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Seu Nome ou Apelido de Investidor:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={28}
                    placeholder="Ex: Weslley"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Sua Turma:</label>
                  <select
                    value={inputTurma}
                    onChange={(e) => setInputTurma(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="6º Ano">6º Ano</option>
                    <option value="7º Ano">7º Ano</option>
                    <option value="8º Ano">8º Ano</option>
                    <option value="9º Ano">9º Ano</option>
                    <option value="1ª Série EM">1ª Série EM</option>
                    <option value="2ª Série EM">2ª Série EM</option>
                    <option value="3ª Série EM">3ª Série EM</option>
                    <option value="Convidado">Turma Geral / Professor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Escolha seu Perfil na Bolsa:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setInputAvatar(av.emoji)}
                        className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                          inputAvatar === av.emoji
                            ? "bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/50"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="text-2xl">{av.emoji}</div>
                        <div className="text-[10px] text-slate-300 font-semibold truncate mt-0.5">
                          {av.label.split(" ")[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
                >
                  Abrir Conta com R$ 10.000,00 →
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginAdmin} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                  No <strong>Modo Professor Administrador</strong>, você controla o tempo do pregão
                  (até 30 min), dispara notícias econômicas do dia a dia e encerra a partida para
                  exibir o ranking de quem mais ganhou e quem mais perdeu.
                </div>

                {adminError && (
                  <p className="text-xs text-rose-400 font-bold bg-rose-950/60 border border-rose-800 p-2.5 rounded-lg">
                    {adminError}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Senha do Professor Administrador:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Digite a senha (ex: Vila@123 ou professor)"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-lg cursor-pointer transition-all"
                >
                  Acessar Mesa Diretora (Admin) →
                </button>
              </form>
            )}
          </div>
        </div>

        <footer className="relative z-10 text-center py-3 text-xs text-slate-500 border-t border-slate-900">
          Banco Vila Corretora de Valores • Simulador Educacional da Escola Estadual Vila Guaracy
        </footer>
      </main>
    );
  }

  // ============================================================================
  // AMBIENTE PRINCIPAL: HOME BROKER BANCO VILA CORRETORA
  // ============================================================================
  const isUpSelected = (selectedStockLive.changePct || 0) >= 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. FAIXA SUPERIOR DE COTAÇÕES DA BOLSA (TICKER TAPE INTERATIVO) */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 min-w-max">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[11px] tracking-wider uppercase flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> B3V AO VIVO
          </span>
          {INITIAL_STOCKS.map((st) => {
            const live = marketState?.stocks?.[st.ticker] || {
              price: st.initialPrice,
              changePct: 0,
            };
            const up = (live.changePct || 0) >= 0;
            const isSelected = selectedTicker === st.ticker;
            return (
              <button
                key={st.ticker}
                onClick={() => setSelectedTicker(st.ticker)}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-2 text-xs transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-slate-800 border-emerald-500/60 shadow"
                    : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50"
                }`}
              >
                <span>{st.icon}</span>
                <span className="font-black text-white">{st.ticker}</span>
                <span className="font-bold text-slate-200">R$ {Number(live.price).toFixed(2)}</span>
                <span className={`font-extrabold ${up ? "text-emerald-400" : "text-rose-400"}`}>
                  {up ? "▲" : "▼"} {up ? "+" : ""}
                  {Number(live.changePct || 0).toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. HEADER DO BANCO VILA CORRETORA */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
              BV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Banco Vila <span className="text-emerald-400 font-bold text-sm">Corretora</span>
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    marketState?.status === "pregao_aberto"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : marketState?.status === "pausado"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : marketState?.status === "encerrado"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      marketState?.status === "pregao_aberto"
                        ? "bg-emerald-400 animate-ping"
                        : "bg-amber-400"
                    }`}
                  />
                  {marketState?.status === "pregao_aberto"
                    ? "Pregão Aberto"
                    : marketState?.status === "pausado"
                    ? "Pregão Pausado"
                    : marketState?.status === "encerrado"
                    ? "Pregão Encerrado"
                    : "Aguardando Início"}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>
                  {player?.avatar || "🦈"} <strong className="text-slate-200">{player?.name}</strong>{" "}
                  ({player?.turma || "Geral"})
                </span>
                <span>•</span>
                <span className="text-cyan-400 font-semibold">
                  {allPlayersWithMe.length} investidor(es) online
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Tempo Restante:</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {remMins}:{remSecs}
                </span>
                <span className="text-xs text-slate-500">|</span>
                <span className="text-xs font-bold text-cyan-400">
                  Hora na Bolsa: {simulatedTime}h
                </span>
              </div>
              <div className="w-44 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((marketState?.elapsedSeconds || 0) /
                        (marketState?.durationSeconds || DEFAULT_DURATION_SECONDS)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Saldo Livre (Conta Vila)
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-400">
                {formatBRL(portfolioMetrics.cash)}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Em Ações na Carteira
              </span>
              <span className="text-sm sm:text-base font-black text-cyan-400">
                {formatBRL(portfolioMetrics.investedMarketValue)}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-700 px-3.5 py-1.5 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Patrimônio Total (Lucro/Prejuízo)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white">
                  {formatBRL(portfolioMetrics.netWorth)}
                </span>
                <span
                  className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                    portfolioMetrics.totalProfit >= 0
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {portfolioMetrics.totalProfit >= 0 ? "+" : ""}
                  {portfolioMetrics.totalProfitPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGlossary(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Dicas e Conceitos da Bolsa"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Guia do Investidor</span>
            </button>

            <button
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                soundFX.muted = next;
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title={isMuted ? "Ativar Som" : "Silenciar"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {isAdmin ? (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                {showAdminPanel ? "Ocultar Admin" : "Painel Professor"}
              </button>
            ) : (
              <button
                onClick={() => {
                  const pwd = window.prompt("Digite a senha do Professor Administrador:");
                  if (
                    pwd &&
                    ["vila@123", "admin", "professor", "guaracy", "123456"].includes(
                      pwd.trim().toLowerCase()
                    )
                  ) {
                    setIsAdmin(true);
                    setShowAdminPanel(true);
                    try {
                      localStorage.setItem("bv_invest_admin", "true");
                    } catch (e) {}
                  } else if (pwd) {
                    window.alert("Senha incorreta.");
                  }
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Acesso Professor Administrador"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Professor</span>
              </button>
            )}

            <button
              onClick={() => {
                if (window.confirm("Deseja sair ou trocar de usuário?")) {
                  try {
                    localStorage.removeItem("bv_invest_player");
                    localStorage.removeItem("bv_invest_admin");
                  } catch (e) {}
                  setPlayer(null);
                  setIsAdmin(false);
                  setShowAdminPanel(false);
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 cursor-pointer"
              title="Trocar de Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-4 space-y-4 flex-1">
        {isAdmin && showAdminPanel && (
          <AdminPanel
            marketState={marketState}
            players={allPlayersWithMe}
            onStartMarket={handleAdminStartMarket}
            onPauseMarket={handleAdminPauseMarket}
            onEndMarket={handleAdminEndMarket}
            onResetMarket={handleAdminResetMarket}
            onTriggerScenario={handleAdminTriggerScenario}
            onCustomNews={handleAdminTriggerScenario}
            onAdjustStock={handleAdminAdjustStock}
            onPayDividends={handleAdminPayDividends}
            onUpdateSettings={handleAdminUpdateSettings}
            onCloseAdminView={() => setShowAdminPanel(false)}
          />
        )}

        {breakingBanner && (
          <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-900 border-2 border-rose-500/70 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider animate-pulse">
                  🚨 PLANTÃO DE NOTÍCIAS •{" "}
                  {NEWS_CHANNELS[breakingBanner.channel]?.name || breakingBanner.channel}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Horário na Bolsa: {breakingBanner.marketTime || simulatedTime}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {breakingBanner.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">{breakingBanner.summary}</p>
              {marketState?.showTips !== false && breakingBanner.educationalNote && (
                <p className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg mt-1">
                  {breakingBanner.educationalNote}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {Object.keys(breakingBanner.impacts || {}).map((tk) => (
                <button
                  key={tk}
                  onClick={() => setSelectedTicker(tk)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-xs font-black text-white border border-slate-700 cursor-pointer transition-all"
                >
                  Ver Gráfico {tk} →
                </button>
              ))}
              <button
                onClick={() => setBreakingBanner(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* COLUNA ESQUERDA: LISTA DE EMPRESAS */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Ações na Bolsa B3V
                </h2>
                <p className="text-[11px] text-slate-400">
                  Clique em uma empresa para analisar e negociar
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400">10 Ativos</span>
            </div>

            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {INITIAL_STOCKS.map((st) => {
                const live = marketState?.stocks?.[st.ticker] || {
                  price: st.initialPrice,
                  changePct: 0,
                  lastTickDelta: 0,
                };
                const isUp = (live.changePct || 0) >= 0;
                const isSelected = selectedTicker === st.ticker;
                const myQty = player?.holdings?.[st.ticker]?.qty || 0;

                return (
                  <div
                    key={st.ticker}
                    onClick={() => setSelectedTicker(st.ticker)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/95 border-emerald-500 shadow-lg shadow-emerald-500/10"
                        : "bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{st.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-white">{st.ticker}</span>
                            {myQty > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold">
                                {myQty} un.
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 font-semibold leading-tight">
                            {st.name}
                          </p>
                          <p className="text-[10px] text-slate-500">{st.sector}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-white">
                          {formatBRL(live.price)}
                        </div>
                        <div
                          className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-1.5 py-0.5 rounded mt-0.5 ${
                            isUp
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {isUp ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {isUp ? "+" : ""}
                          {Number(live.changePct || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUNA CENTRAL: GRÁFICO + BOLETA */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl border border-slate-700">
                    {selectedStockInfo.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white">{selectedStockInfo.ticker}</h2>
                      <span className="text-sm font-bold text-slate-300">
                        — {selectedStockInfo.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Setor: <strong className="text-slate-200">{selectedStockInfo.sector}</strong>{" "}
                      • Inspirada na:{" "}
                      <strong className="text-amber-400">
                        {selectedStockInfo.realInspiration}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {formatBRL(selectedStockLive.price)}
                  </div>
                  <div className="flex items-center justify-end gap-2 text-xs font-bold mt-0.5">
                    <span className="text-slate-400">
                      Abertura: {formatBRL(selectedStockLive.openPrice)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-black ${
                        isUpSelected
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {isUpSelected ? "+" : ""}
                      {Number(selectedStockLive.changePct || 0).toFixed(2)}% no dia
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1">
                  <span className="font-bold text-slate-300">
                    📈 Evolução da Cotação ({selectedStockInfo.ticker}) no Pregão
                  </span>
                  <div className="flex gap-3">
                    <span>
                      Mín:{" "}
                      <strong className="text-rose-400">
                        {formatBRL(selectedStockLive.lowPrice)}
                      </strong>
                    </span>
                    <span>
                      Máx:{" "}
                      <strong className="text-emerald-400">
                        {formatBRL(selectedStockLive.highPrice)}
                      </strong>
                    </span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="88%">
                  <AreaChart data={marketState?.priceHistory || []}>
                    <defs>
                      <linearGradient id="stockColor" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={isUpSelected ? "#10b981" : "#f43f5e"}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor={isUpSelected ? "#10b981" : "#f43f5e"}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis
                      domain={["auto", "auto"]}
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `R$${Number(v).toFixed(0)}`}
                      width={52}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      formatter={(val) => [formatBRL(val), selectedStockInfo.ticker]}
                      labelFormatter={(label) => `Horário na Bolsa: ${label}h`}
                    />
                    <ReferenceLine
                      y={selectedStockInfo.initialPrice}
                      stroke="#475569"
                      strokeDasharray="4 4"
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedTicker}
                      stroke={isUpSelected ? "#10b981" : "#f43f5e"}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#stockColor)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase text-cyan-400">
                    🔍 O que faz a {selectedStockInfo.name} subir ou cair?
                  </span>
                  <div className="flex gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Risco: <strong>{selectedStockInfo.riskLevel}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                      Dividendos ref.: <strong>{selectedStockInfo.dividendYield}</strong>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedStockInfo.description}
                </p>
                <p className="text-xs font-semibold text-emerald-400 pt-1">
                  💡 Dica: {selectedStockInfo.tip}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    Boleta de Negociação — {selectedStockInfo.ticker}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Compre e venda ações instantaneamente com a Corretora Banco Vila
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-right">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">
                    Sua Posição em {selectedTicker}
                  </span>
                  {currentHolding.qty > 0 ? (
                    <div className="text-xs font-bold text-white">
                      <strong className="text-cyan-400">{currentHolding.qty} ações</strong> • Preço
                      Médio: <strong>{formatBRL(currentHolding.avgPrice)}</strong>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Você não possui esta ação</span>
                  )}
                </div>
              </div>

              {currentHolding.qty > 0 && (
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Resultado se vender suas{" "}
                    <strong>
                      {currentHolding.qty}x {selectedTicker}
                    </strong>{" "}
                    agora:
                  </span>
                  {(() => {
                    const diff =
                      (selectedStockLive.price - currentHolding.avgPrice) * currentHolding.qty;
                    const pct =
                      currentHolding.avgPrice > 0
                        ? ((selectedStockLive.price - currentHolding.avgPrice) /
                            currentHolding.avgPrice) *
                          100
                        : 0;
                    return (
                      <span
                        className={`font-black ${
                          diff >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {diff >= 0 ? `+${formatBRL(diff)}` : formatBRL(diff)} (
                        {diff >= 0 ? "+" : ""}
                        {pct.toFixed(2)}%)
                      </span>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">Quantidade de Ações:</label>
                  <span className="text-slate-400">
                    Máximo que seu saldo compra:{" "}
                    <strong className="text-emerald-400">{maxAffordableQty} ações</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={99999}
                    value={tradeQty}
                    onChange={(e) => setTradeQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-center text-lg font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {[1, 5, 10, 25, 50].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setTradeQty(n)}
                        className={`px-2.5 py-2 rounded-lg text-xs font-extrabold border cursor-pointer transition-all ${
                          tradeQty === n
                            ? "bg-emerald-500 text-slate-950 border-emerald-400"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        {n}x
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTradeQty(Math.max(1, Math.floor(maxAffordableQty / 2)))}
                      className="px-2.5 py-2 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 cursor-pointer"
                    >
                      50% Caixa
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeQty(Math.max(1, maxAffordableQty))}
                      className="px-2.5 py-2 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 cursor-pointer"
                    >
                      Máx Compra ({maxAffordableQty})
                    </button>
                    {currentHolding.qty > 0 && (
                      <button
                        type="button"
                        onClick={() => setTradeQty(currentHolding.qty)}
                        className="px-2.5 py-2 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 cursor-pointer"
                      >
                        Minhas ({currentHolding.qty})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Valor Total da Ordem:</span>
                  <span className="text-xl font-black text-white">
                    {formatBRL((Number(tradeQty) || 0) * selectedStockLive.price)}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>Cotação unitária: {formatBRL(selectedStockLive.price)}</div>
                  <div className="text-emerald-400 font-semibold">
                    Taxa de Corretagem: R$ 0,00 (Zero)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleExecuteTrade("BUY")}
                  disabled={maxAffordableQty <= 0 || marketState?.status === "encerrado"}
                  className="py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  <TrendingUp className="w-5 h-5" />
                  COMPRAR {selectedTicker}
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteTrade("SELL")}
                  disabled={currentHolding.qty <= 0 || marketState?.status === "encerrado"}
                  className="py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer transition-all"
                >
                  <TrendingDown className="w-5 h-5" />
                  VENDER {selectedTicker}
                </button>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: NOTÍCIAS, RANKING ONLINE E CARTEIRA */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setRightTab("noticias")}
                className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  rightTab === "noticias"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                Notícias ({marketState?.newsFeed?.length || 0})
              </button>

              <button
                onClick={() => setRightTab("ranking")}
                className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  rightTab === "ranking"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Online ({allPlayersWithMe.length})
              </button>

              <button
                onClick={() => setRightTab("carteira")}
                className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  rightTab === "carteira"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Minha Carteira ({portfolioMetrics.positions.length})
              </button>
            </div>

            {rightTab === "noticias" && (
              <div className="space-y-3 max-h-[660px] overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {Object.values(NEWS_CHANNELS).map((ch) => (
                    <span
                      key={ch.id}
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ch.bgBadge}`}
                    >
                      {ch.shortName}
                    </span>
                  ))}
                </div>

                {(marketState?.newsFeed || []).map((item, idx) => {
                  const ch = NEWS_CHANNELS[item.channel] || NEWS_CHANNELS.G10;
                  return (
                    <div
                      key={item.id || idx}
                      className={`bg-slate-950/90 border rounded-xl p-3.5 space-y-2 transition-all ${
                        idx === 0 ? "border-amber-500/60 shadow-lg" : "border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ch.bgBadge}`}
                        >
                          {ch.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.marketTime ? `🕒 ${item.marketTime}h` : "Agora"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{item.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>

                      {marketState?.showTips !== false && item.educationalNote && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200 font-medium leading-relaxed">
                          {item.educationalNote}
                        </div>
                      )}

                      {item.impacts && Object.keys(item.impacts).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(item.impacts).map(([tk]) => (
                            <button
                              key={tk}
                              onClick={() => setSelectedTicker(tk)}
                              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-[11px] font-bold text-cyan-300 border border-slate-700 cursor-pointer transition-all"
                            >
                              Analisar {tk} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {rightTab === "ranking" && (
              <div className="space-y-4 max-h-[660px] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="font-bold text-white">🏆 Ranking em Tempo Real</span>
                    <span>Patrimônio Total</span>
                  </div>

                  {sortedPlayers.map((p, index) => {
                    const diff = (p.netWorth || INITIAL_CASH) - INITIAL_CASH;
                    const pct = ((diff / INITIAL_CASH) * 100).toFixed(2);
                    const isMe = p.id === player?.id;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          isMe
                            ? "bg-emerald-950/40 border-emerald-500/60"
                            : "bg-slate-950/90 border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 text-center font-black text-sm ${
                              index === 0
                                ? "text-amber-400"
                                : index === 1
                                ? "text-slate-300"
                                : index === 2
                                ? "text-amber-600"
                                : "text-slate-500"
                            }`}
                          >
                            {index + 1}º
                          </span>
                          <span className="text-xl">{p.avatar || "🦈"}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-white">{p.name}</span>
                              {isMe && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                                  Você
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {p.turma || "Geral"} • {p.tradesCount || 0} ordens
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-white">
                            {formatBRL(p.netWorth || INITIAL_CASH)}
                          </div>
                          <div
                            className={`text-xs font-extrabold ${
                              diff >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {diff >= 0 ? "+" : ""}
                            {pct}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <h4 className="text-xs font-black uppercase text-cyan-400">
                    ⚡ Últimas Negociações na Bolsa Vila
                  </h4>
                  {(marketState?.orderTape || []).length === 0 ? (
                    <p className="text-xs text-slate-500">
                      As compras e vendas dos alunos aparecerão aqui ao vivo.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {(marketState?.orderTape || []).slice(0, 10).map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-slate-950 border border-slate-800/80 px-3 py-2 rounded-lg flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{ord.avatar || "🦈"}</span>
                            <strong className="text-white">{ord.playerName}</strong>
                            <span
                              className={`font-black ${
                                ord.type === "BUY" ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {ord.type === "BUY" ? "comprou" : "vendeu"}
                            </span>
                            <strong className="text-amber-300">
                              {ord.qty}x {ord.ticker}
                            </strong>
                          </div>
                          <span className="text-slate-400 font-mono">{formatBRL(ord.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {rightTab === "carteira" && (
              <div className="space-y-4 max-h-[660px] overflow-y-auto pr-1">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Saldo em Caixa:</span>
                    <strong className="text-emerald-400">{formatBRL(portfolioMetrics.cash)}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Investido em Ações:</span>
                    <strong className="text-cyan-400">
                      {formatBRL(portfolioMetrics.investedMarketValue)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-800 pt-2">
                    <span className="font-bold text-white">Patrimônio Total:</span>
                    <strong className="text-white">{formatBRL(portfolioMetrics.netWorth)}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-300">
                    Minhas Ações em Carteira ({portfolioMetrics.positions.length})
                  </h4>

                  {portfolioMetrics.positions.length === 0 ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center space-y-2">
                      <p className="text-xs text-slate-400">
                        Você ainda está com 100% do seu dinheiro em caixa.
                      </p>
                      <p className="text-[11px] text-emerald-400 font-semibold">
                        Selecione uma empresa à esquerda, analise o gráfico e clique em COMPRAR!
                      </p>
                    </div>
                  ) : (
                    portfolioMetrics.positions.map((pos) => (
                      <div
                        key={pos.ticker}
                        onClick={() => setSelectedTicker(pos.ticker)}
                        className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-black text-white">
                              {pos.icon} {pos.ticker}
                            </span>
                            <span className="ml-2 text-xs font-bold text-cyan-400">
                              {pos.qty} ações
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Preço Médio: {formatBRL(pos.avgPrice)} → Atual:{" "}
                              {formatBRL(pos.currentPrice)}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-black text-white">
                              {formatBRL(pos.marketVal)}
                            </div>
                            <div
                              className={`text-xs font-extrabold ${
                                pos.profitVal >= 0 ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {pos.profitVal >= 0 ? "+" : ""}
                              {formatBRL(pos.profitVal)} ({pos.profitVal >= 0 ? "+" : ""}
                              {pos.profitPct.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black text-white">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{toast.subtitle}</p>
          </div>
        </div>
      )}

      {showGlossary && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Manual do Jovem Investidor — Banco Vila
              </h2>
              <button
                onClick={() => setShowGlossary(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {GLOSSARY_ITEMS.map((g, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <h4 className="text-sm font-black text-emerald-400">{g.term}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{g.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {marketState?.status === "encerrado" && (
        <FinalRankingModal
          players={allPlayersWithMe}
          marketState={marketState}
          isAdmin={isAdmin}
          onRestartGame={handleAdminResetMarket}
          onResumeGame={handleAdminStartMarket}
        />
      )}
    </div>
  );
}
