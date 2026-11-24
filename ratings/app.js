const search = document.querySelector("#search");
const sort = document.querySelector("#sort");
const status = document.querySelector("#status");
const table = document.querySelector("table");
const body = table.tBodies[0];
const columns = ["artist", "album", "year", "rating"];
const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

const theme = document.querySelector("#theme");
const themeUrl = new URL(location.href);
const requestedTheme = themeUrl.searchParams.get("theme");
const darkPreference = matchMedia("(prefers-color-scheme: dark)");
let selectedTheme = Array.from(theme.options).some(option => option.value === requestedTheme)
    ? requestedTheme
    : null;

function syncThemePicker() {
    theme.value = selectedTheme ?? (darkPreference.matches ? "midnight" : "slate");
    document.documentElement.dataset.theme = theme.value;
}

syncThemePicker();
darkPreference.addEventListener("change", syncThemePicker);
theme.disabled = false;
theme.addEventListener("change", () => {
    selectedTheme = theme.value;
    syncThemePicker();
    themeUrl.searchParams.set("theme", selectedTheme);
    history.replaceState(null, "", themeUrl);
});

function searchText(value) {
    return value.toLowerCase().normalize("NFD").replace(/\p{Mark}/gu, "");
}

function render(albums) {
    const query = searchText(search.value.trim());
    const matches = albums.filter(({ artist, album }) =>
        searchText(artist).includes(query) || searchText(album).includes(query)
    );
    const key = sort.value;
    if (key === "artist" || key === "album") {
        matches.sort((a, b) => collator.compare(a[key], b[key]));
    } else if (key) {
        matches.sort((a, b) => {
            if (a[key] === b[key]) return 0;
            if (a[key] === null) return 1;
            if (b[key] === null) return -1;
            return b[key] - a[key];
        });
    }

    const rows = document.createDocumentFragment();
    for (const album of matches) {
        const row = document.createElement("tr");
        for (const key of columns) {
            row.insertCell().textContent = album[key] ?? "";
        }
        rows.append(row);
    }
    body.replaceChildren(rows);
    table.hidden = matches.length === 0;
    status.textContent = matches.length
        ? `${matches.length.toLocaleString()} ${matches.length === 1 ? "album" : "albums"}`
        : "No matching albums.";
}

async function load() {
    try {
        const response = await fetch("albums.json", { cache: "no-cache" });
        if (!response.ok) throw new Error("Could not fetch albums");
        const albums = await response.json();
        render(albums);
        search.disabled = sort.disabled = false;
        search.addEventListener("input", () => render(albums));
        sort.addEventListener("change", () => render(albums));
    } catch {
        status.textContent = "Album ratings are temporarily unavailable.";
    }
}

load();
