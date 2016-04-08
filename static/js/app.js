function TodoList(data) {
    this.html =
        "<div class='list-group-item active/'>" +
        "<p id='entryId' class='list-group-item-heading'style='display: none'><%= id %></p>" +
        "<h4 class='list-group-item-heading'><strong>Author:</strong><%= author %></h4>" +
        "<p class='list-group-item-text'><strong>Title:</strong><%=taskTitle%></p>" +
        "<p class='list-group-item-text'><strong>Description:</strong><%=taskDescription%></p>" +
        "<p class='list-group-item-text'><strong>Notes:</strong><%=taskNotes%></p>" +
        "<div class='btn-group' role='group' aria-label=''>" +
        "<button type='button' class='btn btn-default' data-toggle='modal' data-target='#editModal' onclick=getId(this) id=<%=id%>>Update</button>" +
        "<button type='button' class='btn btn-success' data-toggle='modal' data-target='#nodeModal' onclick=getId(this) id=<%=id%>>Note</button>" +
        "<button type='button' class='btn btn-danger' onclick=getId(this) id=<%=id%>>Delete</button>" +
        "</div>" +
        "</div>";
}
TodoList.prototype = {
    render: function () {
        var el = $("#todoList"), l = arguments[0].length;
        el.html('');
        var compiled = _.template(this.html);
        if (!l) {
            el.append(compiled(arguments[0]));
        } else {
            for (var i = 0; i < l; i++) {
                el.append(compiled(arguments[0][i]));
            }
        }
    }
};