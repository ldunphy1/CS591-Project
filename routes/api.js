const express = require('express')
const router = express.Router()
const parseString = require('xml2js').parseString;
const request = require("request");
const rp = require('request-promise')
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

router.post('/searchForIngredient', function (req, res, next) {
    const resultPromises1 = []
    const options = {
        method: 'POST',
        url: 'http://www.supermarketapi.com/api.asmx/StoresByCityState',
        form: {
            APIKEY: SUPERMARKETKEY.key,
            SelectedCity: req.body.SelectedCity,
            SelectedState: req.body.SelectedState
        }
    };
    const p1 = rp(options)
        .catch(function (err) {
            res.send(err)
        })
    resultPromises1.push(p1)
    Promise.all(resultPromises1)
        .then(function (resp) {
            parseString(resp, function (err, result) {
                result.ArrayOfStore.Store.forEach(function (store) {
                    stores.push(store)
                })
                const resultPromises = [];
                stores.forEach(function (store) {
                    const options = {
                        method: 'POST',
                        url: 'http://www.supermarketapi.com/api.asmx/SearchForItem',
                        form: {
                            APIKEY: SUPERMARKETKEY.key,
                            StoreId: store.StoreId[0],
                            ItemName: req.body.ItemName
                        }
                    };
                    const p = rp(options)
                        .catch(function (err) {
                            res.send(err)
                        });

                    resultPromises.push(p);
                });

                Promise.all(resultPromises)
                    .then(function (resp) {
                        parseString(resp, function (err, result) {
                            const results = result.ArrayOfProduct.Product
                            res.json({stores: results})
                        })
                    });
            })
        })
})

module.exports = router