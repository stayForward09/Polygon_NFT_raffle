
const INITAL_STATE = {
  wallet: ``,
  address: ``
};

const reducer: any = (state = INITAL_STATE, action: any) => {
  switch (action.type) {
    case "CONNECT":
      return {
        ...state,
        wallet: action.payload.wallet,
        address: action.payload.address
      };
    default:
      return state;
  }
};
export default reducer;
