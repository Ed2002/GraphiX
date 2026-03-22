# 📊 GraphiX — Product Backlog (PBIs)

## 📌 Visão Geral
Aplicação web interativa para criação, visualização e análise de grafos (dirigidos e não dirigidos), com execução de algoritmos clássicos como BFS, DFS, fecho transitivo e componentes fortemente conexos.

---

# 🧱 EPIC 1 — Setup do Projeto

## PBI 1 — Criar projeto com Vite
**Descrição:** Inicializar projeto React com Vite  
**Critérios de aceite:**
- Projeto criado com sucesso
- `npm run dev` executa corretamente
- Estrutura inicial limpa

---

## PBI 2 — Estrutura de pastas
**Descrição:** Organizar arquitetura do projeto  
**Critérios de aceite:**
- Criar:
  - `/components`
  - `/pages`
  - `/utils`
  - `/hooks`
- Separação clara de responsabilidades

---

## PBI 3 — Configuração de estilo base
**Descrição:** Criar layout inicial  
**Critérios de aceite:**
- Sidebar + Canvas + Console
- CSS global funcionando

---

# 🎨 EPIC 2 — Interface (UI/UX)

## PBI 4 — Sidebar (Graph Editor)
**Critérios de aceite:**
- Input para vértice
- Input de aresta (origem/destino)
- Botões de ação

---

## PBI 5 — Painel de Algoritmos
**Critérios de aceite:**
- Select BFS / DFS
- Select vértice inicial
- Botão executar

---

## PBI 6 — Graph Canvas
**Critérios de aceite:**
- Renderização de nós
- Renderização de arestas
- Atualização dinâmica

---

## PBI 7 — Output Console
**Critérios de aceite:**
- Mostrar traversal
- Mostrar propriedades do grafo

---

# 🔧 EPIC 3 — Estrutura de Dados

## PBI 8 — Classe Graph
**Critérios de aceite:**
- Lista de adjacência
- Suporte dirigido/não dirigido

---

## PBI 9 — Adicionar vértice
**Critérios:**
- Inserção dinâmica
- Atualização visual

---

## PBI 10 — Remover vértice
**Critérios:**
- Remove conexões relacionadas

---

## PBI 11 — Adicionar aresta
**Critérios:**
- Conecta dois vértices
- Respeita direção

---

## PBI 12 — Remover aresta
**Critérios:**
- Remoção correta

---

# 🔍 EPIC 4 — Algoritmos

## PBI 13 — BFS
**Critérios:**
- Retorna ordem correta
- Funciona com qualquer nó inicial

---

## PBI 14 — DFS
**Critérios:**
- Implementação recursiva
- Ordem correta

---

## PBI 15 — Visualização BFS/DFS
**Critérios:**
- Destacar nós visitados

---

## PBI 16 — Fecho transitivo direto
**Critérios:**
- Retorna todos alcançáveis

---

## PBI 17 — Fecho transitivo inverso
**Critérios:**
- Usar grafo transposto

---

## PBI 18 — Verificar conectividade
**Critérios:**
- Retorna TRUE/FALSE

---

## PBI 19 — Componentes fortemente conexos
**Critérios:**
- Implementar Kosaraju
- Retornar lista de componentes

---

# 🎛️ EPIC 5 — Integração

## PBI 20 — Integração Graph + UI
**Critérios:**
- Ações refletem no canvas

---

## PBI 21 — Integração Algoritmos
**Critérios:**
- Resultados exibidos corretamente

---

## PBI 22 — Seleção de vértice inicial
**Critérios:**
- Dropdown dinâmico

---

# ✨ EPIC 6 — Melhorias

## PBI 23 — Destaque visual
**Critérios:**
- Cores diferentes por estado

---

## PBI 24 — Animação (extra)
**Critérios:**
- Execução passo a passo

---

## PBI 25 — Mini mapa
**Critérios:**
- Visualização reduzida do grafo

---

# 📦 EPIC 7 — Entrega

## PBI 26 — Build
**Critérios:**
- `npm run build` funcional

---

## PBI 27 — Empacotamento
**Critérios:**
- ZIP contendo:
  - `/dist`
  - `/src`

---

## PBI 28 — Vídeo
**Critérios:**
- Demonstração completa
- Explicação técnica

---

# ✅ Definição de Pronto (DoD)

- Funcionalidade implementada
- Interface funcional
- Sem erros críticos
- Testado manualmente
- Pronto para demonstração

---

# 🏁 Resultado Esperado

Sistema web que permite:

- Criar grafos dinamicamente  
- Visualizar estrutura  
- Executar algoritmos  
- Interpretar resultados  

---