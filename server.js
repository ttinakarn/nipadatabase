var express = require('express');
var app = express();
var http = require('http').createServer(app);
var db = require('./database');
var io = require('socket.io')(http);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var _socket = null;

var cors = require('cors');
app.use(cors());

io.on('connection', function (socket) {
    _socket = socket;
    console.log('a user connected');
});

// index page
app.get('/', function (req, res) {
    res.send('Express is running');
});

app.get('/api/update', function (req, res) {

    
    // if (_socket) {

    //     _socket.emit('dataUpdated', "Updated data at " +  );

    //     res.send(new Date().toUTCString())
    // }
});
var output = {
    status: 'success',
    message: 'REST API is working'
};

app.get('/api/json', function (req, res) {
    res.status(500).json(output);
});
app.post('/api/vitalsign/', db.insertVitalSigns, (req, res) => {
   console.log('dataUpdated') ;
   
   if (_socket) {

        _socket.emit('dataUpdated',req.data);

       

    }
});
app.get('/api/vitalsign/', db.getVitalSigns);
app.get('/api/vitalsign/:id', db.getVitalSignByID);
app.get('/api/condition/', db.getCondition);
app.get('/api/condition/:id', db.getConditionByID);
app.get('/api/bednumber', db.getBedNumber);
app.get('/api/getBedInfo/:id', db.getBedInfo);
app.get('/api/getLastestVS/:id', db.getLastestVS);

var port = process.env.PORT || 8080;
http.listen(port, function () {
    console.log('App is running on http://localhost:' + port);
});