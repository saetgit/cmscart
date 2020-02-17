var express = require('express');
var router = express.Router();
var Page = require('../models/page');
//get /
router.get('/', function (req, res) {
    Page.findOne({ slug: 'home' }, function (err, page) {
        if (err) console.log(err);
        res.render('index', {
            title: page.title,
            content: page.content
        });



    });
});

//get a page
router.get('/:slug',  (req, res)=> {
    var slug = req.params.slug;
    Page.find({ slug }, (err, page)=> {
        if (err) console.log(err);
        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
              
            })
            console.log(content);
        }


    });
    res.render('index', { title: 'Home' });
});

//exports
module.exports = router;