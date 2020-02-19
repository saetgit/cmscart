const express = require('express');
const router = express.Router();
const flash = require("connect-flash");
const { check, validationResult } = require('express-validator');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
// const fs = require('fs');
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
        fileSize: 1024 * 1024 * 6
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

    } catch (error) {

    }

});

router.post('/add-product', upload.single('uploadFile'), [
    check('title', 'Title must have a value.').not().isEmpty(),
    check('price', 'Price must have a value.').isDecimal(),
    check('category', 'category must have a value.').not().isEmpty(),

], async (req, res) => {
    try {
        let image = req.file.filename;
        let { id, title, price, desc, category } = await req.body;
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
    try {

        let title = "";
        let desc = "";
        let price = "";

        let categories = await Category.find();
        res.render('admin/add_product', { title, desc, categories, price });

    } catch (error) {

    }
});

//get edit product
router.get('/edit-product/:id', async (req, res) => {

    try {
        let categories = await Category.find();
        let { title, desc, category, price, image, _id } = await Product.findById(req.params.id);
        category = category.replace(/\s+/g, '-').toLowerCase();
        res.render('admin/edit_product', {
            title,
            desc,
            categories,
            category,
            price,
            image,
            id: _id
        });

    } catch (error) {
        console.log(error);
        res.redirect('/admin/products')
    }


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
//get delete products
router.get('/delete-product/:id', async(req, res) => {
try {
  
    let { id } = req.params;
    let { image } = await Product.findById(req.params.id);
    // choon faqat esme ax ro mikhayim dashte bashim vase hazf faqat image ro qable delete az database mikhunim
    // hala ba in khat record ro delete mikonim
    let status = await Product.findByIdAndRemove(id);
    // hala esme ax ro darim bayad berim ax ro az folder delete konim ba in dastur
    fs.unlinkSync('public/images/' + image);
    req.flash('success', 'product delete');
    res.redirect('/admin/products');
} catch (error) {
    console.log(error);
    
}
    
});
//exports
module.exports = router;