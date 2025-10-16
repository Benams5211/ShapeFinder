
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

        const bottomButton = document.createElement('button');
        bottomButton.className = 'play-again-button';
        bottomButton.innerHTML = 'Play Again';
        bottomButton.addEventListener('click', () => {
            this.close();
            this.playAgain()
        });
        this.container.appendChild(bottomButton);
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
}
