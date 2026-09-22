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


function getCurrentSalesStyle() {
    const industry=getCurrentIndustry();
    const options=(typeof salesStyleOptions!=="undefined" && salesStyleOptions[industry]) || [];
    const saved=localStorage.getItem("salesStyle") || "";
    return options.some(o=>o.value===saved) ? saved : (options[0]?.value || "inperson");
}

function populateSalesStyleSelect(selectId, industry, preferred) {
    const select=document.getElementById(selectId);
    if(!select || typeof salesStyleOptions==="undefined") return;
    const options=salesStyleOptions[industry] || salesStyleOptions.general || [];
    select.innerHTML="";
    options.forEach(opt=>{
        const el=document.createElement("option"); el.value=opt.value; el.textContent=opt.label; select.appendChild(el);
    });
    if(preferred && options.some(o=>o.value===preferred)) select.value=preferred;
}

function refreshSalesStyleSelectors() {
    const settingsIndustry=document.getElementById("settingsSalesType")?.value || getCurrentIndustry();
    populateSalesStyleSelect("settingsSalesStyle",settingsIndustry,localStorage.getItem("salesStyle"));
    const onboardingIndustry=document.getElementById("onboardingIndustry")?.value || settingsIndustry;
    populateSalesStyleSelect("onboardingSalesStyle",onboardingIndustry,localStorage.getItem("salesStyle"));
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


    const salesStyle = getCurrentSalesStyle();
    const selectedPrayers =
        (typeof salesStylePrayers !== "undefined" && salesStylePrayers[salesType]?.[salesStyle]?.daily)
        || prayers[salesType];


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
                salesType + "-" + salesStyle,
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

    populateSalesStyleSelect("settingsSalesStyle", savedIndustry, localStorage.getItem("salesStyle"));
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

    const salesStyle = document.getElementById("settingsSalesStyle")?.value || "";


    localStorage.setItem(
        "userName",
        name
    );


    localStorage.setItem(
        "salesType",
        industry
    );

    if(salesStyle) localStorage.setItem("salesStyle", salesStyle);


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

        "journeyScreen",

        "prayScreen"

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


function showPray() {

    hideAllScreens();

    const screen = document.getElementById("prayScreen");
    if (screen) screen.style.display = "block";

    setActiveNav("prayNav");
    btcInstallGoalPrayer();
    window.scrollTo(0,0);
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
    const salesStyle = getCurrentSalesStyle();

    if (typeof salesStylePrayers !== "undefined" && salesStylePrayers[industry]?.[salesStyle]?.[mode]?.length) {
        return salesStylePrayers[industry][salesStyle][mode];
    }


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


    showPray();


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

function renderJourneyLegacy() {
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
const btcV04RenderJourney = renderJourneyLegacy;
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

const BTC_SHARE_APP_URL = "https://aguess2018.github.io/before-the-close/?ref=share";
let btcShareDraft = { title:"", text:"" };

function btcShareWrapLines(ctx, text, maxWidth) {
    const words=String(text||"").trim().split(/\s+/); const lines=[]; let line="";
    words.forEach(word=>{ const test=line ? line+" "+word : word; if(ctx.measureText(test).width>maxWidth && line){lines.push(line);line=word;}else line=test; });
    if(line) lines.push(line); return lines;
}

function btcShareIndustryLabel(){
    const raw=(localStorage.getItem("industry")||localStorage.getItem("selectedIndustry")||localStorage.getItem("userIndustry")||"").trim();
    const map={general:"General Sales",solar:"Solar",cars:"Automotive",realestate:"Real Estate",insurance:"Insurance",cellular:"Cellular",d2d:"Door-to-Door",b2b:"B2B"};
    return map[raw]||raw||"Sales";
}
function btcShareStyleLabel(){
    const raw=(localStorage.getItem("salesStyle")||localStorage.getItem("sales_style")||"").trim();
    const map={d2d:"Door-to-Door",appointments:"Appointments",phone:"Phone",coldcall:"Cold Calling",retail:"Retail",showroom:"Showroom",internet:"Internet Leads",field:"Field Prospecting",inperson:"In-Person",outbound:"Outbound"};
    return map[raw]||raw;
}
function btcDrawShareCard(canvas,title,text,format){
    const story=format!=="post"; canvas.width=story?1080:1080; canvas.height=story?1920:1080;
    const ctx=canvas.getContext("2d"), W=canvas.width,H=canvas.height;
    const bg=ctx.createLinearGradient(0,0,W,H); bg.addColorStop(0,"#181713"); bg.addColorStop(.55,"#090909"); bg.addColorStop(1,"#000"); ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    const glow=ctx.createRadialGradient(W*.5,H*.2,0,W*.5,H*.2,W*.75); glow.addColorStop(0,"rgba(212,175,55,.16)"); glow.addColorStop(1,"rgba(212,175,55,0)"); ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
    const pad=story?92:80, max=W-pad*2;
    ctx.textAlign="center"; ctx.fillStyle="#d4af37"; ctx.font="700 34px Arial"; ctx.fillText("✝",W/2,story?160:105);
    ctx.fillStyle="#f6f3ec";ctx.font="700 34px Arial";ctx.letterSpacing="8px";ctx.fillText("BEFORE THE CLOSE",W/2,story?225:160);ctx.letterSpacing="0px";
    ctx.fillStyle="rgba(255,255,255,.55)";ctx.font="600 22px Arial";ctx.fillText("FAITH • FOCUS • PURPOSE",W/2,story?270:198);
    let y=story?520:340; ctx.fillStyle="#fff";ctx.font="700 58px Arial";
    const titleLines=btcShareWrapLines(ctx,title,max); titleLines.slice(0,3).forEach(l=>{ctx.fillText(l,W/2,y);y+=70;});
    y+=story?55:35;ctx.fillStyle="rgba(255,255,255,.82)";ctx.font=story?"400 38px Arial":"400 34px Arial";
    const prayerLines=btcShareWrapLines(ctx,text,max); const maxLines=story?16:10;
    prayerLines.slice(0,maxLines).forEach((l,i)=>{if(i===maxLines-1 && prayerLines.length>maxLines) l=l.replace(/[.,;:]?$/,"")+"…";ctx.fillText(l,W/2,y);y+=story?55:48;});
    const industry=btcShareIndustryLabel(), style=btcShareStyleLabel();
    ctx.fillStyle="#d4af37";ctx.font="700 24px Arial";ctx.fillText(industry+(style?" • "+style:""),W/2,H-(story?260:175));
    ctx.fillStyle="rgba(255,255,255,.7)";ctx.font="600 23px Arial";ctx.fillText("Take a moment Before the Close.",W/2,H-(story?205:125));
    ctx.fillStyle="rgba(255,255,255,.45)";ctx.font="500 20px Arial";ctx.fillText("aguess2018.github.io/before-the-close",W/2,H-(story?160:85));
}
function btcEnsureShareStudio(){
    let modal=document.getElementById("btcShareStudio"); if(modal) return modal;
    modal=document.createElement("div");modal.id="btcShareStudio";modal.className="btc-share-studio";modal.hidden=true;
    modal.innerHTML='<div class="btc-share-sheet" role="dialog" aria-modal="true" aria-label="Share prayer"><div class="btc-share-sheet-head"><div><h3>Share Before the Close</h3><p>Turn this prayer into a branded social card.</p></div><button class="btc-share-close" type="button" aria-label="Close">×</button></div><div class="btc-share-preview"><canvas id="btcSharePreview"></canvas></div><div class="btc-share-format-grid"><button type="button" data-share-format="story">Story<small>9:16 • Instagram, Facebook, Snapchat</small></button><button type="button" data-share-format="post">Post<small>1:1 • Feed-ready</small></button></div><button class="btc-share-link-btn" type="button" data-share-format="link">↗ Share Prayer + App Link</button><p class="btc-share-note">Your phone decides which installed social apps appear in the share sheet. The app link is included when the receiving app supports shared text/links.</p></div>';
    document.body.appendChild(modal);
    modal.querySelector(".btc-share-close").onclick=()=>modal.hidden=true;
    modal.addEventListener("click",e=>{if(e.target===modal)modal.hidden=true;});
    modal.querySelectorAll("[data-share-format]").forEach(b=>b.onclick=()=>btcExecuteSocialShare(b.dataset.shareFormat));
    return modal;
}
async function btcCanvasBlob(canvas){return await new Promise(resolve=>canvas.toBlob(resolve,"image/png",.95));}
async function btcExecuteSocialShare(format){
    const title=btcShareDraft.title,text=btcShareDraft.text; if(!title||!text)return;
    const shareText='"'+title+'" — Before the Close\n\n'+BTC_SHARE_APP_URL;
    if(format==="link"){
        try{if(navigator.share){await navigator.share({title:"Before the Close — "+title,text:shareText,url:BTC_SHARE_APP_URL});btcIncrementMilestone("shares");return;}}catch(e){if(e&&e.name==="AbortError")return;}
        try{await navigator.clipboard.writeText(shareText);alert("Prayer + app link copied.");btcIncrementMilestone("shares");return;}catch(_){}
        window.prompt("Copy this:",shareText);return;
    }
    const canvas=document.createElement("canvas");btcDrawShareCard(canvas,title,text,format);const blob=await btcCanvasBlob(canvas);
    const file=new File([blob],"before-the-close-"+format+".png",{type:"image/png"});
    try{
        if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
            await navigator.share({title:"Before the Close — "+title,text:"A prayer from Before the Close\n"+BTC_SHARE_APP_URL,url:BTC_SHARE_APP_URL,files:[file]});
            btcIncrementMilestone("shares");return;
        }
    }catch(e){if(e&&e.name==="AbortError")return;}
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    try{await navigator.clipboard.writeText(BTC_SHARE_APP_URL);}catch(_){}
    alert("Share card saved. The Before the Close link was also copied so you can add it to your post/story.");btcIncrementMilestone("shares");
}
async function btcSharePrayer(title,text) {
    if(!title || !text) return;
    btcShareDraft={title,text};
    const modal=btcEnsureShareStudio(); const preview=modal.querySelector("#btcSharePreview");btcDrawShareCard(preview,title,text,"story");modal.hidden=false;
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
        industryKeys:["industry","selectedIndustry","userIndustry"],
        styleKeys:["salesStyle"]
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
    const savedStyle=btcReadFirstStored(keys.styleKeys);
    if(name && savedName) name.value=savedName;
    if(industry && savedIndustry && Array.from(industry.options).some(o=>o.value===savedIndustry)) {
        industry.value=savedIndustry;
    }
    populateSalesStyleSelect("onboardingSalesStyle", industry?.value || "general", savedStyle);
}

function saveOnboardingProfile() {
    const name=document.getElementById("onboardingName").value.trim();
    const industry=document.getElementById("onboardingIndustry").value;
    const salesStyle=document.getElementById("onboardingSalesStyle")?.value || "";
    const keys=btcFindProfileKeys();
    if(name) btcWriteExistingOrPrimary(keys.nameKeys,name);
    btcWriteExistingOrPrimary(keys.industryKeys,industry);
    if(salesStyle) btcWriteExistingOrPrimary(keys.styleKeys,salesStyle);
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
    const settingsIndustry=document.getElementById("settingsSalesType");
    if(settingsIndustry) settingsIndustry.addEventListener("change",function(){ populateSalesStyleSelect("settingsSalesStyle",this.value,""); });
    const onboardingIndustry=document.getElementById("onboardingIndustry");
    if(onboardingIndustry) onboardingIndustry.addEventListener("change",function(){ populateSalesStyleSelect("onboardingSalesStyle",this.value,""); });
    refreshSalesStyleSelectors();
});

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


/* ========================================
   v1.0 RC2 — PROGRESSION SYSTEM
======================================== */
const BTC_MILESTONES_KEY="btcMilestones";
const BTC_UNLOCKS_KEY="btcAchievementUnlocks";
let btcAchievementFilter="all";

function btcGetMilestones() {
    try {
        return Object.assign({shares:0,goalsCompleted:0,bestStreak:0},JSON.parse(localStorage.getItem(BTC_MILESTONES_KEY))||{});
    } catch(_) { return {shares:0,goalsCompleted:0,bestStreak:0}; }
}
function btcSaveMilestones(data) {
    localStorage.setItem(BTC_MILESTONES_KEY,JSON.stringify(data));
}
function btcIncrementMilestone(key) {
    const data=btcGetMilestones();
    data[key]=(data[key]||0)+1;
    btcSaveMilestones(data);
}
function btcGetUnlocks() {
    try { return JSON.parse(localStorage.getItem(BTC_UNLOCKS_KEY))||[]; }
    catch(_) { return []; }
}
function btcSaveUnlocks(items) {
    localStorage.setItem(BTC_UNLOCKS_KEY,JSON.stringify(items));
}
function btcCheckBestStreak() {
    const data=btcGetMilestones();
    const streak=getDisplayedStreak();
    if(streak>(data.bestStreak||0)) {
        data.bestStreak=streak;
        btcSaveMilestones(data);
    }
    return Math.max(streak,data.bestStreak||0);
}
function btcCheckGoalCompletion() {
    const focus=getWeeklyFocus();
    if(!focus || !focus.target || (focus.progress||0)<focus.target) return;
    const key="btcGoalComplete:"+focus.weekKey+":"+focus.type+":"+focus.target;
    if(localStorage.getItem(key)!=="true") {
        localStorage.setItem(key,"true");
        btcIncrementMilestone("goalsCompleted");
        btcShowAchievementToast("🎯","Weekly Goal Crushed","You hit "+focus.target+" "+focus.type+".");
    }
}
function btcAchievementData() {
    const checkins=getDailyCheckins();
    const checkinCount=Object.keys(checkins).length;
    const stats=getJourneyStats();
    const prayers=stats.prayersOpened||0;
    const favorites=getFavoriteCountForJourney();
    const streak=getDisplayedStreak();
    const best=btcCheckBestStreak();
    const milestones=btcGetMilestones();
    const shares=milestones.shares||0;
    const goals=milestones.goalsCompleted||0;
    const weekly=btcWeekDates().filter(d=>checkins[btcLocalDateKey(d)]).length;
    const history=typeof btcGetHistory==="function" ? btcGetHistory().length : 0;

    const make=(id,icon,title,desc,cat,current,target)=>({
        id,icon,title,desc,cat,current,target,unlocked:current>=target
    });

    return [
        make("first-checkin","🌱","First Step","Complete your first daily check-in.","faith",checkinCount,1),
        make("five-checkins","🕊️","Finding Rhythm","Complete 5 daily check-ins.","consistency",checkinCount,5),
        make("twenty-checkins","🌅","Showing Up","Complete 20 daily check-ins.","consistency",checkinCount,20),
        make("fifty-checkins","🛡️","Built Different","Complete 50 daily check-ins.","consistency",checkinCount,50),

        make("streak-3","🔥","Three Strong","Reach a 3-day streak.","consistency",best,3),
        make("streak-7","⚡","Seven Days Showing Up","Reach a 7-day streak.","consistency",best,7),
        make("streak-14","🏔️","Two Weeks Steady","Reach a 14-day streak.","consistency",best,14),
        make("streak-30","👑","Thirty Days Grounded","Reach a 30-day streak.","consistency",best,30),

        make("prayers-10","🙏","Ten Moments","Open 10 situational prayers.","faith",prayers,10),
        make("prayers-30","📖","Thirty Prayers Read","Open 30 situational prayers.","faith",prayers,30),
        make("prayers-100","🏆","Century of Purpose","Open 100 situational prayers.","faith",prayers,100),
        make("prayers-250","💯","Deep in the Work","Open 250 situational prayers.","faith",prayers,250),

        make("favorite-1","⭐","Worth Keeping","Save your first favorite prayer.","growth",favorites,1),
        make("favorite-5","💛","Saved for Later","Favorite 5 prayers.","growth",favorites,5),
        make("favorite-15","✨","Personal Collection","Favorite 15 prayers.","growth",favorites,15),

        make("history-10","🧭","Exploring the Library","Build a history of 10 recent prayers.","growth",history,10),
        make("share-1","↗️","Pass It On","Share your first prayer.","action",shares,1),
        make("share-5","📣","Spread the Word","Share 5 prayers.","action",shares,5),
        make("share-20","🤝","Lift the Room","Share 20 prayers.","action",shares,20),

        make("week-5","📅","Five-Day Week","Check in on 5 days this week.","consistency",weekly,5),
        make("goal-1","🎯","Faith in Action","Complete your first weekly sales goal.","action",goals,1),
        make("goal-5","🚀","Goal Getter","Complete 5 weekly sales goals.","action",goals,5)
    ];
}
function setAchievementFilter(filter) {
    btcAchievementFilter=filter;
    document.querySelectorAll("[data-achievement-filter]").forEach(btn=>{
        btn.classList.toggle("active",btn.dataset.achievementFilter===filter);
    });
    btcRenderAchievements();
}
function btcRenderAchievements() {
    const all=btcAchievementData();
    const unlocked=all.filter(a=>a.unlocked).length;
    const count=document.getElementById("achievementUnlockedCount");
    const fill=document.getElementById("achievementOverallFill");
    if(count) count.textContent=unlocked+" / "+all.length;
    if(fill) fill.style.width=((unlocked/all.length)*100)+"%";

    const list=document.getElementById("achievementList");
    if(!list) return;
    const shown=btcAchievementFilter==="all" ? all : all.filter(a=>a.cat===btcAchievementFilter);
    list.innerHTML=shown.map(a=>{
        const pct=Math.min(100,(a.current/a.target)*100);
        const progress=a.unlocked ? "Unlocked" : Math.min(a.current,a.target)+" / "+a.target;
        return '<div class="achievement '+(a.unlocked?'unlocked':'')+'">'+
            '<div class="achievement-icon">'+a.icon+'</div>'+
            '<div class="achievement-copy"><strong>'+a.title+'</strong>'+
            '<span>'+a.desc+' • '+progress+'</span>'+
            '<div class="achievement-progress"><span style="width:'+pct+'%"></span></div>'+
            '<div class="achievement-category">'+a.cat+'</div></div></div>';
    }).join("");

    btcDetectNewUnlocks(all);
}
function btcDetectNewUnlocks(all) {
    const previous=btcGetUnlocks();
    const current=all.filter(a=>a.unlocked).map(a=>a.id);
    const fresh=current.filter(id=>!previous.includes(id));
    btcSaveUnlocks(current);
    if(previous.length && fresh.length) {
        const a=all.find(x=>x.id===fresh[0]);
        if(a) btcShowAchievementToast(a.icon,a.title,"Achievement unlocked");
    }
}
function btcShowAchievementToast(icon,title,copy) {
    let toast=document.getElementById("btcAchievementToast");
    if(!toast) {
        toast=document.createElement("div");
        toast.id="btcAchievementToast";
        toast.className="btc-achievement-toast";
        document.body.appendChild(toast);
    }
    toast.innerHTML='<div class="toast-top">Achievement Unlocked</div><strong>'+icon+' '+title+'</strong><div style="opacity:.62;font-size:.75rem;margin-top:3px">'+copy+'</div>';
    requestAnimationFrame(()=>toast.classList.add("show"));
    clearTimeout(window.btcToastTimer);
    window.btcToastTimer=setTimeout(()=>toast.classList.remove("show"),3200);
}

/* Final v1.0 RC2 Journey renderer: keep every stable v0.9 Journey feature, then upgrade progression. */
const btcRC2PreviousRenderJourney = renderJourney;
renderJourney = function() {
    btcRC2PreviousRenderJourney();
    btcCheckGoalCompletion();
    const best=btcCheckBestStreak();
    const bestEl=document.getElementById("journeyBestStreak");
    if(bestEl) bestEl.textContent=best;
    btcRenderAchievements();
};

/* Re-check goal completion immediately when +/- progress changes. */
const btcRC2ChangeGoalProgress=changeGoalProgress;
changeGoalProgress=function(amount) {
    btcRC2ChangeGoalProgress(amount);
    btcCheckGoalCompletion();
    if(document.getElementById("journeyScreen")?.style.display!=="none") renderJourney();
};

document.addEventListener("DOMContentLoaded",function(){
    btcCheckBestStreak();
});


/* ========================================
   v1.0 RC3 — CINEMATIC NAVIGATION
   Keeps existing screen logic; adds directional entrance motion.
======================================== */
const BTC_NAV_ORDER=["today","journey","pray","favorites","settings"];
let btcLastNavIndex=0;

function btcAnimateScreen(screenId,direction) {
    const el=document.getElementById(screenId);
    if(!el) return;
    el.classList.remove("btc-screen-enter-right","btc-screen-enter-left");
    void el.offsetWidth;
    el.classList.add(direction==="left" ? "btc-screen-enter-left" : "btc-screen-enter-right");
    window.setTimeout(()=>{
        el.classList.remove("btc-screen-enter-right","btc-screen-enter-left");
    },320);
}
function btcNavMotion(name,screenId) {
    const next=BTC_NAV_ORDER.indexOf(name);
    if(next<0) return;
    const direction=next<btcLastNavIndex ? "left" : "right";
    btcLastNavIndex=next;
    requestAnimationFrame(()=>btcAnimateScreen(screenId,direction));
}

/* Wrap stable navigation functions rather than changing their behavior. */
const btcRC3ShowToday=showToday;
showToday=function() {
    btcRC3ShowToday();
    btcNavMotion("today","todayScreen");
};
const btcRC3ShowJourney=showJourney;
showJourney=function() {
    btcRC3ShowJourney();
    btcNavMotion("journey","journeyScreen");
};
const btcRC3ShowPray=showPray;
showPray=function() {
    btcRC3ShowPray();
    btcNavMotion("pray","prayScreen");
};
const btcRC3ShowFavorites=showFavorites;
showFavorites=function() {
    btcRC3ShowFavorites();
    btcNavMotion("favorites","favoritesScreen");
};
const btcRC3ShowSettings=showSettings;
showSettings=function() {
    btcRC3ShowSettings();
    btcNavMotion("settings","settingsScreen");
};


/* ========================================
   v1.0 RC4 — DELIGHT + PERSONAL JOURNEY
======================================== */
const BTC_REFLECTION_KEY="btcReflections";
let btcReflectionMood=null;

function btcGetReflections(){
    try{return JSON.parse(localStorage.getItem(BTC_REFLECTION_KEY))||{};}catch(_){return{};}
}
function btcSaveReflection(mood){
    btcReflectionMood=mood;
    document.querySelectorAll(".reflection-moods button").forEach(b=>b.classList.remove("selected"));
    const moods=["great","solid","tough","brutal"];
    const i=moods.indexOf(mood);
    const buttons=document.querySelectorAll(".reflection-moods button");
    if(buttons[i]) buttons[i].classList.add("selected");
    btcSaveReflectionNote(true);
}
function btcSaveReflectionNote(silent){
    const all=btcGetReflections(), key=btcTodayKey();
    const note=document.getElementById("btcReflectionNote")?.value.trim()||"";
    const existing=all[key]||{};
    all[key]={mood:btcReflectionMood||existing.mood||"",note};
    localStorage.setItem(BTC_REFLECTION_KEY,JSON.stringify(all));
    const msg=document.getElementById("btcReflectionSaved");
    if(msg && !silent) msg.textContent="Saved. Carry the lesson forward.";
}
function btcRenderReflection(){
    const item=btcGetReflections()[btcTodayKey()];
    if(!item)return;
    btcReflectionMood=item.mood;
    const note=document.getElementById("btcReflectionNote"); if(note)note.value=item.note||"";
    const moods=["great","solid","tough","brutal"], i=moods.indexOf(item.mood);
    const buttons=document.querySelectorAll(".reflection-moods button");
    if(buttons[i])buttons[i].classList.add("selected");
}

function btcQuickReset(){
    const modes=["approach","rejection","close","roughDay"];
    const check=getDailyCheckins()[btcTodayKey()];
    let mode="approach";
    if(check==="struggling")mode="roughDay";
    else if(check==="here")mode="rejection";
    else mode=modes[Math.floor(Math.random()*modes.length)];
    openPrayerMode(mode);
}

const BTC_VERSES=[
    {t:"Commit thy works unto the LORD, and thy thoughts shall be established.",r:"Proverbs 16:3"},
    {t:"Whatsoever ye do, do it heartily, as to the Lord, and not unto men.",r:"Colossians 3:23"},
    {t:"Let all your things be done with charity.",r:"1 Corinthians 16:14"},
    {t:"Be strong and of a good courage; be not afraid.",r:"Joshua 1:9"},
    {t:"And let us not be weary in well doing.",r:"Galatians 6:9"},
    {t:"A soft answer turneth away wrath.",r:"Proverbs 15:1"},
    {t:"The thoughts of the diligent tend only to plenteousness.",r:"Proverbs 21:5"}
];
function btcDailyVerse(){
    const d=new Date(), seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    return BTC_VERSES[seed%BTC_VERSES.length];
}
function btcInstallDailyVerse(){
    if(document.getElementById("btcScriptureCard"))return;
    const prayer=document.querySelector("#todayScreen .prayer-card");
    if(!prayer)return;
    const v=btcDailyVerse(), card=document.createElement("section");
    card.id="btcScriptureCard"; card.className="btc-scripture-card";
    card.innerHTML='<div class="eyebrow">Scripture for Today</div><blockquote>“'+v.t+'”</blockquote><cite>'+v.r+' · KJV</cite>';
    prayer.insertAdjacentElement("afterend",card);
}

function btcInstallGoalPrayer(){
    if(document.getElementById("btcGoalPrayerCard"))return;
    const target=document.getElementById("btcPrayGoalSlot")||document.querySelector(".journey-goal-card")||document.querySelector("#journeyScreen .focus-card");
    if(!target)return;
    const card=document.createElement("section");
    card.id="btcGoalPrayerCard";card.className="btc-goal-prayer-card";
    card.innerHTML='<div class="eyebrow">Faith in Action</div><h3>Pray Over My Goal</h3><p>Ask for discipline, patience, courage, and the wisdom to serve people well while you work toward the goal.</p><button class="btc-goal-prayer-btn" type="button" onclick="btcPrayOverGoal()">Pray Over My Goal →</button>';
    target.id==="btcPrayGoalSlot" ? target.appendChild(card) : target.insertAdjacentElement("afterend",card);
}
function btcPrayOverGoal(){
    const focus=getWeeklyFocus();
    const prayers=[
        ["Work With Purpose","God, keep me disciplined in the work in front of me. Help me pursue this goal without letting the number become more important than the people I serve. Give me patience, courage, and consistency. Let my effort reflect integrity, and help me trust You with the outcome. Amen."],
        ["Steady Hands","Lord, give me steady hands and a clear mind as I work toward the goal I set. Help me focus on the next right action, listen well, speak honestly, and keep moving when the answer is no. Let me work with excellence and leave the results in Your hands. Amen."],
        ["The Work Before Me","God, thank You for the opportunity to work, grow, and provide. Keep me humble when things go well and resilient when they do not. Help me serve first, work faithfully, and finish what I started. Amen."]
    ];
    const p=prayers[Math.floor(Math.random()*prayers.length)];
    btcShowAchievementToast("🙏",p[0],focus&&focus.target?"Goal: "+focus.target+" "+focus.type:"Keep working with purpose.");
    setTimeout(()=>{ alert(p[0]+"\n\n"+p[1]); },250);
}

function btcRenderWeeklyRecap(){
    const checkins=getDailyCheckins();
    const week=btcWeekDates();
    const count=week.filter(d=>checkins[btcLocalDateKey(d)]).length;
    const stats=getJourneyStats(), m=btcGetMilestones(), best=btcCheckBestStreak();
    const vals={btcRecapCheckins:count,btcRecapPrayers:stats.prayersOpened||0,btcRecapBest:best,btcRecapGoals:m.goalsCompleted||0,
                btcRecordStreak:best,btcRecordPrayers:stats.prayersOpened||0,btcRecordShares:m.shares||0,btcRecordGoals:m.goalsCompleted||0};
    Object.entries(vals).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
    const head=document.getElementById("btcRecapHeadline"), msg=document.getElementById("btcRecapMessage");
    if(head)head.textContent=count>=5?"You showed up this week.":"Keep building the week.";
    if(msg)msg.textContent=count>=5?"Consistency is becoming part of the way you work. Carry it into the next conversation.":count>=2?"Momentum is building. Keep stacking useful days.":"One intentional day can change the direction of a week.";
}
function btcRenderPrayerOfWeek(){
    if(typeof btcGetHistory!=="function")return;
    const hist=btcGetHistory();
    if(!hist.length)return;
    const item=hist[0];
    const t=document.getElementById("btcPrayerWeekTitle"),p=document.getElementById("btcPrayerWeekText");
    if(t)t.textContent=item.title||"Prayer Worth Carrying Forward";
    if(p)p.textContent=item.text||"";
}

function btcApplyAchievementTiers(){
    document.querySelectorAll("#achievementList .achievement").forEach((card,i)=>{
        const copy=card.querySelector(".achievement-copy strong");
        if(!copy||copy.querySelector(".btc-tier"))return;
        const tier=i>=18?"Diamond":i>=10?"Gold":i>=4?"Silver":"Bronze";
        const span=document.createElement("span");span.className="btc-tier "+tier.toLowerCase();span.textContent=tier;copy.appendChild(span);
    });
}
function btcEvolveStreak(){
    const n=btcCheckBestStreak();
    const el=document.getElementById("streakNumber");
    if(!el)return;
    const parent=el.parentElement;
    if(n>=7)parent?.classList.add("btc-streak-evolved");
}

function btcMicroAnimateClick(e){
    const target=e.target.closest("button");
    if(!target)return;
    target.classList.remove("btc-micro-pop");void target.offsetWidth;target.classList.add("btc-micro-pop");
    setTimeout(()=>target.classList.remove("btc-micro-pop"),350);
}
document.addEventListener("click",btcMicroAnimateClick);

const btcRC4RenderJourney=renderJourney;
renderJourney=function(){
    btcRC4RenderJourney();
    btcRenderWeeklyRecap();
    btcRenderPrayerOfWeek();
    btcInstallGoalPrayer();
    btcApplyAchievementTiers();
    btcEvolveStreak();
};

document.addEventListener("DOMContentLoaded",()=>{
    btcRenderReflection();
    btcInstallDailyVerse();
    btcEvolveStreak();
    const splash=document.getElementById("btcLaunchSplash");
    setTimeout(()=>splash?.classList.add("hide"),720);
    setTimeout(()=>splash?.remove(),1100);
});

/* ========================================
   v1.3 — JOURNEY CALENDAR + MILESTONES + DAYPART PRAYERS
======================================== */
const BTC_MOMENT_KEY="btcMilestoneMoments";
let btcCalendarCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);

const BTC_DAYPART_PRAYERS={
 morning:[
  ["Before the Day Begins","God, thank You for another day to work, serve, and grow. Keep me from chasing outcomes so hard that I forget the people in front of me. Give me courage for the first conversation, patience for the difficult ones, and integrity in every word. Help me do today's work faithfully and trust You with what comes from it. Amen."],
  ["Ready for the Work","Lord, steady my mind before the noise of the day begins. Help me listen well, work with purpose, and walk into every opportunity without fear or desperation. Let my confidence come from preparation, honesty, and faith—not from needing every answer to be yes. Amen."],
  ["Open Hands","God, I bring You my goals for today, but I hold the outcome with open hands. Help me show up prepared, serve people honestly, and keep moving when plans change. Give me energy for the work and wisdom to know what matters most. Amen."]
 ],
 midday:[
  ["Midday Reset","God, meet me right here in the middle of the day. Whatever happened this morning, help me leave it where it belongs. Clear the frustration, calm the pressure, and give me fresh energy for the next conversation. I don't need to win the whole day at once—help me be faithful with the next opportunity. Amen."],
  ["Fresh Start","Lord, reset my attitude before I carry the last result into the next person. Keep rejection from making me guarded and success from making me careless. Help me stay present, curious, and willing to serve. Give me enough strength for the next right action. Amen."],
  ["Second Half","God, thank You that a day is not defined by one rough hour. Give me patience for the second half, discipline when motivation fades, and courage to keep showing up with the same integrity I started with. Amen."]
 ],
 evening:[
  ["Release the Results","God, the work is done for today. Thank You for the doors that opened, the lessons in the ones that did not, and the strength to keep going. Help me learn without obsessing, rest without guilt, and release the results I cannot control. Prepare me to return tomorrow with a clear heart. Amen."],
  ["Grateful for the Work","Lord, thank You for every conversation, every lesson, and every chance to grow today. Show me what I should carry forward and what I need to leave behind. Let tonight restore me so tomorrow's work gets the best of me, not what's left of me. Amen."],
  ["End the Day in Peace","God, quiet the scoreboard in my head. Where I succeeded, keep me humble. Where I struggled, keep me hopeful. Help me remember that my worth is bigger than today's numbers. Give me peace, rest, and wisdom for tomorrow. Amen."]
 ]
};
function btcOpenDaypartPrayer(part){
 const list=BTC_DAYPART_PRAYERS[part]||BTC_DAYPART_PRAYERS.morning;
 const daySeed=Number(btcTodayKey().replaceAll("-","")); const offsets={morning:0,midday:1,evening:2};
 const p=list[(daySeed+(offsets[part]||0))%list.length];
 incrementJourneyPrayerCount();
 btcShowAchievementToast(part==="morning"?"🌅":part==="midday"?"☀️":"🌙",p[0],part==="morning"?"Start grounded.":part==="midday"?"Reset and keep moving.":"Release the day.");
 setTimeout(()=>alert(p[0]+"\n\n"+p[1]),180);
}
function btcGetMilestoneMoments(){try{const x=JSON.parse(localStorage.getItem(BTC_MOMENT_KEY)||"[]");return Array.isArray(x)?x:[]}catch(_){return[]}}
function btcOpenMilestoneComposer(){const m=document.getElementById("btcMilestoneModal");if(m)m.hidden=false;}
function btcCloseMilestoneComposer(){const m=document.getElementById("btcMilestoneModal");if(m)m.hidden=true;}
function btcSaveMilestoneMoment(){
 const type=document.getElementById("btcMilestoneType")?.value||"other", note=document.getElementById("btcMilestoneNote")?.value.trim()||"";
 const items=btcGetMilestoneMoments(); items.unshift({id:Date.now(),date:btcTodayKey(),type,note}); localStorage.setItem(BTC_MOMENT_KEY,JSON.stringify(items.slice(0,100)));
 const noteEl=document.getElementById("btcMilestoneNote");if(noteEl)noteEl.value=""; btcCloseMilestoneComposer(); btcRenderMilestoneMoments(); btcRenderJourneyCalendar(); btcShowAchievementToast("★","Milestone Saved","Carry the win forward.");
}
function btcMilestoneLabel(type){return {appointment:"Booked the Appointment",close:"Closed the Deal","first-sale":"First Sale",goal:"Hit a Goal",breakthrough:"Personal Breakthrough",other:"Milestone"}[type]||"Milestone";}
function btcRenderMilestoneMoments(){
 const box=document.getElementById("btcMilestoneList");if(!box)return; const items=btcGetMilestoneMoments().slice(0,5);
 if(!items.length){box.innerHTML='<div class="btc-empty-state">Your meaningful wins will show up here.</div>';return;}
 box.innerHTML=items.map(x=>'<div class="btc-milestone-item"><strong>★ '+btcEscapeJourney(btcMilestoneLabel(x.type))+'</strong><small>'+btcEscapeJourney(x.date)+'</small>'+(x.note?'<p>'+btcEscapeJourney(x.note)+'</p>':'')+'</div>').join("");
}
function btcEscapeJourney(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function btcMoveCalendar(delta){btcCalendarCursor=new Date(btcCalendarCursor.getFullYear(),btcCalendarCursor.getMonth()+delta,1);btcRenderJourneyCalendar();}
function btcRenderJourneyCalendar(){
 const grid=document.getElementById("btcCalendarGrid"), title=document.getElementById("btcCalendarMonth");if(!grid||!title)return;
 const y=btcCalendarCursor.getFullYear(),m=btcCalendarCursor.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(); title.textContent=first.toLocaleDateString(undefined,{month:"long",year:"numeric"});
 const check=getDailyCheckins(), refs=btcGetReflections(), moments=btcGetMilestoneMoments(); let html=""; for(let i=0;i<first.getDay();i++)html+='<span class="btc-calendar-day empty"></span>';
 for(let d=1;d<=days;d++){const key=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0"), has=!!check[key]||!!refs[key]||moments.some(x=>x.date===key), star=moments.some(x=>x.date===key);html+='<button type="button" class="btc-calendar-day '+(has?'has-data ':'')+(star?'has-milestone ':'')+(key===btcTodayKey()?'today':'')+'" onclick="btcShowCalendarDay(\''+key+'\')">'+d+'</button>';}
 grid.innerHTML=html;
}
function btcShowCalendarDay(key){
 const detail=document.getElementById("btcCalendarDetail");if(!detail)return; const check=getDailyCheckins()[key], ref=btcGetReflections()[key], moments=btcGetMilestoneMoments().filter(x=>x.date===key); const mood={locked:"Locked In",good:"Feeling Good",here:"Just Here",struggling:"Struggling"}[check];
 let bits=['<strong>'+btcEscapeJourney(new Date(key+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}))+'</strong>']; if(mood)bits.push('Check-in: '+mood); if(ref?.mood)bits.push('Reflection: '+ref.mood+(ref.note?' — '+btcEscapeJourney(ref.note):'')); moments.forEach(x=>bits.push('★ '+btcEscapeJourney(btcMilestoneLabel(x.type))+(x.note?' — '+btcEscapeJourney(x.note):''))); if(bits.length===1)bits.push('No Journey activity saved for this day.'); detail.innerHTML=bits.join('<br>');
}
const btcV13RenderJourney=renderJourney;
renderJourney=function(){btcV13RenderJourney();btcRenderJourneyCalendar();btcRenderMilestoneMoments();};
document.addEventListener("DOMContentLoaded",()=>{btcRenderJourneyCalendar();btcRenderMilestoneMoments();});
