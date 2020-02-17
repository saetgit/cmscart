const express = require('express');
const router = express.Router();
const flash = require("connect-flash");
const { check, validationResult } = require('express-validator');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resize_Img = require('resize-img');
const path = require("path");
const multer = require('multer')
// const upload = multer({ dest: '/uploads/' });
const upload = multer({
    dest: '/public/images' // this saves your file into a directory called "uploads"
  }); 

//get Product model
const Product = require('../models/product');
//get Category model
const Category = require('../models/category');
//get products index
router.get('/', async (req, res) => {

    let countDocuments;
    await Product.estimatedDocumentCount((err, c) => {
        countDocuments = c;
    });
    await Product.find((err, products) => {
        res.render('admin/products', { products, countDocuments });
    });

});

router.post('/add-product', upload.single('uploadFile'),async (req, res) => {
    try {
        console.log(await req.body);
    
    res.redirect('/');
    } catch (error) {
        
    }
});
//get add product
router.get('/add-product', async(req, res)=> {
    let title = "";
    let desc = "";
    let price = "";
    Category.find((err, categories) => {
        res.render('admin/add_product', { title, desc, categories, price });
    });
});

//post add product
router.post('/add-product2', upload.single('image'), async (req, res, next) => {
    try {
        console.log(req.body);        


        // let title = req.body.title;
        // let content = req.body.content;
        // let desc = req.body.desc;
        // let categories = req.body.categories;
        // //check validate data
        // const result = validationResult(req);
        // let errors = result.errors;
        // for (let key in errors) {
        //     console.log(errors[key].value);
        // }
        // if (!result.isEmpty()) {
        //     res.send(req.files);
        //     //response validate data to register.ejs
        //     res.render('admin/add_product', { errors, content, title, desc, categories });
        // } else {
        //     // const imagePath = path.join(__dirname, '/public/images');
        //     // const fileUpload = new Resize(imagePath);
        //     // if (!req.file) {
        //     //     res.status(401).json({ error: 'Please provide an image' });
        //     // }
        //     return res.status(200).json({ name: 'ok' });

        // }
    } catch (error) {
        console.log(error);

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