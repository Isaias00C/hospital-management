# Hospital Management

Aplicação web que utiliza um modelo de machine learning para gerar predições a partir de um formulário. O usuário preenche os campos no frontend, os dados são enviados para a API e o modelo, executado dentro do backend, retorna a predição.

> Trabalho de faculdade. Projeto em fase de planejamento.

## Visão geral

```
Usuário → Frontend (React) → POST /predict → Backend (FastAPI + modelo ML) → predição
```

- **Frontend:** formulário e exibição do resultado.
- **Backend:** API que carrega o modelo na inicialização e expõe o endpoint de predição.
- **ML:** notebook de exploração/treino e o modelo exportado.

## Propostas de predição

Candidatas para o que o modelo pode prever. A escolha final depende do que o dataset permite (ver pendências).

| Proposta | Ideia |
|----------|-------|
| **Previsão de custos** | Estimar o custo de um atendimento ou tratamento a partir das características do paciente e do procedimento. |
| **Faltas em consultas** | Prever a probabilidade de o paciente faltar a uma consulta agendada (no-show). |
| **Detecção de fraudes** | Identificar cobranças ou registros suspeitos, por exemplo valores ou padrões fora do esperado. |
| **Precisão de demandas** | Prever a demanda de atendimentos, leitos ou recursos em um período, para apoiar o planejamento. |

## Stack

| Camada   | Tecnologia                                  |
|----------|---------------------------------------------|
| Frontend | React                                       |
| Backend  | FastAPI (Python)                            |
| ML       | Modelo tabular (scikit-learn ou similar)    |
| Dataset  | [Hospital Management Data (Kaggle)](https://www.kaggle.com/datasets/deeplumiere/hospital-management-data) (~20 MB, tabular) |
| Deploy   | Frontend no Vercel e backend no Render |
| Banco    | Não previsto inicialmente; Supabase como opção futura |

## Estrutura do repositório

```
hospital-management/
├── frontend/     # Aplicação React (formulário + resultado)
├── backend/      # API FastAPI
│   └── model/    # Modelo exportado (.joblib ou .onnx)
├── ml/           # Notebooks de exploração/treino e dados locais
└── README.md
```

## Pendências de definição

- [ ] Explorar o dataset e definir a **variável alvo** da predição, escolhendo entre as [propostas](#propostas-de-predição)
- [ ] Definir os **campos do formulário** com base nas features do modelo
- [ ] Escolher o formato de exportação do modelo (`joblib` ou `ONNX`)
- [ ] Confirmar a licença de uso do dataset

## Plano de desenvolvimento

1. **Exploração dos dados** em `ml/` (notebook) e escolha do alvo.
2. **Treino do modelo baseline**, avaliação e exportação para `backend/model/`.
3. **Backend:** endpoint `POST /predict` com validação de entrada (Pydantic), modelo carregado uma única vez na inicialização e CORS configurado.
4. **Frontend:** formulário, chamada à API e exibição do resultado, com a URL da API em variável de ambiente.
5. **Deploy** do frontend e do backend.
6. **Opcional:** salvar histórico de predições no Supabase.

## Deploy e testes pela web

Veja [DEPLOY.md](DEPLOY.md) para conectar o GitHub ao Render e ao Vercel e validar a versão publicada pelo GitHub Actions.

Para desenvolvimento local, veja os guias do [frontend](frontend/README.md) e do [backend](backend/README.md).

## Observações

- Os dados do dataset **não devem ser versionados** no Git (adicionar `ml/data/` ao `.gitignore`).
- Como o contexto é hospitalar, qualquer dado real de pacientes deve ser tratado conforme a LGPD. O projeto usa apenas dados públicos do Kaggle.
- No plano gratuito do Render, o backend "dorme" após 15 minutos sem uso, e a primeira requisição pode levar de 30 a 60 segundos.
