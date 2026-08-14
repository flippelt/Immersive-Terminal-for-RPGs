# Política de segurança

## Reportar vulnerabilidade

Use o canal privado do GitHub:
[**abrir um security advisory**](https://github.com/flippelt/Immersive-Terminal-for-RPGs/security/advisories/new).

Não abra *issue pública* para problemas de segurança — vulnerabilidades são
tratadas em advisory privado até haver patch.

Você receberá uma resposta em até **7 dias corridos**. Patches são aplicados
via PR na `main` (não há branches de release).

## Escopo

Este projeto é um **site estático** sem backend, sem banco de dados, sem
autenticação. O interpretador de comandos e o compositor de cenários vivem
no pacote [`rpgterm-engine`](https://www.npmjs.com/package/rpgterm-engine).
Vetores relevantes:

- **XSS via tema/cenário JSON**: `cat` renderiza conteúdo de arquivos como
  texto (cada linha vira `<p>`), sem `dangerouslySetInnerHTML`. Se você
  adicionar novos componentes, mantenha esse contrato.
- **Injeção de comando**: o parser usa `split(/\s+/)` + dispatch por
  allowlist (`COMMANDS` em `rpgterm-engine`). Comandos customizados via
  cenário retornam **linhas estáticas** — não executam JavaScript do JSON.
- **Recursos externos**: fontes são self-hosted em
  [`public/fonts/`](public/fonts/). Não há Google Fonts. Um cenário pode
  referenciar uma `image:` externa (URL); trate isso como conteúdo do autor.
- **postMessage**: o preview ao vivo (`rpgterm:load`) aceita um bundle do
  frame pai (scenario-forge). Só use a demo embutida em hosts confiáveis.
- **LocalStorage**: guarda preferências da sessão do host, sem PII:
  `tirpg.theme`, `tirpg.lang`, `tirpg.volume`, `tirpg.hum`,
  `tirpg.disabledThemes`, `tirpg.progress.<tema>.<cenário>`.

## Fora de escopo

- Ataques que requerem comprometimento prévio da máquina do jogador.
- DoS pelo próprio jogador (clicar `reboot` mil vezes).

## Dependências

`npm audit --audit-level=high --omit=dev` roda em todo CI e bloqueia o PR.
Dependabot continua abrindo PRs de **segurança**; updates de versão de rotina
estão pausados.
