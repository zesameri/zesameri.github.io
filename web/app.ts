/// <reference path="ts/EditEntryForm.ts"/>
/// <reference path="ts/NewEntryForm.ts"/>
/// <reference path="ts/ElementList.ts"/>

// Prevent compiler errors when using jQuery.  "$" will be given a type of
// "any", so that we can use it anywhere, and assume it has any fields or
// methods, without the compiler producing an error.
var $: any;

// a global for the main ElementList of the program.  See newEntryForm for
// explanation
var mainList: ElementList;
// a global for the EditEntryForm of the program.  See newEntryForm for
// explanation
var editEntryForm: EditEntryForm;


// The 'this' keyword does not behave in JavaScript/TypeScript like it does in
// Java.  Since there is only one NewEntryForm, we will save it to a global, so
// that we can reference it from methods of the NewEntryForm in situations where
// 'this' won't work correctly.
var newEntryForm: NewEntryForm;

// Run some configuration code when the web page loads
$(document).ready(function () {
    // Create the object that controls the "New Entry" form
    newEntryForm = new NewEntryForm();
    // Create the object for the main data list, and populate it with data from
    // the server
    // Create the object that controls the "Edit Entry" form
    editEntryForm = new EditEntryForm();

    mainList = new ElementList();
    mainList.refresh();

    // set up initial UI state
    $("#editElement").hide();
    $("#addElement").hide();
    $("#showElements").show();

    // set up the "Add Message" button
    $("#showFormButton").click(function () {
        $("#addElement").show();
        $("#showElements").hide();
    });
});
