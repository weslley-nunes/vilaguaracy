export const characters = [
  {
    id: 'dandara',
    name: 'Dandara',
    description: 'Focada em força, empoderamento físico e corporal.',
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-600',
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
    id: 'sofia',
    name: 'Sofia',
    description: 'Especialista em direitos, leis e conhecimento sistêmico.',
    color: 'bg-teal-600',
    hoverColor: 'hover:bg-teal-700',
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-600',
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
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-500',
    stats: {
      autoestima: 75,
      conhecimento: 80,
      empatia: 95,
    },
    skills: [
      { id: 'rede_apoio', name: 'Rede de Apoio', type: 'attack', power: 35, description: 'Chama amigas e familiares, enfraquecendo o isolamento.' },
      { id: 'sororidade', name: 'Sororidade', type: 'heal', power: 45, description: 'Conecta-se com outras mulheres, recuperando grande energia.' }
    ]
  }
];

export const obstacles = [
  {
    id: 'gaslighting',
    name: 'Fantasma do Gaslighting',
    description: 'Tenta fazer você duvidar da sua própria sanidade e memória.',
    hp: 100,
    maxHp: 100,
    color: 'bg-slate-800',
    textColor: 'text-slate-800',
    attacks: [
      { name: 'Distorção da Realidade', damage: 15, message: '"Você está louca, isso nunca aconteceu!"' },
      { name: 'Minar Confiança', damage: 20, message: '"Ninguém mais vai acreditar em você além de mim."' }
    ]
  },
  {
    id: 'controle',
    name: 'Monstro do Controle',
    description: 'Quer ditar com quem você fala, o que veste e para onde vai.',
    hp: 120,
    maxHp: 120,
    color: 'bg-red-800',
    textColor: 'text-red-800',
    attacks: [
      { name: 'Isolamento Social', damage: 25, message: '"Por que você precisa de amigas se tem a mim?"' },
      { name: 'Invasão de Privacidade', damage: 20, message: '*Olha o seu celular escondido.*' }
    ]
  },
  {
    id: 'assedio',
    name: 'Sombra do Assédio',
    description: 'Não respeita o seu corpo e o seu espaço pessoal.',
    hp: 90,
    maxHp: 90,
    color: 'bg-indigo-900',
    textColor: 'text-indigo-900',
    attacks: [
      { name: 'Comentário Invasivo', damage: 15, message: 'Faz um comentário indesejado sobre o seu corpo.' },
      { name: 'Aproximação Forçada', damage: 25, message: 'Invade seu espaço pessoal sem consentimento.' }
    ]
  }
];
