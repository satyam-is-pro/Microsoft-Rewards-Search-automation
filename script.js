let searchTimeout;
let openedTabs = [];
let stopSearchFlag = false;
let searches = [];
let currentSearchCount = 0;
let totalSearches = 0;
let isBingApp = false;

// Detect if running in Bing app by checking user agent
function checkIfBingApp() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('edg/') || userAgent.includes('edge/');
}

// Limit the search input field to a maximum of 40
document.getElementById("numSearches").addEventListener("input", function () {
    const maxAllowed = 40;
    if (parseInt(this.value) > maxAllowed) {
        this.value = maxAllowed;
    }
});

// Function to fetch search terms from searches.txt
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

// Function to get a random search term that isn't immediately repeated
const getRandomSearchTerm = (previousTerm) => {
    if (searches.length === 0) return null;

    let randomTerm;
    do {
        randomTerm = searches[Math.floor(Math.random() * searches.length)];
    } while (randomTerm === previousTerm);

    return randomTerm;
};

// Function to show and animate the line loader with a message
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

// Instructions Pop-up Controls
document.getElementById("instructionsBtn").addEventListener("click", () => {
    document.getElementById("instructionsPopup").style.display = "block";
});

document.getElementById("closeInstructions").addEventListener("click", () => {
    document.getElementById("instructionsPopup").style.display = "none";
});

// Function to perform search based on environment
const performSearch = (query) => {
    if (isBingApp) {
        window.location.href = `https://www.bing.com/search?pglt=2083&q=${encodeURIComponent(query)}&FORM=ANNTA1&PC=U531`;
    } else {
        const newTab = window.open(`https://www.bing.com/search?pglt=2083&q=${encodeURIComponent(query)}&FORM=ANNTA1&PC=U531`, '_blank');
        if (newTab) {
            openedTabs.push(newTab);
        }
    }
};

// Start searches button
document.getElementById("startSearches").addEventListener("click", async () => {
    if (searches.length === 0) {
        await fetchSearches();
    }

    isBingApp = checkIfBingApp();
    totalSearches = Math.min(40, parseInt(document.getElementById("numSearches").value) || 34);
    currentSearchCount = 0;
    showLoader(`Starting searches: 0/${totalSearches} completed`);
    
    stopSearchFlag = false;
    let lastSearchTerm = "";

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

        const randomDelay = Math.random() * 5000 + 5000;
        searchTimeout = setTimeout(startSearch, randomDelay);
    };

    showLoader(`Searches started: 0/${totalSearches}`);
    startSearch();
});

// Stop searches button
document.getElementById("stopSearches").addEventListener("click", () => {
    stopSearchFlag = true;
    if (searchTimeout) clearTimeout(searchTimeout);
    showLoader(`Searches stopped at ${currentSearchCount}/${totalSearches}`);
});

// Close tabs button
document.getElementById("closeTabs").addEventListener("click", () => {
    if (!isBingApp) {
        openedTabs.forEach(tab => tab.close());
        openedTabs = [];
        showLoader("All opened search tabs closed.");
    } else {
        showLoader("Tab closing not available in Bing app mode.");
    }
});
