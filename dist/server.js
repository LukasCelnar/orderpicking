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
const positions_1 = require("./utils/positions");
// define constant variables
const PORT = 3000;
const POSITIONS_API_KEY = "MVGBMS0VQI555bTery9qJ91BfUpi53N24SkKMf9Z";
const app = (0, express_1.default)(); // create app
app.use(express_1.default.json()); // parse request body
app.get('/', (req, res) => {
    res.send('Please use /orders endpoint');
});
app.post('/orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = req.body.orders; // parse request
    const selectedPositions = []; // list to store selected positions for all orders
    // loop through requested orders
    for (const order of orders) {
        // get all available positions for current order productId
        const availablePositions = yield (0, positions_1.getAvailablePositions)(order.productId, POSITIONS_API_KEY);
        // get selected positions for current order
        const selectedPositionsForOrder = yield (0, positions_1.selectAvailablePositions)(order, availablePositions);
        // push and unpacked list to the selectedPositions (output)
        selectedPositions.push(...selectedPositionsForOrder);
    }
    /*
      In future we could potentionally update DB with available positions we used here
    */
    // send res
    res.json(selectedPositions);
}));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
