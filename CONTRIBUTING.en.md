# Contributing

**English** · [Português](CONTRIBUTING.md)

Thanks for your interest! The most welcome contribution to this repository is a
**scenario** (demo campaign). System skins (themes) live in the
[`rpgterm-engine`](https://github.com/flippelt/rpgterm-engine) package, not here.

The scenario contract — `scenario.json`, front-matter, `events`, `tracer`,
`login` — is the engine's JSON Schema:

- [`scenario.schema.json`](https://github.com/flippelt/rpgterm-engine/blob/main/src/schema/scenario.schema.json)
- [`frontmatter.schema.json`](https://github.com/flippelt/rpgterm-engine/blob/main/src/schema/frontmatter.schema.json)

The narrative reference is the [Wiki](https://github.com/flippelt/Immersive-Terminal-for-RPGs/wiki).

## Before you start

- **Node 22+** (see [`.nvmrc`](.nvmrc)).
- **Fork** the repository, then:

```bash
git clone https://github.com/<your-username>/Immersive-Terminal-for-RPGs.git
cd Immersive-Terminal-for-RPGs
npm install
npm run dev        # http://localhost:5173
```

## Adding a scenario

A **theme** is the skin (colors, font, banner, sound) — universes ship from
the engine (`alien`, `lancer`, `br`, `wh40k`, `fallout`, `cprd`, `ibm`,
`paranoia`, `expanse`, `eclipse`). `dataslate` is an Imperium (`wh40k`)
device, not a separate chip. A **scenario** is the campaign content and
lives in this repo. Set `"device": "cogitator"` or `"device": "dataslate"`
on an Imperium `scenario.json` to pick the look.

1. Create the folder `src/themes/scenarios/<theme>/<scenario>/`:
   - `scenario.json` — `motd`, `commands`, and optionally `login` / `events` / `tracer` / `dialog`.
   - `files/` — the terminal files as **real files**:
     - `.md` → rendered as markdown (cinematic)
     - `.log` / `.dat` / others → raw text
     - locked files carry a `---` front-matter block at the top
       (`locked`, `password`, `crackDC`, `reveals`, …)
2. The loader (`import.meta.glob` in `src/themes/index.js`) picks the scenario
   up on its own. Do not edit a theme list.
3. Scenarios here are **schema fixtures** (short demos). Real table campaigns
   belong in the private fork, not this engine host.

The IBM workstation (`ibm/workstation`) is the spec-by-example: login, tracer,
DC crack, Wordle decrypt, and a hardened file.

## Adding a new skin

Skins are not added here. Open a PR on
[`rpgterm-engine`](https://github.com/flippelt/rpgterm-engine) with the JSON in
`src/themes/<id>.json` and the register in `src/engine/scenario.js`. This host
inherits the skin on the next package bump.

## Translations (i18n)

The UI and built-in messages ship in **English** (default) and **Portuguese**
(in the engine). **Commands never change language** — only the text does. The
language is picked from the bottom-left control.

To translate a **scenario's content** (name, motd, dialog, custom commands,
`tracer`, `login`, `events`), add an `i18n` block to `scenario.json`:

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

`i18n.<lang>` rules:

- each field **replaces** the base (English) one; plain objects (`dialog`,
  `tracer`, `login`, `locks`, `selfDestruct`) shallow-merge, so you can
  translate just the text keys and the rest comes from the base;
- **don't** translate command names or file paths.

To translate **file bodies**, add a parallel `files.<lang>/` tree mirroring
`files/` — body only, **no** front-matter (the password and other metadata stay
on the base file):

```
scenarios/<theme>/<scenario>/
  files/orders.md       # original (with front-matter if locked)
  files.pt/orders.md    # translated body only
```

(Alternative: an `i18n.<lang>.files` map in `scenario.json`, with
`"/path": "translated body"`.)

> Limitation: **per-file** front-matter strings (`lockLabel`,
> `crackFailMessage`, `crackSuccessMessage`) aren't localized yet — use the
> theme's `locks` labels, which are translatable.

## Before opening the PR

Run and make sure everything passes:

```bash
npm run lint
npm test
npm run build
```

CI also validates every `scenario.json` and file front-matter against the
engine schema.

## Fan content and rights

- Keep content **transformative and short** (original flavor) — don't paste
  long copyrighted text.
- Don't include proprietary assets (images, fonts without a free license).
- Themes based on third-party universes are *fan content*; see the README
  disclaimer. By contributing, you agree to license your code under
  [MIT](LICENSE).

## Opening the Pull Request

1. Create a branch off `main`, commit, and push to **your fork**.
2. Open a PR against this repository's `main`.
3. Describe the scenario and **how to test** it (which theme, which
   commands, passwords for any locked files).

`main` is protected by a *ruleset*. For a PR to merge:

- **CI must pass** (lint + tests + build) — it runs automatically on the PR;
- it needs **at least one approval from a maintainer** (code owner) — review
  may request changes first;
- linear history (use *squash*/*rebase*) and resolved conversations.

Maintainers can help refine the PR during review. Thanks for contributing — and
happy sessions! 🖖
