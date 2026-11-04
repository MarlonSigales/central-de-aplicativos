# Central de Aplicativos

Página única que reúne os aplicativos web de Marlon Sigales (Engenharia Agrícola, CEng/UFPel · Inova Agro UFPel EMBRAPII),
com uma figura e uma linha sobre cada um, agrupados por área. A ideia veio da página
[Math, Physics, and Engineering Applets](https://www.falstad.com/mathphysics.html) do Prof. Paul Falstad
([GitHub](https://github.com/pfalstad)) — obrigado, Professor Falstad, por compartilhar os seus aplicativos.

**Usar:** https://marlonsigales.github.io/central-de-aplicativos/ (GitHub Pages) ou abra `index.html` direto do disco.
HTML, CSS e JavaScript puros, sem servidor e sem bibliotecas externas.

## O que tem

- **Gestão de Projetos primeiro, em destaque:** é o sistema que faz tudo num só (QFD, projeto conceitual e preliminar, TRL e relatórios).
- **Apps separados depois, para casos específicos:** Projeto de produto (QFD, Projeto Conceitual), Propriedade intelectual
  (Apoio à Escrita de Patentes), Apoio à decisão (MCDA-C), Instalações elétricas e energia (Projeto Elétrico Agroindustrial,
  Off-grid), Automação e supervisão (Sinótico — Supervisório MQTT) e Utilitários (Gerador de QR Code). Clique na figura ou no
  nome para abrir; "código ↗" leva ao repositório.
- **Fluxo de projetos com os apps separados:** QFD → Projeto Conceitual → Gestão de Projetos, com o próximo passo destacado.
- **Jogo de missões** (o mesmo do Apoio à Escrita de Patentes): cada missão cumprida dá XP e uma medalha; o XP sobe o nível
  (🌱 Curioso(a) → 🏆 Mestre dos aplicativos); "próxima missão" com botão para cumprir; +XP voando, medalha com confete.
  Conta só o que é aberto a partir da central e fica só no navegador (localStorage); "Zerar progresso" apaga.

| Ação | XP |
|---|---|
| Abrir um app pela 1ª vez | +20 |
| Abrir de novo em outro dia (1 vez por app por dia) | +5 |
| Ver o código de um app (1ª vez) | +5 |
| Voltar à central em outro dia | +3 |
| Visitar a página do Prof. Falstad | +10 |
| Cada medalha | bônus próprio (+5 a +40) |

## Pôr ou tirar um aplicativo

Tudo está em **`js/apps.js`**; não precisa mexer em mais nada.

- **Esconder sem apagar:** no bloco do app, troque `ativo: true` por `ativo: false`.
- **Excluir de vez:** apague o bloco do app (de `{` até `},`) e, se quiser, a figura em `img/apps/`.
- **Pôr um novo:** copie um bloco, troque o `id` e preencha. `url: ''` mostra "endereço a cadastrar".
- **App em destaque (primeiro da página):** `destaque: true` (hoje só a Gestão de Projetos).

A página, o fluxo, as missões, as medalhas e o XP ignoram sozinhos os apps fora do catálogo, e o progresso já salvo não quebra.
Depois de mudar, troque o `?v=` em `index.html` para o navegador não usar a versão antiga.

## Testes

`node tests/testes.js` ou abra `tests/testes.html`. Cobrem o catálogo, o XP, os níveis, as missões e medalhas, a exclusão de apps
e o conserto de progresso salvo corrompido.

## Arquivos

```
index.html          página
css/style.css       mesma identidade visual dos outros sistemas
js/apps.js          catálogo (categorias, apps, fluxo)
js/gamificacao.js   XP, níveis e conquistas
js/app.js           monta a página
img/apps/           telas dos aplicativos
tests/              testes
todoQA.txt          diretrizes, o que foi feito e QA
```

© 2026 Marlon Sigales. Todos os direitos reservados (ver LICENSE).
