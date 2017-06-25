const express = require('express')
const router = express.Router()
const parseString = require('xml2js').parseString;
const request = require("request");
const rp = require('request-promise')
const async = require('async')
const FFKEY = require('../config/food2forkAPI')
const SUPERMARKETKEY = require('../config/supermarketAPI')

//Helper for authorization
const authorized = require('./authCheck')
const mongoose = require('mongoose')
if (!mongoose.connection.db) {
    mongoose.connect('mongodb://localhost/cs591')
}
const db = mongoose.connection
let stores = []
let products=[]

router.get('/getRecipes', function (req, res, next) {
    const options = {
        method: 'POST',
        url: 'http://food2fork.com/api/search',
        form: {key: FFKEY.key}
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        const recipeList = JSON.parse(body)
        const recipeLinks = []
        recipeList.recipes.forEach(function (recipe) {
            recipeLinks.push({title: recipe.title, url: recipe.source_url})
        })
        recipeLinks.shift()
        res.json(recipeLinks)
    });
})

router.post('/findStores', function (req, res, next) {
    const options = {
        method: 'POST',
        url: 'http://www.supermarketapi.com/api.asmx/StoresByCityState',
        form: {
            APIKEY: SUPERMARKETKEY.key,
            SelectedCity: req.body.SelectedCity,
            SelectedState: req.body.SelectedState
        }
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error)
        parseString(body, function (err, result) {
            result.ArrayOfStore.Store.forEach(function (store) {
                stores.push({
                    name: store.Storename,
                    address: store.Address,
                    city: store.City,
                    state: store.State,
                    zip: store.Zip,
                    storeID: store.StoreId
                })
            })
            res.json(stores)
        })
    })
})
router.post('/findIngredient',function(req,res,next){
    const options = {
        method: 'POST',
        url: 'http://www.supermarketapi.com/api.asmx/SearchForItem',
        form: {
            APIKEY: SUPERMARKETKEY.key,
            StoreId: req.body.StoreId,
            ItemName: req.body.ItemName
        }
    };
    request(options,function(error,response,body){
        if(error) throw new Error(error)
        parseString(body, function (err, result) {
            result.ArrayOfProduct.Product.forEach(function(product){
                products.push({name:product.Itemname,image:product.ItemImage, aisle:product.AisleNumber})
            })
            res.json(products)
        })
    })
})

module.exports = router