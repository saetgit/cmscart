const express = require('express');
const router = express.Router();
const flash = require("connect-flash");
const { check, validationResult } = require('express-validator');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resize_Img = require('resize-img');
const path = require("path");
const multer = require('multer')

// Setting Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(
            null,
            `${new Date().toISOString().replace(/:/g, "-")}${file.originalname}`
        );
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb('Only .jpeg or png files are accepted', false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1
    },
    fileFilter: fileFilter
})

//get Product model
const Product = require('../models/product');
//get Category model
const Category = require('../models/category');
//get products index
router.get('/', async (req, res) => {

    try {

        let countDocuments = await Product.estimatedDocumentCount();
        let products = await Product.find();
        res.render('admin/products', { products, countDocuments });

        /*  inaro to neveshti khanumam :) balayi ro ham man neveshtam, man manzurm mesle bala bud, vali hamin ke az await estefade kardi afarin dare, barikala khanumam :*

        let countDocuments;
        await Product.estimatedDocumentCount((err, c) => {
            countDocuments = c;
            console.log(countDocuments);

        });
        await Product.find((err, products) => {
            res.render('admin/products', { products, countDocuments });
        });
        */
    } catch (error) {

    }

});

router.post('/add-product', upload.single('uploadFile'), [
    check('title', 'Title must have a value.').not().isEmpty(),
    check('price', 'Price must have a value.').isDecimal(),
    check('category', 'category must have a value.').not().isEmpty(),

], async (req, res) => {
    try {
        let id = req.body.id;
        let title = req.body.title;
        let price = req.body.price;
        let desc = req.body.desc;
        let category = req.body.category;
        let image = req.file.filename;

        let categories = await Category.find();

        //check validate data
        const result = validationResult(req);
        let errors = result.errors;
        for (let key in errors) {
            console.log(errors[key].value);
        }
        if (!result.isEmpty()) {
            res.send(req.files);
            //response validate data to register.ejs
            res.render('admin/add_product', { errors, price, title, desc, category, image });
        } else {

            // Create new user
            let newProduct = new Product({
                id,
                title,
                price,
                desc,
                category,
                image
            });

            let result = await newProduct.save();
            result.save(err => {
                if (err)
                    return console.log(err);
                req.flash('success', 'product add');
                res.redirect('/admin/products');
            });
        }
    } catch (error) {

    }
});
//get add product
router.get('/add-product', async (req, res) => {
    let title = "";
    let desc = "";
    let price = "";
    Category.find((err, categories) => {
        res.render('admin/add_product', { title, desc, categories, price });
    });
});

//post reorder pages 
router.post('/reorder-page', (req, res) => {
    const ids = req.body['id[]'];
    const count = 0;
    for (const i = 0; i < ids.length; i++) {
        const id = ids[i];
        count++;
        (function (count) {
            page.findById(id, (err, page) => {
                page.sorting = count;
                page.save((err) => {
                    if (err)
                        return console.log(err);
                });
            });

        })(count);
    }
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
    check('password').custom((value, { req }) => {
        if (value !== req.body.passwordConfirmation) {
            throw new Error('Password confirmation is incorrect');
        }
    })
], (req, res, next) => {

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
                        res.redirect('/admin/pages/edit-page' + id);
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