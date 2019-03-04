const express = require("express");
const mysql = require("mysql");
const util = require('util');
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
// const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressValidator = require("express-validator");

var authentication_mdl = require('./middlewares/authentication');

const app = express();

var port = 3000;

/* --------------------mysql connection------------------------- */
/* 
//createConnection()
const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'Madrid.10',
    database : 'panel',
});

db.connect(function(err){
    if(err){
        throw err;
    }
    
    console.log("Connected to database"); 
});

global.pool = db; //global for other routes as well

 */

// createPool()
//Can be done through middleware as well(Database.js like authentication.js)

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Madrid.10',
    database: 'panel'
})
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
});

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query)

global.pool = pool; //global for other routes as well




/* --------------------mysql connection end------------------------- */

/* ----------------------configure middleware -------------------- */

app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(logger('dev'));
app.use(session({
    secret:"secretpass123456",
    resave: true,
	saveUninitialized: true
}));
app.use(expressValidator());
// app.use(cookieParser());

/* ----------------------configure middleware end-------------------- */


/* -----------------------------------Routes----------------------------- */
// routes for the app
// two type to do routing.
// 1. Using router
app.use(require('./routes/index')); 
app.use(require('./routes/login'));

// 2. Without router
const {addPhotosPage, processUploadPhotos, editProfilePage} = require('./routes/user');
//app.use(require('/editUser', editUserPage));
//app.use(require('/processEditUser', processEditUser));
app.get('/addPhotos', authentication_mdl.is_login, addPhotosPage);
app.post('/ajaxUploadPhotos', processUploadPhotos);
app.get('/editProfile', editProfilePage);

/* -----------------------------------Routes end----------------------------- */


//listener
app.listen(port, function() {
    console.log("Server running on port:" + port);  
}) 