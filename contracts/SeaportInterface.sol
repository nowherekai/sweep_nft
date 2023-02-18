// prettier-ignore
import {
    BasicOrderParameters
} from "./lib/SeaportStruct.sol";

interface SeaportInterface {
  function fulfillBasicOrder(BasicOrderParameters calldata parameters)
  external
  payable
  returns (bool fulfilled);
}
