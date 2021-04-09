$(document).ready(function () {
    $("#removeFlashcardBtn").on("click", function () {
        console.log("remove button");
        // Check for null data
        if (rowSelection != null) {
            console.log("remove valid data");

            let deckJsonData = getDataFromLocalStorage(FLASHCARD_DECK_ID);

            let index = deckJsonData["data"].findIndex(function (value) {
                return value.question.toString() === rowSelection.question.toString()
            });

            deckJsonData["data"].splice(index, 1);

            saveDataToLocalStorage(FLASHCARD_DECK_ID, deckJsonData);
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

            
            //disable study now button now button if no data left within deck data.
            if (deckJsonData.data.length <= 0) {
                $("#studyFlashDeckBtn").attr("disabled", true);
            }
        }
    });
});
