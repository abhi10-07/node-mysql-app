const express = require("express");
//object of express lib and creating instance of Router
const router = express.Router();
var authentication_mdl = require('../middlewares/authentication');

router.get('/home', authentication_mdl.is_login, function (req, res) {

    userId = req.session.userId;
    var userPhotos = [];

 
    let query = "Select image From gallery Where user_id = '" + userId + "' and flag = 1" ;
    pool.query(query, function (err, result) {
        if(err) {
            return res.status(500).send(err);
        }
        var resultArray = JSON.parse(JSON.stringify(result));

        resultArray.forEach(function(item) {
            var rows = JSON.parse(item.image);
            for(var i = 0; i < rows.length; i++) {
                var obj = rows[i];
                userPhotos.push(obj.filename);
            }
        })

        res.render('vw_index', {
            pageTitle: "Home",
            pageId: "home",
            images: userPhotos,
            jsRequired: ['gallery']
        });

    });

 
});

//to export the route
module.exports = router;