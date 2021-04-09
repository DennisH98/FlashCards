$(document).ready(function () {
    $("#createFlashDeckBtn").on("click", function () {
        $("#emptyModal").load("./addDeck.html", function () {
            $("#emptyModal").modal("show");

            $("#submitButton").on("click", function () {
                // Get input data
                let card_name = $("#nameForm").val();

                if (card_name !== "") {
                    let newFlaskDeck = {
                        "id": card_name,
                        "data": []
                    };
                    saveDataToLocalStorage(FLASHCARD_DECK_ID, newFlaskDeck);
                    $("#cardList").bootstrapTable("load", newFlaskDeck.data);
                    $("#emptyModal").modal("hide");

                    //open succcessful create, enable export and add button
                    $("#exportFlashDeckBtn").attr("disabled", false);
                    $("#addFlashcardBtn").attr("disabled", false);

                    //hide create flash deck button and show study now button
                    $("#createFlashDeckBtn").addClass("display_none");
                    $("#studyFlashDeckBtn").removeClass("display_none");

                    //reload the title name 
                    $('#title').text(card_name);
                } else {
                    alert("Invalid Entry");
                }
            });
        });
    });
});
