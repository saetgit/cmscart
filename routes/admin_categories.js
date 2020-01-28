const express = require('express');
const router = express.Router();
const flash = require("connect-flash");
const { check, validationResult } = require('express-validator');
//get category modle
const Category = require('../models/category');

//get category index
router.get('/', function (req, res) {
    Category.find((err, categories) => {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});
//get add category
router.get('/add-category', function (req, res) {
    let title = "";

    res.render('admin/add_category', { title });
});

//post add category
router.post('/add-category', [
    check('title', 'Title must have a value.').not().isEmpty(),

], function (req, res, next) {

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();


    //check validate data
    const result = validationResult(req);
    let errors = result.errors;
    for (let key in errors) {
        console.log(errors[key].value);
    }
    if (!result.isEmpty()) {
        //response validate data to register.ejs
        res.render('admin/add_category', { errors, title });
    } else {
        Category.findOne({ slug }, (err, category) => {
            // ... code
            // console.log(page)

            if (category) {
                req.flash('msg', 'Category title exists,choose another!');
                res.locals.messages = req.flash();
                res.render('admin/add_category', {
                    errors, title
                });
            } else {
                const category = new Category({
                    title,
                    slug
                });
                category.save(err => {
                    if (err)
                        return console.log(err);
                    req.flash('success', 'category add');
                    res.redirect('/admin/categories');
                });


            }
        })
    }
});

//post reorder pages 
router.post('/reorder-page', (req, res) => {
    const ids = req.body['id[]'];
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
                });
            });

        })(count);
    }
});

//get edit page
router.get('/edit-page/:slug', (req, res) => {
    Page.findOne({ slug: req.params.slug }).then((page) => {
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
router.post('/edit-page/:slug', [
    check('title', 'Title must have a value.').not().isEmpty(),
    check('content', 'Content must have a value.').not().isEmpty(),
], function (req, res, next) {

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;
    let id = req.body.id;
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
                        res.redirect('/admin/pages');
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
        req.flash('success', 'page add');
        res.redirect('/admin/pages');

    })
});
//exports
module.exports = router;