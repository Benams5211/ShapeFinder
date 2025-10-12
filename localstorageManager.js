// abstract access and manage the localstorage content class definition
// -----------------------------------------------------------------------------
class LocalStorageManager {

    /**
     * Retrieve data type of array from the localstorage of the given key.
     * 
     * @param {key of the array data value in the localstorage} key 
     * @returns 
     */
    getArrayObject(key) {
        try {
            const storedObjects = localStorage.getItem(key);
            let fetchedArrayObject = JSON.parse(storedObjects || '[]');

            return fetchedArrayObject;
        } catch (error) {
            console.error("Error occured while fetching localstorage data of: ", key, error); // We can have a error logging implementation later.
            return [];
        }
    }

    /**
     * Store the value with the key.
     * 
     * @param {the key of the value in the localstorage} key 
     * @param {the value to be stored} value 
     */
    setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

// -----------------------------------------------------------------------------
// access and manage score in the localstorage implementation of clickable access and manage the localstorage content class
// -----------------------------------------------------------------------------
class LocalStorageScoreManager extends LocalStorageManager {

    /**
     * Store the final score of the user in the localstorage.
     */
    storeScore() {
        let sortedExistingScores = this.getArrayObject(localstorageScoreObjectsKey).sort((a, b) => a[localstorageIDKey] - b[localstorageIDKey]);
        let latestID = 0;
        if (sortedExistingScores.length > 0) {
            latestID = Number(sortedExistingScores[sortedExistingScores.length - 1].id);
        }

        const now = new Date().toISOString();
        const scoreObject = { 
            [localstorageIDKey]:        latestID + 1, 
            [localstorageDateKey]:      now,
            [localstorageValueKey]:     combo 
        };
        sortedExistingScores.push(scoreObject);
        this.setItem(localstorageScoreObjectsKey, sortedExistingScores);
    }

    /**
     * Returns the top scores.
     * @param {the numner of top scores that returns} limit 
     * @returns 
     */
    getTopScores(limit = 3) {
        let sortedExistingScores = this.getArrayObject(localstorageScoreObjectsKey).sort((a, b) => b[localstorageValueKey] - a[localstorageValueKey]);
        const topScores = sortedExistingScores.slice(0, limit);
        return topScores;
    }
}