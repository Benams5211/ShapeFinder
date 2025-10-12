class FinalScorePopup {
    constructor(serviceInstance, logoPath) {
        this.service = serviceInstance;
        this.logoPath = logoPath;
        this.container = null;
        this.topScoreIndex = 0;
    }

    async render() {
        // Create the overlay container
        this.container = document.createElement('div');
        this.container.className = 'final-score-popup-window';

        // Add logo
        const logo = document.createElement('img');
        logo.src = this.logoPath;
        logo.className = 'final-score-popup-logo';
        this.container.appendChild(logo);

        const timeOverText = document.createElement('div');
        timeOverText.className = 'final-score-popup-title';
        timeOverText.innerHTML = `<strong>Time's Over!</strong>`;
        this.container.appendChild(timeOverText);

        const finalScoreText = document.createElement('div');
        finalScoreText.className = 'info-final-score';
        finalScoreText.innerHTML = `<strong>Your Score:</strong> ${combo}`;
        this.container.appendChild(finalScoreText);

        // Add content area
        const listContainer = document.createElement('div');
        listContainer.className = 'final-score-popup-list';
        this.container.appendChild(listContainer);

        // Append to DOM
        document.body.appendChild(this.container);

        // Fetch and populate top scores
        const sortedTopScores = await this.service.getTopScores();
        sortedTopScores.forEach(topScoreObject => {
            const row = document.createElement('div');
            row.className = 'final-score-popup-score-row';
            row.innerHTML = `
                    <div class="score-row-rank">#${++this.topScoreIndex}</div>
                    <strong class="score-row-score">${topScoreObject[localstorageValueKey]}</strong>
                    <span class="score-row-date">${this.getDateTime(topScoreObject[localstorageDateKey])}</span>
                `;
            listContainer.appendChild(row);
        });

        const bottomButton = document.createElement('button');
        bottomButton.className = 'play-again-button';
        bottomButton.innerHTML = 'Close';
        bottomButton.addEventListener('click', () => {
            this.close();
        });
        this.container.appendChild(bottomButton);
    }

    close() {
        if (this.container) {
            this.container.remove();
            this.container = null;

            finalScorePopupShown = false;
            this.topScoreIndex = 0;
        }
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
}
