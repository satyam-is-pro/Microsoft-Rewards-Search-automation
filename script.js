let searchTimeout;
let openedTabs = [];
let stopSearchFlag = false;
let searches = [];
let currentSearchCount = 0;
let totalSearches = 0;

// Limit the search input field to a maximum of 40
document.getElementById("numSearches").addEventListener("input", function () {
    const maxAllowed = 40;
    if (parseInt(this.value) > maxAllowed) {
        this.value = maxAllowed;
    }
});

// Fetch search terms from searches.txt
const fetchSearches = async () => {
    try {
        const response = await fetch('searches.txt');
        if (!response.ok) throw new Error('Could not fetch searches');
        const text = await response.text();
        searches = text.split('\n').filter(term => term.trim() !== '');
    } catch (error) {
        console.error('Error fetching search terms:', error);
        showLoader('Could not load search terms. Please check the searches.txt file.');
    }
};

// Get a random search term without immediate repetition
const getRandomSearchTerm = (previousTerm) => {
    if (searches.length === 0) return null;

    let randomTerm;
    do {
        randomTerm = searches[Math.floor(Math.random() * searches.length)];
    } while (randomTerm === previousTerm);

    return randomTerm;
};

// Show loader message
const showLoader = (message) => {
    const loaderContainer = document.getElementById("loader-container");
    const loaderMessage = document.getElementById("loader-message");
    const progressBar = document.getElementById("progress-bar");

    loaderMessage.textContent = message;
    progressBar.style.width = "0";
    loaderContainer.style.display = "block";

    setTimeout(() => {
        progressBar.style.width = "100%";
    }, 0);

    if (!message.includes("Searches:")) {
        setTimeout(() => {
            loaderContainer.style.display = "none";
        }, 5000);
    }
};

// Open search in a new tab
const performSearch = (query) => {
    const newTab = window.open(`https://www.bing.com/search?pglt=2083&q=${encodeURIComponent(query)}&FORM=ANNTA1&PC=U531`, '_blank');
    if (newTab) {
        openedTabs.push(newTab);
    } else {
        console.error("Could not open new tab");
    }
};

// Start searches button
document.getElementById("startSearches").addEventListener("click", async () => {
    if (searches.length === 0) {
        await fetchSearches();
    }

    totalSearches = Math.min(40, parseInt(document.getElementById("numSearches").value) || 34);
    currentSearchCount = 0;
    stopSearchFlag = false;
    let lastSearchTerm = "";

    showLoader(`Starting searches: 0/${totalSearches} completed`);

    const startSearch = () => {
        if (stopSearchFlag || currentSearchCount >= totalSearches) {
            if (searchTimeout) clearTimeout(searchTimeout);
            if (currentSearchCount > 0) {
                showLoader("All searches completed.");
            }
            return;
        }

        const query = getRandomSearchTerm(lastSearchTerm);
        if (query) {
            performSearch(query);
            lastSearchTerm = query;
            currentSearchCount++;
            showLoader(`Searches: ${currentSearchCount}/${totalSearches} completed`);
        }

        // Set a delay between searches (e.g., 5-10 seconds)
        const randomDelay = Math.random() * 5000 + 5000;
        searchTimeout = setTimeout(startSearch, randomDelay);
    };

    startSearch(); // Begin search
});

// Stop searches button
document.getElementById("stopSearches").addEventListener("click", () => {
    stopSearchFlag = true;
    if (searchTimeout) clearTimeout(searchTimeout);
    showLoader(`Searches stopped at ${currentSearchCount}/${totalSearches}`);
});

// Close all opened tabs button
document.getElementById("closeTabs").addEventListener("click", () => {
    openedTabs.forEach(tab => tab.close());
    openedTabs = [];
    showLoader("All opened search tabs closed.");
});
