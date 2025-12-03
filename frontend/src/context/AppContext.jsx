import { createContext, useContext, useReducer } from "react";

// 1. Create Contexts
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// 2. Initial Global State
const initialState = {
  password: null,
  address: null,
  privateKey: null,
};

// 3. Reducer Function (like Redux)
function appReducer(state, action) {
  switch (action.type) {
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_ACCOUNT":
      return { ...state, address: action.address, privateKey: action.pk };
    default:
      return state;
  }
}


// 4. Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// 5. Custom Hooks
export function useApp() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}