"use strict";
/*
  Start the server by running `npm run dev`
  and then you can run `node testApi.js` to test the api

  @@@ Made by Lukas Celnar. @@@
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const PORT = 3000;
const POSITIONS_API_KEY = "MVGBMS0VQI555bTery9qJ91BfUpi53N24SkKMf9Z";
app.use(express_1.default.json()); // parse request body
app.get('/', (req, res) => {
    res.send('Please use /orders endpoint');
});
app.post('/orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = req.body.orders; // parse request
    const selectedPositions = []; // list to store selected positions for all orders
    // loop through requested orders
    for (const order of orders) {
        const selectedPositionsForOrder = [];
        let orderQuantityLeft = order.quantity; // decrease when adding position to selectedPositionsForOrder
        // get available positions for productId from provided api
        const availablePositionsRes = yield axios_1.default.get(`https://dev.aux.boxpi.com/case-study/products/${order.productId}/positions`, { headers: { "x-api-key": POSITIONS_API_KEY } });
        const availablePositions = availablePositionsRes.data;
        // sort based on availablePositions quantity
        const availablePositionsSorted = availablePositions.sort((a, b) => a.quantity - b.quantity);
        // loop through availablePositionsSorted
        // add availablePosition to selectedPositionsForOrder list
        // decrease decreasedOrderQuantityLeft untill its 0 or < 0
        // when decreasedOrderQuantityLeft < 0 --> decrease (take) only the needed quantity to have decreasedOrderQuantityLeft = 0
        for (const availablePosition of availablePositionsSorted) {
            const decreasedOrderQuantityLeft = orderQuantityLeft - availablePosition.quantity;
            if (decreasedOrderQuantityLeft >= 0) {
                selectedPositionsForOrder.push(availablePosition);
                orderQuantityLeft = decreasedOrderQuantityLeft; // update orderQuantityLeft
                // if true we took the perfect quantity (orderQuantityLeft is 0) and there is no need to look for other position
                if (decreasedOrderQuantityLeft === 0)
                    break;
            }
            else if (decreasedOrderQuantityLeft < 0) {
                selectedPositionsForOrder.push(Object.assign(Object.assign({}, availablePosition), { quantity: orderQuantityLeft }));
                orderQuantityLeft = 0; // set orderQuantityLeft to be 0 since we tool only the needed quantity
                break;
            }
        }
        // sort because last item in the list could be lower then items before it
        // that would happen if decreasedOrderQuantityLeft < 0 was true
        // this way we keep the selectedPositionsForOrder sorted
        const selectedPositionsForOrderSorted = selectedPositionsForOrder.sort((a, b) => a.quantity - b.quantity);
        // push and unpacked list to the selectedPositions (output)
        selectedPositions.push(...selectedPositionsForOrderSorted);
    }
    /*
      Here in future we could potentionally update DB with available positions we used
    */
    // send res
    res.json(selectedPositions);
}));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
