// we can use app like postman or this file for testing the api 
// by running `node testApi.js`

const axios = require("axios")

const testApi = async () => {
    const URL = `http://localhost:3000/orders`
    const INPUT_ORDERS = [ 
        { productId: "product-1", quantity: 3 }, 
        { productId: "product-2", quantity: 5 } 
    ] // taken from the pdf example

    const response = await axios.post(URL, {
        orders: INPUT_ORDERS
    })
    console.log(response.data)
}

testApi() // test my api 

/*
const testAvailablePositions = async (productId) => {
    const API_KEY = "MVGBMS0VQI555bTery9qJ91BfUpi53N24SkKMf9Z"

    const res = await axios.get(`https://dev.aux.boxpi.com/case-study/products/${productId}/positions`, {
        headers: {
            "x-api-key" : API_KEY
        }
    })
    console.log(res.data)
}

testAvailablePositions("product-1") // test provided api
*/