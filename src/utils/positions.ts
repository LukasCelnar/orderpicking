import { Position, Order } from "../interfaces";
import axios, { AxiosResponse } from "axios";

// get available positions for a selected productId (needs api key)
export const getAvailablePositions = async (productId : string, positionsApiKey : string) : Promise<Position[]> => {
    // get available positions for productId from provided api
    const availablePositionsRes: AxiosResponse<Position[]> = await axios.get(
        `https://dev.aux.boxpi.com/case-study/products/${productId}/positions`,
        { headers: { "x-api-key": positionsApiKey } }
      );
    const availablePositions: Position[] = availablePositionsRes.data;
  
    // sort based on availablePositions quantity
    const availablePositionsSorted: Position[] = availablePositions.sort((a, b) => a.quantity - b.quantity);

    return availablePositionsSorted
}

// select available positions for a given order
export const selectAvailablePositions = async (order: Order, availablePositions : Position[]) : Promise<Position[]> => {
    const selectedPositionsForOrder: Position[] = [];
    let orderQuantityLeft = order.quantity; // decrease when adding position to selectedPositionsForOrder

    // loop through availablePositions
    // add availablePosition to selectedPositionsForOrder list
    // decrease decreasedOrderQuantityLeft untill its 0 or < 0
    // when decreasedOrderQuantityLeft < 0 --> decrease (take) only the needed quantity to have decreasedOrderQuantityLeft = 0
    for (const availablePosition of availablePositions) {
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

    return selectedPositionsForOrderSorted;
}