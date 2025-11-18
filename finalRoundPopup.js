
const confettiBallEmoji = `&#127882;`;
const clapEmoji = `&#128079;`;
const clapWithSmileEmoji = `&#129303;`;

class FinalRoundPopup {
    constructor(serviceInstance, logoPath) {
        this.service = serviceInstance;
        this.logoPath = logoPath;
        this.container = null;
        this.topRoundIndex = 0;
    }

    async render() {
        // Create the overlay container
        this.container = document.createElement('div');
        this.container.className = 'final-round-popup-window';

        // Add logo
        const logo = document.createElement('img');
        logo.src = this.logoPath;
        logo.className = 'final-round-popup-logo';
        this.container.appendChild(logo);

        const timeOverText = document.createElement('div');
        timeOverText.className = 'final-round-popup-title';
        timeOverText.innerHTML = `<strong>Time's Over!</strong>`;
        this.container.appendChild(timeOverText);

        // Append to DOM
        document.body.appendChild(this.container);

        // Fetch and populate top rounds
        const sortedTopRounds = await this.service.getTopRounds();

        // The recent round is aleady stored.
        if (sortedTopRounds.length > 1) {
            this.summaryView(sortedTopRounds)
        } else {
            this.firstGameView() 
        }

        const playAgainButton = document.createElement('button');
        playAgainButton.className = 'bottom-button';
        playAgainButton.innerHTML = 'Play Again';
        playAgainButton.addEventListener('click', () => {
            this.close();
            this.playAgain()
        });
        this.container.appendChild(playAgainButton);

        const gotoHomeButton = document.createElement('button');
        gotoHomeButton.className = 'bottom-button';
        gotoHomeButton.innerHTML = 'Go To Home';
        gotoHomeButton.addEventListener('click', () => {
            this.close();
            this.gotoHome()
        });
        this.container.appendChild(gotoHomeButton);
    }

    close() {
        if (this.container) {
            this.container.remove();
            this.container = null;

            finalRoundPopupShown = false;
            this.topRoundIndex = 0;
        }
    }

    playAgain() {
        stopHardBGM();
        stopBossBGM();
        startGame();
    }

    gotoHome() {
        gameState = "menu"; 
    }

    getDateTime(dateString) {
        const dateObject = new Date(dateString);

        // Format as MM-DD-YYYY : HH:MM
        const month = dateObject.getMonth() + 1; // months are 0-indexed
        const day = dateObject.getDate();
        const year = dateObject.getFullYear();
        const hours = dateObject.getHours().toString().padStart(2, "0");
        const minutes = dateObject.getMinutes().toString().padStart(2, "0");

        return `${month}-${day}-${year} : ${hours}:${minutes}`;
    }

    firstGameView() {
        this.emojiView(clapWithSmileEmoji);

        const titleText = document.createElement('div');
        titleText.className = 'info-large-font';
        titleText.innerHTML = `Awesome! Your first round is in!`;
        this.container.appendChild(titleText); 
        
        const finalRoundText = document.createElement('div');
        finalRoundText.className = 'info-large-font';
        finalRoundText.innerHTML = `<strong>Your Round:</strong> ${round}`;
        this.container.appendChild(finalRoundText);

        const subtitleText = document.createElement('div');
        subtitleText.className = 'info-final-round';
        subtitleText.innerHTML = `Let’s make the next one even better.`;
        this.container.appendChild(subtitleText); 
    }

    summaryView(sortedTopRounds) {
        if (round > 1) {
            const highestRound = topRoundsBeforeUpdate.length > 0 ? topRoundsBeforeUpdate[0][localstorageValueKey] : 0;
            const secondHighestRound = topRoundsBeforeUpdate.length > 1 ? topRoundsBeforeUpdate[1][localstorageValueKey] : 0;
            const thirdHighestRound = topRoundsBeforeUpdate.length > 2 ? topRoundsBeforeUpdate[2][localstorageValueKey] : 0;

            if (round >= highestRound) {
                this.beatHighestRoundView();
            } else if (round >= secondHighestRound || round >= thirdHighestRound) {
                this.inTopThreeRoundsView();
            } else {
                this.generalSummaryView();
            }
        } else {
            this.generalSummaryView();
        }

        this.topRoundsListView(sortedTopRounds);

        // --- Expandable section of more stats (dynamic content) ---
        const expandContainer = document.createElement('div');
        expandContainer.className = "expand-panel collapsed";

        const inner = document.createElement('div');
        inner.className = "expand-inner";
        inner.innerHTML = this.getDetailedSummaryHTML();
        expandContainer.appendChild(inner);

        this.container.appendChild(expandContainer);

        const showMoreTitle = "Show More Stats";
        const showLessTitle = "Show Less Stats";

        // Toggle button
        const expandBtn = document.createElement("button");
        expandBtn.className = "expand-btn";
        expandBtn.textContent = showMoreTitle;
        expandBtn.onclick = () => {
            expandContainer.classList.toggle("collapsed");
            expandBtn.textContent = expandContainer.classList.contains("collapsed")
                ? showMoreTitle : showLessTitle;
        };
        this.container.appendChild(expandBtn);
    }

    generalSummaryView() {
        const finalRoundText = document.createElement('div');
        finalRoundText.className = 'info-final-round';
        finalRoundText.innerHTML = `<strong>Your Round:</strong> ${round}`;
        this.container.appendChild(finalRoundText);
    }

    beatHighestRoundView() {
        this.emojiView(confettiBallEmoji);

        const titleText = document.createElement('div');
        titleText.className = 'info-large-font';
        titleText.innerHTML = `Incredible! You beat your top score`;
        this.container.appendChild(titleText); 
        
        const finalRoundText = document.createElement('div');
        finalRoundText.className = 'info-large-font';
        finalRoundText.innerHTML = `<strong>Your Round:</strong> ${round}`;
        this.container.appendChild(finalRoundText);

        const subtitleText = document.createElement('div');
        subtitleText.className = 'info-final-round';
        subtitleText.innerHTML = `Can you do it again?`;
        this.container.appendChild(subtitleText);
    }

    inTopThreeRoundsView() {
        this.emojiView(clapEmoji)

        const titleText = document.createElement('div');
        titleText.className = 'info-large-font';
        titleText.innerHTML = `New record unlocked`;
        this.container.appendChild(titleText); 
        
        const finalRoundText = document.createElement('div');
        finalRoundText.className = 'info-large-font';
        finalRoundText.innerHTML = `<strong>Your Round:</strong> ${round}`;
        this.container.appendChild(finalRoundText);

        const subtitleText = document.createElement('div');
        subtitleText.className = 'info-final-round';
        subtitleText.innerHTML = `Your score is now in the Top 3!`;
        this.container.appendChild(subtitleText);
    }

    topRoundsListView(sortedTopRounds) {
        const listContainer = document.createElement('div');
        listContainer.className = 'final-round-popup-list';
        this.container.appendChild(listContainer);

        sortedTopRounds.forEach(topRoundObject => {
            const row = document.createElement('div');
            row.className = 'final-round-popup-round-row';
            row.innerHTML = `
                    <div class="round-row-rank">#${++this.topRoundIndex}</div>
                    <strong class="round-row-round">${topRoundObject[localstorageValueKey]}</strong>
                    <span class="round-row-date">${this.getDateTime(topRoundObject[localstorageDateKey])}</span>
                `;
            listContainer.appendChild(row);
        });
    }

    emojiView(emojiName) {
        const celebrationEmoji = document.createElement('span');
        celebrationEmoji.className = 'info-large-emoji';
        celebrationEmoji.innerHTML = emojiName;
        this.container.appendChild(celebrationEmoji);        
    }

    getDetailedSummaryHTML() {
        const correct = Stats.lifetime.get("correctClicks");
        const incorrect = Stats.lifetime.get("incorrectClicks");

        return `
            <div class="stats-scroll">
                <div class="stats-grid">

                    <div class="stats-column">
                        <div class="details-title">Last Game Stats</div>
                        <div class="details-line"><strong>Correct Clicks: </strong> ${Stats.session.get("correctClicks")}</div>
                        <div class="details-line"><strong>Incorrect Clicks: </strong> ${Stats.session.get("incorrectClicks")}</div>
                        <div class="details-line"><strong>Highest Combo: </strong> ${Stats.session.get("highestCombo")}</div>
                        <div class="details-line"><strong>Average Find Time: </strong> ${nf(Stats.session.get("averageFindTime") / 1000, 1, 2)}s</div>
                        <div class="details-line"><strong>Difficulty: </strong> ${Stats.session.get("difficulty")}</div>
                    </div>

                    <div class="stats-column">
                        <div class="details-title">Lifetime Stats</div>
                        <div class="details-line"><strong>Total Games Played: </strong> ${Stats.lifetime.get("totalGames")}</div>
                        <div class="details-line"><strong>Total Correct Clicks: </strong> ${correct} (${(correct/(correct+incorrect) * 100).toFixed(2)}%)</div>
                        <div class="details-line"><strong>Total Incorrect Clicks: </strong> ${Stats.lifetime.get("incorrectClicks")}</div>
                        <div class="details-line"><strong>Total Alive Time: </strong> ${nf(Stats.lifetime.get("totalPlayTime"), 1, 2)}s</div>
                        <div class="details-line"><strong>Highest Combo: </strong> ${Stats.lifetime.get("highestCombo")}</div>
                        <div class="details-line"><strong>Average Find Time: </strong> ${nf(Stats.lifetime.get("averageFindTime"), 1, 2)}s</div>
                    </div>

                </div>
            </div>
        `;
    }
}
