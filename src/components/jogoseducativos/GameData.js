export const femaleCharacters = [
  {
    id: 'dandara',
    name: 'Dandara',
    description: 'Força e empoderamento físico.',
    gender: 'F',
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
    gender: 'F',
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
    gender: 'F',
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
    gender: 'F',
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
    gender: 'F',
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
    gender: 'F',
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-600',
    image: '/jogoseducativos/sprites/sprite_clara_1787256389770.jpg',
    stats: { autoestima: 85, conhecimento: 75, empatia: 90 }
  }
];

export const maleCharacters = [
  {
    id: 'zeca',
    name: 'Zeca',
    description: 'Sempre pronto para defender quem precisa e combater atitudes machistas.',
    gender: 'M',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-600',
    image: '/sprite_zeca.png',
    stats: { coragem: 90, respeito: 85, empatia: 80 }
  },
  {
    id: 'joao',
    name: 'João',
    description: 'Comunicação assertiva e influência positiva nos grupos de amigos.',
    gender: 'M',
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-600',
    image: '/sprite_joao.jpg',
    stats: { coragem: 80, respeito: 95, empatia: 75 }
  },
  {
    id: 'pedro',
    name: 'Pedro',
    description: 'Compreensão, acolhimento e quebra de estereótipos tóxicos.',
    gender: 'M',
    color: 'bg-amber-600',
    hoverColor: 'hover:bg-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-600',
    image: '/sprite_pedro.jpg',
    stats: { coragem: 75, respeito: 80, empatia: 95 }
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
          { text: 'Pensando bem, talvez a emoção do momento faça com que muitos casos sejam apenas exageros sem fundamento.', isCorrect: false, feedback: 'Você cedeu à manipulação.', damage: 30 },
          { text: 'Isso é mito! Dados provam que denúncias falsas são estatisticamente irrelevantes comparadas ao feminicídio.', isCorrect: true, feedback: 'Excelente! Usou ESTATÍSTICAS para rebater.', damage: 50 },
          { text: 'Eu prefiro não entrar nesse mérito agora, pois cada lado tem sua própria versão sobre os fatos ocorridos.', isCorrect: false, feedback: 'Fugir agora dá mais força para a mentira dele.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'Mesmo assim, violência doméstica é caso de família. Em briga de marido e mulher ninguém mete a colher.',
        options: [
          { text: 'A Lei é muito clara: a sociedade e o Estado têm o dever de garantir a Proteção Integral e intervir.', isCorrect: true, feedback: 'Perfeito! Invocou a PROTEÇÃO INTEGRAL.', damage: 50 },
          { text: 'É verdade que a intimidade do casal precisa ser preservada antes de fazer julgamentos precipitados.', isCorrect: false, feedback: 'A violência não tem justificativa.', damage: 30 },
          { text: 'Sempre achei melhor deixar que eles resolvam as diferenças sozinhos dentro de suas próprias casas.', isCorrect: false, feedback: 'Isso contribui para o silêncio.', damage: 30 }
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
          { text: 'Entendo o seu ponto, talvez seja melhor eu me afastar delas para não causar brigas no relacionamento.', isCorrect: false, feedback: 'Você abriu mão da sua Rede de Apoio.', damage: 30 },
          { text: 'A privacidade é um direito garantido. Minha autonomia jamais negocia a minha liberdade individual!', isCorrect: true, feedback: 'Maravilha! Você defendeu sua AUTONOMIA.', damage: 50 },
          { text: 'Podemos combinar que você olha o meu celular se me prometer que eu posso sair com elas no fim de semana.', isCorrect: false, feedback: 'Ceder controle nunca é saudável.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'Mulher independente não precisa de rede de apoio, você devia se virar sozinha se é tão autônoma.',
        options: [
          { text: 'Realmente, quem precisa de ajuda constante acaba demonstrando fraqueza e dependência emocional.', isCorrect: false, feedback: 'Mentira! O isolamento é perigoso.', damage: 30 },
          { text: 'Acho que nossa convivência já é o suficiente, não preciso de mais ninguém para dar palpite na minha vida.', isCorrect: false, feedback: 'Você está se isolando.', damage: 40 },
          { text: 'Ter autonomia é também saber reconhecer que precisamos da comunidade e de apoio para nos fortalecer.', isCorrect: true, feedback: 'Exato! Saúde e Autonomia são construções coletivas.', damage: 50 }
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
          { text: 'O corpo é meu, e a culpa é sempre do assediador. Uma roupa jamais justifica qualquer tipo de violência.', isCorrect: true, feedback: 'Brilhante! Reafirmou o direito ao seu CORPO.', damage: 50 },
          { text: 'Pensando por esse lado, a roupa realmente chama muita atenção, talvez eu devesse me vestir diferente.', isCorrect: false, feedback: 'Você se culpabilizou pelo erro do agressor.', damage: 30 },
          { text: 'Eu não tinha percebido que estava provocativa, peço desculpas se passei a impressão errada para vocês.', isCorrect: false, feedback: 'A roupa nunca é um convite ao desrespeito.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'As mulheres são as que mais sofrem com depressão e ansiedade porque são muito emocionais.',
        options: [
          { text: 'Nossa saúde mental é afetada pelo acúmulo de jornadas, pelo machismo estrutural e pela pressão social.', isCorrect: true, feedback: 'Perfeito! Mostrou os Indicadores Sociais de Saúde.', damage: 50 },
          { text: 'É verdade que a gente acaba chorando mais por questões biológicas e oscilações hormonais muito fortes.', isCorrect: false, feedback: 'Reforçou um estereótipo prejudicial.', damage: 30 },
          { text: 'Acho que a genética feminina tem uma tendência maior natural a desenvolver esses distúrbios emocionais.', isCorrect: false, feedback: 'Ignorou os fatores sociais da violência.', damage: 30 }
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
          { text: 'A lei funciona sim! A proteção integral obriga o Estado a agir, pois o silêncio só protege o agressor.', isCorrect: true, feedback: 'Perfeito! Você defendeu a Proteção Integral.', damage: 50 },
          { text: 'Olhando a lentidão da justiça, talvez a exposição pública traga consequências piores do que a situação atual.', isCorrect: false, feedback: 'Você aceitou a mordaça do Coronel.', damage: 30 },
          { text: 'Acho que sou forte o suficiente para lidar com meus problemas sem envolver terceiros ou abrir boletins.', isCorrect: false, feedback: 'Isolar-se dificulta a busca por justiça.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'Isso é assunto de casal, ninguém deve interferir. O Estado não tem que se meter.',
        options: [
          { text: 'Acredito que chamar a polícia no calor do momento pode inflamar a briga e tornar a relação ainda pior.', isCorrect: false, feedback: 'A violência não é um problema privado.', damage: 30 },
          { text: 'A violência contra a mulher é crime de ação pública. A sociedade e o Estado têm o dever legal de intervir.', isCorrect: true, feedback: 'Brilhante! O Estado não pode se omitir.', damage: 50 },
          { text: 'Se as coisas saírem do controle, o melhor a fazer é me afastar fisicamente até que os ânimos se acalmem.', isCorrect: false, feedback: 'Apenas se afastar não quebra o ciclo de impunidade.', damage: 20 }
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
          { text: 'Devo admitir que não acompanhei os jornais recentemente para afirmar com certeza sobre esses índices.', isCorrect: false, feedback: 'A ignorância fortalece o Mago.', damage: 30 },
          { text: 'Os indicadores provam o oposto: o Brasil infelizmente ainda é um dos países líderes em feminicídio!', isCorrect: true, feedback: 'Fatal! Usou DADOS concretos.', damage: 50 },
          { text: 'Apesar de acontecer, percebo que as campanhas estão fazendo a criminalidade diminuir gradativamente.', isCorrect: false, feedback: 'Você caiu na falsa sensação de segurança dele.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'A maioria dessas denúncias é falsa. Mulheres mentem para conseguir vantagem no divórcio. Todo mundo sabe.',
        options: [
          { text: 'É inegável que alguns casos envolvendo brigas judiciais têm narrativas exageradas para facilitar processos.', isCorrect: false, feedback: 'Você legitimou um mito.', damage: 30 },
          { text: 'Eu não gostaria de entrar nessa discussão específica, pois a generalização prejudica a avaliação dos fatos.', isCorrect: false, feedback: 'É preciso combater a mentira com fatos.', damage: 20 },
          { text: 'As estatísticas mostram que denúncias falsas são raríssimas. A subnotificação do abuso é o problema real!', isCorrect: true, feedback: 'Excelente! Destruiu a fake news com fatos.', damage: 50 }
        ]
      }
    ]
  },
  {
    id: 'sr_seboso',
    name: 'Fuga do Sr. Seboso',
    description: 'Corra pela sua vida e desvie das armadilhas.',
    image: '/sprite_seboso.png',
    type: 'runner'
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
          { text: 'Olhando esse volume de ocorrências, sinto que a mudança social exigiria recursos fora do nosso alcance.', isCorrect: false, feedback: 'O Sistema se fortaleceu com seu medo.', damage: 50 },
          { text: 'Esses 1.467 casos de 2023 mostram a nossa urgência. A conscientização contínua é a chave para a mudança!', isCorrect: true, feedback: 'GOLPE CRÍTICO! Você usou os dados para ganhar força.', damage: 100 },
          { text: 'Acredito que o endurecimento penal e as novas legislações diminuirão esses números ao longo dos anos.', isCorrect: false, feedback: 'A passividade não destrói O Sistema.', damage: 40 }
        ]
      },
      {
        enemyMessage: 'O CICLO NUNCA TERÁ FIM. VEJA QUANTAS SOFREM NAS SOMBRAS DE SUAS CASAS!',
        imageInMessage: '/infografico_violencia.jpg',
        options: [
          { text: 'As quase 259 mil agressões exigem que o ciclo seja rompido com denúncia e rede de apoio. Não estamos sós!', isCorrect: true, feedback: 'GOLPE CRÍTICO! A Rede de Apoio desestabilizou o Boss.', damage: 100 },
          { text: 'Ao observar essa imensidão de agressões, fica claro que é praticamente impossível monitorar as residências.', isCorrect: false, feedback: 'O Sistema se alimenta da sua desesperança.', damage: 50 },
          { text: 'Trata-se de uma falha de convivência privada onde a sociedade e as instituições pouco podem interferir.', isCorrect: false, feedback: 'A omissão é a maior aliada do Sistema.', damage: 60 }
        ]
      },
      {
        enemyMessage: 'VOCÊ ESTÁ SOZINHA CONTRA MIM. NÃO HÁ QUEM TE ESCUTE. RENDA-SE.',
        options: [
          { text: 'Neste momento de extrema pressão estrutural, parece que as nossas vozes são silenciadas completamente.', isCorrect: false, feedback: 'Seu silêncio o fortalece.', damage: 50 },
          { text: 'As mulheres sempre resistiram bravamente e as nossas vozes encontrarão meios de ressoar na sociedade.', isCorrect: false, feedback: 'Faltou indicar AÇÃO prática.', damage: 30 },
          { text: 'O Ligue 180 é nacional e 24 horas! Nós temos a lei, a informação e somos uma rede unida. O seu fim chegou!', isCorrect: true, feedback: 'GOLPE FINAL! O SISTEMA COLAPSOU!', damage: 150 }
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
    image: '/sprite_pressao.jpg',
    dialogues: [
      {
        enemyMessage: 'Ah, cara! Qual o problema de mandar aquela foto íntima da garota no grupo? Todo mundo faz isso!',
        options: [
          { text: 'Pensando bem, já que vazou de qualquer forma, encaminhar aqui no grupo não vai fazer tanta diferença.', isCorrect: false, feedback: 'Você cedeu à pressão.', damage: 30 },
          { text: 'Isso é crime! Espalhar intimidade sem o consentimento dela causa uma destruição gigantesca em sua vida.', isCorrect: true, feedback: 'Correto! Você cortou a corrente do mal.', damage: 50 },
          { text: 'Eu não me sinto confortável com isso, vou apagar a foto do meu celular para evitar maiores problemas.', isCorrect: false, feedback: 'Omitir-se também é permitir.', damage: 20 }
        ]
      },
      {
        enemyMessage: 'Deixa de ser chato! É só uma piada de mulher no volante. Você não sabe zoar mais?',
        options: [
          { text: 'Admito que essa foi criativa, mas temos que tomar cuidado onde contamos piadas desse tipo hoje em dia.', isCorrect: false, feedback: 'Você riu e fortaleceu o preconceito.', damage: 30 },
          { text: 'Piadas que humilham não têm graça alguma. Elas apenas reforçam comportamentos sociais muito perigosos.', isCorrect: true, feedback: 'Boa! Não tem espaço para piada machista.', damage: 50 },
          { text: 'Acho que a galera aqui já passou dos limites. É melhor eu sair do grupo antes que vire confusão.', isCorrect: false, feedback: 'Sair resolve para você, mas não educa o outro.', damage: 20 }
        ]
      }
    ]
  },
  {
    id: 'fantasma_ciume',
    name: 'Fantasma do Ciúme',
    description: 'Confunde controle com amor.',
    image: '/sprite_ciume.jpg',
    dialogues: [
      {
        enemyMessage: 'Se ela te ama, ela tem que dar a senha do celular. Quem não deve não teme, não é mesmo?',
        options: [
          { text: 'Faz sentido, a transparência digital total é a única forma de evitar traições na era das redes sociais.', isCorrect: false, feedback: 'Isso é invasão de privacidade e abuso.', damage: 30 },
          { text: 'A base de uma relação saudável é a confiança. Controlar o aparelho da parceira é uma invasão abusiva.', isCorrect: true, feedback: 'Perfeito! Amor não é prisão.', damage: 50 },
          { text: 'Eu até concordo, mas procuro checar as mensagens rapidamente quando ela deixa o celular desbloqueado.', isCorrect: false, feedback: 'Isso é quebra total de confiança!', damage: 40 }
        ]
      },
      {
        enemyMessage: 'Olha a roupa que ela vai sair! Você vai deixar ela ir vestida assim? Outros caras vão olhar!',
        options: [
          { text: 'O corpo é exclusivamente dela, e o respeito que as pessoas lhe devem jamais deve depender de sua roupa.', isCorrect: true, feedback: 'Isso aí! Você entende a autonomia dela.', damage: 50 },
          { text: 'Realmente está inadequado para o ambiente, vou pedir com educação para que ela coloque algo mais discreto.', isCorrect: false, feedback: 'Controlar o corpo e as escolhas dela é violência.', damage: 40 },
          { text: 'Eu sei que vão olhar, mas minha presença física vai garantir que nenhum cara tente alguma aproximação.', isCorrect: false, feedback: 'O problema é o pensamento machista dos outros, não a roupa.', damage: 20 }
        ]
      }
    ]
  },
  {
    id: 'monstro_consentimento',
    name: 'Monstro do Consentimento',
    description: 'Não entende que não é não.',
    image: '/sprite_consentimento.jpg',
    dialogues: [
      {
        enemyMessage: 'Ela disse "não" mas deu aquele sorriso... É charme. Insiste que ela cede!',
        options: [
          { text: 'Vou tentar outra abordagem com um pouco mais de romantismo, afinal faz parte do jogo da conquista.', isCorrect: false, feedback: 'Não faça isso! Assédio é crime.', damage: 40 },
          { text: 'Nós sabemos que na cultura atual as mulheres sentem a obrigação de fazer um certo doce no começo.', isCorrect: false, feedback: 'Mito perigoso. Isso só gera assédio.', damage: 40 },
          { text: 'A regra é clara: apenas o sim é sim! Um sorriso não anula a recusa verbal, e o limite precisa ser honrado.', isCorrect: true, feedback: 'Exato! O consentimento é a única regra.', damage: 50 }
        ]
      },
      {
        enemyMessage: 'Ela estava bêbada na festa e foi com você pra casa. Você pode fazer o que quiser agora.',
        options: [
          { text: 'O fato de ela ter topado me acompanhar voluntariamente já demonstra uma abertura total da parte dela.', isCorrect: false, feedback: 'Pessoa alcoolizada não pode dar consentimento válido!', damage: 50 },
          { text: 'Se o discernimento dela está afetado, qualquer interação sexual é crime. Minha prioridade é protegê-la.', isCorrect: true, feedback: 'Bela atitude. Você foi um verdadeiro aliado.', damage: 50 },
          { text: 'Com as leis atuais tão severas, é mais inteligente deitar no sofá e deixar a situação esfriar por completo.', isCorrect: false, feedback: 'Você fez o certo pelos motivos errados.', damage: 20 }
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
          { text: 'O transporte está muito perigoso. Eu não vou arriscar minha integridade física por uma pessoa desconhecida.', isCorrect: false, feedback: 'Sua omissão ajuda o agressor.', damage: 40 },
          { text: 'Vou abrir a câmera disfarçadamente para tentar gravar o rosto do sujeito e usar isso como prova futura.', isCorrect: false, feedback: 'E a proteção dela no momento, como fica?', damage: 20 },
          { text: 'Nós homens temos a obrigação de usar nossa voz para intervir com firmeza ou então acionar a autoridade.', isCorrect: true, feedback: 'Incrível! Ser passivo não é opção.', damage: 50 }
        ]
      },
      {
        enemyMessage: 'Seu vizinho está gritando com a esposa de novo e quebrando tudo. Em briga de marido e mulher...',
        options: [
          { text: 'A sabedoria popular já ensinou há décadas que nessas questões conjugais ninguém deve meter a colher.', isCorrect: false, feedback: 'Ditado ultrapassado que mata mulheres.', damage: 50 },
          { text: 'A denúncia de maus-tratos salva vidas! Eu ligo imediatamente para o número 190 ou para a central 180.', isCorrect: true, feedback: 'Corretíssimo. A denúncia salva.', damage: 50 },
          { text: 'Esses covardes só aprendem no soco. Vou chamar dois amigos para darmos uma lição e acabarmos com isso.', isCorrect: false, feedback: 'Violência gera violência, a polícia deve ser acionada.', damage: 30 }
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
          { text: 'Vou aproveitar a deixa para pegar a palavra, pois meus resultados técnicos trazem uma base mais sólida.', isCorrect: false, feedback: 'Isso é manterrupting. Deixe a mulher falar!', damage: 40 },
          { text: 'Para garantir que a apresentação fique perfeita, eu vou complementar a fala dela e guiar o projeto todo.', isCorrect: false, feedback: 'Elas não precisam de salvação, precisam de respeito à fala.', damage: 30 },
          { text: 'Eu farei questão de ouvi-la. Mulheres sofrem interrupções constantes, e eu não contribuirei para isso.', isCorrect: true, feedback: 'Isso! Saber ouvir é essencial.', damage: 50 }
        ]
      },
      {
        enemyMessage: 'Ela está reclamando do trabalho e cansaço. Diz para ela que é só tomar um banho que passa.',
        options: [
          { text: 'Ela costuma ficar sobrecarregada facilmente, então eu preparo um chá e recomendo um momento de spa.', isCorrect: false, feedback: 'Isso minimiza a carga mental que as mulheres sofrem.', damage: 30 },
          { text: 'O acúmulo de jornadas é exaustivo. A única atitude justa é dividirmos igualmente a manutenção da casa.', isCorrect: true, feedback: 'Mandou bem! Tarefa doméstica é dos dois.', damage: 50 },
          { text: 'Sempre que ela me pede especificamente, eu não hesito em ajudar com a louça ou levar o lixo para fora.', isCorrect: false, feedback: 'Você não tem que "ajudar", tem que dividir a responsabilidade!', damage: 20 }
        ]
      }
    ]
  },
  {
    id: 'sr_seboso_boys',
    name: 'Fuga do Sr. Seboso',
    description: 'Corra pela sua vida e desvie das armadilhas.',
    image: '/sprite_seboso.png',
    type: 'runner'
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
          { text: 'Desde a infância fomos ensinados que a resiliência emocional exige silenciar dores para sermos pilares.', isCorrect: false, feedback: 'Reprimir sentimentos gera agressividade!', damage: 50 },
          { text: 'O machismo tóxico devasta homens também! Falar de emoções e pedir ajuda não anulam nossa humanidade.', isCorrect: true, feedback: 'GOLPE CRÍTICO! Você quebrou a máscara.', damage: 100 },
          { text: 'O mundo exige demonstrações diárias de dominação. Impor força bruta ainda é a maneira mais rápida.', isCorrect: false, feedback: 'O ciclo da violência destrói tudo.', damage: 50 }
        ]
      },
      {
        enemyMessage: 'AS ESTATÍSTICAS NUNCA VÃO MUDAR. SEMPRE FOI ASSIM E SEMPRE SERÁ. A DESIGUALDADE É NATURAL!',
        imageInMessage: '/infografico_feminicidio.jpg',
        options: [
          { text: 'Homens e mulheres possuem distinções biológicas milenares que estruturam nossas diferenças profissionais.', isCorrect: false, feedback: 'Diferença não justifica desigualdade e violência!', damage: 50 },
          { text: 'Nosso papel fundamental agora é agir como aliados reais, mudando nossos comportamentos para reeducar.', isCorrect: true, feedback: 'GOLPE CRÍTICO! A educação é a chave!', damage: 100 },
          { text: 'O aumento drástico das leis de proteção já não foi desenhado para contornar essa falha na sociedade?', isCorrect: false, feedback: 'A lei pune, mas a educação previne.', damage: 40 }
        ]
      },
      {
        enemyMessage: 'VOCÊ VAI TRAIR A SUA PRÓPRIA ESPÉCIE? SEJA COMO NÓS!',
        options: [
          { text: 'Para sobreviver nos círculos corporativos e de amigos, ceder a algumas brincadeiras ainda é necessário.', isCorrect: false, feedback: 'Sua submissão é a vitória dele.', damage: 50 },
          { text: 'Eu sigo a minha própria consciência e procuro focar a atenção na minha evolução espiritual particular.', isCorrect: false, feedback: 'Faltou posicionamento firme e ação.', damage: 30 },
          { text: 'Um homem não agride, não oprime e nem silencia! Nós somos a geração de aliados e a sua impunidade ruiu!', isCorrect: true, feedback: 'GOLPE FINAL! O MACHISMO RUIU!', damage: 150 }
        ]
      }
    ]
  }
];
