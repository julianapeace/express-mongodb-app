
const MongoClient = require('mongodb').MongoClient
const express = require('express')
const app = express()
const importEnv = require('import-env')
const port = process.env.PORT || 8000;
var uri = process.env.DB;
const body_parser = require('body-parser');
var ObjectId = require('mongodb').ObjectID;

app.use(body_parser.urlencoded({extended: false}));

app.set('view engine', 'hbs');
app.use(express.static('public'));

MongoClient.connect(uri, function (err, db) {
  if (err) throw err //could set up error handling to redirect to a page or restart the app
  db = db
  const tasks = db.collection('tasks')

  app.get('/', function(req, res){
    res.redirect('/todos');
  });

  app.get('/todos', function (req, res, next) {
    try{
      tasks.find({}).toArray(function(err, results){
        if (err) throw err;
        console.log(results)
        res.render('todo.hbs', {results: results});
      })
    }
    catch(e){
      console.log('BIG OL ERROR: '+ e)
    }
  });

  app.post('/submit', function(req, res){
    let description = req.body.description;
    try{
      tasks.insertOne({
        description: description,
        done: false
      })
        .then(function(result){
          console.log('Inserted count: ' + result.insertedCount)
          console.log('inserted new task with ID: ' + result.insertedId)
        })
        res.redirect('/todos')
        .catch(next)
    }
    catch(e){
      console.log(e)
    }
    finally{
      console.log('in finally block')
    }
  });

  app.get('/remove', function(req, res){
    tasks.remove({});
    res.redirect('/todos');
  });

  app.post('/done', function(req, res, next){
    var id = req.body._id;
    console.log(id)
    try{
      tasks.findOne({_id:ObjectId(id)})
        .then(function(result){
          return result.done
        })
        .then(bool =>
          tasks.updateOne({_id: ObjectId(id)}, {$set: {"done":!bool}})
            .then(function(result){
              res.redirect('/todos')
            })
            .catch(next)
          )
    }
    catch(e){
      console.log(e)
    }
  });

  app.listen(port, function(){
    console.log('listening on port ' + port)
  });
  db.close();
})
