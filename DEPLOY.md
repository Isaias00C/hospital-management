# Publicar e testar o HospPredict

O front é publicado no Vercel, a API no Render e o código aprovado é integrado em `develop`. Este ambiente é uma demonstração acadêmica. Use os casos sintéticos do formulário.

## Primeira publicação

1. **GitHub.** Revise e integre o PR que adiciona estas configurações em `develop`. Se você administra o repositório, configure a proteção da branch para exigir PR, aprovação e os checks `Frontend build` e `Backend tests`.
2. **Render.** Conecte o repositório pelo painel de **Blueprints**, selecione `develop` e use o `render.yaml` da raiz. Ele define o serviço de API, o comando de inicialização e o deploy após os checks do CI. O assistente pede `CORS_ORIGINS`. Se o endereço do Vercel ainda não existe, use `https://example.invalid` como valor temporário. Confirme que a URL HTTPS da API responde em `/ready` com HTTP 200 e `model_loaded: true`.
3. **Vercel.** Importe o mesmo repositório, escolha `frontend` como **Root Directory** e `develop` como **Production Branch**. Defina `VITE_API_URL` em **Production** e **Preview** com a origem HTTPS da API do Render. Ela é incorporada ao bundle durante o build. Se mudar o valor, gere um novo deploy do front.
4. **Render.** Atualize `CORS_ORIGINS` com a origem exata do front de produção e as origens das prévias que devem acessar a API. Use URLs sem barra no fim e separe os valores por vírgulas. Para PRs, prefira adicionar o endereço estável da prévia da branch para evitar trocar a configuração a cada commit.

O Render consulta `/ready` para decidir se a API pode receber tráfego. Esse endpoint responde 503 quando o modelo falha ao carregar. O front continua consultando `/health` para informar se a API está desligada ou se o modelo está indisponível.

## Validar sem localhost

1. Abra a URL do Vercel, confirme **API Conectada** e calcule o risco usando um caso de demonstração.
2. No GitHub, abra **Actions → Teste da versão web → Run workflow** em `develop`. Informe a URL HTTPS do front e a URL HTTPS da API, sem caminhos nem parâmetros. Use uma URL do Vercel que o runner consiga acessar. Esta verificação não autentica em prévias protegidas.
3. O workflow verifica o HTML e o bundle publicado, a URL da API no bundle, o estado do modelo, a configuração de CORS e uma predição com dados sintéticos.

## Atualizações

- **PR:** o GitHub Actions compila o front e roda os testes do backend. O Vercel cria uma prévia no projeto conectado.
- **Merge em `develop`:** o Vercel atualiza o site de produção. O Render publica alterações da API automaticamente quando os checks do commit passam.
- **Mudanças na API:** mantenha o contrato compatível entre versões, pois Vercel e Render podem terminar os deploys em momentos diferentes. Rode o teste web assim que os serviços estiverem prontos.
