const express = require('express');
const router = express.Router();
const flash = require("connect-flash");
const { check, validationResult } = require('express-validator');
//get page modle
const Page = require('../models/page');

//get pages index
router.get('/', function (req, res) {
    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
        res.render('admin/pages', {
            pages: pages
        });
    });
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
                    sorting: 100
                });
                page.save(err => {
                    if (err)
                        return console.log(err);
                    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
                        if (err) {
                            console.log(err);
                        } else {
                            app.locals.pages = pages;
                        }
                    });
                    req.flash('success', 'page add');
                    res.redirect('/admin/pages');
                });


            }
        })
    }
});
//sort pages function
function sortPages(ids, callback) {
    const count = 0;
    for (const i = 0; i < ids.length; i++) {
        const id = ids[i];
        count++;
        (function (count) {
            page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });

        })(count);
    }
}
//post reorder pages 
router.post('/reorder-page', (req, res) => {
    const ids = req.body['id[]'];
    sortPages(ids, function () {

    })


});

//get edit page
router.get('/edit-page/:id', (req, res) => {
    Page.findById(req.params.id).then((page) => {
        if (!page) { //if page not exist in db
            return res.status(404).send('Page not found');
        }
        res.render('admin/edit_page', { //page  exist
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    }).catch((e) => {//bad request 
        res.status(400).send(e);
    });
});
//post edit page
router.post('/edit-page/:id', [
    check('title', 'Title must have a value.').not().isEmpty(),
    check('content', 'Content must have a value.').not().isEmpty(),
], function (req, res, next) {

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;
    let id = req.params.id;
    //check validate data
    const result = validationResult(req);
    let errors = result.errors;
    for (let key in errors) {
        console.log(errors[key].value);
    }
    if (!result.isEmpty()) {
        //response validate data to register.ejs
        res.render('admin/edit_page', { errors, slug, content, title, id });
    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, (err, page) => {
            // ... code
            // console.log(page)

            if (page) {
                req.flash('msg', 'page slug exists,choose another!');
                res.locals.messages = req.flash();
                res.render('admin/edit_page', {
                    errors, slug, content, title, id
                });
            } else {
                Page.findById(id, (err, page) => {
                    if (err) return console.log(err);
                    page.title = title,
                        page.slug = slug,
                        page.content = content

                    page.save(err => {
                        if (err)
                            return console.log(err);
                        req.flash('success', 'page add');
                        res.redirect('/admin/pages/edit-page/' + id);
                    });
                });



            }
        })
    }
});
//get delete page
router.get('/delete-page/:id', (req, res) => {
    Page.findByIdAndRemove(req.params.id, (err) => {
        if (err) return console.log(err);
        req.flash('success', 'page delete');
        res.redirect('/admin/pages');

    })
});
//exports
module.exports = router;