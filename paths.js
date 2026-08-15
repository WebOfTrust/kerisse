const paths = {
    url: "https://weboftrust.github.io",
    baseUrl: "/kerisse/",
    indexedInKERISSE: "indexed-in-KERISSE.html",
    // Where the browser fetches manifest.json and the *.orama.msgpack.gz shards.
    // Override at build time with SEARCH_INDEX_BASE_URL (GitHub Actions sets this
    // to the Hostinger copy). Local `npm start` keeps same-origin "search-index/".
    searchIndexBaseUrl: process.env.SEARCH_INDEX_BASE_URL || "search-index/"
}

module.exports = paths;