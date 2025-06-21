import { createContext, useReducer, useContext } from "react";
function reducer(state, action) {
  let nextState;
  if (action.type === "CREATE") {
    const maxId =
      state.length > 0
        ? Math.max(...state.map((item) => Number(item.petMissingId)))
        : 0;
    const curr = Date.now();
    const newItem = {
      ...action.data,
      petMissingId: maxId + 1,
      isClosed: false,
      createDate: curr,
      updateDate: curr,
    };
    nextState = [...state, newItem];
  } else if (action.type === "UPDATE") {
    nextState = state.map((item) =>
      String(item.petMissingId) === String(action.data.petMissingId)
        ? { ...action.data, updateDate: Date.now() }
        : item
    );
  } else if (action.type === "DELETE") {
    nextState = state.filter(
      (item) => String(item.petMissingId) !== String(action.data.petMissingId)
    );
  } else {
    throw new Error(`Unhandled action type: ${action.type}`);
  }
  localStorage.setItem("missing", JSON.stringify(nextState));
  return nextState;
}
const MissingStateContext = createContext();
const MissingDispatchContext = createContext();
export const MissingProvider = ({ children }) => {
  const stored = localStorage.getItem("missing");
  const [state, dispatch] = useReducer(
    reducer,
    stored ? JSON.parse(stored) : []
  );
  return (
    <MissingStateContext.Provider value={state}>
      <MissingDispatchContext.Provider value={dispatch}>
        {children}
      </MissingDispatchContext.Provider>
    </MissingStateContext.Provider>
  );
};

export const useMissingState = () => {
  const context = useContext(MissingStateContext);
  if (context === undefined) {
    throw new Error("useMissingState Error");
  }
  return context;
};

export const useMissingDispatch = () => {
  const context = useContext(MissingDispatchContext);
  if (context === undefined) {
    throw new Error("useMissingDispatch Error");
  }
  return context;
};
