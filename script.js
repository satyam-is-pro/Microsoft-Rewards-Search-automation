let searchInterval;
let openedTabs = [];
let stopSearchFlag = false;
let searches = [];

// Function to fetch search terms from the external file
const fetchSearches = async () => {
    try {
        const response = await fetch('searches.txt');
        if (!response.ok) throw new Error('Could not fetch searches');
        const text = await response.text();
        searches = text.split('\n').filter(term => term.trim() !== ''); // Split into lines and filter out empty ones
    } catch (error) {
        console.error('Error fetching search terms:', error);
        alert('Could not load search terms. Please check the searches.txt file.');
    }
};

// Function to get a random search term
const getRandomSearchTerm = (previousTerm) => {
    if (searches.length === 0) return null;

    let randomTerm;
    do {
        randomTerm = searches[Math.floor(Math.random() * searches.length)];
    } while (randomTerm === previousTerm); // Ensure we don't repeat the last search term

    return randomTerm;
};

// Start searches button
document.getElementById("startSearches").addEventListener("click", async () => {
    if (searches.length === 0) {
        await fetchSearches(); // Fetch searches if not already loaded
    }

    const numSearches = Math.min(40, parseInt(document.getElementById("numSearches").value) || 34);
    alert(`You have set ${numSearches} searches.`);

    stopSearchFlag = false;
    let searchCount = 0;
    let lastSearchTerm = ""; // Store the last search term

    const startSearch = () => {
        if (stopSearchFlag || searchCount >= numSearches) {
            clearInterval(searchInterval);
            if (searchCount > 0) { // Only alert if at least one search has been completed
                alert("All searches completed.");
            }
            return;
        }

        const query = getRandomSearchTerm(lastSearchTerm);
        if (query) {
            const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            const newTab = window.open(url, '_blank');

            if (newTab) {
                openedTabs.push(newTab);
                lastSearchTerm = query; // Update last search term
                searchCount++;
            }
        }
    };

    // Use a random interval between 5 to 10 seconds for each search
    searchInterval = setInterval(startSearch, Math.random() * (5000) + 5000);
});

// Stop searches button
document.getElementById("stopSearches").addEventListener("click", () => {
    stopSearchFlag = true;
    clearInterval(searchInterval);
    openedTabs.forEach(tab => tab.close());
    openedTabs = [];
    alert("Searches stopped and all tabs closed.");
});

// Close tabs button
document.getElementById("closeTabs").addEventListener("click", () => {
    openedTabs.forEach(tab => tab.close());
    openedTabs = [];
    alert("All opened search tabs closed.");
});
