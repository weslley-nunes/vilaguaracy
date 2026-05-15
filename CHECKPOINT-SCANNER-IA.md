# Checkpoint de Estabilidade - Scanner & Correção por IA
**Data:** 15 de Maio de 2026
**Status:** ESTÁVEL E FUNCIONAL 🎉

Este documento serve como um "Save State" (Ponto de Restauração). Se no futuro o sistema de correção quebrar ou ficar instável, as regras e arquiteturas definidas abaixo são o motivo pelo qual ele funcionou perfeitamente hoje.

## 🏗️ A Arquitetura Que Salvou o Sistema

### 1. Fuga do Firebase Admin (O Fim do Erro 500)
**O Problema:** O servidor do Coolify não possuía as credenciais corretas (`FIREBASE_PRIVATE_KEY`) configuradas para usar o SDK de Administrador do Firebase, causando erros 500 constantes.
**A Solução:** Transferimos **TODAS** as leituras e escritas de banco de dados (buscar a prova pelo código e salvar a correção) para o **Front-end** (`ScannerPage.js`). 
**Por que funciona:** O Front-end usa o SDK Cliente. Como o professor já está logado no site (Contexto de Autenticação), o Firebase permite o acesso nativamente e com segurança total.

### 2. A Rota da IA Ficou "Burra" (E isso é ótimo)
**O Problema:** A rota `/api/corrections/process` tentava buscar dados no banco, falar com a IA, e salvar a correção. Era muita responsabilidade e quebrava com facilidade.
**A Solução:** A rota foi reduzida a apenas 3 passos simples e sem conexão com o banco de dados:
1. Recebe a foto cortada.
2. Manda pro Gemini com o prompt.
3. Devolve um JSON simples `{"answers": [{"q": 1, "r": "A"}]}`.
Toda a matemática da nota e o salvamento foram passados de volta para o Front-end (`ScannerPage.js`).

### 3. Compressão de Imagem no Celular (Fim do Payload Too Large)
**O Problema:** Fotos de celulares modernos pesavam mais de 5MB, travando o envio (limite do servidor) e gastando muita internet do professor.
**A Solução:** Criamos uma função no `ScannerPage.js` usando `<canvas>` que, no milissegundo em que a foto é tirada, ela é achatada para no máximo `1200px` de largura e qualidade `0.7` (JPEG).
**Por que funciona:** A foto fica com cerca de 150kb. O envio é instantâneo, e a IA lê muito mais rápido.

### 4. Tratamento do `reader.onload` (A Tela de Carregamento)
**O Problema:** O `try/catch` encerrava antes do leitor de arquivos terminar de carregar, fazendo o botão "Carregando" sumir enquanto a foto ainda estava subindo, dando a falsa impressão de que "nada aconteceu".
**A Solução:** Envolvemos o FileReader em uma `Promise` (`processFile`), garantindo que o status de carregamento só suma quando a IA realmente devolver a resposta.

### 5. O Gerenciador de Cotas do Gemini (O Paraquedas)
**O Problema:** O uso do Scanner estava esgotando a pequena cota diária (20 requisições) do modelo principal (`gemini-2.5-flash`), bloqueando tanto o Scanner quanto o Gerador de Questões.
**A Solução:** Implementamos um loop (Array de Fallback) em `/api/corrections/process`. O modelo primário da correção passou a ser o **`gemini-3.1-flash-lite`** (que possui incríveis 500 requisições diárias no plano gratuito).
**Por que funciona:** O Scanner usa a cota gigante do modelo Lite, poupando a cota pequena e preciosa dos modelos mais caros para a criação e elaboração de questões.

---
## 🔄 Como Voltar Para Este Ponto no Futuro
Se algum dia você quiser reverter o código inteiro do portal para este exato momento, use o comando Git no terminal:
`git checkout v1.0-scanner-stable`

(Esta tag foi criada no seu repositório local e enviada ao GitHub durante este checkpoint).
