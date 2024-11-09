let searchTimeout;
let openedTabs = [];
let stopSearchFlag = false;
let searches = [];
let currentSearchCount = 0;
let totalSearches = 0;

window.addEventListener("DOMContentLoaded", () => {
    const numSearchesInput = document.getElementById("numSearches");

    document.getElementById("instructionsBtn").addEventListener("click", () => {
        document.getElementById("instructionsPopup").style.display = "block";
    });

    document.getElementById("closeInstructions").addEventListener("click", () => {
        document.getElementById("instructionsPopup").style.display = "none";
    });
});

document.getElementById("numSearches").addEventListener("input", function () {
    const maxAllowed = 40;
    if (parseInt(this.value) > maxAllowed) {
        this.value = maxAllowed;
    }
});

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

const getRandomSearchTerm = (previousTerm) => {
    if (searches.length === 0) return null;

    let randomTerm;
    do {
        randomTerm = searches[Math.floor(Math.random() * searches.length)];
    } while (randomTerm === previousTerm);

    return randomTerm;
};

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

const performSearch = (query) => {
    const newTab = window.open(`https://www.bing.com/search?pglt=2083&q=${encodeURIComponent(query)}&FORM=ANNTA1&PC=U531`, '_blank');
    if (newTab) {
        openedTabs.push(newTab);
    } else {
        console.error("Could not open new tab");
    }
};

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

        const randomDelay = Math.random() * 5000 + 5000;
        searchTimeout = setTimeout(startSearch, randomDelay);
    };

    startSearch();
});

document.getElementById("stopSearches").addEventListener("click", () => {
    stopSearchFlag = true;
    if (searchTimeout) clearTimeout(searchTimeout);
    showLoader(`Searches stopped at ${currentSearchCount}/${totalSearches}`);
});

document.getElementById("closeTabs").addEventListener("click", () => {
    openedTabs.forEach(tab => tab.close());
    openedTabs = [];
    showLoader("All opened search tabs closed.");
});
function goToRewards() {
    window.open("https://rewards.microsoft.com", "_blank");
}
