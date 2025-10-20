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
// access and manage round in the localstorage implementation of manage the localstorage content class
// -----------------------------------------------------------------------------
class LocalStorageRoundManager extends LocalStorageManager {

    /**
     * Store the final round of the user in the localstorage.
     */
    storeRound() {
        let sortedExistingRounds = this.getArrayObject(localstorageRoundObjectsKey).sort((a, b) => a[localstorageIDKey] - b[localstorageIDKey]);
        let latestID = 0;
        if (sortedExistingRounds.length > 0) {
            latestID = Number(sortedExistingRounds[sortedExistingRounds.length - 1].id);
        }

        const now = new Date().toISOString();
        const roundObject = { 
            [localstorageIDKey]:        latestID + 1, 
            [localstorageDateKey]:      now,
            [localstorageValueKey]:     round 
        };
        sortedExistingRounds.push(roundObject);
        this.setItem(localstorageRoundObjectsKey, sortedExistingRounds);
    }

    /**
     * Returns the top rounds.
     * @param {the numner of top rounds that returns} limit 
     * @returns 
     */
    getTopRounds(limit = 3) {
        let sortedExistingRounds = this.getArrayObject(localstorageRoundObjectsKey).sort((a, b) => b[localstorageValueKey] - a[localstorageValueKey]);
        const topRounds = sortedExistingRounds.slice(0, limit);
        return topRounds;
    }
}