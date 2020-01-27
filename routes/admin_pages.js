const express = require('express');
const router = express.Router();
const flash = require("connect-flash");
const { check, validationResult } = require('express-validator');
//get page modle
const Page = require('../models/page');

//get pages index
router.get('/', function (req, res) {
    res.send('admin Area');
});

//get add page
router.get('/add-page', function (req, res) {
    let title = "";
    let slug = "";
    let content = "";
    res.render('admin/add_page', { title, slug, content });
});

//post add page
router.post('/add-page', [
    check('title', 'Title must have a value.').not().isEmpty(),
    check('content', 'Content must have a value.').not().isEmpty(),
], function (req, res, next) {

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;

    //check validate data
    const result = validationResult(req);
    let errors = result.errors;
    for (let key in errors) {
        console.log(errors[key].value);
    }
    if (!result.isEmpty()) {
        //response validate data to register.ejs
        res.render('admin/add_page', { errors, slug, content, title });
    } else {
        Page.findOne({ slug }, (err, page) => {
            // ... code
            // console.log(page)

            if (page) {
                req.flash('msg', 'page slug exists,choose another!');
                res.locals.messages = req.flash();
                res.render('admin/add_page', {
                    errors, slug, content, title
                });
            } else {
                const page = new Page({
                    title,
                    slug,
                    content,
                    sorting: 0
                });
                page.save(err => {
                    if (err)
                        return console.log(err);
                    req.flash('success', 'page add');
                    res.redirect('/admin/pages');
                });


            }
        })
    }
});

//exports
module.exports = router;