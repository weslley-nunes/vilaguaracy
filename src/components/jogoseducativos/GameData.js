export const characters = [
  {
    id: 'dandara',
    name: 'Dandara',
    description: 'Focada em força e empoderamento físico.',
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-600',
    image: '/jogoseducativos/sprites/sprite_dandara_1787256144306.jpg',
    stats: {
      autoestima: 90,
      conhecimento: 70,
      empatia: 80,
    },
    skills: [
      { id: 'limite', name: 'Impor Limites', type: 'attack', power: 30, description: 'Diz NÃO com firmeza e afasta comportamentos abusivos.' },
      { id: 'amor_proprio', name: 'Amor Próprio', type: 'heal', power: 40, description: 'Reconhece o próprio valor, recuperando a energia.' }
    ]
  },
  {
    id: 'sofia_loira',
    name: 'Sofia',
    description: 'Especialista em direitos, leis e sistêmico.',
    color: 'bg-teal-600',
    hoverColor: 'hover:bg-teal-700',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-600',
    image: '/jogoseducativos/sprites/sprite_sofia_loira_1787256358667.jpg',
    stats: {
      autoestima: 80,
      conhecimento: 95,
      empatia: 75,
    },
    skills: [
      { id: 'maria_penha', name: 'Lei Maria da Penha', type: 'attack', power: 45, description: 'Usa o conhecimento da lei para neutralizar ameaças.' },
      { id: 'informacao', name: 'Buscar Informação', type: 'heal', power: 30, description: 'Entende seus direitos e fortalece sua posição.' }
    ]
  },
  {
    id: 'luna',
    name: 'Luna',
    description: 'Mestra na criação de redes de apoio e empatia.',
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-500',
    image: '/jogoseducativos/sprites/sprite_luna_1787256163256.jpg',
    stats: {
      autoestima: 75,
      conhecimento: 80,
      empatia: 95,
    },
    skills: [
      { id: 'rede_apoio', name: 'Rede de Apoio', type: 'attack', power: 35, description: 'Chama amigas e familiares, enfraquecendo o isolamento.' },
      { id: 'sororidade', name: 'Sororidade', type: 'heal', power: 45, description: 'Conecta-se com outras mulheres, recuperando grande energia.' }
    ]
  },
  {
    id: 'maya',
    name: 'Maya',
    description: 'Focada em independência financeira.',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-600',
    image: '/jogoseducativos/sprites/sprite_maya_1787256366265.jpg',
    stats: {
      autoestima: 85,
      conhecimento: 90,
      empatia: 70,
    },
    skills: [
      { id: 'independencia', name: 'Independência Financeira', type: 'attack', power: 40, description: 'Garante o próprio sustento e recusa controle econômico.' },
      { id: 'planejamento', name: 'Planejamento', type: 'heal', power: 35, description: 'Organiza seus recursos para um futuro seguro.' }
    ]
  },
  {
    id: 'tereza',
    name: 'Tereza',
    description: 'Focada em liderança e voz ativa.',
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-600',
    image: '/jogoseducativos/sprites/sprite_tereza_1787256373037.jpg',
    stats: {
      autoestima: 95,
      conhecimento: 85,
      empatia: 85,
    },
    skills: [
      { id: 'voz_ativa', name: 'Voz Ativa', type: 'attack', power: 45, description: 'Usa o megafone para denunciar injustiças.' },
      { id: 'uniao', name: 'União Comunitária', type: 'heal', power: 40, description: 'Reúne a comunidade para apoio mútuo.' }
    ]
  },
  {
    id: 'maria',
    name: 'Maria',
    description: 'Focada em expressão e saúde mental.',
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-600',
    image: '/jogoseducativos/sprites/sprite_clara_1787256389770.jpg',
    stats: {
      autoestima: 85,
      conhecimento: 75,
      empatia: 90,
    },
    skills: [
      { id: 'expressao', name: 'Expressão Emocional', type: 'attack', power: 35, description: 'Usa a arte para quebrar barreiras psicológicas.' },
      { id: 'terapia', name: 'Busca Terapia', type: 'heal', power: 50, description: 'Cuida da mente e recupera muita energia.' }
    ]
  }
];

export const obstacles = [
  {
    id: 'gaslighting',
    name: 'Fantasma do Gaslighting',
    description: 'Tenta fazer você duvidar da sua memória.',
    hp: 100,
    maxHp: 100,
    color: 'bg-slate-800',
    textColor: 'text-slate-800',
    image: '/jogoseducativos/sprites/sprite_gaslighting_1787256180381.jpg',
    attacks: [
      { name: 'Distorção da Realidade', damage: 15, message: '"Você está louca, isso nunca aconteceu!"' },
      { name: 'Minar Confiança', damage: 20, message: '"Ninguém vai acreditar em você além de mim."' }
    ]
  },
  {
    id: 'controle',
    name: 'Monstro do Controle',
    description: 'Quer ditar com quem você fala e o que veste.',
    hp: 120,
    maxHp: 120,
    color: 'bg-red-800',
    textColor: 'text-red-800',
    image: '/jogoseducativos/sprites/sprite_controle_1787256188898.jpg',
    attacks: [
      { name: 'Isolamento Social', damage: 25, message: '"Por que você precisa de amigas se tem a mim?"' },
      { name: 'Invasão de Privacidade', damage: 20, message: '*Olha o seu celular escondido.*' }
    ]
  },
  {
    id: 'assedio',
    name: 'Sombra do Assédio',
    description: 'Não respeita o seu corpo e o seu espaço.',
    hp: 90,
    maxHp: 90,
    color: 'bg-indigo-900',
    textColor: 'text-indigo-900',
    image: '/jogoseducativos/sprites/sprite_assedio_1787256197698.jpg',
    attacks: [
      { name: 'Comentário Invasivo', damage: 15, message: 'Faz um comentário indesejado sobre o seu corpo.' },
      { name: 'Aproximação Forçada', damage: 25, message: 'Invade seu espaço pessoal sem consentimento.' }
    ]
  }
];
