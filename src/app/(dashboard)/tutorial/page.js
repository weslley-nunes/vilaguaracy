"use client";
import { BookOpen, Printer, Camera, Sparkles, Youtube, FileText } from "lucide-react";

export default function TutorialPage() {

    const guides = [
        {
            title: "Como Criar Avaliações com IA",
            icon: Sparkles,
            color: "text-indigo-600 bg-indigo-50",
            description: "Aprenda a gerar questões automaticamente definindo tema, nível e dificuldade.",
            steps: [
                "Acesse o menu 'Criar Avaliação'.",
                "Digite o tema (ex: 'Revolução Industrial').",
                "Selecione o nível (Fundamental/Médio) e a dificuldade.",
                "Clique em 'Gerar' e aguarde a mágica da IA.",
                "Adicione as questões que gostar à prova clicando nelas."
            ]
        },
        {
            title: "Impressão e Gabarito",
            icon: Printer,
            color: "text-purple-600 bg-purple-50",
            description: "Configure cabeçalhos, embaralhamento e folhas de resposta.",
            steps: [
                "Na tela de criação, clique no botão 'Imprimir / PDF'.",
                "Escolha se deseja embaralhar as questões para evitar cola.",
                "Defina o número de cópias ou cole uma lista de alunos.",
                "Marque 'Incluir Folha de Respostas' para gerar os gabaritos.",
                "O sistema gerará um PDF pronto para cada aluno."
            ]
        },
        {
            title: "Correção Automática",
            icon: Camera,
            color: "text-green-600 bg-green-50",
            description: "Use a câmera do celular para corrigir gabaritos em segundos.",
            steps: [
                "Acesse o menu 'Correção IA' no celular.",
                "Clique em 'Abrir Câmera' e aponte para o QR Code do gabarito.",
                "A IA identificará o aluno e as respostas.",
                "A nota é calculada automaticamente e salva no sistema."
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                    Como usar o Portal
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Tudo o que você precisa saber para aproveitar o Corrige Lab.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {guides.map((guide, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all group">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${guide.color} dark:bg-white/10`}>
                            <guide.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{guide.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{guide.description}</p>

                        <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4">
                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wide mb-3">Passo a Passo</h4>
                            <ul className="space-y-3">
                                {guide.steps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-bold text-indigo-500">{idx + 1}.</span>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}

                {/* Video Placeholder */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white flex flex-col items-center justify-center text-center shadow-xl shadow-indigo-500/20">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform">
                        <Youtube size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Vídeo Tutorial</h3>
                    <p className="opacity-80 text-sm max-w-xs">Assista ao nosso guia completo de 5 minutos sobre como transformar suas avaliações.</p>
                    <button className="mt-6 px-6 py-2 bg-white text-indigo-700 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors">
                        Assistir Agora
                    </button>
                </div>
            </div>
        </div>
    );
}
