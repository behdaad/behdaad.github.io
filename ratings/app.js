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
    return String(value ?? "").toLowerCase().normalize("NFD").replace(/\p{Mark}/gu, "");
}

async function loadRatings(section) {
    const { ratings, singular, plural } = section.dataset;
    const search = section.querySelector("#search");
    const status = section.querySelector("#status");
    const tableScroll = section.querySelector(".table-scroll");
    const table = tableScroll.querySelector("table");
    const body = table.tBodies[0];
    const hasRowNumbers = table.querySelector("th.row-number") !== null;
    const rowNumbers = new Map();
    const columns = [...table.querySelectorAll("[data-sort]")];
    const searchKeys = columns.filter(button => button.hasAttribute("data-searchable"))
        .map(button => button.dataset.sort);
    const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
    let sortColumn = table.querySelector("[aria-sort]");
    let sortKey = sortColumn.querySelector("button").dataset.sort;
    let direction = sortColumn.getAttribute("aria-sort") === "descending" ? -1 : 1;

    function compareEntries(left, right) {
        const a = left[sortKey];
        const b = right[sortKey];
        if (a === b) return 0;
        if (a == null) return 1;
        if (b == null) return -1;
        return direction * (typeof a === "string" ? collator.compare(a, b) : a - b);
    }

    function render(entries) {
        const query = searchText(search.value.trim());
        const matches = entries.filter(entry =>
            !query || searchKeys.some(key => searchText(entry[key]).includes(query))
        );
        matches.sort(compareEntries);

        const rows = document.createDocumentFragment();
        for (const entry of matches) {
            const row = document.createElement("tr");
            if (hasRowNumbers) {
                const cell = row.insertCell();
                cell.className = "row-number";
                cell.textContent = rowNumbers.get(entry);
            }
            for (const button of columns) {
                const cell = row.insertCell();
                cell.className = button.parentElement.className;
                cell.textContent = entry[button.dataset.sort] ?? "";
            }
            rows.append(row);
        }
        body.replaceChildren(rows);
        tableScroll.hidden = matches.length === 0;
        status.textContent = matches.length
            ? `${matches.length.toLocaleString()} ${matches.length === 1 ? singular : plural}`
            : `No matching ${plural}.`;
    }

    try {
        const response = await fetch(ratings, { cache: "no-cache" });
        if (!response.ok) throw new Error("Could not fetch ratings");
        const entries = await response.json();
        if (hasRowNumbers) {
            [...entries].sort(compareEntries).forEach((entry, index) => rowNumbers.set(entry, index + 1));
        }
        render(entries);
        search.disabled = false;
        search.addEventListener("input", () => render(entries));
        for (const button of columns) {
            button.addEventListener("click", () => {
                const key = button.dataset.sort;
                const initialDirection = button.dataset.direction === "descending" ? -1 : 1;
                direction = key === sortKey ? -direction : initialDirection;
                sortKey = key;
                sortColumn.removeAttribute("aria-sort");
                sortColumn = button.parentElement;
                sortColumn.setAttribute("aria-sort", direction === 1 ? "ascending" : "descending");
                render(entries);
            });
        }
    } catch {
        status.textContent = "Ratings are temporarily unavailable.";
    }
}

for (const section of document.querySelectorAll("[data-ratings]")) {
    loadRatings(section);
}
