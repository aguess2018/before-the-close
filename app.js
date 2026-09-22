/* ========================================
   BEFORE THE CLOSE
   APP.JS
======================================== */


/* ========================================
   APP STATE
======================================== */

let devMode = false;
let devPrayerIndex = null;
let logoClickCount = 0;
let logoClickTimer = null;

let feedbackRating = 0;

let activePrayerMode = null;
let activeModePrayerIndex = 0;
let modePrayerQueues = {};


/* ========================================
   PRAYER MODE INFORMATION
======================================== */

const prayerModeInfo = {

    approach: {
        heading: "Before the Approach",
        subtitle: "Walk into the next opportunity with purpose.",
        icon: "🚶"
    },

    rejection: {
        heading: "After Rejection",
        subtitle: "Leave the last answer behind you.",
        icon: "💪"
    },

    close: {
        heading: "Before the Close",
        subtitle: "You've done the work. Ask with confidence.",
        icon: "🤝"
    },

    roughDay: {
        heading: "Rough Day",
        subtitle: "Reset your mind and finish with purpose.",
        icon: "🌧️"
    }

};


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

    const today = new Date();

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

                /*
                    Support favorites from
                    older app versions.
                */

                if (
                    typeof item
                    === "string"
                ) {

                    return {
                        text: item,
                        title: "Saved Prayer",
                        industry: "general"
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
                salesType,

            mode:
                "daily"

        });

    }


    saveFavorites(
        favorites
    );


    updateFavoriteButton();
}


function saveFavorites(
    favorites
) {

    localStorage.setItem(

        "favorites",

        JSON.stringify(
            favorites
        )

    );
}


function updateFavoriteButton() {

    const button =
        document.getElementById(
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
        document.getElementById(
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
                document.createElement(
                    "div"
                );


            card.className =
                "favorite-card";


            const industry =
                document.createElement(
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
                document.createElement(
                    "div"
                );


            title.className =
                "favorite-title";


            title.innerText =
                item.title;


            const text =
                document.createElement(
                    "p"
                );


            text.innerText =
                item.text;


            const removeButton =
                document.createElement(
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

            const shareButton =
                document.createElement(
                    "button"
                );

            shareButton.className =
                "share-favorite";

            shareButton.innerText =
                "↗ Share Prayer";

            shareButton.onclick =
                function() {
                    btcSharePrayer(
                        item.title,
                        item.text
                    );
                };


            const favoriteActions =
                document.createElement(
                    "div"
                );

            favoriteActions.className =
                "favorite-actions";

            favoriteActions.appendChild(
                shareButton
            );

            favoriteActions.appendChild(
                removeButton
            );

            card.appendChild(
                favoriteActions
            );


            list.appendChild(
                card
            );

        }
    );
}


function removeFavorite(
    index
) {

    let favorites =
        getFavorites();


    favorites.splice(
        index,
        1
    );


    saveFavorites(
        favorites
    );


    displayFavorites();

    updateFavoriteButton();

    updateModeFavoriteButton();
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

        /*
            Already counted today.
        */

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
        document.getElementById(
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

    devPrayerIndex =
        null;


    updateWelcome();

    getDailyPrayer();
}


/* ========================================
   NAVIGATION
======================================== */

function setActiveNav(
    activeNav
) {

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

    const screens = [

        "todayScreen",

        "favoritesScreen",

        "settingsScreen",

        "prayerModeScreen",

        "journeyScreen"

    ];


    screens.forEach(
        function(screenId) {

            const screen =
                document.getElementById(
                    screenId
                );


            if (screen) {

                screen.style.display =
                    "none";

            }

        }
    );
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
   PRAYER MODES
======================================== */

function getModePrayerList(
    mode
) {

    const industry =
        getCurrentIndustry();


    /*
        Use industry-specific prayers
        whenever they exist.
    */

    if (
        typeof modePrayers !== "undefined"
        &&
        modePrayers[industry]
        &&
        modePrayers[industry][mode]
        &&
        modePrayers[industry][mode].length
    ) {

        return modePrayers[
            industry
        ][mode];

    }


    /*
        Otherwise use the General
        Sales prayer library.
    */

    if (
        typeof modePrayers !== "undefined"
        &&
        modePrayers.general
        &&
        modePrayers.general[mode]
    ) {

        return modePrayers
            .general[
                mode
            ];

    }


    return [];
}


function getModeQueueKey(mode) {
    return getCurrentIndustry() + "-" + mode;
}

function refillModePrayerQueue(mode, prayerList) {
    const key = getModeQueueKey(mode);
    const indexes = prayerList.map(function(_, index) { return index; });

    for (let i = indexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }

    if (indexes.length > 1 && indexes[indexes.length - 1] === activeModePrayerIndex) {
        [indexes[0], indexes[indexes.length - 1]] = [indexes[indexes.length - 1], indexes[0]];
    }

    modePrayerQueues[key] = indexes;
}

function getNextModePrayerIndex(mode, prayerList) {
    const key = getModeQueueKey(mode);
    if (!modePrayerQueues[key] || modePrayerQueues[key].length === 0) {
        refillModePrayerQueue(mode, prayerList);
    }
    return modePrayerQueues[key].pop();
}


function openPrayerMode(
    mode
) {

    const prayerList =
        getModePrayerList(
            mode
        );


    if (
        prayerList.length === 0
    ) {

        console.error(
            "No mode prayers found for:",
            mode
        );

        return;
    }


    activePrayerMode =
        mode;


    activeModePrayerIndex = getNextModePrayerIndex(mode, prayerList);


    hideAllScreens();


    const screen =
        document.getElementById(
            "prayerModeScreen"
        );


    if (!screen) {

        console.error(
            "Prayer Mode screen not found."
        );

        return;
    }


    screen.style.display =
        "block";


    /*
        Remove bottom nav highlight
        while inside a prayer mode.
    */

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


    renderPrayerMode();


    window.scrollTo(
        0,
        0
    );
}


function renderPrayerMode() {

    incrementJourneyPrayerCount();

    if (!activePrayerMode) {

        return;
    }


    const info =
        prayerModeInfo[
            activePrayerMode
        ];


    const prayerList =
        getModePrayerList(
            activePrayerMode
        );


    if (
        !info
        ||
        prayerList.length === 0
    ) {

        return;
    }


    const prayer =
        prayerList[
            activeModePrayerIndex
        ];


    document
        .getElementById(
            "modeHeading"
        )
        .innerText =
        info.heading;


    document
        .getElementById(
            "modeSubtitle"
        )
        .innerText =
        info.subtitle;


    document
        .getElementById(
            "modeIcon"
        )
        .innerText =
        info.icon;


    document
        .getElementById(
            "modePrayerTitle"
        )
        .innerText =
        prayer.title;


    document
        .getElementById(
            "modePrayerText"
        )
        .innerText =
        prayer.text;


    const industry =
        getCurrentIndustry();


    const industryLabel =
        industryNames[
            industry
        ]
        ||
        "Sales";


    document
        .getElementById(
            "modeIndustryLabel"
        )
        .innerText =
        industryLabel
        + " • Prayer for right now";


    updateModeFavoriteButton();
}


function giveAnotherModePrayer() {
    if (!activePrayerMode) return;

    const prayerList = getModePrayerList(activePrayerMode);
    if (prayerList.length <= 1) return;

    activeModePrayerIndex =
        getNextModePrayerIndex(activePrayerMode, prayerList);

    renderPrayerMode();
}


function closePrayerMode() {

    activePrayerMode =
        null;


    showToday();


    window.scrollTo(
        0,
        0
    );
}


/* ========================================
   PRAYER MODE FAVORITES
======================================== */

function toggleModeFavorite() {

    if (!activePrayerMode) {

        return;
    }


    const prayerText =
        document
            .getElementById(
                "modePrayerText"
            )
            .innerText;


    const prayerTitle =
        document
            .getElementById(
                "modePrayerTitle"
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
                salesType,

            mode:
                activePrayerMode

        });

    }


    saveFavorites(
        favorites
    );


    updateModeFavoriteButton();
}


function updateModeFavoriteButton() {

    const button =
        document.getElementById(
            "modeFavoriteButton"
        );


    if (
        !button
        ||
        !activePrayerMode
    ) {

        return;
    }


    const prayerTextElement =
        document.getElementById(
            "modePrayerText"
        );


    if (!prayerTextElement) {

        return;
    }


    const prayerText =
        prayerTextElement.innerText;


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
   TESTER FEEDBACK
======================================== */

function openFeedback() {

    const overlay =
        document.getElementById(
            "feedbackOverlay"
        );


    if (!overlay) {

        return;
    }


    const savedName =
        localStorage.getItem(
            "userName"
        );


    if (savedName) {

        document
            .getElementById(
                "feedbackName"
            )
            .value =
            savedName;

    }


    document
        .getElementById(
            "feedbackError"
        )
        .innerText =
        "";


    overlay.classList.add(
        "open"
    );


    document.body.style.overflow =
        "hidden";
}


function closeFeedback() {

    const overlay =
        document.getElementById(
            "feedbackOverlay"
        );


    if (!overlay) {

        return;
    }


    overlay.classList.remove(
        "open"
    );


    document.body.style.overflow =
        "";
}


function handleFeedbackOverlay(
    event
) {

    if (
        event.target.id
        === "feedbackOverlay"
    ) {

        closeFeedback();

    }
}


function setFeedbackRating(
    rating
) {

    feedbackRating =
        rating;


    const buttons =
        document.querySelectorAll(
            "#ratingButtons button"
        );


    buttons.forEach(
        function(
            button,
            index
        ) {

            if (
                index + 1
                === rating
            ) {

                button.classList.add(
                    "selected"
                );

            }

            else {

                button.classList.remove(
                    "selected"
                );

            }

        }
    );
}


function submitFeedback() {

    const type =
        document
            .getElementById(
                "feedbackType"
            )
            .value;


    const name =
        document
            .getElementById(
                "feedbackName"
            )
            .value
            .trim();


    const message =
        document
            .getElementById(
                "feedbackMessage"
            )
            .value
            .trim();


    const error =
        document.getElementById(
            "feedbackError"
        );


    if (!message) {

        error.innerText =
            "Tell us a little about your feedback first.";

        return;
    }


    error.innerText =
        "";


    const industry =
        getCurrentIndustry();


    const industryName =
        industryNames[
            industry
        ]
        ||
        industry;


    const ratingText =
        feedbackRating
        ?
        feedbackRating
        + "/5"
        :
        "Not provided";


    const testerName =
        name
        ||
        "Anonymous tester";


    const subject =
        "Before the Close - "
        + type;


    const body =

        "BEFORE THE CLOSE TESTER FEEDBACK"
        + "\n\n"

        + "Type: "
        + type
        + "\n"

        + "Rating: "
        + ratingText
        + "\n"

        + "Tester: "
        + testerName
        + "\n"

        + "Sales Industry: "
        + industryName
        + "\n\n"

        + "FEEDBACK"
        + "\n"

        + "--------------------"
        + "\n"

        + message
        + "\n\n"

        + "--------------------"
        + "\n"

        + "Sent from Before the Close";


    const mailto =
        "mailto:beforetheclose@gmail.com"
        + "?subject="
        + encodeURIComponent(
            subject
        )
        + "&body="
        + encodeURIComponent(
            body
        );


    window.location.href =
        mailto;
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
            prayers[
                salesType
            ];


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
        prayers[
            salesType
        ];


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
        industryNames[
            salesType
        ]
        + " • Prayer "
        + (devPrayerIndex + 1)
        + " of "
        + selectedPrayers.length;
}


function nextDevPrayer() {

    const salesType =
        getCurrentIndustry();


    const selectedPrayers =
        prayers[
            salesType
        ];


    if (
        devPrayerIndex === null
    ) {

        devPrayerIndex =
            0;

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
        prayers[
            salesType
        ];


    if (
        devPrayerIndex === null
    ) {

        devPrayerIndex =
            0;

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
        prayers[
            salesType
        ];


    devPrayerIndex =
        Math.floor(
            Math.random()
            *
            selectedPrayers.length
        );


    getDailyPrayer();
}


/* ========================================
   KEYBOARD CONTROLS
======================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key
            === "Escape"
        ) {

            const feedbackOverlay =
                document.getElementById(
                    "feedbackOverlay"
                );


            if (
                feedbackOverlay
                &&
                feedbackOverlay.classList
                    .contains("open")
            ) {

                closeFeedback();

                return;
            }


            if (
                activePrayerMode
            ) {

                closePrayerMode();

            }

        }

    }
);


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

/* ========================================
   BETA v0.4 — DAILY CHECK-IN + JOURNEY
======================================== */
const BTC_STATS_KEY = "btcJourneyStats";
const BTC_CHECKIN_KEY = "btcDailyCheckins";

function btcTodayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

function getJourneyStats() {
    try { return JSON.parse(localStorage.getItem(BTC_STATS_KEY)) || { prayersOpened:0 }; }
    catch (_) { return { prayersOpened:0 }; }
}

function saveJourneyStats(stats) {
    localStorage.setItem(BTC_STATS_KEY, JSON.stringify(stats));
}

function getDailyCheckins() {
    try { return JSON.parse(localStorage.getItem(BTC_CHECKIN_KEY)) || {}; }
    catch (_) { return {}; }
}

function saveDailyCheckin(mood) {
    const checkins=getDailyCheckins();
    checkins[btcTodayKey()]=mood;
    localStorage.setItem(BTC_CHECKIN_KEY,JSON.stringify(checkins));
    renderDailyCheckin();
    renderJourney();
}

function renderDailyCheckin() {
    const mood=getDailyCheckins()[btcTodayKey()];
    const responses={
        locked:"You’re locked in. Keep the confidence, stay humble, and serve the person in front of you.",
        good:"Carry that good energy into the work today. Stay present and use it well.",
        here:"Showing up still counts. Focus on the next useful action—not the entire day at once.",
        struggling:"You don’t have to feel unstoppable to keep moving. Slow it down and win the next small moment."
    };
    document.querySelectorAll(".checkin-btn").forEach(btn => btn.classList.toggle("selected",btn.dataset.mood===mood));
    const box=document.getElementById("checkinResponse");
    if(box && mood){ box.textContent=responses[mood]; box.hidden=false; }
}

function getFavoriteCountForJourney() {
    try {
        const parsed=JSON.parse(localStorage.getItem("favorites") || "[]");
        if(Array.isArray(parsed)) return parsed.length;
        if(parsed && typeof parsed==="object") return Object.keys(parsed).length;
    } catch(_){}
    return 0;
}

function getDisplayedStreak() {
    const el=document.getElementById("streakNumber");
    const n=el ? parseInt(el.textContent,10) : 0;
    return Number.isFinite(n) ? n : 0;
}

function incrementJourneyPrayerCount() {
    const stats=getJourneyStats();
    stats.prayersOpened=(stats.prayersOpened||0)+1;
    saveJourneyStats(stats);
}

function renderJourney() {
    const checkins=getDailyCheckins();
    const stats=getJourneyStats();
    const streak=getDisplayedStreak();
    const checkinCount=Object.keys(checkins).length;
    const prayers=stats.prayersOpened||0;
    const favorites=getFavoriteCountForJourney();

    const set=(id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
    set("journeyStreak",streak);
    set("journeyCheckins",checkinCount);
    set("journeyPrayers",prayers);
    set("journeyFavorites",favorites);

    const achievements=[
        ["🌱","First Check-In","Complete your first daily check-in",checkinCount>=1],
        ["🔥","7 Days Showing Up","Reach a 7-day streak",streak>=7],
        ["🙏","30 Prayers Read","Open 30 situational prayers",prayers>=30],
        ["⭐","Saved for Later","Favorite at least 5 prayers",favorites>=5],
        ["🏆","100 Prayers Read","Open 100 situational prayers",prayers>=100],
        ["📅","Five-Day Week","Check in on 5 days in one week",btcWeekDates().filter(d=>checkins[btcLocalDateKey(d)]).length>=5],
        ["💯","250 Prayers Read","Open 250 situational prayers",prayers>=250]
    ];
    const list=document.getElementById("achievementList");
    if(list) list.innerHTML=achievements.map(a =>
        '<div class="achievement '+(a[3]?'unlocked':'')+'"><div class="achievement-icon">'+a[0]+'</div><div class="achievement-copy"><strong>'+a[1]+'</strong><span>'+a[2]+(a[3]?' • Unlocked':'')+'</span></div></div>'
    ).join("");
}

function showJourney() {
    hideAllScreens();
    const screen=document.getElementById("journeyScreen");
    if(screen) screen.style.display="block";
    setActiveNav("journeyNav");
    renderJourney();
    window.scrollTo(0,0);
}

document.addEventListener("DOMContentLoaded",function(){
    renderDailyCheckin();
    renderJourney();
});


/* ========================================
   BETA v0.5 — WEEKLY CHALLENGE + ACTIVITY
======================================== */
function btcLocalDateKey(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth()+1).padStart(2,"0") + "-" +
        String(date.getDate()).padStart(2,"0");
}

function btcStartOfWeek(date) {
    const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
    const day=d.getDay();
    const diff=(day===0 ? -6 : 1-day);
    d.setDate(d.getDate()+diff);
    return d;
}

function btcWeekDates() {
    const start=btcStartOfWeek(new Date());
    return Array.from({length:7},(_,i)=>{
        const d=new Date(start);
        d.setDate(start.getDate()+i);
        return d;
    });
}

function renderWeeklyChallenge() {
    const checkins=getDailyCheckins();
    const dates=btcWeekDates();
    const labels=["M","T","W","T","F","S","S"];
    const completed=dates.filter(d=>checkins[btcLocalDateKey(d)]).length;
    const goal=5;

    const badge=document.getElementById("weeklyChallengeBadge");
    const fill=document.getElementById("weeklyChallengeFill");
    const days=document.getElementById("weeklyChallengeDays");
    const title=document.getElementById("weeklyChallengeTitle");
    const copy=document.getElementById("weeklyChallengeCopy");

    if(badge) badge.textContent=Math.min(completed,goal)+" / "+goal;
    if(fill) fill.style.width=Math.min(100,(completed/goal)*100)+"%";
    if(title) title.textContent=completed>=goal ? "Challenge Complete" : "Show Up 5 Days";
    if(copy) copy.textContent=completed>=goal
        ? "You showed up at least 5 days this week. Keep the momentum going."
        : "Complete a daily check-in on 5 different days this week.";

    if(days) {
        days.innerHTML=dates.map((d,i)=>{
            const done=!!checkins[btcLocalDateKey(d)];
            return '<div class="challenge-day '+(done?'done':'')+'">'+labels[i]+'<strong>'+(done?'✓':'•')+'</strong></div>';
        }).join("");
    }
}

function btcLastSevenDates() {
    const today=new Date();
    return Array.from({length:7},(_,i)=>{
        const d=new Date(today.getFullYear(),today.getMonth(),today.getDate());
        d.setDate(d.getDate()-(6-i));
        return d;
    });
}

function renderRecentActivity() {
    const checkins=getDailyCheckins();
    const dates=btcLastSevenDates();
    const labels=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const week=document.getElementById("activityWeek");
    const summary=document.getElementById("activitySummary");
    const active=dates.filter(d=>checkins[btcLocalDateKey(d)]).length;

    if(week) {
        week.innerHTML=dates.map(d=>{
            const on=!!checkins[btcLocalDateKey(d)];
            return '<div class="activity-day '+(on?'active':'')+'">'+labels[d.getDay()]+'<strong>'+d.getDate()+'</strong><div class="activity-dot"></div></div>';
        }).join("");
    }
    if(summary) {
        summary.textContent=active===0
            ? "No check-ins in the last 7 days yet. Today can be day one."
            : "You checked in "+active+" of the last 7 days.";
    }
}

/* Extend Journey rendering without replacing the stable v0.4 function. */
const btcV04RenderJourney = renderJourney;
renderJourney = function() {
    btcV04RenderJourney();
    renderWeeklyChallenge();
    renderRecentActivity();
};


/* ========================================
   BETA v0.6 — SHARE + PRAYER HISTORY
======================================== */
const BTC_HISTORY_KEY = "btcPrayerHistory";
const BTC_HISTORY_LIMIT = 20;

function btcGetHistory() {
    try { return JSON.parse(localStorage.getItem(BTC_HISTORY_KEY)) || []; }
    catch (_) { return []; }
}

function btcSaveHistory(items) {
    localStorage.setItem(BTC_HISTORY_KEY, JSON.stringify(items.slice(0,BTC_HISTORY_LIMIT)));
}

function btcRecordPrayer(title,text,type) {
    if(!title || !text) return;
    let items=btcGetHistory();
    const key=(type||"prayer")+"|"+title+"|"+text;
    items=items.filter(item=>item.key!==key);
    items.unshift({
        key:key,
        title:title,
        text:text,
        type:type||"Prayer",
        viewedAt:new Date().toISOString()
    });
    btcSaveHistory(items);
}

function btcEscapeHtml(value) {
    return String(value).replace(/[&<>"']/g,function(ch){
        return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch];
    });
}

function renderPrayerHistory() {
    const list=document.getElementById("prayerHistoryList");
    if(!list) return;
    const items=btcGetHistory();
    if(!items.length) {
        list.innerHTML='<div class="history-empty">Your recently read prayers will appear here.</div>';
        return;
    }
    list.innerHTML=items.map(item=>{
        const d=new Date(item.viewedAt);
        const stamp=d.toLocaleDateString(undefined,{month:"short",day:"numeric"});
        return '<div class="history-item"><div class="history-item-top"><strong>'+btcEscapeHtml(item.title)+'</strong><small>'+btcEscapeHtml(item.type)+' • '+stamp+'</small></div><p>'+btcEscapeHtml(item.text)+'</p></div>';
    }).join("");
}

function clearPrayerHistory() {
    localStorage.removeItem(BTC_HISTORY_KEY);
    renderPrayerHistory();
}

async function btcSharePrayer(title,text) {
    if(!title || !text) return;
    const shareText="BEFORE THE CLOSE\nFaith • Focus • Purpose\n\n"+title+"\n\n"+text+"\n\nBefore the Close · Built for people who sell with purpose";
    try {
        if(navigator.share) {
            await navigator.share({title:"Before the Close — "+title,text:shareText});
            return;
        }
        if(navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareText);
            alert("Prayer copied to your clipboard.");
            return;
        }
    } catch(err) {
        if(err && err.name==="AbortError") return;
    }
    window.prompt("Copy this prayer:",shareText);
}

function btcEnsureShareButton(container,titleGetter,textGetter) {
    if(!container || container.querySelector(".btc-share-btn")) return;
    const btn=document.createElement("button");
    btn.className="btc-share-btn";
    btn.type="button";
    btn.textContent="↗ Share Prayer";
    btn.addEventListener("click",()=>btcSharePrayer(titleGetter(),textGetter()));
    container.appendChild(btn);
}

function btcInstallShareButtons() {
    /* Prayer Mode uses known v0.3 IDs. */
    const modeText=document.getElementById("modePrayerText");
    const modeTitle=document.getElementById("modePrayerTitle");
    if(modeText && modeTitle) {
        const container=modeText.parentElement;
        btcEnsureShareButton(container,()=>modeTitle.textContent.trim(),()=>modeText.textContent.trim());
    }

    /* Daily prayer: find the title/text elements already used by the stable app. */
    const titleCandidates=["prayerTitle","dailyPrayerTitle"];
    const textCandidates=["prayerText","dailyPrayerText"];
    let title=null,text=null;
    titleCandidates.some(id=>(title=document.getElementById(id)));
    textCandidates.some(id=>(text=document.getElementById(id)));
    if(title && text) {
        btcEnsureShareButton(text.parentElement,()=>title.textContent.trim(),()=>text.textContent.trim());
    }
}

/* Extend stable Journey renderer. */
const btcV05RenderJourney = renderJourney;
renderJourney = function() {
    btcV05RenderJourney();
    renderPrayerHistory();
};

document.addEventListener("DOMContentLoaded",function(){
    btcInstallShareButtons();

    /* Record the daily prayer once its existing renderer has populated the DOM. */
    setTimeout(function(){
        const title=document.getElementById("prayerTitle") || document.getElementById("dailyPrayerTitle");
        const text=document.getElementById("prayerText") || document.getElementById("dailyPrayerText");
        if(title && text) btcRecordPrayer(title.textContent.trim(),text.textContent.trim(),"Daily");
    },250);
});

document.addEventListener("DOMContentLoaded",function(){
    const modeText=document.getElementById("modePrayerText");
    const modeTitle=document.getElementById("modePrayerTitle");
    if(modeText && modeTitle) {
        const observer=new MutationObserver(function(){
            const title=modeTitle.textContent.trim();
            const text=modeText.textContent.trim();
            if(title && text) btcRecordPrayer(title,text,"Prayer Mode");
        });
        observer.observe(modeText,{childList:true,subtree:true,characterData:true});
    }
});


/* ========================================
   BETA v0.7 — WEEKLY GOALS + INTENTIONS
======================================== */
const BTC_FOCUS_KEY="btcWeeklyFocus";

function btcWeekKey() {
    const start=btcStartOfWeek(new Date());
    return btcLocalDateKey(start);
}

function getWeeklyFocus() {
    try {
        const saved=JSON.parse(localStorage.getItem(BTC_FOCUS_KEY));
        if(!saved || saved.weekKey!==btcWeekKey()) return null;
        return saved;
    } catch(_) { return null; }
}

function openFocusEditor() {
    const focus=getWeeklyFocus();
    const modal=document.getElementById("focusModal");
    const type=document.getElementById("goalType");
    const custom=document.getElementById("customGoalType");
    const target=document.getElementById("goalTarget");
    const intention=document.getElementById("weeklyIntention");
    if(focus) {
        const standard=["Appointments","Closes","Doors Knocked","Calls","Follow-Ups","Demos","Quotes"];
        type.value=standard.includes(focus.type)?focus.type:"Custom";
        custom.value=standard.includes(focus.type)?"":focus.type;
        target.value=focus.target;
        intention.value=focus.intention||"";
    }
    toggleCustomGoal();
    modal.hidden=false;
    document.body.style.overflow="hidden";
}

function closeFocusEditor() {
    const modal=document.getElementById("focusModal");
    if(modal) modal.hidden=true;
    document.body.style.overflow="";
}

function toggleCustomGoal() {
    const type=document.getElementById("goalType");
    const wrap=document.getElementById("customGoalWrap");
    if(type && wrap) wrap.hidden=type.value!=="Custom";
}

function useIntentionSuggestion(text) {
    const box=document.getElementById("weeklyIntention");
    if(box) box.value=text;
}

function saveWeeklyFocus() {
    const select=document.getElementById("goalType");
    const custom=document.getElementById("customGoalType");
    const targetEl=document.getElementById("goalTarget");
    const intentionEl=document.getElementById("weeklyIntention");
    let type=select.value==="Custom" ? custom.value.trim() : select.value;
    const target=parseInt(targetEl.value,10);
    const intention=intentionEl.value.trim();

    if(!type) { alert("Give your goal a name."); return; }
    if(!Number.isFinite(target) || target<1) { alert("Set a weekly target of at least 1."); return; }

    const old=getWeeklyFocus();
    const focus={
        weekKey:btcWeekKey(),
        type:type.slice(0,28),
        target:Math.min(target,9999),
        progress:old && old.type===type && old.target===target ? old.progress||0 : 0,
        intention:intention.slice(0,140)
    };
    localStorage.setItem(BTC_FOCUS_KEY,JSON.stringify(focus));
    closeFocusEditor();
    renderWeeklyFocus();
    renderJourneyGoal();
}

function changeGoalProgress(amount) {
    const focus=getWeeklyFocus();
    if(!focus) return;
    focus.progress=Math.max(0,Math.min(focus.target,(focus.progress||0)+amount));
    localStorage.setItem(BTC_FOCUS_KEY,JSON.stringify(focus));
    renderWeeklyFocus();
    renderJourneyGoal();
}

function renderWeeklyFocus() {
    const focus=getWeeklyFocus();
    const empty=document.getElementById("focusEmpty");
    const summary=document.getElementById("focusSummary");
    if(!empty || !summary) return;
    if(!focus) {
        empty.hidden=false; summary.hidden=true; return;
    }
    empty.hidden=true; summary.hidden=false;
    const progress=focus.progress||0;
    const pct=Math.min(100,(progress/focus.target)*100);
    document.getElementById("focusGoalDisplay").textContent=focus.target+" "+focus.type;
    document.getElementById("focusProgressDisplay").textContent=progress+" / "+focus.target;
    document.getElementById("focusProgressFill").style.width=pct+"%";
    document.getElementById("focusIntentionDisplay").textContent=focus.intention || "Show up with faith, focus, and purpose.";
}

function renderJourneyGoal() {
    const focus=getWeeklyFocus();
    const empty=document.getElementById("journeyGoalEmpty");
    const content=document.getElementById("journeyGoalContent");
    if(!empty || !content) return;
    if(!focus) { empty.hidden=false; content.hidden=true; return; }
    empty.hidden=true; content.hidden=false;
    const progress=focus.progress||0;
    document.getElementById("journeyGoalName").textContent=focus.type;
    document.getElementById("journeyGoalNumbers").textContent=progress+" / "+focus.target;
    document.getElementById("journeyGoalFill").style.width=Math.min(100,(progress/focus.target)*100)+"%";
    document.getElementById("journeyIntention").textContent=focus.intention ? "“"+focus.intention+"”" : "";
}

document.addEventListener("DOMContentLoaded",function(){
    const type=document.getElementById("goalType");
    if(type) type.addEventListener("change",toggleCustomGoal);
    renderWeeklyFocus();
    renderJourneyGoal();
});

/* Extend the stable Journey renderer again. */
const btcV06RenderJourney = renderJourney;
renderJourney = function() {
    btcV06RenderJourney();
    renderJourneyGoal();
};


/* ========================================
   BETA v0.8 — FIRST-LAUNCH ONBOARDING
======================================== */
const BTC_ONBOARDING_KEY="btcOnboardingComplete";

function btcSetOnboardingStep(step) {
    [1,2,3].forEach(function(n){
        const panel=document.getElementById("onboardingStep"+n);
        const dot=document.getElementById("onboardingDot"+n);
        if(panel) panel.hidden=n!==step;
        if(dot) dot.classList.toggle("active",n===step);
    });
}

function goToOnboardingStep(step) {
    btcSetOnboardingStep(step);
}

function btcFindProfileKeys() {
    /* Stable app has historically persisted profile data in localStorage.
       These common keys preserve compatibility without changing existing settings logic. */
    return {
        nameKeys:["firstName","userName","name"],
        industryKeys:["industry","selectedIndustry","userIndustry"]
    };
}

function btcReadFirstStored(keys) {
    for(const key of keys) {
        const value=localStorage.getItem(key);
        if(value) return value;
    }
    return "";
}

function btcWriteExistingOrPrimary(keys,value) {
    let wrote=false;
    keys.forEach(function(key){
        if(localStorage.getItem(key)!==null) {
            localStorage.setItem(key,value);
            wrote=true;
        }
    });
    if(!wrote) localStorage.setItem(keys[0],value);
}

function btcPrefillOnboarding() {
    const keys=btcFindProfileKeys();
    const name=document.getElementById("onboardingName");
    const industry=document.getElementById("onboardingIndustry");
    const savedName=btcReadFirstStored(keys.nameKeys);
    const savedIndustry=btcReadFirstStored(keys.industryKeys);
    if(name && savedName) name.value=savedName;
    if(industry && savedIndustry && Array.from(industry.options).some(o=>o.value===savedIndustry)) {
        industry.value=savedIndustry;
    }
}

function saveOnboardingProfile() {
    const name=document.getElementById("onboardingName").value.trim();
    const industry=document.getElementById("onboardingIndustry").value;
    const keys=btcFindProfileKeys();
    if(name) btcWriteExistingOrPrimary(keys.nameKeys,name);
    btcWriteExistingOrPrimary(keys.industryKeys,industry);
    goToOnboardingStep(3);
}

function finishOnboarding() {
    localStorage.setItem(BTC_ONBOARDING_KEY,"true");
    const onboarding=document.getElementById("onboarding");
    if(onboarding) onboarding.hidden=true;
    document.body.style.overflow="";
    /* Reload once so the stable greeting/daily-prayer logic consumes the chosen profile. */
    window.location.reload();
}

function replayOnboarding() {
    const onboarding=document.getElementById("onboarding");
    if(!onboarding) return;
    btcPrefillOnboarding();
    btcSetOnboardingStep(1);
    onboarding.hidden=false;
    document.body.style.overflow="hidden";
}

document.addEventListener("DOMContentLoaded",function(){
    if(localStorage.getItem(BTC_ONBOARDING_KEY)!=="true") {
        btcPrefillOnboarding();
        btcSetOnboardingStep(1);
        const onboarding=document.getElementById("onboarding");
        if(onboarding) onboarding.hidden=false;
        document.body.style.overflow="hidden";
    }
});


/* ========================================
   BETA v0.9 — DAILY REMINDER / HABIT SYSTEM
======================================== */
const BTC_REMINDER_KEY="btcDailyReminder";
let btcReminderTimer=null;

function getReminderSettings() {
    try {
        return JSON.parse(localStorage.getItem(BTC_REMINDER_KEY)) || {enabled:false,time:"08:00",lastSent:""};
    } catch(_) {
        return {enabled:false,time:"08:00",lastSent:""};
    }
}

function saveReminderSettings(settings) {
    localStorage.setItem(BTC_REMINDER_KEY,JSON.stringify(settings));
}

function btcNotificationSupported() {
    return "Notification" in window;
}

function btcReminderTodayKey() {
    return btcTodayKey();
}

async function toggleDailyReminder(enabled) {
    const settings=getReminderSettings();

    if(enabled && btcNotificationSupported()) {
        if(Notification.permission==="default") {
            const permission=await Notification.requestPermission();
            if(permission!=="granted") {
                document.getElementById("reminderEnabled").checked=false;
                settings.enabled=false;
                saveReminderSettings(settings);
                renderReminderSettings();
                return;
            }
        } else if(Notification.permission!=="granted") {
            document.getElementById("reminderEnabled").checked=false;
            settings.enabled=false;
            saveReminderSettings(settings);
            renderReminderSettings();
            return;
        }
    }

    settings.enabled=enabled;
    saveReminderSettings(settings);
    renderReminderSettings();
    scheduleLocalReminderCheck();
}

function saveReminderTime(value) {
    const settings=getReminderSettings();
    settings.time=value || "08:00";
    saveReminderSettings(settings);
    renderReminderSettings();
    scheduleLocalReminderCheck();
}

function renderReminderSettings() {
    const settings=getReminderSettings();
    const enabled=document.getElementById("reminderEnabled");
    const time=document.getElementById("reminderTime");
    const wrap=document.getElementById("reminderTimeWrap");
    const status=document.getElementById("reminderStatusText");
    const note=document.getElementById("reminderSupportNote");
    if(!enabled) return;

    enabled.checked=!!settings.enabled;
    if(time) time.value=settings.time || "08:00";
    if(wrap) wrap.hidden=!settings.enabled;

    if(status) {
        status.textContent=settings.enabled ? "On • "+btcFormatReminderTime(settings.time) : "Off";
    }

    if(note) {
        if(!btcNotificationSupported()) {
            note.textContent="This browser does not support web notifications. Your reminder preference will still be saved.";
        } else if(Notification.permission==="denied") {
            note.textContent="Notifications are blocked for this site. Enable them in your browser/site settings to receive alerts.";
        } else {
            note.textContent="Beta reminder: notifications work while Before the Close is active and can catch up when you reopen it. Full closed-app push reminders will come with the backend notification system.";
        }
    }
}

function btcFormatReminderTime(value) {
    const parts=(value||"08:00").split(":");
    const d=new Date();
    d.setHours(Number(parts[0]),Number(parts[1]),0,0);
    return d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
}

function btcReminderMessage() {
    const focus=(typeof getWeeklyFocus==="function") ? getWeeklyFocus() : null;
    if(focus && focus.intention) return "Your intention: "+focus.intention;
    return "Take a minute for faith, focus, and purpose before the next move.";
}

function sendBTCNotification(title,body) {
    if(!btcNotificationSupported() || Notification.permission!=="granted") return false;
    try {
        if(navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(reg => reg.showNotification(title,{
                body:body,
                icon:"./icons/icon-192.png",
                badge:"./icons/icon-192.png",
                tag:"before-the-close-daily"
            }));
        } else {
            new Notification(title,{body:body,icon:"./icons/icon-192.png"});
        }
        return true;
    } catch(_) { return false; }
}

function checkDailyReminder() {
    const settings=getReminderSettings();
    if(!settings.enabled) return;

    const now=new Date();
    const parts=(settings.time||"08:00").split(":");
    const scheduled=new Date(now.getFullYear(),now.getMonth(),now.getDate(),Number(parts[0]),Number(parts[1]),0,0);
    const today=btcReminderTodayKey();

    if(now>=scheduled && settings.lastSent!==today) {
        if(sendBTCNotification("Before the Close",btcReminderMessage())) {
            settings.lastSent=today;
            saveReminderSettings(settings);
        }
    }
}

function scheduleLocalReminderCheck() {
    if(btcReminderTimer) clearInterval(btcReminderTimer);
    checkDailyReminder();
    btcReminderTimer=setInterval(checkDailyReminder,60000);
}

async function testReminder() {
    if(!btcNotificationSupported()) {
        alert("Notifications are not supported in this browser.");
        return;
    }
    if(Notification.permission==="default") await Notification.requestPermission();
    if(Notification.permission!=="granted") {
        alert("Notifications are currently blocked for Before the Close.");
        return;
    }
    sendBTCNotification("Before the Close","Test successful. You’re ready to start with purpose.");
}

document.addEventListener("visibilitychange",function(){
    if(document.visibilityState==="visible") checkDailyReminder();
});

document.addEventListener("DOMContentLoaded",function(){
    renderReminderSettings();
    scheduleLocalReminderCheck();
});
