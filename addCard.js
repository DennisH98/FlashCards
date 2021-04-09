$(document).ready(function () {
    $("#addFlashcardBtn").on("click", function () {
        $("#emptyModal").load("./addCard.html", function () {
            $("#emptyModal").modal("show");

            $("#submitButton").on("click", function () {
                console.log("Submit new card");
                let deckJsonData = getDataFromLocalStorage(FLASHCARD_DECK_ID);

                // Get input data
                let question = $("#questionForm").val().trim();
                let answer = $("#answerForm").val().trim();
                
                //as long as data is not empty and not a duplicate question (case sensitive)
                if (question !== "" 
                    && answer !== ""
                    && !checkIfQuestionExistsInLocalStorage(question, deckJsonData.data)
                ) {
                    let array = { question, answer };
                    deckJsonData['data'].push(array);

                    console.log("Add new card to storage");
                    console.log(deckJsonData);
                    saveDataToLocalStorage(FLASHCARD_DECK_ID, deckJsonData);

                    $("#cardList").bootstrapTable("load", deckJsonData["data"]);
                    $("#emptyModal").modal("hide");


                    //enable study now button now button if data exists in deck
                    if (deckJsonData.data.length > 0) {
                        $("#studyFlashDeckBtn").attr("disabled", false);
                    }
                } else {
                    alert("Please enter a unique question.");
                }
            });
        });
    });
});
