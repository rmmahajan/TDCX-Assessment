const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 4000;
const User = require('./models/user-model');
const Todos = require('./models/todos-model');
const ObjectId = require("mongoose").Types.ObjectId;
app.use(cors());
app.use(express.json());

// Establish connection to mongoDB
mongoose.connect("mongodb+srv://user:user123@users.qllx3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{ 
  useNewUrlParser: true,
  useCreateIndex: true, 
  useUnifiedTopology: true
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
  });
});

// Post request to register user
app.post("/register", async (req, res) => {

  try {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).exec();
  if (user) {
    res.status(500);
    res.json({
      message: "user already exists",
    });
    return;
  }
  await User.create({ username, password });
  res.json({
    message: "success",
  });
}
catch(err){
  console.log(err)
}
});

// Post request to login user
app.post("/login", async (req, res) => {
  try{
  const { username, password } = req.body;
  const user = await User.findOne({ username }).exec();
  if (!user || user.password !== password) {
    res.status(403);
    res.json({
      message: "invalid login",
    });
    return;
  }
  res.json({
    message: "success",
  });
}catch(err){
  console.log(err)
}
});

// Post request to add tasks to database
app.post("/todos", async (req, res) => {
  try{
  const { authorization } = req.headers;
  const [, token] = authorization.split(" ");
  const [username, password] = token.split(":");
  const todosItems = req.body;
  const user = await User.findOne({ username }).exec();
  if (!user || user.password !== password) {
    res.status(403);
    res.json({
      message: "invalid access",
    });
    return;
  }
  const todos = await Todos.findOne({ userId: user._id }).exec();
  if (!todos) {
    await Todos.create({
      userId: user._id,
      todos: todosItems,
    });
  } else {
    todos.todos = todosItems;
    await todos.save();
  }
  res.json(todosItems);
}catch(err){
  console.log(err)
}
});

// Get request to get the list of tasks from database
app.get("/todos", async (req, res) => {
  try{
  const { authorization } = req.headers;
  const [, token] = authorization.split(" ");
  const [username, password] = token.split(":");
  const user = await User.findOne({ username }).exec();
  if (!user || user.password !== password) {
    res.status(403);
    res.json({
      message: "invalid access",
    });
    return;
  }
  const { todos } = await Todos.findOne({ userId: user._id }).exec();
  res.json(todos);
}catch(err){
  console.log(err)
}
});


// Post request to delete tasks from database
app.post('/deleteTodos/:id', async (req,res) => {
  try{
  const { authorization } = req.headers;
  const [, token] = authorization.split(" ");
  const [username, password] = token.split(":");
  const user = await User.findOne({ username }).exec();
  if (!user || user.password !== password) {
    res.status(403);
    res.json({
      message: "invalid access",
    });
    return;
  }
  const data = await Todos.findOne({ userId: user._id }).exec();
  if (!data) {    
  } else {

    const todoId=req.params.id;
      Todos.findById(data._id)
      .then(result => {
        for(var i=0;i<result.todos.length;i++)
        {
          if(result.todos[i].id === todoId)
          {
            result.todos.splice(i,1);
            break;
          }
        }
        result.save()
        .then(() => res.json("Updated"))
        .catch(err => console.log(err))
      })

  }
}catch(err){
  console.log(err)
}
}); 

// Post request to update the edited task
app.post('/update/:id',async (req,res) => {
try{
  const { authorization } = req.headers;
  const [, token] = authorization.split(" ");
  const [username, password] = token.split(":");
  const user = await User.findOne({ username }).exec();
  if (!user || user.password !== password) {
    res.status(403);
    res.json({
      message: "invalid access",
    });
    return;
  }
  const todoId=req.params.id;
  const data = await Todos.findOne({ userId: user._id }).exec();
  if (!data) {    
  } else {

    Todos.findById(data._id)
      .then(result => {
        for(var i=0;i<result.todos.length;i++)
        {
          if(result.todos[i].id === todoId)
          {
            result.todos[i].text = req.body.newTodo;
            break;
          }
        }
        result.save()
        .then(() => res.json("Updated"))
        .catch(err => console.log(err))
      })
  }
}catch(err){
  console.log(err)
}
});
