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

        const finalRoundText = document.createElement('div');
        finalRoundText.className = 'info-final-round';
        finalRoundText.innerHTML = `<strong>Your Round:</strong> ${round}`;
        this.container.appendChild(finalRoundText);

        // Add content area
        const listContainer = document.createElement('div');
        listContainer.className = 'final-round-popup-list';
        this.container.appendChild(listContainer);

        // Append to DOM
        document.body.appendChild(this.container);

        // Fetch and populate top rounds
        const sortedTopRounds = await this.service.getTopRounds();
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

            finalRoundPopupShown = false;
            this.topRoundIndex = 0;
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
