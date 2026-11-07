import { NextResponse } from "next/server";
import { db as clientDb } from "@/services/firebase";
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { INITIAL_STOCKS, INITIAL_CASH, DEFAULT_DURATION_SECONDS } from "@/components/investimento/marketData";

const MARKET_DOC_ID = "mercado_principal";

export function buildInitialMarketState() {
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
    status: "aguardando",
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
        title: "🔔 SINO DE ABERTURA: Bolsa de Valores do Banco Vila (B3V) pronta para o pregão!",
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
    updatedAt: Date.now(),
  };
}

// Fallback em memória caso o Firestore ainda esteja sem permissão publicada
if (!globalThis.__bancoVilaMemory) {
  globalThis.__bancoVilaMemory = {
    marketState: buildInitialMarketState(),
    players: {},
  };
}

async function readMarketAndPlayers() {
  try {
    const marketRef = doc(clientDb, "investimento_sala", MARKET_DOC_ID);
    const marketSnap = await getDoc(marketRef);

    let marketState;
    if (!marketSnap.exists()) {
      marketState = globalThis.__bancoVilaMemory.marketState || buildInitialMarketState();
      await setDoc(marketRef, marketState).catch(() => {});
    } else {
      marketState = marketSnap.data();
      globalThis.__bancoVilaMemory.marketState = marketState;
    }

    const playersSnap = await getDocs(collection(clientDb, "investimento_jogadores"));
    const players = [];
    playersSnap.forEach((d) => {
      const pData = { id: d.id, ...d.data() };
      players.push(pData);
      globalThis.__bancoVilaMemory.players[d.id] = pData;
    });

    return { marketState, players };
  } catch (e) {
    // Fallback em memória garantido (nunca falha!)
    return {
      marketState: globalThis.__bancoVilaMemory.marketState,
      players: Object.values(globalThis.__bancoVilaMemory.players),
    };
  }
}

export async function GET() {
  const data = await readMarketAndPlayers();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === "joinPlayer") {
      const { playerId, name, turma, avatar } = body;
      const id = playerId || `inv_${Date.now()}`;
      const existing = globalThis.__bancoVilaMemory.players[id];

      const playerObj = existing
        ? {
            ...existing,
            id,
            name: name || existing.name,
            turma: turma || existing.turma || "Geral",
            avatar: avatar || existing.avatar || "🦈",
            lastSeen: Date.now(),
            online: true,
          }
        : {
            id,
            name: name || "Investidor",
            turma: turma || "Geral",
            avatar: avatar || "🦈",
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

      globalThis.__bancoVilaMemory.players[id] = playerObj;
      await setDoc(doc(clientDb, "investimento_jogadores", id), playerObj, { merge: true }).catch(
        () => {}
      );

      return NextResponse.json({ player: playerObj });
    }

    if (action === "syncPlayer") {
      const { playerId, playerData, tradeOrder } = body;
      if (!playerId) return NextResponse.json({ ok: false });

      const updatedPlayer = {
        ...(globalThis.__bancoVilaMemory.players[playerId] || {}),
        ...playerData,
        id: playerId,
        lastSeen: Date.now(),
        online: true,
      };
      globalThis.__bancoVilaMemory.players[playerId] = updatedPlayer;
      await setDoc(doc(clientDb, "investimento_jogadores", playerId), updatedPlayer, {
        merge: true,
      }).catch(() => {});

      if (tradeOrder) {
        const m = globalThis.__bancoVilaMemory.marketState || buildInitialMarketState();
        const tape = Array.isArray(m.orderTape) ? [...m.orderTape] : [];
        tape.unshift({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          playerName: updatedPlayer.name,
          avatar: updatedPlayer.avatar || "🦈",
          type: tradeOrder.type,
          ticker: tradeOrder.ticker,
          qty: tradeOrder.qty,
          price: tradeOrder.price,
          total: tradeOrder.total,
          timestamp: Date.now(),
        });

        const stocks = { ...(m.stocks || {}) };
        if (stocks[tradeOrder.ticker]) {
          const st = { ...stocks[tradeOrder.ticker] };
          const impactFactor = Math.min(0.006, (tradeOrder.total / 50000) * 0.005);
          const direction = tradeOrder.type === "BUY" ? 1 : -1;
          const newPrice = Math.max(
            1.5,
            Number((st.price * (1 + direction * impactFactor)).toFixed(2))
          );
          st.prevPrice = st.price;
          st.price = newPrice;
          st.highPrice = Math.max(st.highPrice || newPrice, newPrice);
          st.lowPrice = Math.min(st.lowPrice || newPrice, newPrice);
          st.changePct = Number(
            (((newPrice - st.openPrice) / st.openPrice) * 100).toFixed(2)
          );
          stocks[tradeOrder.ticker] = st;
        }

        const nextMarket = {
          ...m,
          stocks,
          orderTape: tape.slice(0, 25),
          updatedAt: Date.now(),
        };
        globalThis.__bancoVilaMemory.marketState = nextMarket;
        await setDoc(doc(clientDb, "investimento_sala", MARKET_DOC_ID), nextMarket, {
          merge: true,
        }).catch(() => {});
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "adminResetGame") {
      const { clearPlayers } = body;
      const freshState = buildInitialMarketState();
      globalThis.__bancoVilaMemory.marketState = freshState;
      await setDoc(doc(clientDb, "investimento_sala", MARKET_DOC_ID), freshState).catch(() => {});

      if (clearPlayers) {
        globalThis.__bancoVilaMemory.players = {};
        try {
          const snap = await getDocs(collection(clientDb, "investimento_jogadores"));
          for (const d of snap.docs) {
            await deleteDoc(doc(clientDb, "investimento_jogadores", d.id)).catch(() => {});
          }
        } catch (e) {}
      } else {
        Object.keys(globalThis.__bancoVilaMemory.players).forEach((pid) => {
          globalThis.__bancoVilaMemory.players[pid] = {
            ...globalThis.__bancoVilaMemory.players[pid],
            cash: INITIAL_CASH,
            holdings: {},
            netWorth: INITIAL_CASH,
            profit: 0,
            profitPct: 0,
            tradesCount: 0,
            tradeHistory: [],
            lastSeen: Date.now(),
          };
        });
        try {
          const snap = await getDocs(collection(clientDb, "investimento_jogadores"));
          for (const d of snap.docs) {
            await setDoc(
              doc(clientDb, "investimento_jogadores", d.id),
              {
                cash: INITIAL_CASH,
                holdings: {},
                netWorth: INITIAL_CASH,
                profit: 0,
                profitPct: 0,
                tradesCount: 0,
                tradeHistory: [],
                lastSeen: Date.now(),
              },
              { merge: true }
            ).catch(() => {});
          }
        } catch (e) {}
      }

      return NextResponse.json({ marketState: freshState });
    }

    if (action === "adminPayDividends") {
      const { yieldPct = 0.03 } = body;
      const m = globalThis.__bancoVilaMemory.marketState || buildInitialMarketState();
      const stocks = m.stocks || {};
      let totalPaidPlayers = 0;

      const allPlayerIds = Object.keys(globalThis.__bancoVilaMemory.players);
      for (const pid of allPlayerIds) {
        const p = globalThis.__bancoVilaMemory.players[pid];
        const holdings = p.holdings || {};
        let dividendCash = 0;
        let portfolioValue = 0;

        Object.keys(holdings).forEach((tk) => {
          const qty = holdings[tk]?.qty || 0;
          const currentPrice = stocks[tk]?.price || 0;
          if (qty > 0 && currentPrice > 0) {
            const val = qty * currentPrice;
            portfolioValue += val;
            dividendCash += val * yieldPct;
          }
        });

        if (dividendCash > 0) {
          totalPaidPlayers++;
          const roundedDiv = Number(dividendCash.toFixed(2));
          const newCash = Number(((p.cash || 0) + roundedDiv).toFixed(2));
          const newNetWorth = Number((newCash + portfolioValue).toFixed(2));
          const newProfit = Number((newNetWorth - INITIAL_CASH).toFixed(2));
          const newProfitPct = Number(((newProfit / INITIAL_CASH) * 100).toFixed(2));

          const updatedP = {
            ...p,
            cash: newCash,
            netWorth: newNetWorth,
            profit: newProfit,
            profitPct: newProfitPct,
            lastDividend: {
              amount: roundedDiv,
              timestamp: Date.now(),
            },
          };
          globalThis.__bancoVilaMemory.players[pid] = updatedP;
          await setDoc(doc(clientDb, "investimento_jogadores", pid), updatedP, {
            merge: true,
          }).catch(() => {});
        }
      }

      const newsItem = {
        id: `div_${Date.now()}`,
        channel: "VALOR",
        title: `💰 CHUVA DE DIVIDENDOS! Empresas da Bolsa Vila distribuem ${(yieldPct * 100).toFixed(
          1
        )}% em dinheiro aos acionistas!`,
        summary:
          "Quem tinha ações na carteira acabou de receber dividendos diretamente no saldo da Conta Banco Vila!",
        educationalNote:
          "💡 O QUE SÃO DIVIDENDOS: Quando você é acionista de boas empresas, parte do lucro delas cai direto na sua conta da corretora sem você precisar vender suas ações!",
        impacts: {},
        timestamp: Date.now(),
        marketTime: m.priceHistory?.[m.priceHistory.length - 1]?.timeLabel || "Pregão",
      };

      const nextMarket = {
        ...m,
        newsFeed: [newsItem, ...(m.newsFeed || [])].slice(0, 30),
        updatedAt: Date.now(),
      };
      globalThis.__bancoVilaMemory.marketState = nextMarket;
      await setDoc(doc(clientDb, "investimento_sala", MARKET_DOC_ID), nextMarket, {
        merge: true,
      }).catch(() => {});

      return NextResponse.json({ ok: true, totalPaidPlayers });
    }

    if (action === "adminUpdateMarket") {
      const { marketPatch } = body;
      const nextMarket = {
        ...(globalThis.__bancoVilaMemory.marketState || buildInitialMarketState()),
        ...marketPatch,
        updatedAt: Date.now(),
      };
      globalThis.__bancoVilaMemory.marketState = nextMarket;
      await setDoc(doc(clientDb, "investimento_sala", MARKET_DOC_ID), nextMarket, {
        merge: true,
      }).catch(() => {});

      return NextResponse.json({ ok: true, marketState: nextMarket });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro POST /api/investimento:", error);
    return NextResponse.json({ ok: true, fallback: true });
  }
}
