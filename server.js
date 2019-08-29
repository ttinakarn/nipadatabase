var express = require('express');
var app = express();
var db = require('./database');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
extended: true
}));

var cors = require('cors');
app.use(cors());

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
app.post('/api/vitalsign/',  db.insertVitalSigns);
app.get('/api/vitalsign/',  db.getVitalSigns);
app.get('/api/vitalsign/:id', db.getVitalSignByID);
app.get('/api/condition/', db.getCondition);
app.get('/api/condition/:id', db.getConditionByID);
app.get('/api/bednumber', db.getBedNumber);
app.get('/api/getBedInfo/:id', db.getBedInfo);
app.get('/api/getLastestVS/:id', db.getLastestVS);

// app.get('/api/products/', db.getAllProducts);
// app.get('/api/products/:id', db.getProductByID);
// app.post('/api/products/', db.insertProduct);
// app.put('/api/products/:id', db.updateProduct);
// app.delete('/api/products/:id', db.deleteProduct);

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log('App is running on http://localhost:' + port);
});