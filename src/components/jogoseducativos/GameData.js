export const characters = [
  {
    id: 'dandara',
    name: 'Dandara',
    description: 'Força e empoderamento físico.',
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-600',
    image: '/jogoseducativos/sprites/sprite_dandara_1787256144306.jpg',
    stats: { autoestima: 90, conhecimento: 70, empatia: 80 }
  },
  {
    id: 'sofia_loira',
    name: 'Sofia',
    description: 'Direitos, leis e proteção sistêmica.',
    color: 'bg-teal-600',
    hoverColor: 'hover:bg-teal-700',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-600',
    image: '/jogoseducativos/sprites/sprite_sofia_loira_1787256358667.jpg',
    stats: { autoestima: 80, conhecimento: 95, empatia: 75 }
  },
  {
    id: 'luna',
    name: 'Luna',
    description: 'Redes de apoio e acolhimento.',
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-500',
    image: '/jogoseducativos/sprites/sprite_luna_1787256163256.jpg',
    stats: { autoestima: 75, conhecimento: 80, empatia: 95 }
  },
  {
    id: 'maya',
    name: 'Maya',
    description: 'Independência financeira e autonomia.',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-600',
    image: '/jogoseducativos/sprites/sprite_maya_1787256366265.jpg',
    stats: { autoestima: 85, conhecimento: 90, empatia: 70 }
  },
  {
    id: 'tereza',
    name: 'Tereza',
    description: 'Liderança e voz ativa da comunidade.',
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-600',
    image: '/jogoseducativos/sprites/sprite_tereza_1787256373037.jpg',
    stats: { autoestima: 95, conhecimento: 85, empatia: 85 }
  },
  {
    id: 'maria',
    name: 'Maria',
    description: 'Expressão corporal e saúde mental.',
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-600',
    image: '/jogoseducativos/sprites/sprite_clara_1787256389770.jpg',
    stats: { autoestima: 85, conhecimento: 75, empatia: 90 }
  }
];

export const obstacles = [
  {
    id: 'gaslighting',
    name: 'Fantasma do Gaslighting',
    description: 'Manipulação Psicológica.',
    image: '/jogoseducativos/sprites/sprite_gaslighting_1787256180381.jpg',
    dialogues: [
      {
        enemyMessage: 'Você sabe que as mulheres inventam muito essas histórias de violência para chamar atenção, né? Não tem dados que provem isso.',
        options: [
          { text: 'Tem razão, às vezes a gente exagera.', isCorrect: false, feedback: 'Você cedeu à manipulação.', damage: 30 },
          { text: 'Isso é mito! Dados mostram que denúncias falsas são estatisticamente irrelevantes perto da taxa de feminicídio.', isCorrect: true, feedback: 'Excelente! Usou ESTATÍSTICAS para rebater.', damage: 50 },
          { text: 'Eu não quero discutir isso com você.', isCorrect: false, feedback: 'Fugir agora dá mais força para a mentira dele.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'Mesmo assim, violência doméstica é caso de família. Em briga de marido e mulher ninguém mete a colher.',
        options: [
          { text: 'A Lei Maria da Penha é clara: a sociedade e o Estado devem garantir a Proteção Integral da mulher.', isCorrect: true, feedback: 'Perfeito! Invocou a PROTEÇÃO INTEGRAL.', damage: 50 },
          { text: 'Depende muito do que aconteceu entre eles.', isCorrect: false, feedback: 'A violência não tem justificativa.', damage: 30 },
          { text: 'É verdade, cada um cuida da sua vida.', isCorrect: false, feedback: 'Isso contribui para o silêncio.', damage: 30 }
        ]
      }
    ]
  },
  {
    id: 'controle',
    name: 'Monstro do Controle',
    description: 'Fere a autonomia feminina.',
    image: '/jogoseducativos/sprites/sprite_controle_1787256188898.jpg',
    dialogues: [
      {
        enemyMessage: 'Se você me amasse de verdade, me deixaria ver seu celular e parar de sair com essas suas amigas.',
        options: [
          { text: 'Tá bom, eu não saio mais com elas.', isCorrect: false, feedback: 'Você abriu mão da sua Rede de Apoio.', damage: 30 },
          { text: 'A privacidade é um direito. Minha AUTONOMIA não negocia a minha liberdade individual.', isCorrect: true, feedback: 'Maravilha! Você defendeu sua AUTONOMIA.', damage: 50 },
          { text: 'Você pode ver meu celular, mas me deixa sair.', isCorrect: false, feedback: 'Ceder controle nunca é saudável.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'Mulher independente não precisa de rede de apoio, você devia se virar sozinha se é tão autônoma.',
        options: [
          { text: 'Verdade, pedir ajuda é sinal de fraqueza.', isCorrect: false, feedback: 'Mentira! O isolamento é perigoso.', damage: 30 },
          { text: 'Só você me basta, não preciso de mais ninguém.', isCorrect: false, feedback: 'Você está se isolando.', damage: 40 },
          { text: 'Ter AUTONOMIA é também reconhecer que precisamos de políticas públicas e da comunidade ao nosso lado.', isCorrect: true, feedback: 'Exato! Saúde e Autonomia são construções coletivas.', damage: 50 }
        ]
      }
    ]
  },
  {
    id: 'assedio',
    name: 'Sombra do Assédio',
    description: 'Viola a saúde e o corpo.',
    image: '/jogoseducativos/sprites/sprite_assedio_1787256197698.jpg',
    dialogues: [
      {
        enemyMessage: 'Também, com essa roupa, você queria o quê? Você não respeita o próprio corpo.',
        options: [
          { text: 'O meu CORPO é meu, e a culpa do assédio é sempre do assediador. A roupa não justifica a violência.', isCorrect: true, feedback: 'Brilhante! Reafirmou o direito ao seu CORPO.', damage: 50 },
          { text: 'Desculpa, eu vou me trocar.', isCorrect: false, feedback: 'Você se culpabilizou pelo erro do agressor.', damage: 30 },
          { text: 'Eu não pensei que chamaria tanta atenção.', isCorrect: false, feedback: 'A roupa nunca é um convite ao desrespeito.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'As mulheres são as que mais sofrem com depressão e ansiedade porque são muito emocionais.',
        options: [
          { text: 'Nossa SAÚDE mental é afetada pela sobrecarga de trabalho, machismo e pela violência estrutural.', isCorrect: true, feedback: 'Perfeito! Mostrou os Indicadores Sociais de Saúde.', damage: 50 },
          { text: 'É que a gente chora muito mesmo.', isCorrect: false, feedback: 'Reforçou um estereótipo prejudicial.', damage: 30 },
          { text: 'Acho que a genética não ajuda.', isCorrect: false, feedback: 'Ignorou os fatores sociais da violência.', damage: 30 }
        ]
      }
    ]
  },
  {
    id: 'silencio',
    name: 'Coronel do Silêncio',
    description: 'Opressor que desencoraja denúncias.',
    image: '/sprite_silencio.jpg',
    dialogues: [
      {
        enemyMessage: 'Deixa disso. A Lei Maria da Penha nem funciona na prática. Vai dar em nada e você vai ficar mal falada.',
        options: [
          { text: 'A lei funciona sim, e a PROTEÇÃO INTEGRAL obriga o Estado e a sociedade a agirem. O silêncio só protege você!', isCorrect: true, feedback: 'Perfeito! Você defendeu a Proteção Integral.', damage: 50 },
          { text: 'Talvez seja melhor não me expor mesmo...', isCorrect: false, feedback: 'Você aceitou a mordaça do Coronel.', damage: 30 },
          { text: 'Eu vou resolver isso sozinha.', isCorrect: false, feedback: 'Isolar-se dificulta a busca por justiça.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'Isso é assunto de casal, ninguém deve interferir. O Estado não tem que se meter.',
        options: [
          { text: 'Eu concordo, a polícia só piora as coisas.', isCorrect: false, feedback: 'A violência não é um problema privado.', damage: 30 },
          { text: 'A violência contra a mulher é um crime de ação incondicionada. A sociedade e o Estado TÊM o dever de intervir.', isCorrect: true, feedback: 'Brilhante! O Estado não pode se omitir.', damage: 50 },
          { text: 'Vou apenas me afastar dele.', isCorrect: false, feedback: 'Apenas se afastar não quebra o ciclo de impunidade.', damage: 20 }
        ]
      }
    ]
  },
  {
    id: 'desinformacao',
    name: 'Mago da Desinformação',
    description: 'Distorce dados e nega a realidade.',
    image: '/sprite_desinformacao.jpg',
    dialogues: [
      {
        enemyMessage: 'Vocês feministas exageram! As estatísticas de violência doméstica caíram muito nos últimos anos.',
        options: [
          { text: 'Na verdade não vi os dados recentes...', isCorrect: false, feedback: 'A ignorância fortalece o Mago.', damage: 30 },
          { text: 'Os INDICADORES SOCIAIS provam o contrário: o Brasil ainda é um dos países com maiores taxas de feminicídio do mundo!', isCorrect: true, feedback: 'Fatal! Usou DADOS concretos.', damage: 50 },
          { text: 'Pelo menos está diminuindo.', isCorrect: false, feedback: 'Você caiu na falsa sensação de segurança dele.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'A maioria dessas denúncias é falsa. Mulheres mentem para conseguir vantagem no divórcio. Todo mundo sabe.',
        options: [
          { text: 'É, algumas devem mentir mesmo.', isCorrect: false, feedback: 'Você legitimou um mito.', damage: 30 },
          { text: 'Não quero debater achismos com você.', isCorrect: false, feedback: 'É preciso combater a mentira com fatos.', damage: 20 },
          { text: 'As ESTATÍSTICAS oficias mostram que denúncias falsas são raríssimas. A subnotificação do abuso real é o verdadeiro problema!', isCorrect: true, feedback: 'Excelente! Destruiu a fake news com fatos.', damage: 50 }
        ]
      }
    ]
  }
];
