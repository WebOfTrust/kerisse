# Kerisse search engine

## Organizational

We've split up old WOT-terms repo into:

- [kerisse](https://github.com/WebOfTrust/kerisse) : search engine (Typesense-based [github.io site](https://weboftrust.github.io/kerisse/))
- new [WOT-terms](https://github.com/WebOfTrust/WOT-terms): glossary, solely focussed on terminology, filtering, and connect to source management (Docusaurus-based [github.io site](https://weboftrust.github.io/WOT-terms/?level=2))
- [keridoc:](https://github.com/WebOfTrust/keridoc) KERI documentation site (Docusaurus-based: [github.io site](https://weboftrust.github.io/keridoc/?level=2))

Apart from this, we still have:

- [kerific](https://github.com/WebOfTrust/kerific): SSI-terminology dictionary including KERI terms (browser extension for Brave/Edge/Chrome).

## Information for developers

- Add custom css in /src/assets/main.scss

- The references in manifest.json point to files in the final distribution: `/dist`
- `/dist` is generated from source via `npm run build`
- Start local webserver: `npm start`, this will start a server on `http://localhost:8080/`
