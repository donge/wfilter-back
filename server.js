//server.js
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser  = require('body-parser');

//database
mongoose.connect('mongodb://127.0.0.1:27017/wfilter');

var db = mongoose.connection;
db.on('error', function (err) {
  console.log('connection error:', err.message);
});
db.once('open', function callback () {
  console.log("Connected to DB!");
});


//data
var all = mongoose.model('All', {
    keyword: String,
    action: String,
});


var Schema = mongoose.Schema;

// Word schema
var Word = new Schema({
    keyword: { type: String, required: true, unique: true },
    rule: { type: String, required: true}
});
/*
Word.path('keyword').validate(function (v) {
  return v.length > 1;
});
*/
var WordModel = mongoose.model('Word', Word);


//config
app.set('title', 'My Application');


//route
app.get('/api/words', function(req, res) {
	WordModel.find(function(err, words) {
		if (err) {
			res.send(err);
		}
		res.json(words);
	});
});
//post must use body parse
app.use(bodyParser.json());

app.post('/api/words', function(req, res) {
    console.log(req);
  	var word = new WordModel({
  	    keyword: req.body.keyword,
  	    rule: req.body.rule
  	});

  	word.save(function (err) {
    if (!err) {
      return res.send({ status: 'OK', word:word });
    } else {
      //console.log(err);
      if(err.name == 'ValidationError') {
        res.statusCode = 400;
        res.send({ error: 'Validation error' });
      } else {
        res.statusCode = 500;
        res.send({ error: 'Server error' });
      }
      console.log('Internal error(%d): %s',res.statusCode,err.message);
    }
  });
});


app.delete('/api/words/:id', function(req, res) {
    console.log(req);
    WordModel.remove({
        _id: req.params.id
    }, function (err, word) {
        if (!err) {
            return res.send({ status: 'OK', word:word });
        } else {
            res.send(err);
        }
    });
});

/*
app.get('*', function(req, res) {
	res.sendfile('./public/index.html')
});
*/
app.use('/', express.static('public'));

app.listen(8080, function() {
	console.log('App listening on port 8080');
});

