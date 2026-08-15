const paths = {
    url: "https://weboftrust.github.io",
    baseUrl: "/kerisse/",
    indexedInKERISSE: "indexed-in-KERISSE.html",
    // Where the browser fetches manifest.json and the *.orama.msgpack.gz shards.
    // - "search-index/" = same origin (webpack copies output/search-index/ into dist/)
    // - external hosting, e.g. "https://keri.foundation/kerisse/search-index/"
    //   (requires CORS headers on that server — see hosting/htaccess-search-index)
    searchIndexBaseUrl: "search-index/"
}

module.exports = paths;