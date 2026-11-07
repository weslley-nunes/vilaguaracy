import { NextResponse } from "next/server";
import { getDb } from "@/services/firebase-admin";
import { db as clientDb } from "@/services/firebase";
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import {
  INITIAL_STOCKS,
  INITIAL_CASH,
  DEFAULT_DURATION_SECONDS,
  MARKET_SCENARIOS,
} from "@/components/investimento/marketData";

const MARKET_DOC_ID = "mercado_principal";

function formatSimulatedClock(elapsed, duration) {
  const ratio = Math.min(1, Math.max(0, elapsed / (duration || DEFAULT_DURATION_SECONDS)));
  const totalSimMinutes = Math.floor(ratio * 420);
  const hours = 10 + Math.floor(totalSimMinutes / 60);
  const mins = totalSimMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function buildInitialMarketState(customResetId) {
  const now = Date.now();
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
    resetId: customResetId || now,
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
        timestamp: now,
        marketTime: "10:00",
      },
    ],
    orderTape: [],
    dividendEvents: [],
    lastTickAt: now,
    updatedAt: now,
  };
}

if (!globalThis.__bancoVilaMemory) {
  globalThis.__bancoVilaMemory = {
    marketState: buildInitialMarketState(),
    players: {},
    usedScenarios: [],
  };
}

// Funções de leitura e escrita unificadas (Prioridade 1: Firebase Admin -> Prioridade 2: Client SDK -> Prioridade 3: Memória)
async function dbGetMarket() {
  const adminDb = getDb();
  if (adminDb) {
    try {
      const snap = await adminDb.collection("investimento_sala").doc(MARKET_DOC_ID).get();
      if (snap.exists) {
        const data = snap.data();
        globalThis.__bancoVilaMemory.marketState = data;
        return data;
      } else {
        const initial = buildInitialMarketState();
        await adminDb.collection("investimento_sala").doc(MARKET_DOC_ID).set(initial);
        globalThis.__bancoVilaMemory.marketState = initial;
        return initial;
      }
    } catch (e) {
      console.error("Admin dbGetMarket error:", e.message);
    }
  }

  try {
    const snap = await getDoc(doc(clientDb, "investimento_sala", MARKET_DOC_ID));
    if (snap.exists()) {
      const data = snap.data();
      globalThis.__bancoVilaMemory.marketState = data;
      return data;
    }
  } catch (e) {}

  return globalThis.__bancoVilaMemory.marketState;
}

async function dbSaveMarket(marketState) {
  globalThis.__bancoVilaMemory.marketState = marketState;
  const adminDb = getDb();
  if (adminDb) {
    try {
      await adminDb.collection("investimento_sala").doc(MARKET_DOC_ID).set(marketState, { merge: true });
      return;
    } catch (e) {
      console.error("Admin dbSaveMarket error:", e.message);
    }
  }
  try {
    await setDoc(doc(clientDb, "investimento_sala", MARKET_DOC_ID), marketState, { merge: true });
  } catch (e) {}
}

async function dbGetPlayers() {
  const adminDb = getDb();
  if (adminDb) {
    try {
      const snap = await adminDb.collection("investimento_jogadores").get();
      const list = [];
      snap.forEach((d) => {
        const p = { id: d.id, ...d.data() };
        list.push(p);
        globalThis.__bancoVilaMemory.players[d.id] = p;
      });
      return list;
    } catch (e) {
      console.error("Admin dbGetPlayers error:", e.message);
    }
  }

  try {
    const snap = await getDocs(collection(clientDb, "investimento_jogadores"));
    const list = [];
    snap.forEach((d) => {
      const p = { id: d.id, ...d.data() };
      list.push(p);
      globalThis.__bancoVilaMemory.players[d.id] = p;
    });
    return list;
  } catch (e) {}

  return Object.values(globalThis.__bancoVilaMemory.players);
}

async function dbSavePlayer(playerId, playerData) {
  const merged = {
    ...(globalThis.__bancoVilaMemory.players[playerId] || {}),
    ...playerData,
    id: playerId,
  };
  globalThis.__bancoVilaMemory.players[playerId] = merged;

  const adminDb = getDb();
  if (adminDb) {
    try {
      await adminDb.collection("investimento_jogadores").doc(playerId).set(merged, { merge: true });
      return merged;
    } catch (e) {
      console.error("Admin dbSavePlayer error:", e.message);
    }
  }
  try {
    await setDoc(doc(clientDb, "investimento_jogadores", playerId), merged, { merge: true });
  } catch (e) {}
  return merged;
}

// Avança o tick do mercado de forma CENTRALIZADA no servidor (garante que todos os alunos vejam os mesmos preços!)
async function advanceServerMarketTickIfNeeded(currentMarket) {
  if (!currentMarket || currentMarket.status !== "pregao_aberto") {
    return currentMarket;
  }

  const now = Date.now();
  const lastTickAt = currentMarket.lastTickAt || currentMarket.updatedAt || now;
  const deltaMs = now - lastTickAt;

  if (deltaMs < 3000) {
    return currentMarket;
  }

  const speed = currentMarket.speed || 1;
  const realSecondsElapsed = Math.min(8, Math.max(3, Math.floor(deltaMs / 1000)));
  const stepSeconds = realSecondsElapsed * speed;
  const duration = currentMarket.durationSeconds || DEFAULT_DURATION_SECONDS;
  const nextElapsed = Math.min(duration, (currentMarket.elapsedSeconds || 0) + stepSeconds);
  const simClock = formatSimulatedClock(nextElapsed, duration);

  const nextStocks = {};
  const historyPoint = {
    step: (currentMarket.priceHistory?.length || 0) + 1,
    timeLabel: simClock,
  };

  INITIAL_STOCKS.forEach((info) => {
    const cur = currentMarket.stocks?.[info.ticker] || {
      ticker: info.ticker,
      price: info.initialPrice,
      openPrice: info.initialPrice,
      prevPrice: info.initialPrice,
      highPrice: info.initialPrice,
      lowPrice: info.initialPrice,
      changePct: 0,
      momentum: 0,
    };

    const currentMomentum = Number(cur.momentum || 0);
    const momentumStep = currentMomentum * 0.35;
    const remainingMomentum = Number((currentMomentum * 0.65).toFixed(4));

    const randomShock = (Math.random() - 0.492) * 2 * info.volatility * (0.7 + 0.3 * speed);
    const pctMove = momentumStep + randomShock;

    const rawNextPrice = cur.price * (1 + pctMove);
    const nextPrice = Math.max(1.5, Number(rawNextPrice.toFixed(2)));
    const openPrice = cur.openPrice || info.initialPrice;
    const changePct = Number((((nextPrice - openPrice) / openPrice) * 100).toFixed(2));

    nextStocks[info.ticker] = {
      ...cur,
      prevPrice: cur.price,
      price: nextPrice,
      highPrice: Math.max(cur.highPrice || nextPrice, nextPrice),
      lowPrice: Math.min(cur.lowPrice || nextPrice, nextPrice),
      changePct,
      lastTickDelta: Number((nextPrice - cur.price).toFixed(2)),
      momentum: Math.abs(remainingMomentum) < 0.001 ? 0 : remainingMomentum,
    };

    historyPoint[info.ticker] = nextPrice;
  });

  const nextHistory = [...(currentMarket.priceHistory || []), historyPoint].slice(-80);
  let nextNewsFeed = [...(currentMarket.newsFeed || [])];

  // Disparo automático de notícias no servidor (a cada ~60s)
  if (currentMarket.autoNews && nextElapsed < duration - 15) {
    const lastNewsTime = nextNewsFeed[0]?.timestamp || 0;
    const cooldownMs = Math.max(28000, Math.floor(60000 / speed));
    if (now - lastNewsTime > cooldownMs) {
      const used = globalThis.__bancoVilaMemory.usedScenarios || [];
      const available = MARKET_SCENARIOS.filter((s) => !used.includes(s.id));
      const pool = available.length > 0 ? available : MARKET_SCENARIOS;
      const randomScen = pool[Math.floor(Math.random() * pool.length)];
      if (randomScen) {
        globalThis.__bancoVilaMemory.usedScenarios = [...used.slice(-15), randomScen.id];
        const newsItem = {
          id: `${randomScen.id}_${now}`,
          channel: randomScen.channel,
          title: randomScen.title,
          summary: randomScen.summary,
          educationalNote: randomScen.educationalNote,
          impacts: randomScen.impacts,
          timestamp: now,
          marketTime: simClock,
        };
        nextNewsFeed = [newsItem, ...nextNewsFeed].slice(0, 30);

        Object.entries(randomScen.impacts).forEach(([tk, impactPct]) => {
          if (nextStocks[tk]) {
            const st = nextStocks[tk];
            const immediatePrice = Math.max(
              1.5,
              Number((st.price * (1 + impactPct * 0.45)).toFixed(2))
            );
            st.price = immediatePrice;
            st.highPrice = Math.max(st.highPrice, immediatePrice);
            st.lowPrice = Math.min(st.lowPrice, immediatePrice);
            st.changePct = Number(
              (((immediatePrice - st.openPrice) / st.openPrice) * 100).toFixed(2)
            );
            st.momentum = Number(((st.momentum || 0) + impactPct * 0.55).toFixed(4));
            historyPoint[tk] = immediatePrice;
          }
        });
      }
    }
  }

  const nextStatus = nextElapsed >= duration ? "encerrado" : "pregao_aberto";
  const updatedMarket = {
    ...currentMarket,
    status: nextStatus,
    elapsedSeconds: nextElapsed,
    stocks: nextStocks,
    priceHistory: nextHistory,
    newsFeed: nextNewsFeed,
    lastTickAt: now,
    updatedAt: now,
  };

  await dbSaveMarket(updatedMarket);
  return updatedMarket;
}

export async function GET() {
  let marketState = await dbGetMarket();
  marketState = await advanceServerMarketTickIfNeeded(marketState);
  const players = await dbGetPlayers();

  // Recalcular netWorth ao vivo de cada jogador com base nos preços atuais do servidor
  const stocks = marketState?.stocks || {};
  const enrichedPlayers = players.map((p) => {
    const cash = Number(p.cash ?? INITIAL_CASH);
    const holdings = p.holdings || {};
    let invested = 0;
    Object.keys(holdings).forEach((tk) => {
      const qty = Number(holdings[tk]?.qty || 0);
      const price = Number(stocks[tk]?.price || 0);
      if (qty > 0 && price > 0) {
        invested += qty * price;
      }
    });
    const netWorth = Number((cash + invested).toFixed(2));
    const profit = Number((netWorth - INITIAL_CASH).toFixed(2));
    const profitPct = Number(((profit / INITIAL_CASH) * 100).toFixed(2));
    return {
      ...p,
      cash: Number(cash.toFixed(2)),
      netWorth,
      profit,
      profitPct,
    };
  });

  return NextResponse.json({ marketState, players: enrichedPlayers });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === "joinPlayer") {
      const { playerId, name, turma, avatar } = body;
      const id = playerId || `inv_${Date.now()}`;
      const marketState = await dbGetMarket();
      const players = await dbGetPlayers();
      const existing = players.find((p) => p.id === id);

      const playerObj =
        existing && existing.resetId === marketState.resetId
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
              resetId: marketState.resetId,
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

      const saved = await dbSavePlayer(id, playerObj);
      return NextResponse.json({ player: saved, marketState });
    }

    if (action === "syncPlayer") {
      const { playerId, playerData, tradeOrder } = body;
      if (!playerId) return NextResponse.json({ ok: false });

      let marketState = await dbGetMarket();

      const updatedPlayer = await dbSavePlayer(playerId, {
        ...playerData,
        id: playerId,
        resetId: marketState.resetId,
        lastSeen: Date.now(),
        online: true,
      });

      if (tradeOrder) {
        const tape = Array.isArray(marketState.orderTape) ? [...marketState.orderTape] : [];
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

        const stocks = { ...(marketState.stocks || {}) };
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

        marketState = {
          ...marketState,
          stocks,
          orderTape: tape.slice(0, 25),
          updatedAt: Date.now(),
        };
        await dbSaveMarket(marketState);
      }

      return NextResponse.json({ ok: true, player: updatedPlayer, marketState });
    }

    if (action === "adminResetGame") {
      const { clearPlayers } = body;
      const newResetId = Date.now();
      const freshState = buildInitialMarketState(newResetId);
      globalThis.__bancoVilaMemory.usedScenarios = [];
      await dbSaveMarket(freshState);

      const adminDb = getDb();
      const players = await dbGetPlayers();

      if (clearPlayers) {
        globalThis.__bancoVilaMemory.players = {};
        if (adminDb) {
          const batch = adminDb.batch();
          players.forEach((p) => {
            batch.delete(adminDb.collection("investimento_jogadores").doc(p.id));
          });
          await batch.commit().catch(() => {});
        }
      } else {
        for (const p of players) {
          await dbSavePlayer(p.id, {
            ...p,
            resetId: newResetId,
            cash: INITIAL_CASH,
            holdings: {},
            netWorth: INITIAL_CASH,
            profit: 0,
            profitPct: 0,
            tradesCount: 0,
            tradeHistory: [],
            lastSeen: Date.now(),
          });
        }
      }

      return NextResponse.json({ marketState: freshState });
    }

    if (action === "adminPayDividends") {
      const { yieldPct = 0.03 } = body;
      const marketState = await dbGetMarket();
      const stocks = marketState.stocks || {};
      const players = await dbGetPlayers();
      let totalPaidPlayers = 0;

      for (const p of players) {
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

          await dbSavePlayer(p.id, {
            ...p,
            cash: newCash,
            netWorth: newNetWorth,
            profit: newProfit,
            profitPct: newProfitPct,
            lastDividend: {
              amount: roundedDiv,
              timestamp: Date.now(),
            },
          });
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
        marketTime:
          marketState.priceHistory?.[marketState.priceHistory.length - 1]?.timeLabel || "Pregão",
      };

      const nextMarket = {
        ...marketState,
        newsFeed: [newsItem, ...(marketState.newsFeed || [])].slice(0, 30),
        updatedAt: Date.now(),
      };
      await dbSaveMarket(nextMarket);

      return NextResponse.json({ ok: true, totalPaidPlayers, marketState: nextMarket });
    }

    if (action === "adminUpdateMarket") {
      const { marketPatch } = body;
      const currentMarket = await dbGetMarket();
      const nextMarket = {
        ...currentMarket,
        ...marketPatch,
        updatedAt: Date.now(),
      };
      await dbSaveMarket(nextMarket);
      return NextResponse.json({ ok: true, marketState: nextMarket });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro POST /api/investimento:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
