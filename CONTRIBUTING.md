# Contribuindo

[English](CONTRIBUTING.en.md) · **Português**

Obrigado pelo interesse! A contribuição mais bem-vinda é **adicionar um novo
tema** (skin) e/ou **cenário** (campanha). Este guia foca nisso.

## Antes de começar

- **Node 22+** (veja [`.nvmrc`](.nvmrc)).
- Faça **fork** do repositório, depois:

```bash
git clone https://github.com/<seu-usuario>/Immersive-Terminal-for-RPGs.git
cd Immersive-Terminal-for-RPGs
npm install
npm run dev        # http://localhost:5173
```

## Adicionando um tema novo

Um **tema** é a skin (cores, fonte, banner, sons). Um **cenário** é o conteúdo
da campanha (textos, arquivos, comandos). O schema completo está na seção
[*Criando conteúdo*](README.md#criando-conteúdo) do README.

1. **Skin** — crie `src/themes/<id>.json` com `palette`, `font`, `crt`,
   `banner`, `boot`, `locks`, `defaultScenario`, etc.
2. **Cenário** — crie a pasta `src/themes/scenarios/<id>/<cenário>/`:
   - `scenario.json` — `motd`, `commands`, e opcionalmente `login` / `events`.
   - `files/` — os arquivos do terminal como **arquivos reais**:
     - `.md` → renderizado como markdown (cinematográfico)
     - `.log` / `.dat` / outros → texto cru
     - arquivos trancados levam um bloco `---` de front-matter no topo
       (`locked`, `password`, `crackDC`, `reveals`, …)
3. **Registre** o tema importando-o em
   [`src/themes/index.js`](src/themes/index.js) e adicionando-o à `THEME_LIST`.
4. **Não** adicione ao `DEMO_IDS` — a curadoria do demo é da manutenção.

Use os temas existentes em `src/themes/` como modelo.

## Traduções (i18n)

A interface e as mensagens internas já vêm em **inglês** (padrão) e
**português** (veja `src/i18n/`). Os **comandos nunca mudam de idioma** — só os
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

Para **temas**, o mesmo bloco `i18n` traduz `extraHelp`, `unknownHint`, etc.

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
3. Descreva o tema/cenário e **como testar** (qual tema, quais comandos, senhas
   de arquivos trancados se houver).

A `main` é protegida por um *ruleset*. Para um PR ser mergeado:

- o **CI precisa passar** (lint + testes + build) — roda automaticamente no PR;
- é preciso **pelo menos uma aprovação de um mantenedor** (code owner) — o
  review pode solicitar mudanças antes;
- histórico linear (use *squash*/*rebase*) e conversas resolvidas.

Mantenedores podem ajudar a ajustar o PR no review. Obrigado por contribuir — e
boas sessões! 🖖
