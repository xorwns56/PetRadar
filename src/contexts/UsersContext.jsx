import { createContext, useReducer, useContext } from "react";
function reducer(state, action) {
  let nextState;
  switch (action.type) {
    case "CREATE":
      nextState = [...state, action.data];
      break;
    case "UPDATE":
      nextState = state.map((item) =>
        String(item.id) === String(action.data.id) ? action.data : item
      );
      break;
    case "DELETE":
      nextState = state.filter(
        (item) => String(item.id) !== String(action.data.id)
      );
      break;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
  localStorage.setItem("users", JSON.stringify(nextState));
  return nextState;
}
const UsersStateContext = createContext();
const UsersDispatchContext = createContext();
export const UsersProvider = ({ children }) => {
  const stored = localStorage.getItem("users");
  const [state, dispatch] = useReducer(
    reducer,
    stored ? JSON.parse(stored) : []
  );
  return (
    <UsersStateContext.Provider value={state}>
      <UsersDispatchContext.Provider value={dispatch}>
        {children}
      </UsersDispatchContext.Provider>
    </UsersStateContext.Provider>
  );
};

export const useUsersState = () => {
  const context = useContext(UsersStateContext);
  if (context === undefined) {
    throw new Error("useUsersState Error");
  }
  return context;
};

export const useUsersDispatch = () => {
  const context = useContext(UsersDispatchContext);
  if (context === undefined) {
    throw new Error("useUsersDispatch Error");
  }
  return context;
};
