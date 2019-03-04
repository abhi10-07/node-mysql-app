const express = require("express");
const router = express.Router();

router.get('/', function (req, res) {
    res.render('vw_login', {
        pageTitle: "Login",
        pageId: "login",
        jsRequired: ['validation']
    });
});

router.get('/login', function (req, res) {
    res.render('vw_login', {
        pageTitle: "Login",
        pageId: "login",
        jsRequired: ['validation']
    });
});

router.post('/login', function (req, res) {

    // session_store = req.session; 

    // req.assert('txtEmail', 'Please fill the Username').notEmpty();
    // req.assert('txtEmail', 'Email not valid').isEmail();
    // req.assert('txtPassword', 'Please fill the Password').notEmpty();
    // var errors = req.validationErrors();
    // if (!errors) {}

    let password = req.sanitize( 'password' ).escape().trim(); 
    let username = req.sanitize( 'username' ).escape().trim();

    let query = "Select id, username, password From users Where email =  '" + username + "' AND flag = 1"; 

    pool.query(query, function(err, result) {

        if(err) {
            return res.status(500).send(err);
        }

        result = JSON.parse(JSON.stringify(result));
        
        if(result.length > 0) {
            if(password == result[0].password) {

                req.session.is_login = true;
				req.session.username = username;
                req.session.userId = result[0].id;

                return res.send({'status':1});
            } else {
                return res.send({'status':2});
            }
        } else {
            return res.send({'status':0});
        }
    })

});

router.get('/logout', function (req, res) {
    req.session.destroy(function(err) { 
        if(err) { 
            console.log(err); 
        } else { 
            res.redirect('/login'); 
        } 
    });
})

router.get('/addUser', function (req, res) {
    res.render('vw_addUser', {
        pageTitle: "Add User",
        pageId: "add_user",
        jsRequired: ["validation"],
    });
});

router.post('/addUser/processAddUser', function (req, res) {

    let fname = req.body.fname;
    let lname = req.body.lname;
    let username = req.body.email;
    let password = req.body.password;
    let email = req.body.email;
    let phone = req.body.phone;
    let description = req.body.description;

    let query = "SELECT username FROM users where username = '"+ username +"'";
    
    pool.query(query, function (err, result) {
        if(err) {
            return res.status(500).send(err);
        }

        if(result.length > 0) {
            message = "Username exist !";
            res.render('vw_addUser.js', {
                message,
                pageTitle : "User exist",
            });
        } else {
            // send the player's details to the database
            let query = "INSERT INTO `users` (first_name, last_name, username, password, email, phone, description) VALUES ('" +
            fname + "', '" + lname + "', '" + username + "', '" + password + "', '" + email + "', '" + phone + "', '" + description + "')";
            pool.query(query, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.redirect('/');
            })
        }
    })
});

module.exports = router;