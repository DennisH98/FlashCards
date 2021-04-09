$(document).ready(function () {
    $("#editFlashcardBtn").on("click", function () {
        $("#emptyModal").load("./editCard.html", function () {

            // Check for null data
            if (rowSelection != null) {
                let originalQuestion = rowSelection["question"];
                let answer = rowSelection["answer"];

                // Load data into modal
                $("#questionForm").val(originalQuestion);
                $("#answerForm").val(answer);
                $("#emptyModal").modal("show");

                $("#submitButton").on("click", function () {
                    newQuestion = $("#questionForm").val().trim();
                    answer = $("#answerForm").val().trim();
                    
                    let deckJsonData = getDataFromLocalStorage(FLASHCARD_DECK_ID);
                    //checks if the original loaded question matches the newly set question name.
                    //if it matches, allow save
                    //OR If not match, check if other question names are duplicate, if not, allow save.
                    if (originalQuestion === newQuestion
                        || (originalQuestion !== newQuestion && !checkIfQuestionExistsInLocalStorage(newQuestion, deckJsonData.data))
                    ) {
                       
                        //update the original question and answer in the deckJsonData with the new question value and answer
                        for(index in deckJsonData.data) {
                            if (deckJsonData.data[index].question === originalQuestion) {
                                deckJsonData.data[index] = { 
                                    "question": newQuestion,
                                    "answer": answer
                                };
                            }
                        }

                        console.log("new question and answer: " + newQuestion + answer);
                        console.log(deckJsonData);

                        //save to local storage
                        saveDataToLocalStorage(FLASHCARD_DECK_ID, deckJsonData);
                       
                        //update table
                        $("#cardList").bootstrapTable("load", deckJsonData.data);

                        //unselect the all table row
                        $('#cardList').bootstrapTable('uncheckAll');

                        //unset row selection
                        rowSelection = null;
                        rowIndex = null;
                        console.log({ rowSelection, rowIndex });

                        //disable edit and remove button
                        $("#editFlashcardBtn").attr("disabled", true);
                        $("#removeFlashcardBtn").attr("disabled", true);

                        $("#emptyModal").modal("hide");
                    }
                    else {
                        alert("Please enter a unique question.");
                    }
                });
            }
        });
    });
});
