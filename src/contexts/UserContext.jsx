import { createContext, useReducer, useContext } from "react";

function reducer(state, action) {
  let nextState;
  switch (action.type) {
    case "CREATE":
      nextState = {
        ...state,
        users: [...state.users, { ...action.data, createDate: Date.now() }],
      };
      localStorage.setItem("user", JSON.stringify(nextState.users));
      return nextState;
    case "UPDATE":
      nextState = {
        ...state,
        users: state.users.map((item) =>
          String(item.id) === String(action.data.id)
            ? { ...item, ...action.data }
            : item
        ),
      };
      localStorage.setItem("user", JSON.stringify(nextState.users));
      return nextState;
    case "DELETE":
      nextState = {
        ...state,
        users: state.users.filter(
          (item) => String(item.id) !== String(action.data.id)
        ),
      };
      localStorage.setItem("user", JSON.stringify(nextState.users));
      return nextState;
    case "ADD_ALERT":
      nextState = {
        ...state,
        users: state.users.map((user) =>
          String(user.id) === String(action.data.id)
            ? {
                ...user,
                alerts: [...action.data.alerts, ...(user.alerts || [])],
                lastAlertDate: Date.now(),
              }
            : user
        ),
      };
      localStorage.setItem("user", JSON.stringify(nextState.users));
      return nextState;
    case "REMOVE_ALERT":
      nextState = {
        ...state,
        users: state.users.map((user) =>
          String(user.id) === String(action.data.id)
            ? {
                ...user,
                alerts: (user.alerts || []).filter(
                  (alert) =>
                    String(alert.postId) !== String(action.data.postId) ||
                    String(alert.postType) !== String(action.data.postType)
                ),
              }
            : user
        ),
      };
      localStorage.setItem("user", JSON.stringify(nextState.users));
      return nextState;
    case "LOGIN":
      sessionStorage.setItem("currentUser", JSON.stringify(action.data.id));
      return {
        ...state,
        currentUser: action.data.id,
      };
    case "LOGOUT":
      sessionStorage.removeItem("currentUser");
      return {
        ...state,
        currentUser: null,
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

const UserStateContext = createContext();
const UserDispatchContext = createContext();
export const UserProvider = ({ children }) => {
  const initialState = {
    users: JSON.parse(localStorage.getItem("user") || "[]"),
    currentUser: JSON.parse(sessionStorage.getItem("currentUser") || "null"),
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
};

export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState Error");
  }
  return context;
};

export const useUserDispatch = () => {
  const context = useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch Error");
  }
  return context;
};
