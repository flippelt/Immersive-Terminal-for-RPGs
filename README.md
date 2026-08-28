# Terminal Imersivo para RPG

[![CI](https://img.shields.io/github/actions/workflow/status/flippelt/Immersive-Terminal-for-RPGs/ci.yml?label=CI)](https://github.com/flippelt/Immersive-Terminal-for-RPGs/actions) [![Release](https://img.shields.io/github/v/release/flippelt/Immersive-Terminal-for-RPGs)](https://github.com/flippelt/Immersive-Terminal-for-RPGs/releases) ![Release date](https://img.shields.io/github/release-date/flippelt/Immersive-Terminal-for-RPGs) [![Last commit](https://img.shields.io/github/last-commit/flippelt/Immersive-Terminal-for-RPGs)](https://github.com/flippelt/Immersive-Terminal-for-RPGs/commits) [![License](https://img.shields.io/github/license/flippelt/Immersive-Terminal-for-RPGs)](https://github.com/flippelt/Immersive-Terminal-for-RPGs/blob/main/LICENSE) ![Top language](https://img.shields.io/github/languages/top/flippelt/Immersive-Terminal-for-RPGs) ![Repo size](https://img.shields.io/github/repo-size/flippelt/Immersive-Terminal-for-RPGs) ![Issues](https://img.shields.io/github/issues/flippelt/Immersive-Terminal-for-RPGs)

[English](README.en.md) · **Português**

### → [**LIVE DEMO**](https://flippelt.github.io/Immersive-Terminal-for-RPGs/) ←

Um site que simula um terminal de console retrô (estilo *cool-retro-term*) para
usar como prop em mesas de RPG. Troque de "sistema" e o visual, os textos e o
conteúdo mudam por completo. O Mestre cria cenários editando só arquivos JSON.

Sistemas incluídos: **Alien** (MU/TH/UR), **Lancer** (COMP/CON), **Blade Runner**
(Esper), **Warhammer 40K** (Cogitator e Dataslate Imperial), **Fallout** (RobCo
Termlink), **Cyberpunk RED** (NetWatch), **IBM 5151** (PC-DOS, fósforo verde),
**Paranoia**, **The Expanse** e **Eclipse Phase**.

Stack: **React + Vite**, 100% estático, sem backend. Áudio sintetizado no
navegador (sem assets), fontes self-hosted (sem Google Fonts).

---

## Recursos

- **CRT em CSS puro** — scanlines, glow de fósforo, flicker, sweep, curvatura e
  vinheta. Respeita `prefers-reduced-motion`.
- **Terminal híbrido** — boot animado por typewriter + prompt interativo com
  cursor inline que segue a digitação e as setas ←/→.
- **Bilíngue (EN / PT-BR)** — interface e cenários em inglês e português;
  alterne pelo controle no canto inferior esquerdo. Os **comandos não mudam** de
  idioma. Autores podem traduzir seus próprios cenários (veja o CONTRIBUTING).
- **Arquivos trancados** — `crack` (força bruta animada), `decrypt` (minigame de
  cifra estilo Wordle) e `unlock` (senha conhecida), com barra de progresso
  configurável, teste de dificuldade opcional e cadeias de desbloqueio. Ler um
  arquivo (`cat`) abre um **popup cinematográfico** com rolagem.
- **Cinematografia do Mestre** — eventos ao destrancar, popup de autodestruição
  com OVERRIDE e o rastreador estilo Cyberpunk.
- **Modo Mestre** (escondido) — revela senhas e conteúdo trancado sem destrancar
  pros jogadores.
- **Som sintetizado** — clique de tecla, beep de sucesso/erro, whoosh de boot e
  hum ambiente opcional, com volume controlável.
- **Temas + cenários** — skin reutilizável separada do conteúdo da campanha; um
  tema pode hospedar várias campanhas.

---

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
```

Build de produção:

```bash
npm run build        # app completo → dist/
npm run lint         # ESLint
npm test             # Vitest (schema dos cenários + smoke do Terminal + UI)
```

### Deploy

A cada push em `main`, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
publica o app completo no **GitHub Pages**, na raiz do repositório — essa é a
página pública oficial (a demo, com todos os sistemas e funções).

---

## Documentação (Wiki)

A referência detalhada vive na **[Wiki](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki)**:

- **[Comandos](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki/Commands)** — todos os comandos, atalhos, Modo Mestre, carregar campanha pela URL.
- **[Autoria: Temas](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki/Authoring-Themes)** — o JSON da skin (paleta, fonte, CRT, sons, banner, boot).
- **[Autoria: Cenários](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki/Authoring-Scenarios)** — pasta do cenário, `scenario.json`, árvore `files/`, markdown, login.
- **[Cenários custom](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki/Custom-Scenarios)** — bundle JSON, `?scenario64=`, `loadscenario`.
- **[Arquivos Trancados](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki/Locked-Files)** — front-matter, `crack` vs `decrypt`, teste de dificuldade, cadeias.
- **[Cinematografia](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki/Cinematics)** — eventos, contagens, autodestruição, o rastreador.
- **[Arquitetura](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki/Architecture)** — layout do código e as fontes.

Resumo rápido: navegue com `ls`/`cd`/`cat`, abra arquivos trancados com `crack`/
`decrypt`, troque de sistema com `theme` e de campanha com `scenario`. Ligue o
**Modo Mestre** com `Ctrl+Shift+G`. Carregue uma campanha direto pela URL:
`.../?theme=cprd&scenario=heimdall`.

> 🛠 **Editor visual (web):** prefere não editar JSON na mão? O
> **[scenario-forge](https://flippelt.github.io/scenario-forge/)** monta o cenário
> por formulário — árvore de arquivos, flags (crack/tracer/lock), diálogo
> (`query`/`ask`), eventos — e testa no preview in-process (mesmo
> `rpgterm-engine`). Exporta pasta, `.zip`, bundle JSON ou link `?scenario64=`.

## Família

| Projeto | Papel |
|---|---|
| [scenario-forge](https://github.com/flippelt/scenario-forge) | editor web dos cenários · [demo](https://flippelt.github.io/scenario-forge/) |
| [rpgterm-engine](https://www.npmjs.com/package/rpgterm-engine) | motor npm (VFS, comandos, crack/tracer) |
| [rpg-prop-kit](https://www.npmjs.com/package/rpg-prop-kit) | CRT e props analógicos |
| [session-kit](https://github.com/flippelt/session-kit) | um YAML de sessão → este terminal e as outras ferramentas |

---

## Contribuindo

Quer adicionar um tema novo? Veja o [guia de contribuição](CONTRIBUTING.md).
Todo PR passa pelo CI e precisa de aprovação da manutenção antes do merge.

---

## Licença

Código sob [MIT](LICENSE) © 2026 Felipe Lippelt.

> **Conteúdo de fã, não-oficial.** Os temas referenciam universos de terceiros
> (Alien, Lancer, Blade Runner, Warhammer 40,000, Fallout, Cyberpunk) apenas
> para uso em mesas de RPG. Este projeto não é afiliado nem endossado pelos
> detentores dessas marcas, que permanecem propriedade de seus respectivos
> donos. A licença MIT cobre apenas o código-fonte original deste repositório.
