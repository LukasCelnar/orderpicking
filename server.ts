/*
  Start the server by running `npm run dev` 
  and then you can run `node testApi.js` to test the api

  @@@ Made by Lukas Celnar. @@@
*/

import express, { Express, Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';

interface Position {
  productId: string;
  quantity: number;
  positionId: string;
  x: number;
  y: number;
  z: number;
}

interface Order {
  productId: string;
  quantity: number;
}

const app: Express = express();
const PORT: number = 3000;
const POSITIONS_API_KEY: string = "MVGBMS0VQI555bTery9qJ91BfUpi53N24SkKMf9Z";

app.use(express.json()); // parse request body

app.get('/', (req: Request, res: Response): void => {
  res.send('Please use /orders endpoint');
});

app.post('/orders', async (req: Request, res: Response): Promise<void> => {
  const orders: Order[] = req.body.orders; // parse request
  const selectedPositions: Position[] = []; // list to store selected positions for all orders

  // loop through requested orders
  for (const order of orders) {
    const selectedPositionsForOrder: Position[] = [];
    let orderQuantityLeft = order.quantity; // decrease when adding position to selectedPositionsForOrder

    // get available positions for productId from provided api
    const availablePositionsRes: AxiosResponse<Position[]> = await axios.get(
      `https://dev.aux.boxpi.com/case-study/products/${order.productId}/positions`,
      { headers: { "x-api-key": POSITIONS_API_KEY } }
    );
    const availablePositions: Position[] = availablePositionsRes.data;

    // sort based on availablePositions quantity
    const availablePositionsSorted: Position[] = availablePositions.sort((a, b) => a.quantity - b.quantity);

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
        if (decreasedOrderQuantityLeft === 0) break;
      } else if (decreasedOrderQuantityLeft < 0) {
        selectedPositionsForOrder.push({ ...availablePosition, quantity: orderQuantityLeft });
        orderQuantityLeft = 0; // set orderQuantityLeft to be 0 since we tool only the needed quantity
        break;
      }
    }

    // sort because last item in the list could be lower then items before it
    // that would happen if decreasedOrderQuantityLeft < 0 was true
    // this way we keep the selectedPositionsForOrder sorted
    const selectedPositionsForOrderSorted: Position[] = selectedPositionsForOrder.sort((a, b) => a.quantity - b.quantity);
    
    // push and unpacked list to the selectedPositions (output)
    selectedPositions.push(...selectedPositionsForOrderSorted);
  }

  /*
    Here in future we could potentionally update DB with available positions we used
  */

  // send res
  res.json(selectedPositions);
});

app.listen(PORT, (): void => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
