$(document).ready(function(){

    //data required for partial spaced repetition study
    const DECK_MAX_QUEUE = 5;
    let originalDeckData = getDataFromLocalStorage(FLASHCARD_DECK_ID);
    let cardsLeftUntouchedIndices = [];
    let cardsLeftTouchedIndices = [];
    let cardsLeftTouchedTimesCorrect = [];
    let studyQueue = [];
    let numberCorrect = 0;
    let numberIncorrect = 0;

    let pastCardIndicesDone = [];
    let pastCardsIndex = 0;
    
    //initialize queue
    initializeRepetitionQueue();

    function initializeRepetitionQueue() {
        /*
            split the original deck data's index into "touched" and "untouched" arrays. 
            where 
                untouched are cards with correctNumberTimes as = 0 and
                touched as correctNumberTimes > 0
            These arrays are the cards that have not been used yet.
            Take the first 5 items from the touched, then untouched if not enough, for the study queue, the rest are unused and will be added when needed.
        */
        for(let originalIndex in originalDeckData.data) {
            let timesCorrect = originalDeckData.data[originalIndex].numberTimesCorrect;
            if(timesCorrect <= 0) {
                cardsLeftUntouchedIndices.push(parseInt(originalIndex));
                
            }
            else {
                cardsLeftTouchedIndices.push(parseInt(originalIndex));
                cardsLeftTouchedTimesCorrect.push(timesCorrect);
            }
        }

        let maxTouchedIndicesLength = null;
        let maxUntouchedIndicesLength = null;

        //when deck is smaller than max queue size
        if(originalDeckData.data.length < DECK_MAX_QUEUE) {
            maxTouchedIndicesLength = cardsLeftTouchedIndices.length;
            maxUntouchedIndicesLength = cardsLeftUntouchedIndices.length;
        }
        //when touched indices length is larger than queue
        else if(cardsLeftTouchedIndices.length >= DECK_MAX_QUEUE) {
            maxTouchedIndicesLength = DECK_MAX_QUEUE;
            maxUntouchedIndicesLength = 0;
        }
        //when other conditions, just use a combination of touched and untouched cards, with touched cards as priority
        else {
            maxTouchedIndicesLength = cardsLeftTouchedIndices.length;
            maxUntouchedIndicesLength = (DECK_MAX_QUEUE - cardsLeftTouchedIndices.length);
        }

        //for touched items generate randomized values from touched indices.
        for(let i = 0; i < maxTouchedIndicesLength; i++) {
            let randomizedTouchedIndex = getRandomizedFlashcardIndexFromTouchedFlashcards();

            let indexOfItemToRemove = cardsLeftTouchedIndices.indexOf(randomizedTouchedIndex);

            //remove item from touched indices array and from times correct array
            cardsLeftTouchedIndices.splice(indexOfItemToRemove, 1);
            cardsLeftTouchedTimesCorrect.splice(indexOfItemToRemove, 1);

            //add this item to queue
            studyQueue.push(randomizedTouchedIndex);
        }

        //for the remainder that are untouched items, add randomized data from untouched array
        for(let n = 0; n < maxUntouchedIndicesLength; n++) {
            let randomizedUntouchedIndex = getRandomizedFlashcardIndexFromUntouchedFlashcards();
            //remove item from untouched indices array
            cardsLeftUntouchedIndices.splice(cardsLeftUntouchedIndices.indexOf(randomizedUntouchedIndex), 1);

            //add this item to queue
            studyQueue.push(randomizedUntouchedIndex);
        }

        //Change header to reflect flash card id
        $("#titleHeader").text("Study Deck: " + originalDeckData.id);

        let currentCard = originalDeckData.data[studyQueue[0]];

        // Initialize the first card using the 0th item in the queue
        $("#flashcard").text(currentCard.question);
        $("#flashcard").data("state", "question");
    }

    //when user clicks I don't know
    function handleDontKnowBtn() {
        let currentFlashcardIndex = studyQueue[0];

        //remove it from current queue
        studyQueue.splice(studyQueue.indexOf(currentFlashcardIndex), 1);

        //if the length of deck is 1, push the same card back again.
        if(originalDeckData.data.length === 1) {
            studyQueue.push(currentFlashcardIndex);
        }
        //if length is >= 2 add the current flashcard after the next card
        else if(originalDeckData.data.length >= 2) {
            studyQueue.splice(1, 0, currentFlashcardIndex);
        }

        numberIncorrect = numberIncorrect + 1;
    }

    //when the user clicks I got it.
    function handleIGotItBtn() {
        let currentFlashcardIndex = studyQueue[0];

        //remove it from current queue
        studyQueue.splice(studyQueue.indexOf(currentFlashcardIndex), 1);

        //Add the current item to the end of the queue.
        studyQueue.push(currentFlashcardIndex);

        //increment number of correct in both local data and local storage
        numberCorrect = numberCorrect + 1;
        saveIncrementedNumCorrectTimesForFlashcard(currentFlashcardIndex);
    }


    //when the user clicks Easy, don't show again
    function handleEasyBtn() {
        let currentFlashcardIndex = studyQueue[0];

        //remove it from current queue
        studyQueue.splice(studyQueue.indexOf(currentFlashcardIndex), 1);

        //add a new item to the end of the queue, first priotizing touched items, then untouched.
        let nextIndex = null;
        if(cardsLeftTouchedIndices.length > 0) {
            nextIndex = getRandomizedFlashcardIndexFromTouchedFlashcards();

            let indexOfItemToRemove = cardsLeftTouchedIndices.indexOf(nextIndex);

            //remove item from touched indices array and from times correct array
            cardsLeftTouchedIndices.splice(indexOfItemToRemove, 1);
            cardsLeftTouchedTimesCorrect.splice(indexOfItemToRemove, 1);
        }
        else if (cardsLeftUntouchedIndices.length > 0) {
            nextIndex = getRandomizedFlashcardIndexFromUntouchedFlashcards();
            //remove item from touched indices array
            cardsLeftUntouchedIndices.splice(cardsLeftUntouchedIndices.indexOf(nextIndex), 1);
        }

        //increment number of correct in both local data and local storage
        saveIncrementedNumCorrectTimesForFlashcard(currentFlashcardIndex);
        numberCorrect = numberCorrect + 1;

        //if there is still cards left from touched or untouched indices, push the next index
        if(nextIndex !== null) {
            studyQueue.push(nextIndex);
        }
    }


    //saveIncrementedNumCorrectTimesForFlashcard
    function getRandomizedFlashcardIndexFromTouchedFlashcards() {

        if(cardsLeftTouchedIndices.length === 1) {
            return cardsLeftTouchedIndices[0];
        }
        else {
            /*
                create an array of percentage sof the probability that it will show based on:
                randomize it based on times correct ie:
                    [ 10, 20, 50] correct times will its data value according to the total
                    like: [ (10 - total), (20 - total), (50 - total) ] = [70, 60, 30]

                    (1 - (value/total of data))*100 for the probability that it will show again
                    ie: floor((1 - (50/80))*100) = 37.5% chance it will show next, floor it
            */
            
            //get sum of the times correct array
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            let sumTouchedArrayTimesCorrect = cardsLeftTouchedTimesCorrect.reduce(reducer)

            let probabilityPercentageArray = [];
            for(let touchedIndex in cardsLeftTouchedTimesCorrect) {
                let percentageOfShowing = Math.floor((cardsLeftTouchedTimesCorrect[touchedIndex] / sumTouchedArrayTimesCorrect) * 100);
                probabilityPercentageArray.push(percentageOfShowing);
            }

            //reverse the probability such that the smallest number will have the highest percetnage
            probabilityPercentageArray.reverse();
            let probabilityArray = []; 
            for(let item in probabilityPercentageArray) {
                for( let i = 0; i < probabilityPercentageArray[item]; i++ ) {
                    probabilityArray.push(cardsLeftTouchedIndices[item]);
                }
            }
            let randomizedIndex = probabilityArray[Math.floor(Math.random() * probabilityArray.length)];
            return randomizedIndex;
        }
    }

    function getRandomizedFlashcardIndexFromUntouchedFlashcards() {
        return cardsLeftUntouchedIndices[Math.floor(Math.random() * cardsLeftUntouchedIndices.length)];
    }

    //Reveal answer when clicking on flash card
    $("#flashcard").on("click", function() {
        
        //Initial card 
        let currentCard = null;
        if(studyQueue.length > 0) {
            currentCard = originalDeckData.data[studyQueue[0]];
        }

        let currentState = $(this).data("state");

        if (currentState === "question") {
            //set the question state to answer
            $(this).data("state", "answer");
            $(this).text(currentCard.answer);

            //show study btns
            showStudyBtns();
        }
        else if (currentState === "answer") {
            //set the answer to question
            $(this).data("state", "question");
            $(this).text(currentCard.question);
        }
    });


    //Reveal answer when clicking on past flash card
    $("#pastFlashcard").on("click", function () {
        //Initial card 
        let currentCard = null;
        if (pastCardIndicesDone.length > 0) {
            currentCard = originalDeckData.data[pastCardIndicesDone[pastCardsIndex]];
        }
        let currentState = $(this).data("state");

        if (currentState === "question") {
            //set the question state to answer
            $(this).data("state", "answer");
            $(this).text(currentCard.answer);
        }
        else if (currentState === "answer") {
            //set the answer to question
            $(this).data("state", "question");
            $(this).text(currentCard.question);
        }
    });

    
    $("#prevFlashcardBtn").click(function(){
        //hide btns
        hideStudyBtns();

        //if first time showing: flashcard id does not have class display_none
        if(!$("#flashcard").hasClass("display_none")) {
            //use the index 0 as the card

            //hide the flashcard
            $("#flashcard").addClass("display_none");

            //if length of indices done is 1
            if (pastCardIndicesDone.length === 1) {

                //hide previous btn
                $("#prevFlashcardBtn").addClass("display_none");
            }
        }
        else {
            //if second last item in past cards done array
            if (pastCardIndicesDone.length > 0 && (pastCardsIndex === 1)) {
                //hide previous btn
                $("#prevFlashcardBtn").addClass("display_none");
            }
            if (pastCardIndicesDone.length > 0 && (pastCardsIndex > 0)) {
                //decrement index, only when not first time.
                pastCardsIndex = pastCardsIndex - 1;
            }
        }

        //set flashcard using past index
        let prevCardIndex = pastCardIndicesDone[pastCardsIndex];
        $("#pastFlashcard").text(originalDeckData.data[prevCardIndex].question);
        $("#pastFlashcard").data("state", "question");

        //show pastFlashcard
        $("#pastFlashcard").removeClass("display_none");

        //show the next btn
        $("#nextFlashcardBtn").removeClass("display_none");
     });
    

    $("#nextFlashcardBtn").click(function(){
        //if the index is equal to last item of the pastCardIndicesDone array, hide the past flashcards and show the flashcard,
        if (pastCardIndicesDone.length > 0 && ((pastCardIndicesDone.length - 1) === pastCardsIndex)) {
            $("#flashcard").removeClass("display_none");
            $("#pastFlashcard").addClass("display_none");

            //hide the next btn
            $("#nextFlashcardBtn").addClass("display_none");

            //show study btns
            showStudyBtns();
        }
        //increment the index and refresh the question card
        else {
            pastCardsIndex = pastCardsIndex + 1;

            //set the question data
            let nextCardIndex = pastCardIndicesDone[pastCardsIndex];
            $("#pastFlashcard").text(originalDeckData.data[nextCardIndex].question);
            $("#pastFlashcard").data("state", "question");
        }

        //show the prev btn
        $("#prevFlashcardBtn").removeClass("display_none");
    });

    function handleAnswerBtns(btnId) {
        //set the state of card to question
        $("#flashcard").data("state", "question");

        //hide btns
        hideStudyBtns();

        //current studyQueue item
        let currentCardIndex = studyQueue[0];

        //show previous btn
        $("#prevFlashcardBtn").removeClass("display_none");

        //add the card that just answered to "pastCardIndicesDone" for previous back tracking
        pastCardIndicesDone.push(currentCardIndex);

        //set the index to last item of cardIndicesDone by length
        pastCardsIndex = (pastCardIndicesDone.length - 1);

        if (btnId === "redBtn") {
            //handle I don't know
            handleDontKnowBtn();
            let nextCardIndex = studyQueue[0];
            //go to the next card
            currentCard = originalDeckData.data[nextCardIndex];
        }
        else if (btnId === "yellowBtn") {
            //handle I got it
            handleIGotItBtn();
            let nextCardIndex = studyQueue[0];
            //go to the next card
            currentCard = originalDeckData.data[nextCardIndex];
        }
        else if (btnId === "greenBtn") {
            handleEasyBtn();
            let nextCardIndex = studyQueue[0];
            //go to the next card
            currentCard = originalDeckData.data[nextCardIndex];
        }

        //refresh the number correct and incorrect counters
        $("#correctNum").text(numberCorrect);
        $("#incorrectNum").text(numberIncorrect);

        //no data left in study queue, hide the question/answer card and show "No more flash cards screen". 
        if(studyQueue.length <= 0) {
            $("#flashcard").addClass("display_none");
            $("#no_cards_screen").removeClass("display_none");
            //hide the prev and forward btn
            $("#prevFlashcardBtn").addClass("display_none");
            $("#nextFlashcardBtn").addClass("display_none");
        }
        else {
            //set the next question, if there are any more items in study queue
            $("#flashcard").text(currentCard.question);
            $("#flashcard").data("state", "question");
        }
    }

    //Incorrect answer
    $("#redBtn").click(function () {
        handleAnswerBtns($(this).attr("id"));
    });

    //Correct answer
    $("#yellowBtn").click(function () {
        handleAnswerBtns($(this).attr("id"));
    }) ;

    //Easy, Don't show
    $("#greenBtn").click(function(){
        handleAnswerBtns($(this).attr("id"));
    });

    function showStudyBtns() {
        $("#btn-row").removeClass("display_none");
    }

    function hideStudyBtns() {
        $("#btn-row").addClass("display_none");
    }
});
    