const express = require('express')
const router = express.Router()
const parseString = require('xml2js').parseString;
const request = require("request");
const FFKEY = require('../config/spoonacularAPI')
//const SUPERMARKETKEY = require('../config/supermarketAPI')

//Helper for authorization
const authorized = require('./authCheck')
const mongoose = require('mongoose')
if (!mongoose.connection.db) {
    mongoose.connect('mongodb://localhost/cs591')
}
const db = mongoose.connection

//uses Spoonacular API to return recipes to use in the form of a JSON object
/*
 **SAMPLE RESPONSE**
    {results":
    [{
        "id": 723984,
        "title": "Cabbage Salad with Peanuts",
        "readyInMinutes": 15,
        "servings": 2,
        "sourceUrl": "http://naturallyella.com/cabbage-salad-with-peanuts/",
        "openLicense": 0,
        "image": "cabbage-salad-with-peanuts-723984.jpg"
    ]}
    "baseUri": "https://spoonacular.com/recipeImages/",
    "offset": 0,
    "number": 10,
    "totalResults": 367543,
    "processingTimeMs": 283,
    "expires": 1592126158122,
    "isStale": false
 */
router.post('/getRecipes', authorized, function (req, res, next) {
    const options = {
        method: 'POST',
        url: 'https://api.spoonacular.com/recipes/search',
        form: {
            key: FFKEY.key,         //API key
            page: req.body.page,    //indicates page # of results (either 1 or 2)
            q: req.body.q           //(optional) if omitted, top-rated results will be returned
        }
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        const recipeList = JSON.parse(body)
        const recipeLinks = []

        //check for no results
        if (recipeList.number == 0) {
            res.json({message: "No results"})
        }
        else {
            //iterate through recipes, adds title & source url to recipeLinks array
            /* recipeList.results.forEach(function (recipe) {
                recipeLinks.push({title: recipe.title, url: recipe.sourceUrl})
            })

            //send recipe info to front end
            res.json(recipeLinks) */
            console.log(body)
        }
    });
})

//uses Supermarket API to returns stores within a City and State in XML format
/*
 **SAMPLE RESPONSE**
 <ArrayOfStore>
 <Store>
 <Storename>Shaw's</Storename>
 <Address>33 Kilarnock Street</Address>
 <City>Boston</City>
 <State>MA</State>
 <Zip>2215</Zip>
 <Phone> </Phone>
 <StoreId>2341ab1afa</StoreId>
 </Store>
 </ArrayOfStore>
 */
/*router.post('/findStores', authorized, function (req, res, next) {
    const stores = []
    const options = {
        method: 'POST',
        url: 'http://www.supermarketapi.com/api.asmx/StoresByCityState',
        form: {
            APIKEY: SUPERMARKETKEY.key,             //API key
            SelectedCity: req.body.SelectedCity,    //user-inputted city
            SelectedState: req.body.SelectedState   //user-inputted state
        }
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error)

        //convert XML to JSON
        parseString(body, function (err, result) {
            try {

                //iterate through stores and add to stores array
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

                //send store info to front end
                res.json(stores)
            }

                //error-handling
            catch (error) {
                res.statusCode = 502
                res.json(stores)
            }
        })
    })
})*/

//uses Supermarket API to return search results for Products (limit 20 Items)
/*
 **SAMPLE RESPONSE**
 <ArrayOfProduct>
 <Product>
 <Itemname>Gerber 100% Apple Juice - 32 Fl. Oz.</Itemname>
 <ItemDescription>Made from freshly pressed apples...</ItemDescription>
 <ItemCategory>Baby</ItemCategory>
 <ItemID>26315</ItemID><ItemImage>http://smapistorage.blob.core.windows.net/thumbimages/165020004_100x100.jpg</ItemImage>
 <AisleNumber>Aisle:10</AisleNumber>
 </Product>
 </ArrayOfProduct>
 */
/*router.post('/findIngredient', authorized, function (req, res, next) {
    const products = []
    const options = {
        method: 'POST',
        url: 'http://www.supermarketapi.com/api.asmx/SearchForItem',
        form: {
            APIKEY: SUPERMARKETKEY.key,     //API key
            StoreId: req.body.StoreId,      //store ID of store where user is searching for products
            ItemName: req.body.ItemName     //user-inputted product name
        }
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error)

        //convert XML to JSON
        parseString(body, function (err, result) {
            try {

                //iterate through products and add to products array
                result.ArrayOfProduct.Product.forEach(function (product) {

                    //check for products that return no results
                    if (product.Itemname[0] === 'NOITEM') throw new Error(error)
                    products.push(
                        {
                            name: product.Itemname[0],
                            image: product.ItemImage[0],
                            aisle: product.AisleNumber[0]
                        })
                })

                //send product info to front end
                res.json(products)
            }

                //error-handling
            catch (error) {
                res.statusCode = 302
                res.json(products)
            }
        })
    })
})*/

module.exports = router