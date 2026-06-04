// The UI dictionaries live once in rpgterm-engine (single source). This thin
// re-export keeps every component's `import { makeT } from '../i18n/ui.js'`
// working unchanged.
export { makeT, SUPPORTED_LANGS } from 'rpgterm-engine'
