# Information

Create an array with strings that should be ignored.

- Path fragments use substring matching: writing `newsroom` ignores every URL that contains `newsroom`.
- Full `http://` / `https://` URLs match exactly (trailing slash ignored), so a parent page can be excluded without dropping its children.

```
[
    "gleif.org/en/meta",
    "gleif.org/en/contact",
    "gleif.org/en/newsroom",
    "gleif.org/en/lei-data/email-notifications-on-technical-updates",
    "https://kericonf.com/archive/"
]
```
