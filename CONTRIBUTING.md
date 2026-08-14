# Contribuindo

[English](CONTRIBUTING.en.md) · **Português**

Obrigado pelo interesse! A contribuição mais bem-vinda neste repositório é um
**cenário** (campanha demo). Skins de sistema (temas) vivem no pacote
[`rpgterm-engine`](https://github.com/flippelt/rpgterm-engine), não aqui.

O contrato de um cenário — `scenario.json`, front-matter, `events`, `tracer`,
`login` — está no JSON Schema do engine:

- [`scenario.schema.json`](https://github.com/flippelt/rpgterm-engine/blob/main/src/schema/scenario.schema.json)
- [`frontmatter.schema.json`](https://github.com/flippelt/rpgterm-engine/blob/main/src/schema/frontmatter.schema.json)

A referência narrativa está na [Wiki](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki).

## Antes de começar

- **Node 22+** (veja [`.nvmrc`](.nvmrc)).
- Faça **fork** do repositório, depois:

```bash
git clone https://github.com/<seu-usuario>/Immersive-Terminal-for-RPGs.git
cd Immersive-Terminal-for-RPGs
npm install
npm run dev        # http://localhost:5173
```

## Adicionando um cenário

Um **tema** é a skin (cores, fonte, banner, sons) — 8 já vêm do engine
(`alien`, `lancer`, `br`, `wh40k`, `fallout`, `cprd`, `dataslate`, `ibm`).
Um **cenário** é o conteúdo da campanha e fica neste repo.

1. Crie a pasta `src/themes/scenarios/<tema>/<cenário>/`:
   - `scenario.json` — `motd`, `commands`, e opcionalmente `login` / `events` / `tracer` / `dialog`.
   - `files/` — os arquivos do terminal como **arquivos reais**:
     - `.md` → renderizado como markdown (cinematográfico)
     - `.log` / `.dat` / outros → texto cru
     - arquivos trancados levam um bloco `---` de front-matter no topo
       (`locked`, `password`, `crackDC`, `reveals`, …)
2. O loader (`import.meta.glob` em `src/themes/index.js`) registra o cenário
   sozinho. Não edite a lista de temas.
3. Cenários daqui são **fixtures do schema** (demos curtos). Campanhas de mesa
   reais vão no fork privado, não neste motor.

O IBM workstation (`ibm/workstation`) é o spec-by-example: login, tracer,
crack com DC, decrypt Wordle e arquivo endurecido.

## Adicionando uma skin nova

Skins não se adicionam aqui. Abra um PR em
[`rpgterm-engine`](https://github.com/flippelt/rpgterm-engine) com o JSON em
`src/themes/<id>.json` e o registro em `src/engine/scenario.js`. Depois este
host herda a skin no próximo bump do pacote.

## Traduções (i18n)

A interface e as mensagens internas já vêm em **inglês** (padrão) e
**português** (no engine). Os **comandos nunca mudam de idioma** — só os
textos. O idioma sai do botão no canto inferior esquerdo.

Para traduzir o **conteúdo de um cenário** (nome, motd, diálogos, comandos
customizados, `tracer`, `login`, `events`), adicione um bloco `i18n` ao
`scenario.json`:

```json
{
  "name": "Case 4127-A",
  "motd": ["..."],
  "i18n": {
    "pt": {
      "name": "Caso 4127-A",
      "motd": ["..."],
      "dialog": { "fallback": "DADOS INSUFICIENTES." }
    }
  }
}
```

Regras do `i18n.<lang>`:

- cada campo **substitui** o do idioma base (inglês); objetos simples
  (`dialog`, `tracer`, `login`, `locks`, `selfDestruct`) sofrem *merge* raso, então
  você pode traduzir só as chaves de texto e o resto vem do base;
- **não** traduza nomes de comando nem caminhos de arquivo.

Para traduzir os **corpos dos arquivos**, crie uma árvore paralela
`files.<lang>/` espelhando `files/` — apenas o corpo, **sem** front-matter (a
senha e os demais metadados continuam vindo do arquivo base):

```
scenarios/<tema>/<cenário>/
  files/orders.md       # original (com front-matter, se trancado)
  files.pt/orders.md    # só o corpo traduzido
```

(Alternativa: um mapa `i18n.<lang>.files` no `scenario.json`, com
`"/caminho": "corpo traduzido"`.)

> Limitação: strings de front-matter **por arquivo** (`lockLabel`,
> `crackFailMessage`, `crackSuccessMessage`) ainda não são localizadas — use os
> rótulos de `locks` no tema, que são traduzíveis.

## Antes de abrir o PR

Rode e garanta que tudo passa:

```bash
npm run lint
npm test
npm run build
```

O CI também valida cada `scenario.json` e o front-matter dos arquivos contra
o schema do engine.

## Conteúdo de fã e direitos

- Mantenha o conteúdo **transformativo e curto** (flavor original) — não cole
  textos longos protegidos por copyright.
- Não inclua assets proprietários (imagens, fontes sem licença livre).
- Temas baseados em universos de terceiros são *fan content*; veja o disclaimer
  no README. Ao contribuir, você concorda em licenciar seu código sob
  [MIT](LICENSE).

## Abrindo o Pull Request

1. Crie uma branch a partir de `main`, commite e dê push no **seu fork**.
2. Abra um PR contra a `main` deste repositório.
3. Descreva o cenário e **como testar** (qual tema, quais comandos, senhas
   de arquivos trancados se houver).

A `main` é protegida por um *ruleset*. Para um PR ser mergeado:

- o **CI precisa passar** (lint + testes + build) — roda automaticamente no PR;
- é preciso **pelo menos uma aprovação de um mantenedor** (code owner) — o
  review pode solicitar mudanças antes;
- histórico linear (use *squash*/*rebase*) e conversas resolvidas.

Mantenedores podem ajudar a ajustar o PR no review. Obrigado por contribuir — e
boas sessões! 🖖
