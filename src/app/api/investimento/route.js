import { NextResponse } from "next/server";
import { getDb } from "@/services/firebase-admin";
import { INITIAL_STOCKS, INITIAL_CASH, DEFAULT_DURATION_SECONDS } from "@/components/investimento/marketData";

const MARKET_DOC_ID = "mercado_principal";

function buildInitialMarketState() {
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
      momentum: 0, // tendência residual de notícias recentes
    };
    firstPoint[s.ticker] = s.initialPrice;
  });

  return {
    status: "aguardando", // 'aguardando' | 'pregao_aberto' | 'pausado' | 'encerrado'
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
        summary: "Cada investidor inicia com R$ 10.000,00 na conta da Corretora Banco Vila. Analise os gráficos, leia as notícias em tempo real e monte sua carteira de ações!",
        educationalNote: "💡 DICA INICIAL: Diversifique sua carteira comprando empresas de setores diferentes e deixe uma reserva em caixa para aproveitar notícias urgentes!",
        impacts: {},
        timestamp: Date.now(),
        marketTime: "10:00"
      }
    ],
    orderTape: [],
    dividendEvents: [],
    updatedAt: Date.now(),
  };
}

export async function GET() {
  try {
    const db = getDb();
    const marketRef = db.collection("investimento_sala").doc(MARKET_DOC_ID);
    const marketSnap = await marketRef.get();

    let marketState;
    if (!marketSnap.exists) {
      marketState = buildInitialMarketState();
      await marketRef.set(marketState);
    } else {
      marketState = marketSnap.data();
    }

    const playersSnap = await db.collection("investimento_jogadores").get();
    const players = [];
    playersSnap.forEach((doc) => {
      players.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ marketState, players });
  } catch (error) {
    console.error("Erro GET /api/investimento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const db = getDb();
    const marketRef = db.collection("investimento_sala").doc(MARKET_DOC_ID);

    if (action === "joinPlayer") {
      const { playerId, name, turma, avatar } = body;
      if (!playerId || !name) {
        return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
      }
      const playerRef = db.collection("investimento_jogadores").doc(playerId);
      const snap = await playerRef.get();

      if (snap.exists) {
        const existing = snap.data();
        await playerRef.set(
          {
            name,
            turma: turma || existing.turma || "Geral",
            avatar: avatar || existing.avatar || "🦈",
            lastSeen: Date.now(),
            online: true,
          },
          { merge: true }
        );
        return NextResponse.json({ player: { id: playerId, ...existing, name, turma, avatar } });
      } else {
        const newPlayer = {
          id: playerId,
          name,
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
        await playerRef.set(newPlayer);
        return NextResponse.json({ player: newPlayer });
      }
    }

    if (action === "syncPlayer") {
      const { playerId, playerData, tradeOrder } = body;
      if (!playerId) return NextResponse.json({ error: "Sem playerId" }, { status: 400 });

      const playerRef = db.collection("investimento_jogadores").doc(playerId);
      await playerRef.set(
        {
          ...playerData,
          lastSeen: Date.now(),
          online: true,
        },
        { merge: true }
      );

      // Se houve uma ordem de compra/venda, registra na fita da bolsa (Order Tape) e gera micro-impacto de liquidez
      if (tradeOrder) {
        const marketSnap = await marketRef.get();
        if (marketSnap.exists) {
          const m = marketSnap.data();
          const tape = Array.isArray(m.orderTape) ? [...m.orderTape] : [];
          tape.unshift({
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            playerName: playerData.name,
            avatar: playerData.avatar || "🦈",
            type: tradeOrder.type, // 'BUY' | 'SELL'
            ticker: tradeOrder.ticker,
            qty: tradeOrder.qty,
            price: tradeOrder.price,
            total: tradeOrder.total,
            timestamp: Date.now(),
          });

          // Micro-impacto de oferta e demanda dos alunos na corretora
          const stocks = { ...(m.stocks || {}) };
          if (stocks[tradeOrder.ticker]) {
            const st = { ...stocks[tradeOrder.ticker] };
            const impactFactor = Math.min(0.006, (tradeOrder.total / 50000) * 0.005);
            const direction = tradeOrder.type === "BUY" ? 1 : -1;
            const newPrice = Math.max(1.5, Number((st.price * (1 + direction * impactFactor)).toFixed(2)));
            st.prevPrice = st.price;
            st.price = newPrice;
            st.highPrice = Math.max(st.highPrice || newPrice, newPrice);
            st.lowPrice = Math.min(st.lowPrice || newPrice, newPrice);
            st.changePct = Number((((newPrice - st.openPrice) / st.openPrice) * 100).toFixed(2));
            stocks[tradeOrder.ticker] = st;
          }

          await marketRef.set(
            {
              stocks,
              orderTape: tape.slice(0, 25),
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        }
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "adminResetGame") {
      const { clearPlayers } = body;
      const freshState = buildInitialMarketState();
      await marketRef.set(freshState);

      const playersSnap = await db.collection("investimento_jogadores").get();
      const batch = db.batch();
      playersSnap.forEach((doc) => {
        if (clearPlayers) {
          batch.delete(doc.ref);
        } else {
          batch.update(doc.ref, {
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
      });
      await batch.commit();

      return NextResponse.json({ marketState: freshState });
    }

    if (action === "adminPayDividends") {
      const { yieldPct = 0.03 } = body; // ex: 3% de dividendos sobre o valor das ações em carteira
      const marketSnap = await marketRef.get();
      if (!marketSnap.exists) return NextResponse.json({ error: "Mercado não iniciado" }, { status: 400 });
      const m = marketSnap.data();
      const stocks = m.stocks || {};

      const playersSnap = await db.collection("investimento_jogadores").get();
      const batch = db.batch();
      let totalPaidPlayers = 0;

      playersSnap.forEach((doc) => {
        const p = doc.data();
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

          batch.update(doc.ref, {
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
      });

      const newsItem = {
        id: `div_${Date.now()}`,
        channel: "VALOR",
        title: `💰 CHUVA DE DIVIDENDOS! Empresas da Bolsa Vila distribuem ${(yieldPct * 100).toFixed(1)}% em dinheiro aos acionistas!`,
        summary: `Quem tinha ações na carteira acabou de receber dividendos diretamente no saldo da Conta Banco Vila! Investidores que estavam 100% parados em caixa não receberam.`,
        educationalNote: `💡 O QUE SÃO DIVIDENDOS: Quando você é acionista de boas empresas, parte do lucro delas cai direto na sua conta da corretora sem você precisar vender suas ações!`,
        impacts: {},
        timestamp: Date.now(),
        marketTime: m.priceHistory?.[m.priceHistory.length - 1]?.timeLabel || "Pregão",
      };

      const newsFeed = [newsItem, ...(m.newsFeed || [])].slice(0, 30);
      batch.update(marketRef, {
        newsFeed,
        updatedAt: Date.now(),
      });

      await batch.commit();
      return NextResponse.json({ ok: true, totalPaidPlayers });
    }

    if (action === "adminUpdateMarket") {
      const { marketPatch } = body;
      await marketRef.set(
        {
          ...marketPatch,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 });
  } catch (error) {
    console.error("Erro POST /api/investimento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
