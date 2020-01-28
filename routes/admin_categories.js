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



//get edit category
router.get('/edit-category/:id', (req, res) => {
    Category.findById(req.params.id).then((category) => {
        if (!category) { //if page not exist in db
            return res.status(404).send('Page not found');
        }
        res.render('admin/edit_category', { //page  exist
            title: category.title,
            id: category._id
        });
    }).catch((e) => {//bad request 
        res.status(400).send(e);
    });
});
//post edit category
router.post('/edit-category/:id', [
    check('title', 'Title must have a value.').not().isEmpty(),
], function (req, res, next) {

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    let id = req.params.id;
    //check validate data
    const result = validationResult(req);
    let errors = result.errors;
    for (let key in errors) {
        console.log(errors[key].value);
    }
    if (!result.isEmpty()) {
        //response validate data to register.ejs
        res.render('admin/edit_category', { errors, title, id });
    } else {
        Category.findOne({ slug: slug, _id: { '$ne': id } }, (err, category) => {
            // ... code
            // console.log(page)

            if (category) {
                req.flash('msg', 'category title exists,choose another!');
                res.locals.messages = req.flash();
                res.render('admin/edit_category', {
                    errors, title, id
                });
            } else {
                Category.findById(id, (err, category) => {
                    if (err) return console.log(err);
                    category.title = title,
                        category.slug = slug

                    category.save(err => {
                        if (err)
                            return console.log(err);
                        req.flash('success', 'category edit');
                        res.redirect('/admin/categories/edit-category/' + id);
                    });
                });



            }
        })
    }
});
//get delete category
router.get('/delete-category/:id', (req, res) => {
    Category.findByIdAndDelete(req.params.id, (err) => {
        if (err) return console.log(err);
        req.flash('success', 'category delete');
        res.redirect('/admin/categories/');

    })
});
//exports
module.exports = router;