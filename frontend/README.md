# Frontend — HospPredict

Aplicação web desenvolvida em **React 18** com **Vite** e **Tailwind CSS**, especializada em apoio à decisão clínica para predição de risco de readmissão hospitalar em até 30 dias (`readmission_30d`), consumindo a API FastAPI e o modelo Naive Bayes (`GaussianNB`).

---

## 🚀 Funcionalidades & Design Implementados

- **Formulário Clínico em 4 Etapas (Abas):**
  1. **Demografia & Perfil:** Idade, Sexo biológico, Índice de Comorbidade de Charlson (CCI), IMC, Tabagismo, Nível Socioeconômico, Zona Residencial e Estado Civil (com flag automática de paciente idoso $\ge 65$).
  2. **Internação & Fluxo:** Tipo de atendimento, Urgência da admissão, Departamento hospitalar, Tempo de internação (com categoria de permanência em tempo real), Revisitas anteriores e controle de primeira internação vs. dias desde a última alta.
  3. **Estado Clínico & Labs:** Categoria e gravidade diagnóstica, Sinais Vitais (Pressão Arterial Sistólica/Diastólica, Frequência Cardíaca, Frequência Respiratória, Temperatura, SpO₂) e Exames Laboratoriais na alta (Glicose, Creatinina, Hemoglobina, Leucócitos/WBC).
  4. **Prescrições & Medicamentos:** Contagem total de fármacos (alerta de polifarmácia $\ge 5$), classes terapêuticas e seleção interativa de alertas farmacológicos (Medicação de alto risco, Anticoagulante, Insulina, Diuréticos, Betabloqueadores, IECA/BRA).

- **Casos de Teste Rápidos (Presets em 1 Clique):**
  - *Paciente Idoso Crítico (Alto Risco)* — 74 anos, ICC descompensada, polifarmácia e anticoagulante.
  - *Paciente Jovem Eletivo (Baixo Risco)* — 32 anos, procedimento ortopédico, primeira internação.
  - *Paciente Clínico Médio (Risco Moderado)* — 55 anos, infecção respiratória tratada.

- **Painel de Resultados Clínicos:**
  - Badge visual de alto impacto (Alto Risco em carmim/âmbar vs. Baixo Risco em verde esmeralda).
  - Medidor de Score de Risco percentual (0 a 100%).
  - Barras comparativas de distribuição de probabilidades $P(0)$ e $P(1)$.
  - Box de Recomendações Clínicas e Conduta (Follow-up 48h/7d/14d, telemonitoramento, reconciliação medicamentosa).
  - Lista de fatores de risco detectados no paciente.
  - Botão de impressão/exportação de relatório clínico formatado (`window.print`).

- **Resiliência e Conectividade:**
  - Health check dinâmico com indicador de status da API no cabeçalho.
  - Tratamento inteligente de *Cold Start* com aviso educativo para instâncias gratuitas no Render (que hibernam após 15 minutos).
  - Validações completas client-side com mensagens inline de limites clínicos.
  - Modal com documentação acadêmica e métricas do modelo (Accuracy, F1, AUC-ROC, matriz de confusão) para a banca examinadora do IFCE.

---

## 📂 Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Cabeçalho com status da API e modal do modelo
│   │   ├── TabsNavigation.jsx       # Navegação em abas com progresso
│   │   ├── DemographicsSection.jsx  # Seção 1: Demografia e comorbidades
│   │   ├── EncounterSection.jsx     # Seção 2: Contexto de internação
│   │   ├── ClinicalSection.jsx      # Seção 3: Sinais vitais e exames
│   │   ├── MedicationsSection.jsx   # Seção 4: Prescrições e classes de risco
│   │   ├── ResultCard.jsx           # Card do resultado com scores e conduta
│   │   └── ModelInfoModal.jsx       # Modal acadêmico com métricas e critérios
│   ├── constants/
│   │   └── fields.js                # Dicionário de enums, limites e presets clínicos
│   ├── services/
│   │   └── api.js                   # Integração com FastAPI (/health e /predict)
│   ├── App.jsx                      # Estado global, validações e orquestração
│   ├── index.css                    # Estilos Tailwind e classes clínicas
│   └── main.jsx                     # Ponto de entrada React
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── .env.example
└── README.md
```

---

## ⚙️ Configuração

Crie um arquivo `.env` na pasta `frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

Para produção no Vercel ou Render, aponte `VITE_API_URL` para a URL pública do backend FastAPI.

---

## 💻 Como Rodar Localmente

```bash
# Acessar a pasta frontend
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento Vite
npm run dev

# Gerar build de produção
npm run build
```

---

## 🌐 Deploy no Vercel

1. No painel do Vercel, selecione o repositório.
2. Defina o **Root Directory** como `frontend`.
3. Adicione a variável de ambiente `VITE_API_URL` com a URL do backend FastAPI.
4. O build command será `npm run build` e o output directory será `dist`.
