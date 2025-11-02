import initialState from "./initial.value";

const MainReducer = (state = initialState, action) => {
  switch (action.type) {
    case "toggle_header":
      return { ...state, toggle_header: action.payload };
    case "Inventory_Data":
      return { ...state, inventory_data: action.payload };
    default:
      return state;
  }
};

export default MainReducer;
