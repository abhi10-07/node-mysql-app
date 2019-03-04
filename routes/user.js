const express = require("express");
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const readChunk = require('read-chunk');
const fileType = require('file-type');

module.exports = {

    addPhotosPage: function (req, res) {
        
        res.render('vw_addImages', {
            pageTitle: "Add Photos",
            pageId: "add_photos",
            jsRequired: ['upload']
        });

    },

    processUploadPhotos: (req, res) => {

        var photos = [],
        userId = req.session.userId,
        form = new formidable.IncomingForm();
        form.multiples = true;
        form.uploadDir = path.join(__dirname, '../','tmp_uploads');
        form.on('file', function (name, file) {        
            var buffer = null,
                type = null,
                filename = '';
            buffer = readChunk.sync(file.path, 0, 262);
            type = fileType(buffer);
            // Check the file type as it must be either png,jpg or jpeg
            if (type !== null && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')) {
                filename = Date.now() + '-' + file.name;
                fs.rename(file.path, path.join(__dirname, '../public/uploads/' + filename));
                photos.push({
                    status: true,
                    filename: filename,
                    type: type.ext,
                    publicPath: '/uploads/' + filename
                });
            } else {
                photos.push({
                    status: false,
                    filename: file.name,
                    message: 'Invalid file type'
                });
                fs.unlink(file.path);
            }
        });
        form.on('error', function(err) {
            console.log('Error occurred during processing - ' + err);
        });
        form.on('end', function() {
            console.log('All the request fields have been processed.');
        });
        form.parse(req, function (err, fields, files) {
            let query = "Insert Into gallery (user_id, image) Values ('" + userId +"' , '"+ JSON.stringify(photos) +"')";
            
            pool.query(query, function (err, result) {
                if(err) {
                    return res.status(500).send(err);
                } 
            })
            res.status(200).json(photos);
        });

    },

    editProfilePage: (req, res) => {

        res.render('vw_editProfile', {
            pageTitle: "Edit Profile",
            pageId: "edit_profile",
            jsRequired: ['validation', 'datepicker']
        })
    }

};
