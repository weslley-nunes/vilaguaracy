// Dados das Empresas Fictícias (Baseadas nas Gigantes da B3 - Bolsa do Brasil)
// Canais de Notícias Brasileiros Fictícios e Cenários do Dia a Dia para o Simulador Banco Vila

export const INITIAL_CASH = 10000.00;
export const DEFAULT_DURATION_SECONDS = 30 * 60; // 30 minutos máximo de pregão

export const NEWS_CHANNELS = {
  G10: {
    id: 'G10',
    name: 'G10 Economia',
    shortName: 'G10',
    inspiredBy: 'G1 Economia',
    color: '#dc2626',
    bgBadge: 'bg-red-600 text-white',
    borderColor: 'border-red-500/50',
    tagline: 'O portal de notícias em tempo real da Vila'
  },
  VALOR: {
    id: 'VALOR',
    name: 'Valor da Vila',
    shortName: 'VALOR',
    inspiredBy: 'Valor Econômico',
    color: '#059669',
    bgBadge: 'bg-emerald-700 text-white',
    borderColor: 'border-emerald-500/50',
    tagline: 'Jornalismo econômico e análise corporativa'
  },
  INFOGRANA: {
    id: 'INFOGRANA',
    name: 'InfoGrana',
    shortName: 'InfoGrana',
    inspiredBy: 'InfoMoney',
    color: '#2563eb',
    bgBadge: 'bg-blue-600 text-white',
    borderColor: 'border-blue-500/50',
    tagline: 'Seu guia de investimentos na Bolsa B3V'
  },
  CNN: {
    id: 'CNN',
    name: 'VilaNews Money',
    shortName: 'VilaNews TV',
    inspiredBy: 'CNN Brasil Money / GloboNews',
    color: '#e11d48',
    bgBadge: 'bg-rose-600 text-white',
    borderColor: 'border-rose-500/50',
    tagline: 'URGENTE: Cobertura ao vivo do pregão'
  },
  FOLHA: {
    id: 'FOLHA',
    name: 'Folha do Mercado',
    shortName: 'Folha',
    inspiredBy: 'Folha / Estadão Economia',
    color: '#4f46e5',
    bgBadge: 'bg-indigo-600 text-white',
    borderColor: 'border-indigo-500/50',
    tagline: 'Política, Brasília e bastidores da economia'
  },
  BCV: {
    id: 'BCV',
    name: 'Boletim Banco Central (BCV)',
    shortName: 'COPOM / BCV',
    inspiredBy: 'Banco Central do Brasil',
    color: '#d97706',
    bgBadge: 'bg-amber-500 text-slate-950 font-black',
    borderColor: 'border-amber-400/60',
    tagline: 'Comunicado Oficial: Juros Selic, Inflação e Câmbio'
  }
};

export const INITIAL_STOCKS = [
  {
    ticker: 'PETV4',
    name: 'PetroVila S.A.',
    realInspiration: 'Petrobras (PETR4)',
    sector: 'Petróleo & Energia',
    icon: '🛢️',
    color: '#eab308',
    initialPrice: 38.50,
    volatility: 0.014,
    dividendYield: '11,4% a.a.',
    riskLevel: 'Médio',
    description: 'Gigante brasileira de exploração de petróleo no pré-sal e produção de combustíveis. Ganha força com a alta internacional do petróleo e novas descobertas, mas oscila com decisões políticas sobre o preço da gasolina.',
    tip: 'Observe notícias sobre preço do barril de petróleo, descobertas de poços e política de combustíveis.'
  },
  {
    ticker: 'MINV3',
    name: 'MineraVila S.A.',
    realInspiration: 'Vale (VALE3)',
    sector: 'Mineração & Siderurgia',
    icon: '⛏️',
    color: '#10b981',
    initialPrice: 61.20,
    volatility: 0.013,
    dividendYield: '9,1% a.a.',
    riskLevel: 'Médio',
    description: 'Líder mundial na exportação de minério de ferro para fabricação de aço. Como vende em dólar para a Ásia e Europa, lucra muito quando a China cresce ou o Dólar sobe.',
    tip: 'Fique atento às notícias sobre crescimento da China, obras de infraestrutura e cotação do Dólar.'
  },
  {
    ticker: 'BVIL4',
    name: 'Banco Vila S.A.',
    realInspiration: 'Itaú / Banco do Brasil (ITUB4/BBAS3)',
    sector: 'Bancos & Finanças',
    icon: '🏦',
    color: '#f97316',
    initialPrice: 33.80,
    volatility: 0.009,
    dividendYield: '8,8% a.a.',
    riskLevel: 'Baixo (Defensiva)',
    description: 'O maior banco e corretora do país. É uma empresa sólida que costuma aumentar seus lucros quando a Taxa Selic (juros) sobe, mas sofre se o desemprego e a inadimplência dispararem.',
    tip: 'Bancos costumam proteger a carteira quando os juros (Selic) sobem e pagam bons dividendos.'
  },
  {
    ticker: 'MAGV3',
    name: 'MagaVila Varejo',
    realInspiration: 'Magazine Luiza (MGLU3)',
    sector: 'Varejo & E-Commerce',
    icon: '🛍️',
    color: '#3b82f6',
    initialPrice: 12.40,
    volatility: 0.022,
    dividendYield: '1,2% a.a.',
    riskLevel: 'Alto (Arrojada)',
    description: 'Grande rede de lojas físicas e aplicativo de compras online. Suas ações têm movimentos fortes: disparam quando os juros caem e o povo compra parcelado, mas despencam se a Selic e a inflação subirem!',
    tip: 'Juros baixos + datas comemorativas (Black Friday, Natal) = Alta forte! Juros altos = Queda forte!'
  },
  {
    ticker: 'WEGV3',
    name: 'EletroMotor Vila',
    realInspiration: 'WEG (WEGE3)',
    sector: 'Indústria & Energia Limpa',
    icon: '⚡',
    color: '#06b6d4',
    initialPrice: 52.90,
    volatility: 0.012,
    dividendYield: '3,5% a.a.',
    riskLevel: 'Médio-Baixo',
    description: 'Fábrica multinacional brasileira de motores elétricos, painéis solares, turbinas eólicas e recarregadores de carros elétricos. Exporta tecnologia para mais de 100 países.',
    tip: 'Sobe com acordos de energia renovável, carros elétricos, modernização industrial e alta do dólar.'
  },
  {
    ticker: 'AERV3',
    name: 'AeroVila Aviação',
    realInspiration: 'Embraer (EMBR3)',
    sector: 'Aviação & Aeroespacial',
    icon: '✈️',
    color: '#6366f1',
    initialPrice: 47.60,
    volatility: 0.016,
    dividendYield: '2,1% a.a.',
    riskLevel: 'Médio-Alto',
    description: 'Orgulho da engenharia nacional: fabrica jatos comerciais, aviões de defesa e carros voadores elétricos (eVTOL). Suas ações saltam a cada nova encomenda internacional de aeronaves.',
    tip: 'Feiras internacionais de aviação, encomendas de jatos e dólar alto impulsionam a AeroVila.'
  },
  {
    ticker: 'AGRV3',
    name: 'AgroTocantins S.A.',
    realInspiration: 'SLC Agrícola / BrasilAgro (SLCE3)',
    sector: 'Agronegócio & Grãos',
    icon: '🌾',
    color: '#84cc16',
    initialPrice: 24.50,
    volatility: 0.015,
    dividendYield: '7,9% a.a.',
    riskLevel: 'Médio',
    description: 'Potência agrícola produtora de soja, milho e algodão no coração do Brasil. Lucra com clima bom, chuvas regulares, super-safras e exportações, mas sofre com secas severas ou pragas.',
    tip: 'Previsão do tempo, safra recorde e demanda mundial por alimentos mexem diretamente com a AGRV3.'
  },
  {
    ticker: 'BEBV3',
    name: 'BebiVila Cervejaria & Refris',
    realInspiration: 'Ambev (ABEV3)',
    sector: 'Bebidas & Consumo',
    icon: '🥤',
    color: '#ec4899',
    initialPrice: 13.20,
    volatility: 0.009,
    dividendYield: '6,6% a.a.',
    riskLevel: 'Baixo (Defensiva)',
    description: 'Maior fabricante de refrigerantes, sucos, águas e bebidas da América Latina. Vende muito no calor, feriados, Carnaval e eventos esportivos, mas perde margem se o açúcar e o alumínio encarecerem.',
    tip: 'Ondas de calor, festas populares e aumento de renda favorecem a BebiVila.'
  },
  {
    ticker: 'CELV3',
    name: 'CeluVila Papel & Floresta',
    realInspiration: 'Suzano / Klabin (SUZB3)',
    sector: 'Papel & Celulose',
    icon: '🌲',
    color: '#14b8a6',
    initialPrice: 56.40,
    volatility: 0.012,
    dividendYield: '5,4% a.a.',
    riskLevel: 'Médio',
    description: 'Maior produtora mundial de celulose de eucalipto e embalagens sustentáveis. Como quase toda a receita vem em Dólar de exportações, suas ações funcionam como proteção quando o Real se desvaloriza.',
    tip: 'Quando o Dólar dispara ou a demanda por embalagens ecológicas cresce, a CELV3 se valoriza.'
  },
  {
    ticker: 'TECV3',
    name: 'TecVila Sistemas & IA',
    realInspiration: 'Totvs (TOTS3)',
    sector: 'Tecnologia & IA',
    icon: '🤖',
    color: '#a855f7',
    initialPrice: 29.80,
    volatility: 0.018,
    dividendYield: '2,8% a.a.',
    riskLevel: 'Médio-Alto',
    description: 'Líder brasileira em softwares empresariais, computação em nuvem e Inteligência Artificial. Cresce rápido com a digitalização de empresas e escolas, mas é sensível a juros altos e segurança cibernética.',
    tip: 'Lançamentos de IA e contratos de tecnologia fazem a ação decolar; falhas técnicas ou juros altos pesam.'
  }
];

// Cenários do dia a dia que o Professor Administrador pode disparar (ou ativar no modo automático)
export const MARKET_SCENARIOS = [
  // === 1. MACROECONOMIA & BANCO CENTRAL ===
  {
    id: 'selic_corte',
    category: 'Macroeconomia & Juros',
    channel: 'BCV',
    title: 'Banco Central da Vila reduz a Taxa Selic em 0,75% e anima o consumo!',
    summary: 'Com a inflação controlada, o Copom cortou a taxa básica de juros. O crédito ficou mais barato para famílias comprarem parcelado e empresas investirem.',
    educationalNote: '💡 COMO O MERCADO REAGE: Juros mais baixos barateiam o crediário e estimulam o consumo e a tecnologia (MAGV3, TECV3 e AERV3 sobem forte!). Já os bancos (BVIL4) têm leve ajuste.',
    impacts: {
      MAGV3: 0.16,
      TECV3: 0.11,
      AERV3: 0.06,
      BEBV3: 0.07,
      WEGV3: 0.06,
      BVIL4: -0.04
    }
  },
  {
    id: 'selic_alta',
    category: 'Macroeconomia & Juros',
    channel: 'BCV',
    title: 'URGENTE: Banco Central sobe a Taxa Selic em 1,00% para frear a inflação!',
    summary: 'Diante da alta dos preços nos supermercados, o Banco Central subiu os juros. Financiamentos e compras no cartão de crédito ficarão mais caros.',
    educationalNote: '💡 COMO O MERCADO REAGE: Juros altos derrubam empresas de Varejo e Tecnologia (MAGV3 e TECV3 caem forte), mas beneficiam o setor bancário (BVIL4 sobe com juros maiores).',
    impacts: {
      BVIL4: 0.09,
      MAGV3: -0.17,
      TECV3: -0.10,
      BEBV3: -0.05,
      AERV3: -0.04
    }
  },
  {
    id: 'dolar_dispara',
    category: 'Macroeconomia & Juros',
    channel: 'VALOR',
    title: 'Dólar dispara e passa de R$ 5,90 com tensão internacional; exportadoras brilham!',
    summary: 'A moeda americana subiu forte hoje. Empresas brasileiras que vendem produtos em dólar para o exterior terão receita recorde em reais, mas quem depende de importados sofre.',
    educationalNote: '💡 COMO O MERCADO REAGE: Exportadoras como CeluVila (CELV3), MineraVila (MINV3), AgroTocantins (AGRV3), AeroVila (AERV3) e EletroMotor (WEGV3) sobem! Varejo doméstico (MAGV3) cai.',
    impacts: {
      CELV3: 0.14,
      MINV3: 0.11,
      AGRV3: 0.10,
      AERV3: 0.09,
      WEGV3: 0.08,
      MAGV3: -0.11,
      BEBV3: -0.04
    }
  },
  {
    id: 'dolar_cai_pib_sobe',
    category: 'Macroeconomia & Juros',
    channel: 'G10',
    title: 'PIB do Brasil surpreende, Dólar recua para R$ 4,95 e confiança do consumidor bate recorde!',
    summary: 'Dados oficiais mostram geração recorde de empregos e queda do dólar, impulsionando o poder de compra das famílias brasileiras.',
    educationalNote: '💡 COMO O MERCADO REAGE: Economia doméstica aquecida e dólar mais baixo impulsionam Varejo (MAGV3), Bebidas (BEBV3), Bancos (BVIL4) e Tecnologia (TECV3). Exportadoras puras (CELV3) recuam levemente.',
    impacts: {
      MAGV3: 0.14,
      BEBV3: 0.10,
      BVIL4: 0.08,
      TECV3: 0.09,
      CELV3: -0.06,
      MINV3: -0.04
    }
  },

  // === 2. COMMODITIES, ENERGIA & AGRONEGÓCIO ===
  {
    id: 'petroleo_descoberta',
    category: 'Energia, Mineração & Agro',
    channel: 'CNN',
    title: 'PLANTÃO: PetroVila (PETV4) anuncia descoberta de megacampo de petróleo de alta qualidade!',
    summary: 'Geólogos confirmaram uma reserva gigante de petróleo leve na costa brasileira, capaz de aumentar em 30% a produção da companhia nos próximos anos.',
    educationalNote: '💡 COMO O MERCADO REAGE: Descobertas comprovadas de reservas aumentam o valor intrínseco e os futuros dividendos da PetroVila (PETV4 dispara!).',
    impacts: {
      PETV4: 0.18,
      BVIL4: 0.04,
      WEGV3: 0.05
    }
  },
  {
    id: 'petroleo_queda_congelamento',
    category: 'Energia, Mineração & Agro',
    channel: 'FOLHA',
    title: 'Barril de petróleo despenca lá fora e governo estuda segurar preço dos combustíveis',
    summary: 'O excesso de petróleo no mercado mundial derrubou a cotação internacional, enquanto rumores sobre subsídios na gasolina preocupam acionistas da PetroVila.',
    educationalNote: '💡 COMO O MERCADO REAGE: Queda do petróleo + risco de controle de preços faz investidores venderem PETV4 (-15%). Por outro lado, frete mais barato ajuda o Varejo (MAGV3) e Agro (AGRV3).',
    impacts: {
      PETV4: -0.15,
      MAGV3: 0.05,
      AGRV3: 0.04,
      BEBV3: 0.03
    }
  },
  {
    id: 'supersafra_tocantins',
    category: 'Energia, Mineração & Agro',
    channel: 'G10',
    title: 'Super-safra no Tocantins! Clima perfeito gera colheita histórica de soja e milho',
    summary: 'Chuvas na medida certa e uso de tratores autônomos fizeram a AgroTocantins (AGRV3) bater recorde histórico de produtividade e fechar megacontratos de exportação.',
    educationalNote: '💡 COMO O MERCADO REAGE: Safra recorde aumenta o faturamento da AgroTocantins (AGRV3 sobe forte!) e movimenta o crédito rural do Banco Vila (BVIL4).',
    impacts: {
      AGRV3: 0.19,
      BVIL4: 0.05,
      WEGV3: 0.04
    }
  },
  {
    id: 'seca_severa_agro',
    category: 'Energia, Mineração & Agro',
    channel: 'CNN',
    title: 'ALERTA CLIMÁTICO: Onda de seca severa e queimadas atrasam plantio de grãos no país',
    summary: 'A falta de chuvas prolongada reduziu em 25% a estimativa de colheita de soja e encareceu matérias-primas agrícolas e energia elétrica.',
    educationalNote: '💡 COMO O MERCADO REAGE: Eventos climáticos extremos prejudicam diretamente o Agronegócio (AGRV3 cai forte) e encarecem insumos de bebidas e alimentos (BEBV3 cai).',
    impacts: {
      AGRV3: -0.16,
      BEBV3: -0.07,
      MAGV3: -0.04
    }
  },
  {
    id: 'china_pacote_infra',
    category: 'Energia, Mineração & Agro',
    channel: 'VALOR',
    title: 'China anuncia pacote trilionário de ferrovias e cidades inteligentes; minério dispara!',
    summary: 'O governo chinês aprovou a construção de dezenas de linhas de trem-bala e prédios, fazendo a demanda por aço, minério de ferro e celulose explodir.',
    educationalNote: '💡 COMO O MERCADO REAGE: A China é a maior compradora de minério e celulose do Brasil. MineraVila (MINV3) e CeluVila (CELV3) disparam!',
    impacts: {
      MINV3: 0.17,
      CELV3: 0.12,
      AGRV3: 0.07,
      PETV4: 0.06
    }
  },
  {
    id: 'china_desacelera',
    category: 'Energia, Mineração & Agro',
    channel: 'INFOGRANA',
    title: 'Crise imobiliária na Ásia derruba preço do minério de ferro em 12% na madrugada',
    summary: 'Construtoras internacionais reduziram pedidos de aço e minério de ferro, pressionando as mineradoras listadas na Bolsa Vila.',
    educationalNote: '💡 COMO O MERCADO REAGE: Com menos construção civil na Ásia, o preço do minério cai e as ações da MineraVila (MINV3) sofrem forte correção.',
    impacts: {
      MINV3: -0.15,
      CELV3: -0.06
    }
  },

  // === 3. EMPRESAS, VAREJO, INDÚSTRIA & TECNOLOGIA ===
  {
    id: 'black_friday_recorde',
    category: 'Empresas, Varejo & Tecnologia',
    channel: 'INFOGRANA',
    title: 'Vendas da MagaVila (MAGV3) explodem 60% em Mega Promoção Online com entrega em 2 horas!',
    summary: 'Filas virtuais e recorde de pedidos pelo aplicativo surpreenderam os analistas da Bolsa Vila. Embalagens da CeluVila também tiveram alta demanda.',
    educationalNote: '💡 COMO O MERCADO REAGE: Resultado operacional acima do esperado faz as ações de varejo (MAGV3) saltarem rapidamente! Quem fornece papelão para caixas (CELV3) e sistemas (TECV3) também sobe.',
    impacts: {
      MAGV3: 0.21,
      CELV3: 0.07,
      TECV3: 0.06,
      BVIL4: 0.04
    }
  },
  {
    id: 'aerovila_encomenda_jatos',
    category: 'Empresas, Varejo & Tecnologia',
    channel: 'VALOR',
    title: 'AeroVila (AERV3) fecha venda histórica de 80 jatos e 200 carros voadores para os EUA!',
    summary: 'O contrato bilionário garante carteira de pedidos cheia pelos próximos 5 anos. Os motores elétricos serão fornecidos em parceria com a EletroMotor Vila (WEGV3).',
    educationalNote: '💡 COMO O MERCADO REAGE: Contratos bilionários em moeda forte e parcerias industriais impulsionam tanto a fabricante (AERV3) quanto sua fornecedora de motores (WEGV3)!',
    impacts: {
      AERV3: 0.19,
      WEGV3: 0.12,
      TECV3: 0.04
    }
  },
  {
    id: 'weg_energia_solar',
    category: 'Empresas, Varejo & Tecnologia',
    channel: 'G10',
    title: 'EletroMotor Vila (WEGV3) cria superbateria solar que carrega em 5 minutos!',
    summary: 'A patente brasileira revolucionou o setor de energia limpa e atraiu fundos de investimento do mundo inteiro para a Bolsa Vila.',
    educationalNote: '💡 COMO O MERCADO REAGE: Inovação tecnológica patenteada gera vantagem competitiva duradoura. WEGV3 dispara na Bolsa!',
    impacts: {
      WEGV3: 0.18,
      AERV3: 0.06,
      TECV3: 0.05
    }
  },
  {
    id: 'tecvila_ia_educacao',
    category: 'Empresas, Varejo & Tecnologia',
    channel: 'INFOGRANA',
    title: 'TecVila (TECV3) lança Inteligência Artificial nacional adotada por 10 mil empresas e bancos!',
    summary: 'O novo sistema reduz custos operacionais em 40%. O Banco Vila (BVIL4) foi o primeiro grande cliente a integrar a tecnologia.',
    educationalNote: '💡 COMO O MERCADO REAGE: Receita recorrente de assinaturas de IA valoriza muito empresas de tecnologia (TECV3 +18%) e aumenta a eficiência dos bancos (BVIL4 +6%).',
    impacts: {
      TECV3: 0.18,
      BVIL4: 0.06,
      MAGV3: 0.04
    }
  },
  {
    id: 'ataque_cibernetico',
    category: 'Empresas, Varejo & Tecnologia',
    channel: 'CNN',
    title: 'URGENTE: Instabilidade global em servidores de nuvem tira sistemas e lojas online do ar!',
    summary: 'Uma falha em atualização de servidores deixou aplicativos de compras e softwares empresariais indisponíveis por várias horas nesta tarde.',
    educationalNote: '💡 COMO O MERCADO REAGE: Falhas técnicas afetam a confiança em empresas de software (TECV3) e travam vendas do e-commerce (MAGV3).',
    impacts: {
      TECV3: -0.14,
      MAGV3: -0.10,
      BVIL4: -0.03
    }
  },
  {
    id: 'onda_calor_carnaval',
    category: 'Empresas, Varejo & Tecnologia',
    channel: 'G10',
    title: 'Verão histórico e festival nacional esgotam estoques de refrigerantes e sucos da BebiVila!',
    summary: 'Com temperaturas acima de 38°C em todo o país e estádios lotados, as fábricas da BebiVila (BEBV3) operam em três turnos para atender os supermercados.',
    educationalNote: '💡 COMO O MERCADO REAGE: Clima quente + eventos aumentam imediatamente o volume de vendas de bebidas (BEBV3 sobe forte!).',
    impacts: {
      BEBV3: 0.16,
      MAGV3: 0.04,
      AGRV3: 0.03
    }
  },
  {
    id: 'banco_vila_lucro_recorde',
    category: 'Empresas, Varejo & Tecnologia',
    channel: 'VALOR',
    title: 'Banco Vila (BVIL4) divulga lucro trimestral recorde e anuncia expansão internacional!',
    summary: 'O balanço financeiro mostrou crescimento na carteira de crédito, baixa inadimplência e recorde de novos jovens investidores na corretora.',
    educationalNote: '💡 COMO O MERCADO REAGE: Balanços trimestrais com lucro acima do esperado atraem grandes investidores para o papel (BVIL4 sobe forte!).',
    impacts: {
      BVIL4: 0.15,
      TECV3: 0.05,
      MAGV3: 0.03
    }
  },

  // === 4. CRISES, CISNES NEGROS & REVogAÇÕES ===
  {
    id: 'greve_logistica',
    category: 'Crises & Eventos Globais',
    channel: 'CNN',
    title: 'PLANTÃO: Paralisação nas rodovias atrasa entregas de mercadorias e abastecimento no país!',
    summary: 'Bloqueios em estradas afetam o transporte de compras online, bebidas e combustíveis, gerando cautela generalizada na Bolsa Vila.',
    educationalNote: '💡 COMO O MERCADO REAGE: Crises logísticas atingem fortemente quem depende de caminhões para entregar produtos (MAGV3, BEBV3 e PETV4 caem). Empresas digitais (TECV3) sofrem menos.',
    impacts: {
      MAGV3: -0.14,
      BEBV3: -0.11,
      PETV4: -0.09,
      AGRV3: -0.08,
      MINV3: -0.03,
      TECV3: 0.02
    }
  },
  {
    id: 'circuit_breaker_crise',
    category: 'Crises & Eventos Globais',
    channel: 'CNN',
    title: 'ALERTA VERMELHO: Temor de crise econômica mundial provoca onda de vendas nas bolsas!',
    summary: 'Bolsas dos EUA, Europa e Ásia operam em forte queda hoje após dados econômicos fracos. Investidores buscam proteção ou oportunidades de compra na baixa!',
    educationalNote: '💡 LIÇÃO DE OURO DO INVESTIDOR: Em momentos de pânico ("Bear Market"), quase todas as ações caem juntas. Investidores precipitados vendem no fundo com prejuízo; investidores estrategistas usam seu caixa para comprar boas empresas baratas ("na promoção")!',
    impacts: {
      PETV4: -0.12,
      MINV3: -0.11,
      MAGV3: -0.15,
      AERV3: -0.11,
      TECV3: -0.10,
      WEGV3: -0.08,
      AGRV3: -0.07,
      CELV3: -0.05,
      BVIL4: -0.06,
      BEBV3: -0.05
    }
  },
  {
    id: 'bull_market_brasil',
    category: 'Crises & Eventos Globais',
    channel: 'VALOR',
    title: 'EUFORIA NA BOLSA! Brasil recebe nota de Grau de Investimento e bilhões entram na Bolsa Vila!',
    summary: 'Agências internacionais elevaram a nota de crédito do país. Fundos estrangeiros estão comprando ações brasileiras de todos os setores em ritmo recorde!',
    educationalNote: '💡 COMO O MERCADO REAGE: Quando o risco do país cai ("Bull Market"), o fluxo de capital estrangeiro levanta quase todas as empresas da Bolsa, especialmente as líderes (Blue Chips)!',
    impacts: {
      PETV4: 0.13,
      MINV3: 0.12,
      BVIL4: 0.13,
      MAGV3: 0.16,
      WEGV3: 0.11,
      AERV3: 0.12,
      AGRV3: 0.10,
      BEBV3: 0.09,
      CELV3: 0.09,
      TECV3: 0.14
    }
  }
];

export const GLOSSARY_ITEMS = [
  {
    term: 'Ação (Ex: PETV4, BVIL4)',
    definition: 'É a menor "fatia" do capital de uma empresa. Quando você compra 1 ação, você se torna sócio daquela empresa e ganha se ela crescer e der lucro!'
  },
  {
    term: 'Preço Médio (PM)',
    definition: 'É a média do valor que você pagou pelas suas ações. Para ter lucro na venda, o Preço Atual precisa estar MAIOR que o seu Preço Médio!'
  },
  {
    term: 'Comprar na Baixa, Vender na Alta',
    definition: 'Regra clássica da Bolsa: comprar ações de boas empresas quando estão descontadas (baratas) ou quando sai uma notícia positiva no início, e vender quando já subiram bastante.'
  },
  {
    term: 'Taxa Selic (Juros)',
    definition: 'É a taxa básica de juros da economia. Quando a Selic SOBE, o varejo (MAGV3) sofre porque o crédito fica caro, mas bancos (BVIL4) ganham. Quando a Selic CAI, o varejo e a tecnologia decolam!'
  },
  {
    term: 'Empresas Exportadoras (Dólar)',
    definition: 'Empresas que vendem para outros países (como MineraVila MINV3, CeluVila CELV3, AgroTocantins AGRV3 e AeroVila AERV3) ganham mais reais quando o Dólar sobe!'
  },
  {
    term: 'Diversificação ("Não pôr todos os ovos na mesma cesta")',
    definition: 'Distribuir seus R$ 10.000 entre empresas de setores diferentes (ex: Banco + Energia + Agro + Tecnologia) protege você caso um setor sofra uma notícia ruim.'
  },
  {
    term: 'Dividendos',
    definition: 'Parte do lucro das empresas dividida em dinheiro direto na conta dos acionistas que possuem ações na carteira!'
  }
];

export const AVATARS = [
  { id: 'shark', emoji: '🦈', label: 'Tubarão da Bolsa' },
  { id: 'bull', emoji: '🐂', label: 'Touro de Ouro' },
  { id: 'rocket', emoji: '🚀', label: 'Foguete Financeiro' },
  { id: 'eagle', emoji: '🦅', label: 'Águia Analista' },
  { id: 'lion', emoji: '🦁', label: 'Leão do Mercado' },
  { id: 'brain', emoji: '🧠', label: 'Estrategista' },
  { id: 'diamond', emoji: '💎', label: 'Mão de Diamante' },
  { id: 'crown', emoji: '👑', label: 'Magnata da Vila' }
];
