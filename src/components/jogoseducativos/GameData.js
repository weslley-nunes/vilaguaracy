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
  },
  {
    id: 'superboss',
    name: 'O Sistema (Patriarcado)',
    description: 'A raiz da desigualdade. Use o conhecimento máximo.',
    image: '/sprite_superboss.jpg',
    isEpic: true,
    dialogues: [
      {
        enemyMessage: 'VOCÊ ACHA QUE PODE MUDAR ALGO? OLHE PARA ISTO. A VIOLÊNCIA É INEVITÁVEL.',
        imageInMessage: '/infografico_feminicidio.jpg',
        options: [
          { text: 'Esses números me assustam. Talvez eu não possa fazer nada.', isCorrect: false, feedback: 'O Sistema se fortaleceu com seu medo.', damage: 50 },
          { text: 'Esses 1.467 casos de feminicídio em 2023 mostram a urgência da nossa luta. Conscientização e educação são nossas armas!', isCorrect: true, feedback: 'GOLPE CRÍTICO! Você usou os dados para ganhar força.', damage: 100 },
          { text: 'As leis vão resolver isso sozinhas com o tempo.', isCorrect: false, feedback: 'A passividade não destrói O Sistema.', damage: 40 }
        ]
      },
      {
        enemyMessage: 'O CICLO NUNCA TERÁ FIM. VEJA QUANTAS SOFREM NAS SOMBRAS DE SUAS CASAS!',
        imageInMessage: '/infografico_violencia.jpg',
        options: [
          { text: 'Quase 259 mil agressões... O ciclo de abuso DEVE ser rompido pela denúncia e pela Rede de Apoio. Ninguém está sozinha!', isCorrect: true, feedback: 'GOLPE CRÍTICO! A Rede de Apoio desestabilizou o Boss.', damage: 100 },
          { text: 'É impossível combater algo tão grande e oculto.', isCorrect: false, feedback: 'O Sistema se alimenta da sua desesperança.', damage: 50 },
          { text: 'O que acontece em casa, fica em casa.', isCorrect: false, feedback: 'A omissão é a maior aliada do Sistema.', damage: 60 }
        ]
      },
      {
        enemyMessage: 'VOCÊ ESTÁ SOZINHA CONTRA MIM. NÃO HÁ QUEM TE ESCUTE. RENDA-SE.',
        options: [
          { text: 'Talvez eu não tenha voz mesmo.', isCorrect: false, feedback: 'Seu silêncio o fortalece.', damage: 50 },
          { text: 'Eu tenho voz e não estou sozinha!', isCorrect: false, feedback: 'Faltou indicar AÇÃO prática.', damage: 30 },
          { text: 'A central de atendimento LIGUE 180 está disponível 24 horas! Nós temos a lei, a informação e umas às outras. O SEU FIM CHEGOU!', isCorrect: true, feedback: 'GOLPE FINAL! O SISTEMA COLAPSOU!', damage: 150 }
        ]
      }
    ]
  }
];

export const obstaclesBoys = [
  {
    id: 'pressao_amigos',
    name: 'A Pressão do Grupo',
    description: 'Amigos incentivando atitudes machistas.',
    image: '/sprite_assedio.jpg',
    dialogues: [
      {
        enemyMessage: 'Ah, cara! Qual o problema de mandar aquela foto íntima da garota no grupo? Todo mundo faz isso!',
        options: [
          { text: 'É, acho que não dá nada...', isCorrect: false, feedback: 'Você cedeu à pressão.', damage: 30 },
          { text: 'Isso é crime! Espalhar foto íntima sem consentimento destrói a vida da menina.', isCorrect: true, feedback: 'Correto! Você cortou a corrente do mal.', damage: 50 },
          { text: 'Melhor eu não mandar, mas não vou falar nada.', isCorrect: false, feedback: 'Omitir-se também é permitir.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'Deixa de ser chato! É só uma piada de mulher no volante. Você não sabe zoar mais?',
        options: [
          { text: 'Kkk, foi engraçado vai.', isCorrect: false, feedback: 'Você riu e fortaleceu o preconceito.', damage: 30 },
          { text: 'Piada que diminui a mulher não tem graça. Isso só reforça estereótipos perigosos.', isCorrect: true, feedback: 'Boa! Não tem espaço para piada machista.', damage: 50 },
          { text: 'Vou sair do grupo.', isCorrect: false, feedback: 'Sair resolve para você, mas não educa o outro.', damage: 20 }
        ]
      }
    ]
  },
  {
    id: 'fantasma_ciume',
    name: 'Fantasma do Ciúme',
    description: 'Confunde controle com amor.',
    image: '/sprite_gaslighting.jpg',
    dialogues: [
      {
        enemyMessage: 'Se ela te ama, ela tem que dar a senha do celular. Quem não deve não teme, não é mesmo?',
        options: [
          { text: 'Verdade, vou pedir a senha.', isCorrect: false, feedback: 'Isso é invasão de privacidade e abuso.', damage: 30 },
          { text: 'Em um relacionamento saudável, a base é a confiança, não o controle. Eu respeito o espaço dela.', isCorrect: true, feedback: 'Perfeito! Amor não é prisão.', damage: 50 },
          { text: 'Só olho quando ela vai no banheiro.', isCorrect: false, feedback: 'Isso é quebra total de confiança!', damage: 40 }
        ]
      },
      {
        enemyMessage: 'Olha a roupa que ela vai sair! Você vai deixar ela ir vestida assim? Outros caras vão olhar!',
        options: [
          { text: 'Ela se veste como quiser. O corpo é dela e o respeito dos outros não depende da roupa!', isCorrect: true, feedback: 'Isso aí! Você entende a autonomia dela.', damage: 50 },
          { text: 'Realmente, vou pedir pra ela trocar.', isCorrect: false, feedback: 'Controlar o corpo e as escolhas dela é violência.', damage: 40 },
          { text: 'É, mas eu vou junto pra proteger.', isCorrect: false, feedback: 'O problema é o pensamento machista dos outros, não a roupa.', damage: 20 }
        ]
      }
    ]
  },
  {
    id: 'monstro_consentimento',
    name: 'Monstro do Consentimento',
    description: 'Não entende que não é não.',
    image: '/sprite_luna.jpg',
    dialogues: [
      {
        enemyMessage: 'Ela disse "não" mas deu aquele sorriso... É charme. Insiste que ela cede!',
        options: [
          { text: 'Vou tentar de novo, né?', isCorrect: false, feedback: 'Não faça isso! Assédio é crime.', damage: 40 },
          { text: 'Claro, as mulheres gostam de insistência.', isCorrect: false, feedback: 'Mito perigoso. Isso só gera assédio.', damage: 40 },
          { text: 'Não é NÃO. Se não for um SIM claro, eu recuo. Respeito acima de tudo!', isCorrect: true, feedback: 'Exato! O consentimento é a única regra.', damage: 50 }
        ]
      },
      {
        enemyMessage: 'Ela estava bêbada na festa e foi com você pra casa. Você pode fazer o que quiser agora.',
        options: [
          { text: 'Se ela veio comigo, é porque quis.', isCorrect: false, feedback: 'Pessoa alcoolizada não pode dar consentimento válido!', damage: 50 },
          { text: 'Se ela não tem condições de consentir, nada acontece. Vou garantir que ela fique segura.', isCorrect: true, feedback: 'Bela atitude. Você foi um verdadeiro aliado.', damage: 50 },
          { text: 'Melhor eu não fazer nada para não dar problema.', isCorrect: false, feedback: 'Você fez o certo pelos motivos errados.', damage: 20 }
        ]
      }
    ]
  },
  {
    id: 'cumplice_silencio',
    name: 'O Cúmplice do Silêncio',
    description: 'Quer que você feche os olhos.',
    image: '/sprite_silencio.jpg',
    dialogues: [
      {
        enemyMessage: 'Você viu aquele cara assediando a menina no ônibus? Deixa quieto, não se mete. Não é problema seu.',
        options: [
          { text: 'Melhor fingir que não vi.', isCorrect: false, feedback: 'Sua omissão ajuda o agressor.', damage: 40 },
          { text: 'Vou gravar escondido.', isCorrect: false, feedback: 'E a proteção dela no momento, como fica?', damage: 20 },
          { text: 'Eu tenho que intervir, de forma segura, ou chamar ajuda. Homens precisam ser barreira contra o assédio!', isCorrect: true, feedback: 'Incrível! Ser passivo não é opção.', damage: 50 }
        ]
      },
      {
        enemyMessage: 'Seu vizinho está gritando com a esposa de novo e quebrando tudo. Em briga de marido e mulher...',
        options: [
          { text: 'Não se mete a colher.', isCorrect: false, feedback: 'Ditado ultrapassado que mata mulheres.', damage: 50 },
          { text: 'Em briga de marido e mulher, SE LIGA 180 ou 190! Eu denuncio para salvar vidas.', isCorrect: true, feedback: 'Corretíssimo. A denúncia salva.', damage: 50 },
          { text: 'Vou lá bater nele.', isCorrect: false, feedback: 'Violência gera violência, a polícia deve ser acionada.', damage: 30 }
        ]
      }
    ]
  },
  {
    id: 'mestre_desrespeito',
    name: 'Mestre da Desinformação',
    description: 'Minimiza e interrompe.',
    image: '/sprite_desinformacao.jpg',
    dialogues: [
      {
        enemyMessage: 'A colega tá falando na reunião de novo. Interrompe ela, você sabe explicar melhor que ela.',
        options: [
          { text: 'Vou falar por cima, eu li mais sobre o assunto.', isCorrect: false, feedback: 'Isso é manterrupting. Deixe a mulher falar!', damage: 40 },
          { text: 'As mulheres ganham espaço se tiverem ajuda dos homens para falar.', isCorrect: false, feedback: 'Elas não precisam de salvação, precisam de respeito à fala.', damage: 30 },
          { text: 'Eu respeito o turno dela de fala. Mulheres são interrompidas muito mais que homens, não serei um deles.', isCorrect: true, feedback: 'Isso! Saber ouvir é essencial.', damage: 50 }
        ]
      },
      {
        enemyMessage: 'Ela está reclamando do trabalho e cansaço. Diz para ela que é só tomar um banho que passa.',
        options: [
          { text: 'Ela precisa de soluções práticas, vou dar.', isCorrect: false, feedback: 'Isso minimiza a carga mental que as mulheres sofrem.', damage: 30 },
          { text: 'A dupla jornada das mulheres é pesada. O certo é dividir as tarefas de casa e cuidar juntos.', isCorrect: true, feedback: 'Mandou bem! Tarefa doméstica é dos dois.', damage: 50 },
          { text: 'Eu ajudo ela sempre que ela me pede.', isCorrect: false, feedback: 'Você não tem que "ajudar", tem que dividir a responsabilidade!', damage: 20 }
        ]
      }
    ]
  },
  {
    id: 'superboss_boys',
    name: 'A Máscara do Machismo',
    description: 'Exige que você seja agressivo e engula o choro.',
    image: '/sprite_superboss.jpg',
    isEpic: true,
    dialogues: [
      {
        enemyMessage: 'OLHE PARA VOCÊ. "HOMEM DE VERDADE" NÃO MOSTRA SENTIMENTOS. O CHORO É FRAQUEZA. A FORÇA É A VIOLÊNCIA!',
        imageInMessage: '/infografico_violencia.jpg',
        options: [
          { text: 'Tem razão, homem tem que ser forte e não chorar.', isCorrect: false, feedback: 'Reprimir sentimentos gera agressividade!', damage: 50 },
          { text: 'O machismo tóxico machuca os homens também! Sentir e falar sobre emoções nos torna humanos, e não monstros agressivos.', isCorrect: true, feedback: 'GOLPE CRÍTICO! Você quebrou a máscara.', damage: 100 },
          { text: 'A violência resolve as coisas mais rápido.', isCorrect: false, feedback: 'O ciclo da violência destrói tudo.', damage: 50 }
        ]
      },
      {
        enemyMessage: 'AS ESTATÍSTICAS NUNCA VÃO MUDAR. SEMPRE FOI ASSIM E SEMPRE SERÁ. A DESIGUALDADE É NATURAL!',
        imageInMessage: '/infografico_feminicidio.jpg',
        options: [
          { text: 'Homens e mulheres são diferentes, não tem como mudar.', isCorrect: false, feedback: 'Diferença não justifica desigualdade e violência!', damage: 50 },
          { text: 'Isso pode ser mudado com a educação! Se nós homens formos aliados e mudarmos nossos comportamentos, o machismo estrutural vai cair!', isCorrect: true, feedback: 'GOLPE CRÍTICO! A educação é a chave!', damage: 100 },
          { text: 'As leis já não estão mudando isso?', isCorrect: false, feedback: 'A lei pune, mas a educação previne.', damage: 40 }
        ]
      },
      {
        enemyMessage: 'VOCÊ VAI TRAIR A SUA PRÓPRIA ESPÉCIE? SEJA COMO NÓS!',
        options: [
          { text: 'Melhor seguir o bando pra não ser zoado.', isCorrect: false, feedback: 'Sua submissão é a vitória dele.', damage: 50 },
          { text: 'Eu sigo o que é certo.', isCorrect: false, feedback: 'Faltou posicionamento firme e ação.', damage: 30 },
          { text: 'Homem de verdade não agride, não oprime e não silencia! Nós somos a geração de aliados, o seu tempo de impunidade acabou!', isCorrect: true, feedback: 'GOLPE FINAL! O MACHISMO RUIU!', damage: 150 }
        ]
      }
    ]
  }
];
