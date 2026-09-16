const fs = require('fs');

// 1. Edit API route
let apiCode = fs.readFileSync('src/app/api/generate/route.js', 'utf8');

// Use regex for the API parameters
apiCode = apiCode.replace(/const { topic, difficulty = "[^"]+", level = "[^"]+", year = "[^"]+" } = await req.json\(\);/,
    `const { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral", isContextualized = true } = await req.json();`);

// Use regex to replace the rules block
apiCode = apiCode.replace(/REGRAS PARA O ENUNCIADO:[\s\S]*?REGRAS CR[^\s]+TICAS DE SA[^\s]+DA:/,
    `\${isContextualized ? \`
                    REGRAS PARA O ENUNCIADO (CONCEITO CONTEXTUALIZADO):
                    1. Gere enunciados MAIORES e mais ELABORADOS, apresentando sempre uma SITUAÇÃO-PROBLEMA (situação do cotidiano, história, caso prático ou experimento) ANTES da pergunta direta.
                    2. ATENÇÃO À DIFICULDADE: Se a dificuldade da questão for Fácil, utilize um vocabulário SIMPLES e de fácil compreensão para as crianças/estudantes, evite palavras complexas, mesmo mantendo o texto mais longo.
                    3. O comando final ou a pergunta direta da questão DEVE iniciar com um verbo da Taxonomia de Bloom em destaque com dois asteriscos (ex: **Analise**, **Identifique**, **Calcule**, **Explique**). Exemplo: "[Contexto longo aqui...] Diante disso, **Identifique** qual..."\` : \`
                    REGRAS PARA O ENUNCIADO (DIRETO):
                    1. O enunciado de CADA questão DEVE ser direto e iniciar obrigatoriamente com um verbo de comando da Taxonomia de Bloom (ex: **Analise**, **Compare**, **Identifique**, **Calcule**).
                    2. Este verbo de comando DEVE estar em destaque (negrito) utilizando exatamente dois asteriscos no início e no fim do verbo, por exemplo: "**Analise** a situação..." ou "**Calcule** o valor...".\`}
                    
                    REGRAS CRÍTICAS DE SAÍDA:`);

fs.writeFileSync('src/app/api/generate/route.js', apiCode, 'utf8');
console.log("API updated.");

// 2. Edit Builder page
let builderCode = fs.readFileSync('src/app/(dashboard)/builder/page.js', 'utf8');

// Add State
const stateReplacement = `const [difficulty, setDifficulty] = useState("Médio");
    const [isContextualized, setIsContextualized] = useState(true);`;
builderCode = builderCode.replace(/const \[difficulty, setDifficulty\] = useState\([^)]+\);/, stateReplacement);

// Update fetch request
const fetchTarget = `body: JSON.stringify({ topic, difficulty, level, year }),`;
const fetchReplacement = `body: JSON.stringify({ topic, difficulty, level, year, isContextualized }),`;
builderCode = builderCode.replace(fetchTarget, fetchReplacement);

// Add Checkbox in UI
const uiTarget = `<div className="flex gap-4">
                          <button 
                              onClick={handleGenerate}`;
const uiReplacement = `<div className="flex items-center gap-2 mb-4">
                            <input 
                                type="checkbox" 
                                id="isContextualized" 
                                checked={isContextualized} 
                                onChange={(e) => setIsContextualized(e.target.checked)} 
                                className="w-4 h-4 text-vg-dark bg-gray-100 border-gray-300 rounded focus:ring-vg-dark focus:ring-2"
                            />
                            <label htmlFor="isContextualized" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Criar questões contextualizadas (situação-problema)
                            </label>
                        </div>
                        <div className="flex gap-4">
                          <button 
                              onClick={handleGenerate}`;
builderCode = builderCode.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/app/(dashboard)/builder/page.js', builderCode, 'utf8');
console.log("Builder page updated.");
