/**
 * ElementList provides a way of seeing all of the data stored on the server.
 */
class ElementList {
    /**
     * refresh is the public method for updating messageList
     */
    refresh() {
        // Issue a GET, and then pass the result to update()
        $.ajax({
            type: "GET",
            url: "/messages",
            dataType: "json",
            success: mainList.update
        });
    }

    /**
     * update is the private method used by refresh() to update messageList
     */
    private update(data: any) {
        $("#messageList").html("<table>");
        for (let i = 0; i < data.mData.length; ++i) {
            $("#messageList").append("<tr><td>" + data.mData[i].mTitle +
                "</td>" + mainList.buttons(data.mData[i].mId) + "</tr>");
        }
        $("#messageList").append("</table>");
        // Find all of the delete buttons, and set their behavior
        $(".delbtn").click(mainList.clickDelete);
        // Find all of the Edit buttons, and set their behavior
        $(".editbtn").click(mainList.clickEdit);
    }

    /**
     * buttons() adds a 'delete' button and an 'edit' button to the HTML for each
     * row
     */
    private buttons(id: string): string {
        return "<td><button class='editbtn' data-value='" + id
            + "'>Edit</button></td>"
            + "<td><button class='delbtn' data-value='" + id
            + "'>Delete</button></td>";
    }

    /**
     * clickEdit is the code we run in response to a click of a delete button
     */
    private clickEdit() {
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
    private clickDelete() {
      // TODO: check the response
      let id = $(this).data("value");
      $.ajax({
          type: "DELETE",
          url: "/messages/" + id,
          dataType: "json",
          // TODO: we should really have a function that looks at the return
          //       value and possibly prints an error message.
          success: mainList.refresh
      })
    }
} // end class ElementList
