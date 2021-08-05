const Product = require('../models/product.model');
const mongoose = require('mongoose');
const fileHelper = require('../utils/file');

exports. getAddProduct = (req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    res.render('admin/edit-product', 
    {
        docTitle: 'Add Product', 
        path: '/admin/edit-product',
        editing: false,
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postAddProduct = (req, res, next) => {
    const reqData = {
        //_id: new mongoose.Types.ObjectId('60ba01925c149237045c0ed0'),
        title: req.body.title,
        imageUrl: '', 
        description: req.body.description,
        price: req.body.price,
        userId: req.user
    };
    const imageFile = req.file;

    if(!imageFile){
        return next(new Error('Image file is not found'));
    }
    reqData.imageUrl = imageFile.path;
    const product =  new Product(reqData);
    product.save()
        .then(result => {
            console.log("Created Product");
            res.redirect('/admin/products');
        })
        .catch(err => {
            //res.redirect('/500');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if(!editMode){
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if(!product){
                return res.redirect('/');
            }
            res.render('admin/edit-product', 
            {
                docTitle: 'Edit Product', 
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            //res.redirect('/500');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next)=>{
    const reqData = {
        id: req.body.id,
        title: req.body.title,
        imageUrl: '',
        description: req.body.description,
        price: req.body.price,
    }

    const imageFile = req.file;

    Product.findById(reqData.id)
        .then(product => {
            product.title = reqData.title;
            if(imageFile){  
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = imageFile.path;
            }
            product.description = reqData.description;
            product.price = reqData.price;
            product.__v = product.__v + 1;
            return product.save()
        })
        .then(result => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
        })
        .catch(err => {
            //res.redirect('/500');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getProducts = (req, res, next )=>{
    Product.find({userId: req.user._id })
        // .populate('userId', 'name')
        // .select('title price -_id')
        .then(products => {
            console.log(products)
            res.render('admin/products', {
                prods: products,
                docTitle: 'Admin products',
                path: '/admin/products',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            if(!product){
                return next(new Error('Product not found!'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.findByIdAndRemove(prodId)
        })
        .then(deleteResult => {
            console.log('DESTROYED PRODUCT:');
            res.redirect('/admin/products');
        })
        .catch(err => {
            //res.redirect('/500');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}