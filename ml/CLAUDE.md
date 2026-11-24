# CLAUDE.md

Instruções para o agente que vai desenvolver a parte de Machine Learning do trabalho final da disciplina de Probabilidade e Estatística (IFCE, Engenharia da Computação, professor Valberto Feitosa).

Responda sempre em português do Brasil.

---

## 1. Contexto do projeto

O trabalho exige uma solução completa de Machine Learning de classificação supervisionada, do estudo da base até uma aplicação web que usa o modelo treinado.

Requisitos obrigatórios do enunciado:

- Base de dados pública (UCI, Kaggle ou OpenML) adequada a classificação supervisionada, com variável-alvo categórica.
- Análise da base: origem, quantidade de observações, quantidade de variáveis preditoras, variável-alvo, classes, análise exploratória, estatísticas descritivas, distribuição das classes, justificativa das features e pré-processamento.
- Modelo **Naive Bayes** treinado com Python e Scikit-Learn.
- Avaliação com, no mínimo: acurácia, precisão, recall, F1-score e matriz de confusão.
- Modelo salvo com `joblib` ou `pickle`.
- Aplicação web (front-end em HTML/CSS/JS e back-end em Flask ou Django) com formulário, um campo por feature, botão "Prever" e exibição da classe prevista. A probabilidade é opcional.

**Dataset escolhido:** Hospital Management Data (Kaggle), https://www.kaggle.com/datasets/deeplumiere/hospital-management-data. Ele é tabular, tem cerca de 20 MB e é descrito como um registro eletrônico de saúde (EHR) preparado para modelagem. Pode ser sintético.

**Equipe:** até 4 pessoas. Esta tarefa é de **Patric**, responsável pela parte de ML. As demais partes (backend e frontend) são feitas por outros integrantes e dependem do contrato definido aqui.

**Avaliação:** nota da equipe (3,0) e nota individual (1,0), dada na apresentação. Como o professor pode perguntar sobre qualquer parte, o código e os notebooks precisam ser explicados com clareza.

---

## 2. Regras gerais

- **Não invente nomes de colunas, valores ou métricas.** Antes de qualquer decisão, leia o dataset real e use os nomes que existem nele.
- **Não escolha a variável-alvo sozinho sem explicar.** Se houver mais de uma opção razoável, apresente as opções com prós e contras e peça a confirmação do usuário antes de seguir para o treino.
- **Não versione dados** nem arquivos grandes no Git. A pasta `ml/data/` e o `.venv/` ficam fora do repositório.
- **Não use dados de pacientes reais** em nenhum arquivo versionado. Se o dataset tiver identificadores pessoais, remova-os das features.
- **Use `random_state=42`** em todas as divisões e processos aleatórios, para que os resultados sejam reproduzíveis.
- **Registre as limitações.** Se o dataset parecer sintético ou com pouco sinal (features sem relação com o alvo, métricas quase perfeitas ou quase aleatórias), escreva isso na análise, porque é cobrado na avaliação.
- **Evite vazamento de dados.** Não use no treino colunas que só existem depois do resultado que se quer prever. Ajuste o pré-processamento somente com o conjunto de treino.

---

## 3. Estrutura de pastas esperada

```
ml/
├── notebooks/
│   ├── 01_exploracao.ipynb    # análise exploratória, escolha do alvo e das features
│   └── 02_treino.ipynb        # pré-processamento, treino, avaliação e exportação
├── data/                      # CSV do dataset (fora do Git)
├── requirements.txt           # versões fixas das bibliotecas
└── README.md
backend/
└── model/
    └── modelo_nb.joblib       # pipeline exportado (pré-processamento + Naive Bayes)
```

Se a pasta `backend/` ainda não existir, crie apenas `ml/` e deixe a exportação para o momento em que o backend estiver pronto, informando o caminho esperado.

---

## 4. Ambiente

```bash
cd ml
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install jupyter pandas numpy scikit-learn joblib matplotlib seaborn
pip freeze > requirements.txt
```

- Registre a versão do Python e do scikit-learn (`python --version`, `python -c "import sklearn; print(sklearn.__version__)"`) no README.
- A versão do scikit-learn deve ser **a mesma** usada pelo backend. Se o backend mudar a versão, o modelo precisa ser treinado de novo.
- Garanta que `.venv/` e `ml/data/` estejam no `.gitignore` da raiz.

Download do dataset via CLI do Kaggle (exige token de API configurado):

```bash
kaggle datasets download -d deeplumiere/hospital-management-data -p data --unzip
```

Se a CLI não estiver configurada, peça ao usuário que baixe pelo site e coloque o CSV em `ml/data/`.

---

## 5. Passo a passo

### Fase 1: Conhecer a base (`01_exploracao.ipynb`)

1. Carregar o CSV de `ml/data/` com pandas e registrar o nome exato do arquivo.
2. Verificar `shape`, `columns`, `head()`, `dtypes` e `isnull().sum()`.
3. Registrar no notebook, em markdown: origem da base, número de observações, número de variáveis, tipo de cada coluna.
4. Fazer a análise exploratória:
   - `describe()` para as numéricas e `describe(include="object")` para as categóricas;
   - `value_counts(normalize=True)` na possível variável-alvo;
   - histogramas das numéricas e gráficos de barras das categóricas;
   - checar correlações entre as numéricas e o alvo, quando fizer sentido.
5. Listar e descrever as possíveis variáveis-alvo e pedir a confirmação do usuário antes de seguir.

### Fase 2: Definir o problema

6. A **variável-alvo** precisa ser categórica, com poucas classes, e fazer sentido para uma previsão na interface.
7. As **features** devem ter relação plausível com o alvo. Remover:
   - identificadores (ID, nome, CPF, número de prontuário);
   - datas, a menos que sejam transformadas em algo útil (por exemplo, dia da semana ou tempo de internação);
   - colunas que vazam o resultado.
8. Justificar cada feature escolhida e cada etapa de pré-processamento em markdown no notebook.
9. Preencher a seção "Decisões do modelo" do README:

```markdown
## Decisões do modelo
- Variável alvo: ...
- Classes: ...
- Features: ... (justificativa no notebook 01)
- Pré-processamento: ...
- Modelo final: Naive Bayes (CategoricalNB ou GaussianNB)
```

### Fase 3: Pré-processamento

10. Valores faltantes: mediana para numéricas, moda para categóricas, ou remover linhas. Justificar a escolha.
11. Codificar categóricas com `OneHotEncoder(handle_unknown="ignore", sparse_output=False)` ou `OrdinalEncoder`.
12. Escolher a variante do Naive Bayes:
    - `CategoricalNB`, se as features forem majoritariamente categóricas;
    - `GaussianNB`, se forem majoritariamente numéricas (verificar a distribuição nos histogramas).
    - Se forem mistas, justificar a escolha no notebook.

### Fase 4: Treino e avaliação (`02_treino.ipynb`)

13. Dividir com `train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)`.
14. Montar um `Pipeline` com `ColumnTransformer` (pré-processamento) e o Naive Bayes escolhido. O pré-processamento deve ser ajustado só no treino, o que o Pipeline já garante.
15. Treinar com `fit(X_train, y_train)`.
16. Calcular e exibir:
    - acurácia (`accuracy_score`);
    - precisão, recall e F1 (`precision_score`, `recall_score`, `f1_score`), com `average="macro"` se houver mais de duas classes ou desbalanceamento, informando isso no texto;
    - matriz de confusão (`confusion_matrix`), de preferência com visualização;
    - `classification_report` como apoio.
17. Interpretar os resultados: o que cada métrica significa para o problema, em quais classes o modelo erra mais e quais são as limitações.
18. (Opcional) Comparar com outro modelo, como regressão logística ou árvore de decisão, apenas como referência. O modelo final é sempre o Naive Bayes.

### Fase 5: Exportação

19. Salvar o pipeline completo:

```python
import joblib
joblib.dump(model, "../backend/model/modelo_nb.joblib")
```

20. Criar um script de teste separado (por exemplo, `ml/teste_carregamento.py`) que carrega o `.joblib`, cria um DataFrame com um exemplo de entrada e confirma que `predict` e `predict_proba` funcionam sem depender do notebook.

### Fase 6: Contrato com o backend e o frontend

21. Gerar um arquivo `ml/CONTRATO.md` com:
    - nome exato de cada campo do formulário, igual ao nome da coluna usada no treino;
    - tipo de cada campo (número, texto, lista de opções) e valores aceitos;
    - classes de saída, com o rótulo que deve aparecer na tela;
    - se `predict_proba` está disponível.

Exemplo de formato:

```
idade: número inteiro, entre 0 e 120
sexo: "M" ou "F"
...
Saída: classe prevista (texto) e probabilidade por classe (opcional)
```

22. O backend deve montar o DataFrame de entrada com exatamente essas colunas, na mesma ordem usada no treino.

### Fase 7: Documentação e entrega

23. Atualizar `ml/README.md` com: decisões finais, ordem de execução dos notebooks (01, depois 02), comando de download, versões de Python e scikit-learn, e limitações.
24. Revisar a documentação cobrindo: origem da base, dados, alvo, features, pré-processamento, métricas e limitações.
25. Garantir que o usuário consiga explicar cada etapa na apresentação individual: por que Naive Bayes, por que essas features, o que significa cada métrica e como o modelo chega ao resultado.

---

## 6. Ordem de trabalho para o agente

1. Confirmar com o usuário a estrutura da pasta e o caminho do CSV.
2. Executar a Fase 1 e mostrar o resultado das verificações iniciais.
3. Parar e pedir a confirmação da variável-alvo e das features antes da Fase 3.
4. Seguir as fases 3 a 7 após a confirmação.
5. Ao final de cada fase, resumir o que foi feito e o que falta.

Sempre que faltar uma informação (nome de coluna, decisão de projeto, caminho de arquivo), pergunte ao usuário em vez de supor.

---

## 7. Entregáveis

- `ml/notebooks/01_exploracao.ipynb`
- `ml/notebooks/02_treino.ipynb`
- `ml/requirements.txt`
- `ml/README.md` atualizado
- `ml/CONTRATO.md`
- `backend/model/modelo_nb.joblib`
- Métricas, matriz de confusão e interpretação registradas no notebook de treino