/*
  Start the server by running `npm run dev` 
  and then you can run `node testApi.js` to test the api

  @@@ Made by Lukas Celnar. @@@
*/

import express, { Express, Request, Response } from 'express';
import { Order, Position } from './interfaces';
import { getAvailablePositions, selectAvailablePositions } from './utils/positions';

// define constant variables
const PORT: number = 3000;
const POSITIONS_API_KEY: string = "MVGBMS0VQI555bTery9qJ91BfUpi53N24SkKMf9Z";

const app: Express = express(); // create app

app.use(express.json()); // parse request body

app.get('/', (req: Request, res: Response): void => {
  res.send('Please use /orders endpoint');
});

app.post('/orders', async (req: Request, res: Response): Promise<void> => {
  const orders: Order[] = req.body.orders; // parse request
  const selectedPositions: Position[] = []; // list to store selected positions for all orders

  // loop through requested orders
  for (const order of orders) {
    // get all available positions for current order productId
    const availablePositions : Position[] = await getAvailablePositions(order.productId, POSITIONS_API_KEY)

    // get selected positions for current order
    const selectedPositionsForOrder : Position[] = await selectAvailablePositions(order, availablePositions)
    
    // push and unpacked list to the selectedPositions (output)
    selectedPositions.push(...selectedPositionsForOrder);
  }

  /*
    In future we could potentionally update DB with available positions we used here
  */

  // send res
  res.json(selectedPositions);
});

app.listen(PORT, (): void => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
