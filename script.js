let searchTimeout;
let openedTabs = [];
let stopSearchFlag = false;
let searches = [];

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

// Function to get a random search term that isn’t immediately repeated
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

    setTimeout(() => {
        loaderContainer.style.display = "none";
    }, 5000);
};

// Instructions Pop-up Controls
document.getElementById("instructionsBtn").addEventListener("click", () => {
    document.getElementById("instructionsPopup").style.display = "block";
});

document.getElementById("closeInstructions").addEventListener("click", () => {
    document.getElementById("instructionsPopup").style.display = "none";
});

// Start searches button
document.getElementById("startSearches").addEventListener("click", async () => {
    if (searches.length === 0) {
        await fetchSearches();
    }

    const numSearches = Math.min(40, parseInt(document.getElementById("numSearches").value) || 34);
    showLoader(`Searches set to ${numSearches}.`);
    
    stopSearchFlag = false;
    let searchCount = 0;
    let lastSearchTerm = "";

    const startSearch = () => {
        if (stopSearchFlag || searchCount >= numSearches) {
            if (searchTimeout) clearTimeout(searchTimeout);
            if (searchCount > 0) {
                showLoader("All searches completed.");
            }
            return;
        }

        const query = getRandomSearchTerm(lastSearchTerm);
        if (query) {
            const url = `https://www.bing.com/search?pglt=2083&q=${encodeURIComponent(query)}&FORM=ANNTA1&PC=U531`;
            const newTab = window.open(url, '_blank');

            if (newTab) {
                openedTabs.push(newTab);
                lastSearchTerm = query;
                searchCount++;
            }
        }

        // Set a new random delay between 5 to 10 seconds for the next search
        const randomDelay = Math.random() * 5000 + 5000;
        searchTimeout = setTimeout(startSearch, randomDelay);
    };

    showLoader("Searches started.");
    startSearch(); // Start the first search immediately
});

// Stop searches button
document.getElementById("stopSearches").addEventListener("click", () => {
    stopSearchFlag = true;
    if (searchTimeout) clearTimeout(searchTimeout);
    showLoader("Searches stopped.");
});

// Close tabs button
document.getElementById("closeTabs").addEventListener("click", () => {
    openedTabs.forEach(tab => tab.close());
    openedTabs = [];
    showLoader("All opened search tabs closed.");
});
