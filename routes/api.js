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
    const stores = []
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
            try {
                result.ArrayOfStore.Store.forEach(function (store) {
                    stores.push({
                        name: store.Storename[0],
                        address: store.Address[0],
                        city: store.City[0],
                        state: store.State[0],
                        zip: store.Zip[0],
                        storeID: store.StoreId[0]
                    })
                })
                res.json(stores)
            }
            catch (error) {
                res.statusCode = 302
                res.json(stores)
            }

        })
    })
})
router.post('/findIngredient', function (req, res, next) {
    const products = []
    const options = {
        method: 'POST',
        url: 'http://www.supermarketapi.com/api.asmx/SearchForItem',
        form: {
            APIKEY: SUPERMARKETKEY.key,
            StoreId: req.body.StoreId,
            ItemName: req.body.ItemName
        }
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error)
        parseString(body, function (err, result) {
            try {
                result.ArrayOfProduct.Product.forEach(function (product) {
                    if (product.Itemname[0]==='NOITEM') throw new Error(error)
                    products.push(
                        {
                            name: product.Itemname[0],
                            image: product.ItemImage[0],
                            aisle: product.AisleNumber[0]
                        })
                })
                res.json(products)
            }
            catch (error) {
                res.statusCode = 302
                res.json(products)
            }

        })
    })
})

module.exports = router