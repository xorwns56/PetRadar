import { createContext, useReducer, useContext } from "react";
function reducer(state, action) {
  let nextState;
  if (action.type === "CREATE") {
    const maxId =
      state.length > 0
        ? Math.max(...state.map((item) => Number(item.petReportId)))
        : 0;
    const curr = Date.now();
    const newItem = {
      ...action.data,
      petReportId: maxId + 1,
      createDate: curr,
      updateDate: curr,
    };
    nextState = [...state, newItem];
  } else if (action.type === "UPDATE") {
    nextState = state.map((item) =>
      String(item.petReportId) === String(action.data.petReportId)
        ? { ...item, ...action.data, updateDate: Date.now() }
        : item
    );
  } else if (action.type === "DELETE") {
    nextState = state.filter(
      (item) => String(item.petReportId) !== String(action.data.petReportId)
    );
  } else if (action.type === "DELETE_BY_MISSING") {
    nextState = state.filter(
      (item) => String(item.petMissingId) !== String(action.data.petMissingId)
    );
  } else if (action.type === "DELETE_USER_DATA") {
    nextState = state.filter(
      (item) =>
        item.petMissingUser !== action.data.id && item.id !== action.data.id
    );
  } else {
    throw new Error(`Unhandled action type: ${action.type}`);
  }
  localStorage.setItem("report", JSON.stringify(nextState));
  return nextState;
}
const ReportStateContext = createContext();
const ReportDispatchContext = createContext();
export const ReportProvider = ({ children }) => {
  const stored = localStorage.getItem("report");
  const [state, dispatch] = useReducer(
    reducer,
    stored ? JSON.parse(stored) : []
  );
  return (
    <ReportStateContext.Provider value={state}>
      <ReportDispatchContext.Provider value={dispatch}>
        {children}
      </ReportDispatchContext.Provider>
    </ReportStateContext.Provider>
  );
};

export const useReportState = () => {
  const context = useContext(ReportStateContext);
  if (context === undefined) {
    throw new Error("useReportState Error");
  }
  return context;
};

export const useReportDispatch = () => {
  const context = useContext(ReportDispatchContext);
  if (context === undefined) {
    throw new Error("useReportDispatch Error");
  }
  return context;
};
