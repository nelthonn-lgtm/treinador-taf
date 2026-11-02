# Treinador TAF · Polícia Penal/RN

App instalável (PWA) para preparação do Teste de Aptidão Física com progressão segura para joelhos e ombros.

## O que tem
- **Check-in diário de dor** (joelhos e ombros, 0–10, sinais de alerta). O treino do dia se adapta sozinho: verde = normal, amarelo = reduzido, laranja = regenerativo da região, vermelho = descanso.
- **Plano adaptativo**: 3 corridas, 2 forças em casa, 1 mobilidade e 1 descanso por semana. A progressão é por níveis: só sobe depois de completar as sessões sem dor; se a dor aparecer, o nível se repete.
  - Corrida: 20 níveis, da caminhada ao ritmo de prova (5:00/km), com semanas leves e simulados de 12 min.
  - Barra do zero: B1 (elástico e manguito) → dead hang → ativação escapular → remada australiana → isometria → negativas → superband → barra livre → margem de segurança.
  - Abdominal (técnica do edital) e pernas/glúteos para proteger o joelho.
- **GPS**: distância, tempo, pace médio e atual, mapa, aviso por voz a cada 400 m, metrônomo de cadência, treino guiado por blocos e **simulado de 12 min** com projeção e ritmo necessário para a meta.
- **Cronômetros**: intervalado, abdominal de 60 s com contador por toque, suspensão/isometria na barra e cronômetro livre.
- **Evolução**: comparação com os índices do edital e com as metas, gráficos, km por semana, dor nos últimos 30 dias, histórico.
- Gamificação (XP, sequência, conquistas), hidratação, rodagem do tênis, regras do TAF, lembretes via Google Agenda, backup em JSON, funciona offline.

Índices do Edital PPRN 2026 (Policial Penal): barra 3 (masc.) / isometria 5 s (fem.); abdominal 60 s 15 / 10; corrida 12 min 2.000 m / 1.600 m. Editáveis em Mais › Perfil.

## Privacidade
Todos os dados ficam no aparelho (localStorage). Nenhum servidor. Veja `privacidade.html`.

## Publicar na Google Play (quando quiser)
1. Crie a conta de desenvolvedor no Google Play Console (taxa única de US$ 25).
2. Acesse https://www.pwabuilder.com, cole o endereço do app e gere o pacote **Android (Trusted Web Activity)**. Ele entrega o `.aab` e o arquivo `assetlinks.json`.
3. Coloque o `assetlinks.json` em `.well-known/assetlinks.json` neste repositório (para a barra do navegador não aparecer no app).
4. No Play Console: crie o app, envie o `.aab`, preencha a ficha (ícone 512 px já está em a raiz), informe a política de privacidade (`privacidade.html`) e o formulário de segurança de dados (nenhum dado coletado/compartilhado; localização usada só no aparelho).
5. Contas pessoais novas precisam de teste fechado com 12 testadores por 14 dias antes da produção.

## Estrutura
`index.html` · `styles.css` · `app.js` (telas) · `program.js` (plano e exercícios) · `store.js` (dados, níveis, XP) · `devices.js` (GPS, voz, som) · `sw.js` (offline) · `manifest.webmanifest`. Leaflet e Chart.js vêm do jsDelivr e ficam em cache para uso offline.
