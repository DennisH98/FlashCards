$(document).ready(function () {


    function importDeckData(deckJsonData) {
        //save to local storage
        saveDataToLocalStorage(FLASHCARD_DECK_ID, deckJsonData);

        $('#cardList').bootstrapTable("load", deckJsonData.data);
        $('#cardList').bootstrapTable('refresh');

        //updates the title of the table to the deck's title
        $('#title').text("" + deckJsonData.id);

        //enable the export button and add if data is loaded
        $("#exportFlashDeckBtn").attr("disabled", false);
        $("#addFlashcardBtn").attr("disabled", false);

        //hide the "create flash deck button" if flashdeck is loaded and show study button instead
        $("#createFlashDeckBtn").addClass("display_none");
        $("#studyFlashDeckBtn").removeClass("display_none");

        //if the data length is not empty, enable the study flash card button
        if(deckJsonData.data.length > 0) {
            $("#studyFlashDeckBtn").attr("disabled", false);
        }
    }


    // TODO prevent navigation away if editing something TODO, this does not work.
    // window.addEventListener("beforeunload", function (e) {
    //     var confirmationMessage = 'It looks like you have been editing something. '
    //         + 'If you leave before saving, your changes will be lost.';

    //     (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    //     return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    // });
    
    /**
     * Initial operations before showing page
     */

    //check if there is any already stored local data with the flashcard deck Id, if so, load it into the table
    let initialLoadedFlashCardData = getDataFromLocalStorage(FLASHCARD_DECK_ID);
    if (initialLoadedFlashCardData !== null) {
        console.log(initialLoadedFlashCardData)

        //setup page for importing data
        importDeckData(initialLoadedFlashCardData);
    }
    else {
        //show the main page if no data to be loaded.
        $('#title').text( "Please create a deck" );
    }

    $("#main").removeClass("display_none");

    /***
     * OPENS A SIMPLE MODAL
     */

    function clearSimpleModalData() {
        $("#simpleModal").modal('hide');

        //overwrite simple modal data before showing
            //remove all classes, then add only the basic classes
        $("#simpleModal").find("#modal-header").removeClass();
        $("#simpleModal").find("#modal-header").addClass("modal-header");
        $("#simpleModal").find("#modal-header").addClass("modal_header_background");

        $("#simpleModal").find("#simpleModalTitle").text("Modal Title");

        $("#simpleModal").find("#simpleModalBody").text("Modal Body");

        //buttons
        $("#simpleModal").find("#simpleModalXCloseBtn").removeClass();
        $("#simpleModal").find("#simpleModalXCloseBtn").addClass("close");
        $("#simpleModal").find("#simpleModalXCloseBtn").prop("onclick", null).off("click"); //remove onclick function

        $("#simpleModal").find("#simpleModalOkBtn").text("Ok");
        $("#simpleModal").find("#simpleModalOkBtn").prop("onclick", null).off("click"); //remove onclick function
        
        $("#simpleModal").find("#simpleModalCloseBtn").text("Close");
        $("#simpleModal").find("#simpleModalCloseBtn").prop("onclick", null).off("click"); //remove onclick function
    }


    /**
         * For opening the simple modal
         * @param {* The title of the modal } title 
         * @param {* The body text of the modal } body 
         * @param {* The text of the ok button } okBtnText 
         * @param {* function to execute upon click of ok btn } okBtnOnClickFunc 
         * @param {* Show or hide the close button and X button } hideCloseBtn 
         * @param {* Text of the close btn } closeBtnText 
         * @param {* type of modal, "primary", "error", "warning", "success" } type 
         * @param {* function to execute upon click of close btn  } closeBtnOnClickFunc
         * @param {* function to execute upon click of xclose btn } xCloseBtnOnClickFunc
         */
    function openSimpleModal(
        title = "Title",
        body = "Body",
        okBtnText = "Ok",
        okBtnOnClickFunc = () => { },
        hideCloseBtn = false,
        closeBtnText = "Close",
        type = "primary",
        closeBtnOnClickFunc = () => { },
        xCloseBtnOnClickFunc = () => { }

    ) {
        //overwrite simple modal data before showing
        if (type === "primary") {
            $("#simpleModal").find("#modal_header").addClass("bg-primary");
            $("#simpleModal").find("#modal-header").addClass("white_text");
            $("#simpleModal").find("#simpleModalXCloseBtn").addClass("white_text");
        }
        else if (type === "warning") {
            $("#simpleModal").find("#modal-header").addClass("bg-warning");
        }
        else if (type === "error") {
            $("#simpleModal").find("#modal-header").addClass("bg-danger");
            $("#simpleModal").find("#modal-header").addClass("white_text");
            $("#simpleModal").find("#simpleModalXCloseBtn").addClass("white_text");
        }
        else if (type === "success") {
            $("#simpleModal").find("#modal-header").addClass("bg-success");
            $("#simpleModal").find("#modal-header").addClass("white_text");
            $("#simpleModal").find("#simpleModalXCloseBtn").addClass("white_text");
        }

        //title and body
        $("#simpleModal").find("#simpleModalTitle").text(title);
        $("#simpleModal").find("#simpleModalBody").text(body);

        //ok button
        $("#simpleModal").find("#simpleModalOkBtn").text(okBtnText);
        $("#simpleModal").find("#simpleModalOkBtn").on("click", okBtnOnClickFunc);

        //hide close btn and x close btn
        if (hideCloseBtn) {
            $("#simpleModal").find("#simpleModalCloseBtn").addClass("display_none");
            $("#simpleModal").find("#simpleModalXCloseBtn").addClass("display_none");
        }
        else {
            $("#simpleModal").find("#simpleModalCloseBtn").text(closeBtnText);
            $("#simpleModal").find("#simpleModalCloseBtn").on("click", closeBtnOnClickFunc);

            $("#simpleModal").find("#simpleModalXCloseBtn").on("click", xCloseBtnOnClickFunc);
        }

        $("#simpleModal").modal('show');
    }

    $("#simpleModal").on("hidden.bs.modal", function(e) {
        //clear the simple modal after closing the modal
        clearSimpleModalData();
        console.log("clear modal");
    });


    /**
     *
     * LIST PAGE FOOTER ACTIONS BUTTONS
     */
    $("#studyFlashDeckBtn").on("click", function () {
        // switch over to the add card page
        window.location.href = 'StudySession/index.html';
    });


    /**
     * 
     * TOOL BOX BUTTONS
     */
    
    $("#studyFlashDeckBtn").on("click", function() {
	// switch over to the add card page
        window.location.href = 'StudySession/index.html';
    });

    $("#importFlashDeckBtn").on("click", function () {

        //asks if user once more before they load as they can be overwriting unsaved data
        openSimpleModal(
            "You have some unsaved changes.",
            "Are you sure you want to import another flash deck?",
            "Import",
            function () {
                $("#simpleModal").modal('hide');
                //open file input loader
                $("#loadDeckFileInput").trigger("click");
            },
            false,
            "Cancel",
            "warning"
        );
    });


    $("#exportFlashDeckBtn").on("click", function() {
        //downloads json object as a .json file, if there exists one
        let currentFlashDeck = getDataFromLocalStorage(FLASHCARD_DECK_ID);
        downloadFile(currentFlashDeck, currentFlashDeck.id, ".json");
    });


    /**
     * FILE INPUT OPERATIONS
     */

    //This is for checking if the file is a valid JSON, otherwise prevent save.
    $("#loadDeckFileInput").change(function () {
        //load file
        let fileToLoadData = document.getElementById("loadDeckFileInput").files[0];
        if(fileToLoadData) {
            let fileType = fileToLoadData.type;
            let fileName = fileToLoadData.name;

            //check if the file type is a json and ends with .json 
            if (!fileType === "application/json" || !fileName.toLowerCase().endsWith(".json")) {
                //invalid .json file extension file
                openSimpleModal(
                    "Invalid Flash Deck File",
                    "Please select a JSON extension file",
                    "Ok",
                    function() {
                        $("#simpleModal").modal('hide');
                    },
                    true,
                    "Close",
                    "error"
                );
                
                //empty out previously laoded data in the file input
                $(this).val(null);
            }
            //valid json
            else {
                readFlashDeckFile(fileToLoadData);
            }
        }
    });

    function readFlashDeckFile(fileToLoadData) {
        //attempt to read file data
        let fileReader = new FileReader();
        fileReader.onload = function (fileLoadedEvent) {
            let textFromFileLoaded = fileLoadedEvent.target.result;
            let deckJsonData = getParsedJsonFromText(textFromFileLoaded);

            //invalid json file
            if (deckJsonData == null) {
                openSimpleModal(
                    "Invalid JSON Flash Deck File",
                    "Please select a valid JSON file",
                    "Ok",
                    function () {
                        $("#simpleModal").modal('hide');
                    },
                    true,
                    "Close",
                    "error"
                );
            }
            //valid json, load into local storage and load table with data.
            else {
                //check if it has a valid flashdeck json structure of or its empty.
                /*
                    id: ""
                    data: [] 
		        */
                //valid flash deck json
                if (deckJsonData !== null 
                    && deckJsonData !== undefined
                    && deckJsonData.id !== undefined
                    && deckJsonData.data !== undefined
                    && typeof deckJsonData.id === "string"
                    && deckJsonData.id !== ""
                    && typeof deckJsonData.data === "object"
                    && deckJsonData.data.length >= 0
                ) {
                    console.log("loaded json data");
                    console.log(deckJsonData);

                    //set up page for importing data
                    importDeckData(deckJsonData);
                }
                //invalid flash deck file
                else {
                    openSimpleModal(
                        "Invalid Flash Deck File",
                        "Please select a valid Flash Deck file",
                        "Ok",
                        function () {
                            $("#simpleModal").modal('hide');
                        },
                        true,
                        "Close",
                        "error"
                    );
                }
            }

            //empty out previously laoded data in the file input
            $(this).val(null);
        };
        //read file
        fileReader.readAsText(fileToLoadData, "UTF-8");
    }



    /**
     *
     * TABLE ROW SELECTION
     */

     //enable edit and remove button while setting the data for rowselection
    $("#cardList").on("check.bs.table", function (row, $element, field) {

        //enable edit and remove button
        $("#editFlashcardBtn").attr("disabled", false);
        $("#removeFlashcardBtn").attr("disabled", false);

        //if elemnt is selec
        rowSelection = $element;
        rowIndex = field.index();
        console.log({rowSelection, rowIndex});
    });

    //on uncheck row, disable edit and remove and clear rowselection
    $("#cardList").on("uncheck.bs.table", function (row, $element, field) {

        //disable edit and remove button
        $("#editFlashcardBtn").attr("disabled", true);
        $("#removeFlashcardBtn").attr("disabled", true);

        rowSelection = null;
        rowIndex = null;
        console.log({ rowSelection, rowIndex });
    });



    /**
     * TODO Remove later, testing purposes
     */
    $("#clearInternalStorageBtn").on("click", function () {
        localStorage.clear();
        //destroy bootstrap table and then rebuild it.
        $("#cardList").bootstrapTable('destroy');
        $("#cardList").bootstrapTable();
    });

     // Get row data when clicking on row
    $("#cardList").on("click-row.bs.table", function (row, $element, field) {
        rowSelection = $element;
        rowIndex = field.index();
        console.log({rowSelection, rowIndex});
    });
});

let rowSelection;
let rowIndex;

function downloadFile(data, fileName, fileExt) { //found from here https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName + fileExt);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

