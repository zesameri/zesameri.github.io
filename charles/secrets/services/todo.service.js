// Getting the Mongoose Model
var ToDo = require('../models/todo.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the To do List
exports.getTodos = async function(query, page, limit)
{
    var options = {
        page,
        limit
    }
    // awaited promise, return todo list from the promise
    try {
        var todos = await ToDo.paginate(query, options)
        return todos;

    } catch(e) {
        throw Error('Error while Paginating Todos')
    }
}

// Creating a new Mongoose Object
exports.createTodo = async function(todo)
{
    var newTodo = new ToDo( {
        title: todo.title,
        description: todo.description,
        date: new Date(),
        status: todo.status
    })
    // save and return the new todo
    try {
        var savedTodo = await newTodo.save()
        return savedTodo;
    } catch(e) {
        throw Error("Error while creating Todo")
    }
}

exports.updateTodo = async function(todo){
    var id = todo.id
    // Find the old Todo Object by the Id
    try {
        var oldTodo = await ToDo.findById(id);
    } catch(e) {
        throw Error("Error occured while finding the Todo")
    }
    // if no Todo exists return false
    if(!oldTodo){
        return false;
    }

    console.log(oldTodo)

    //Edit the Todo Object
    oldTodo.title = todo.title
    oldTodo.description = todo.description
    oldTodo.status = todo.status

    console.log(oldTodo)

    try {
        var savedTodo = await oldTodo.save()
        return savedTodo;
    } catch(e) {
        throw Error("Error occured while updating the Todo");
    }
}

// Delete the Todo
exports.deleteTodo = async function(id){
    try {
        var deleted = await ToDo.remove({_id: id})
        if(deleted.result.n === 0){
            throw Error("Todo Could not be deleted")
        }
        return deleted
    } catch(e) {
        throw Error("Error Occured while Deleting the Todo")
    }
}
