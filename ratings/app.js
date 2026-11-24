const search = document.querySelector("#search");
const status = document.querySelector("#status");
const table = document.querySelector("table");
const body = table.tBodies[0];
const sortButtons = table.querySelectorAll("[data-sort]");
const columns = ["artist", "album", "year", "rating"];
const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
let sortKey;
let direction = 1;

const theme = document.querySelector("#theme");
const requestedTheme = new URLSearchParams(location.search).get("theme");
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
    const themeUrl = new URL(location.href);
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
    if (sortKey) {
        matches.sort((left, right) => {
            const a = left[sortKey];
            const b = right[sortKey];
            if (a === b) return 0;
            if (a === null) return 1;
            if (b === null) return -1;
            return direction * (typeof a === "string" ? collator.compare(a, b) : a - b);
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
        search.disabled = false;
        search.addEventListener("input", () => render(albums));
        for (const button of sortButtons) {
            button.addEventListener("click", () => {
                const key = button.dataset.sort;
                direction = key === sortKey ? -direction : key === "year" || key === "rating" ? -1 : 1;
                sortKey = key;
                table.querySelector("[aria-sort]")?.removeAttribute("aria-sort");
                button.parentElement.setAttribute("aria-sort", direction === 1 ? "ascending" : "descending");
                render(albums);
            });
        }
    } catch {
        status.textContent = "Album ratings are temporarily unavailable.";
    }
}

load();
