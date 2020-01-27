var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
//get pages index
router.get('/', function (req, res) {
    res.send('admin Area');
});

//get add page
router.get('/add-page', function (req, res) {
    let title="";
    let slug="";
    let content="";
    res.render('admin/add_page',{title,slug,content});
    
});

//post add page
router.post('/add-page', [
    check('title', 'Title must have a value.').not().isEmpty(),
    check('content', 'Content must have a value.').not().isEmpty(),
], function (req, res, next) {
    
    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if (slug=="") slug = title.replace(/\s+/g,'-').toLowerCase();
    let content = req.body.content;

    //check validate data
    const result = validationResult(req);
    var errors = result.errors;
    for (var key in errors) {
        console.log(errors[key].value);
    }
    if (!result.isEmpty()) {
        //response validate data to register.ejs
        res.render('admin/add_page', {errors, slug, content,title});
    } else{
        console.log('succes');        
    }
});


// router.post('/add-page', function (req, res) {
//     req.checkBody('title','Title must have a value.').notEmpty();
//     req.checkBody('content','Content must have a value.').notEmpty();
//     var title=req.body.title;
//     var slug=req.body.slug.replace(/\s+/g,'-').toLowerCase();
//     if(slug=="") slug=title.replace(/\s+/g,'-').toLowerCase();
//     var content=req.body.content;

//     var errors=req.validationErrors();
//     if(errors){
//         console.log('errors');
//         res.render('admin/add_page',{
//             title:title,
//             slug:slug,
//             content:content
//         });
//     }else{
//         console.log('success');
//     }
    
    
// });

//exports
module.exports = router;