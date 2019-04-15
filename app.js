const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');
let tenantAvaible = [];
let tenantBussy = [];
let timer = 30;
//Create redis client

let client = redis.createClient();

client.on('connect', function () {
    console.log('Connected to REDIS...')
})


//Setting port 
const port = 3000;

//init app
const app = express();

//View Engine 
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//methodOverride
app.use(methodOverride('_method'));

// Search Page
app.get('/', function (req, res, next) {
    res.render('searchusers');
});

//Search Processing
app.post('/user/search', function (req, res, next) {
    client.set(`stagepool1`, 'value', 'nx', 'ex', timer, function (err, reply) {
        if (reply === null) {
            let result;
            client.ttl(`stagepool1`, function (err, reply) {
                res.render('searchusers', {

                    error: `tenant ---Stagepool1---- is bussy, remaining time is ${reply}`
                });
            });

        } else if (reply == "OK") {
            tenantAvaible.push('stagepool' + (tenantAvaible.length + 1));

            res.render('searchusers', {

                error: `stagepool1 fue seteado`
            });
        };
    });





});



// Add user Page
app.get('/user/add', function (req, res, next) {
    res.render('addusers');
});

// Processing Add User Page
app.post('/user/add', function (req, res, next) {
    let tenant = req.body.tenant;
    let ttl = req.body.ttl;

    client.set(tenant, tenant, 'ex', ttl, 'nx',
        function (err, reply) {
            if (reply === null) {
                client.ttl(tenant, function (err, reply) {
                    res.render('addusers', {
                        error: `tenant ---${tenant}---- is bussy, remaining time is ${reply}`
                    });
                });
            } else if (reply == "OK") {
                res.render('addusers', {
                    error: `${tenant} fue seteado`
                });
            };
        });

});

//delete 
app.post('/user/delete/', function (req, res, next) {
    let tenat1 = req.body.tenant;
    client.del(tenat1);
    res.render('addusers', {
        error: `${tenat1} fue desbloqueado`
    });
});

app.listen(port, function () {
    console.log('Server started on port ' + port);
})




