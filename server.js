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

var output = {
    status: 'success',
    message: 'REST API is working'
};

app.get('/api/json', function (req, res) {
    res.status(500).json(output);
});

app.post('/api/vitalsign/', db.insertVitalSigns, (req, res) => {
   console.log('dataUpdated') ;
   console.log(_socket);
   console.log(req.data);  
   if (_socket) {
        _socket.emit('dataUpdated',req.data);
    }
});

app.get('/api/patient/', db.getpatient);
app.get('/api/patient/:an', db.getpatientInformation);
app.post('/api/patient', db.insertpatient);
app.put('/api/patient/:an', db.updatepatient);
// app.delete('/api/patient/:an', db.deletepatient);

app.get('/api/dischargepatient', db.getdischargepatient);
app.put('/api/dischargepatient/:an', db.updatedischarge);

app.get('/api/admithistory/:hn' , db.getadmithistory);

app.get('/api/vitalsign/', db.getVitalSigns);
app.get('/api/vitalsign/:an', db.getVitalSignByID);
app.get('/api/lastestVS/:an', db.getLastestVS);

app.get('/api/condition/', db.getCondition);
app.get('/api/condition/:id', db.getConditionByID);
app.get('/api/score/', db.getscore);

app.get('/api/bednumber', db.getBedNumber);
app.get('/api/bednumber/:an', db.getBedInfo);

var port = process.env.PORT || 8080;
http.listen(port, function () {
    console.log('App is running on http://localhost:' + port);
});