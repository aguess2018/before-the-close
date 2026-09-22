/* ========================================
   BEFORE THE CLOSE
   APP LOGIC
======================================== */


/* ========================================
   DEV MODE
======================================== */

let devMode = false;
let devPrayerIndex = null;
let logoClickCount = 0;
let logoClickTimer = null;


/* ========================================
   HELPERS
======================================== */

function getDateString(date) {

    return (
        date.getFullYear()
        + "-"
        + (date.getMonth() + 1)
        + "-"
        + date.getDate()
    );
}


function getCurrentIndustry() {

    return document
        .getElementById("salesType")
        .value;
}


function getDailyPrayerIndex(
    salesType,
    selectedPrayers
) {

    const today =
        new Date();

    const dateString =
        getDateString(today);

    const seed =
        dateString
        + "-"
        + salesType;

    let hash = 0;

    for (
        let i = 0;
        i < seed.length;
        i++
    ) {

        hash =
            ((hash << 5) - hash)
            + seed.charCodeAt(i);

        hash |= 0;
    }

    return (
        Math.abs(hash)
        % selectedPrayers.length
    );
}


/* ========================================
   DAILY PRAYER
======================================== */

function getDailyPrayer() {

    const salesType =
        getCurrentIndustry();

    const selectedPrayers =
        prayers[salesType];


    if (
        !selectedPrayers
        ||
        selectedPrayers.length === 0
    ) {

        console.error(
            "No prayers found for:",
            salesType
        );

        return;
    }


    let prayerNumber;


    if (
        devMode
        &&
        devPrayerIndex !== null
    ) {

        prayerNumber =
            devPrayerIndex;

    }

    else {

        prayerNumber =
            getDailyPrayerIndex(
                salesType,
                selectedPrayers
            );

    }


    const todaysPrayer =
        selectedPrayers[
            prayerNumber
        ];


    document
        .getElementById(
            "prayerTitle"
        )
        .innerText =
        todaysPrayer.title;


    document
        .getElementById(
            "prayerText"
        )
        .innerText =
        todaysPrayer.text;


    updateFavoriteButton();

    updateDevPanel();
}


/* ========================================
   FAVORITES
======================================== */

function getFavorites() {

    const saved =
        localStorage.getItem(
            "favorites"
        );


    if (!saved) {

        return [];
    }


    try {

        const favorites =
            JSON.parse(saved);


        return favorites.map(
            function(item) {

                if (
                    typeof item
                    === "string"
                ) {

                    return {

                        text:
                            item,

                        title:
                            "Saved Prayer",

                        industry:
                            "general"

                    };

                }


                return item;

            }
        );

    }

    catch (error) {

        console.error(
            "Could not load favorites:",
            error
        );

        return [];
    }
}


function toggleFavorite() {

    const prayerText =
        document
            .getElementById(
                "prayerText"
            )
            .innerText;


    const prayerTitle =
        document
            .getElementById(
                "prayerTitle"
            )
            .innerText;


    const salesType =
        getCurrentIndustry();


    let favorites =
        getFavorites();


    const alreadySaved =
        favorites.some(
            function(item) {

                return (
                    item.text
                    === prayerText
                );

            }
        );


    if (alreadySaved) {

        favorites =
            favorites.filter(
                function(item) {

                    return (
                        item.text
                        !== prayerText
                    );

                }
            );

    }

    else {

        favorites.push({

            text:
                prayerText,

            title:
                prayerTitle,

            industry:
                salesType

        });

    }


    localStorage.setItem(

        "favorites",

        JSON.stringify(
            favorites
        )

    );


    updateFavoriteButton();
}


function updateFavoriteButton() {

    const button =
        document
            .getElementById(
                "favoriteButton"
            );


    if (!button) {

        return;
    }


    const prayerText =
        document
            .getElementById(
                "prayerText"
            )
            .innerText;


    const favorites =
        getFavorites();


    const alreadySaved =
        favorites.some(
            function(item) {

                return (
                    item.text
                    === prayerText
                );

            }
        );


    if (alreadySaved) {

        button.innerText =
            "♥ Saved";

        button.classList.add(
            "saved"
        );

    }

    else {

        button.innerText =
            "♡ Save Prayer";

        button.classList.remove(
            "saved"
        );

    }
}


/* ========================================
   DISPLAY FAVORITES
======================================== */

function displayFavorites() {

    const favorites =
        getFavorites();


    const list =
        document
            .getElementById(
                "favoritesList"
            );


    list.innerHTML = "";


    if (
        favorites.length === 0
    ) {

        list.innerHTML = `
            <div class="empty-favorites">
                ♡
                <br><br>
                You haven't saved any prayers yet.
                <br>
                When one speaks to you, save it here.
            </div>
        `;

        return;
    }


    favorites.forEach(
        function(
            item,
            index
        ) {

            const card =
                document
                    .createElement(
                        "div"
                    );


            card.className =
                "favorite-card";


            const industry =
                document
                    .createElement(
                        "div"
                    );


            industry.className =
                "favorite-industry";


            industry.innerText =
                industryNames[
                    item.industry
                ]
                ||
                "🙏 SAVED PRAYER";


            const title =
                document
                    .createElement(
                        "div"
                    );


            title.className =
                "favorite-title";


            title.innerText =
                item.title;


            const text =
                document
                    .createElement(
                        "p"
                    );


            text.innerText =
                item.text;


            const removeButton =
                document
                    .createElement(
                        "button"
                    );


            removeButton.className =
                "remove-favorite";


            removeButton.innerText =
                "♡ Remove from Favorites";


            removeButton.onclick =
                function() {

                    removeFavorite(
                        index
                    );

                };


            card.appendChild(
                industry
            );

            card.appendChild(
                title
            );

            card.appendChild(
                text
            );

            card.appendChild(
                removeButton
            );


            list.appendChild(
                card
            );

        }
    );
}


function removeFavorite(index) {

    let favorites =
        getFavorites();


    favorites.splice(
        index,
        1
    );


    localStorage.setItem(

        "favorites",

        JSON.stringify(
            favorites
        )

    );


    displayFavorites();

    updateFavoriteButton();
}


/* ========================================
   DAILY STREAK
======================================== */

function updateStreak() {

    const today =
        new Date();


    const todayString =
        getDateString(today);


    const lastVisit =
        localStorage.getItem(
            "lastVisit"
        );


    let streak =
        parseInt(
            localStorage.getItem(
                "streak"
            )
        )
        || 0;


    if (!lastVisit) {

        streak = 1;

    }

    else if (
        lastVisit
        === todayString
    ) {

        // Already counted today.

    }

    else {

        const yesterday =
            new Date();


        yesterday.setDate(
            yesterday.getDate() - 1
        );


        const yesterdayString =
            getDateString(
                yesterday
            );


        if (
            lastVisit
            === yesterdayString
        ) {

            streak++;

        }

        else {

            streak = 1;

        }
    }


    localStorage.setItem(
        "streak",
        streak
    );


    localStorage.setItem(
        "lastVisit",
        todayString
    );


    document
        .getElementById(
            "streakNumber"
        )
        .innerText =
        streak;
}


/* ========================================
   PERSONALIZED GREETING
======================================== */

function updateWelcome() {

    const name =
        localStorage.getItem(
            "userName"
        );


    const title =
        document
            .getElementById(
                "welcomeTitle"
            );


    if (!name) {

        title.innerText =
            "Start with purpose.";

        return;
    }


    const hour =
        new Date()
            .getHours();


    let greeting;


    if (
        hour < 12
    ) {

        greeting =
            "Good morning";

    }

    else if (
        hour < 17
    ) {

        greeting =
            "Good afternoon";

    }

    else {

        greeting =
            "Good evening";

    }


    title.innerText =
        greeting
        + ", "
        + name
        + ".";
}


/* ========================================
   SETTINGS
======================================== */

function loadSettings() {

    const savedName =
        localStorage.getItem(
            "userName"
        )
        || "";


    const savedIndustry =
        localStorage.getItem(
            "salesType"
        )
        || "general";


    document
        .getElementById(
            "userName"
        )
        .value =
        savedName;


    document
        .getElementById(
            "settingsSalesType"
        )
        .value =
        savedIndustry;
}


function saveSettings() {

    const name =
        document
            .getElementById(
                "userName"
            )
            .value
            .trim();


    const industry =
        document
            .getElementById(
                "settingsSalesType"
            )
            .value;


    localStorage.setItem(
        "userName",
        name
    );


    localStorage.setItem(
        "salesType",
        industry
    );


    document
        .getElementById(
            "salesType"
        )
        .value =
        industry;


    document
        .getElementById(
            "settingsSaved"
        )
        .innerText =
        "✓ Settings saved";


    /*
        Reset dev preview when
        switching industries.
    */

    devPrayerIndex = null;


    updateWelcome();

    getDailyPrayer();
}


/* ========================================
   NAVIGATION
======================================== */

function setActiveNav(activeNav) {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function(item) {

                item.classList.remove(
                    "active"
                );

            }
        );


    document
        .getElementById(
            activeNav
        )
        .classList.add(
            "active"
        );
}


function hideAllScreens() {

    document
        .getElementById(
            "todayScreen"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "favoritesScreen"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "settingsScreen"
        )
        .style.display =
        "none";
}


function showToday() {

    hideAllScreens();


    document
        .getElementById(
            "todayScreen"
        )
        .style.display =
        "block";


    setActiveNav(
        "todayNav"
    );


    updateWelcome();

    getDailyPrayer();
}


function showFavorites() {

    hideAllScreens();


    document
        .getElementById(
            "favoritesScreen"
        )
        .style.display =
        "block";


    setActiveNav(
        "favoritesNav"
    );


    displayFavorites();
}


function showSettings() {

    hideAllScreens();


    document
        .getElementById(
            "settingsScreen"
        )
        .style.display =
        "block";


    setActiveNav(
        "settingsNav"
    );


    document
        .getElementById(
            "settingsSaved"
        )
        .innerText =
        "";


    loadSettings();
}


/* ========================================
   DEV MODE
======================================== */

function setupDevMode() {

    const brands =
        document.querySelectorAll(
            ".brand"
        );


    brands.forEach(
        function(brand) {

            brand.addEventListener(
                "click",
                function() {

                    logoClickCount++;


                    clearTimeout(
                        logoClickTimer
                    );


                    logoClickTimer =
                        setTimeout(
                            function() {

                                logoClickCount =
                                    0;

                            },
                            1500
                        );


                    if (
                        logoClickCount
                        >= 5
                    ) {

                        logoClickCount =
                            0;

                        toggleDevMode();

                    }

                }
            );

        }
    );
}


function toggleDevMode() {

    devMode =
        !devMode;


    if (devMode) {

        const salesType =
            getCurrentIndustry();

        const selectedPrayers =
            prayers[salesType];


        devPrayerIndex =
            getDailyPrayerIndex(
                salesType,
                selectedPrayers
            );


        createDevPanel();

        getDailyPrayer();

    }

    else {

        devPrayerIndex =
            null;


        const panel =
            document.getElementById(
                "devPanel"
            );


        if (panel) {

            panel.remove();

        }


        getDailyPrayer();
    }
}


function createDevPanel() {

    if (
        document.getElementById(
            "devPanel"
        )
    ) {

        return;
    }


    const panel =
        document.createElement(
            "div"
        );


    panel.id =
        "devPanel";


    panel.className =
        "dev-panel";


    panel.innerHTML = `

        <div class="dev-title">
            🛠 DEV MODE
        </div>

        <div
            class="dev-status"
            id="devStatus"
        >
        </div>

        <div class="dev-buttons">

            <button
                onclick="previousDevPrayer()"
            >
                ← Previous
            </button>

            <button
                onclick="nextDevPrayer()"
            >
                Next →
            </button>

        </div>

        <button
            class="dev-random"
            onclick="randomDevPrayer()"
        >
            🎲 Random Prayer
        </button>

        <button
            class="dev-exit"
            onclick="toggleDevMode()"
        >
            Exit Dev Mode
        </button>

    `;


    document
        .getElementById(
            "todayScreen"
        )
        .appendChild(
            panel
        );
}


function updateDevPanel() {

    if (!devMode) {

        return;
    }


    const status =
        document.getElementById(
            "devStatus"
        );


    if (!status) {

        return;
    }


    const salesType =
        getCurrentIndustry();


    const selectedPrayers =
        prayers[salesType];


    if (
        devPrayerIndex === null
    ) {

        devPrayerIndex =
            getDailyPrayerIndex(
                salesType,
                selectedPrayers
            );

    }


    status.innerText =
        industryNames[salesType]
        + " • Prayer "
        + (devPrayerIndex + 1)
        + " of "
        + selectedPrayers.length;
}


function nextDevPrayer() {

    const salesType =
        getCurrentIndustry();


    const selectedPrayers =
        prayers[salesType];


    if (
        devPrayerIndex === null
    ) {

        devPrayerIndex = 0;

    }

    else {

        devPrayerIndex =
            (
                devPrayerIndex + 1
            )
            %
            selectedPrayers.length;

    }


    getDailyPrayer();
}


function previousDevPrayer() {

    const salesType =
        getCurrentIndustry();


    const selectedPrayers =
        prayers[salesType];


    if (
        devPrayerIndex === null
    ) {

        devPrayerIndex = 0;

    }

    else {

        devPrayerIndex--;


        if (
            devPrayerIndex < 0
        ) {

            devPrayerIndex =
                selectedPrayers.length
                - 1;

        }
    }


    getDailyPrayer();
}


function randomDevPrayer() {

    const salesType =
        getCurrentIndustry();


    const selectedPrayers =
        prayers[salesType];


    devPrayerIndex =
        Math.floor(
            Math.random()
            *
            selectedPrayers.length
        );


    getDailyPrayer();
}


/* ========================================
   START APP
======================================== */

function startApp() {

    const savedIndustry =
        localStorage.getItem(
            "salesType"
        );


    if (
        savedIndustry
        &&
        prayers[
            savedIndustry
        ]
    ) {

        document
            .getElementById(
                "salesType"
            )
            .value =
            savedIndustry;

    }

    else {

        document
            .getElementById(
                "salesType"
            )
            .value =
            "general";

    }


    updateWelcome();

    updateStreak();

    setupDevMode();

    getDailyPrayer();
}


startApp();