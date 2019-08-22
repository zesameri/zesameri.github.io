/**
 * ElementList provides a way of seeing all of the data stored on the server.
 */
class ElementList {
    /**
     * The name of the DOM entry associated with ElementList
     */
    private static readonly NAME = "ElementList";

    /**
     * Track if the Singleton has been initialized
     */
    private static isInit = false;

    /**
     * Initialize the ElementList singleton by creating its element in the DOM.
     * This needs to be called from any public static method, to ensure that the
     * Singleton is initialized before use.
     */
    private static init() {
        if (!ElementList.isInit) {
            $("body").append('<div id="' + ElementList.NAME +
                '"><h3>All Messages</h3><button id="' + ElementList.NAME +
                '-showFormButton">Add Message</button><div id="' +
                ElementList.NAME + '-messageList"></div></div>');
            ElementList.isInit = true;
        }
    }

    /**
     * refresh is the public method for updating messageList
     */
    public static refresh() {
        // Make sure the singleton is initialized
        ElementList.init();
        // Issue a GET, and then pass the result to update()
        $.ajax({
            type: "GET",
            url: "/messages",
            dataType: "json",
            success: ElementList.update
        });
    }

    /**
     * update() is the private method used by refresh() to update the
     * ElementList
     */
    private static update(data: any) {
        // Use a template to generate a table from the provided data, and put
        // the table into our messageList element.
        $("#" + ElementList.NAME + "-messageList").html(Handlebars.templates[ElementList.NAME + ".hb"](data));
        // Find all of the delete buttons, and set their behavior
        $("." + ElementList.NAME + "-delbtn").click(ElementList.clickDelete);
        // Find all of the Edit buttons, and set their behavior
        $("." + ElementList.NAME + "-editbtn").click(ElementList.clickEdit);
    }


    /**
     * buttons() adds a 'delete' button and an 'edit' button to the HTML for each
     * row
     */
    private static buttons(id: string): string {
      return "<td><button class='" + ElementList.NAME +
          "-editbtn' data-value='" + id + "'>Edit</button></td>" +
          "<td><button class='" + ElementList.NAME +
          "-delbtn' data-value='" + id + "'>Delete</button></td>";
    }

    /**
     * clickEdit is the code we run in response to a click of a delete button
     */
    private static clickEdit() {
        // as in clickDelete, we need the ID of the row
        let id = $(this).data("value");
        $.ajax({
            type: "GET",
            url: "/messages/" + id,
            dataType: "json",
            success: editEntryForm.init
        });
    }

    /**
     * clickDelete is the code we run in response to a click of a delete button
     */
    private static clickDelete() {
      // TODO: check the response
      let id = $(this).data("value");
      $.ajax({
          type: "DELETE",
          url: "/messages/" + id,
          dataType: "json",
          // TODO: we should really have a function that looks at the return
          //       value and possibly prints an error message.
          success: ElementList.refresh
      })
    }
} // end class ElementList
