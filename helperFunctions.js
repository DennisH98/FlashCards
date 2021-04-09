//tries to parse a text, if its an invalid json, throw error
function getParsedJsonFromText(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        //alert(e); // error in the above string, not valid json.
        return null;
    }
}

//get and save functions for local storage
function saveDataToLocalStorage(dataKey, data) {
    //NOTE: if data is json, conver to text to store.
    let formattedData = null;
    try {
       formattedData = JSON.stringify(data);
    } catch (e) {
        //not a json, just use data as is.
        formattedData = data;
    }
    window.localStorage.setItem(dataKey, formattedData);
}
function getDataFromLocalStorage(dataKey) {
    //NOTE if data was originally json, unpack it from text to json
    let data = window.localStorage.getItem(dataKey);
    let formattedData = null;
    try {
        formattedData = JSON.parse(data);
    } catch (e) {
        //not a json, just use data as is.
        formattedData = data;
    }
    return formattedData;
}

//note this function is case sensitive
function checkIfQuestionExistsInLocalStorage(question, data) {
    if(question === "" || typeof question === "undefined") {
        return false;
    }
    let foundQuestion = false;
    for(index in data) {
        if (data[index].question === question) {
            foundQuestion = true;
            break;
        }
    }
    return foundQuestion;
}

//for incrementing the number of correct times for a specific flashcard with index
function saveIncrementedNumCorrectTimesForFlashcard(flashcardIndex) {
    let deckData = getDataFromLocalStorage(FLASHCARD_DECK_ID);
    if(typeof deckData.data[flashcardIndex] !== "undefined") {
        deckData.data[flashcardIndex].numberTimesCorrect = deckData.data[flashcardIndex].numberTimesCorrect + 1;
    }
    saveDataToLocalStorage(FLASHCARD_DECK_ID, deckData)
}