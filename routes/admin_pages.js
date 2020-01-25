var express=require('express');
var router=express.Router();
//get pages index
router.get('/',function(req,res){
    res.send('admin Area');
});

//get add page
router.get('/add-page',function(req,res){
    res.send('admin Area');
});

//exports
module.exports=router;