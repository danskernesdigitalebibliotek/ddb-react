import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage/session";
import userReducer from "./user.slice";
import checklistMaterialButtonReducer from "../apps/checklist-button/checklist-material-button.slice";
import orderMaterialReducer from "../apps/order-material/order-material.slice";

const persistConfig = {
  key: "ddb-react",
  storage
};

export const store = configureStore({
  reducer: persistReducer(
    persistConfig,
    combineReducers({
      checklistMaterialButton: checklistMaterialButtonReducer,
      orderMaterial: orderMaterialReducer,
      user: userReducer
    })
  ),
  devTools: process.env.NODE_ENV === "development"
});

export const persistor = persistStore(store);
