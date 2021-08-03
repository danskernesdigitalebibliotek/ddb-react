import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import OpenPlatform from "../../core/OpenPlatform";
import DingIll from "../../core/DingIll";

export const resetStatusDelayed = createAsyncThunk(
  "orderMaterial/resetStatusDelayed",
  () => {
    return new Promise(resolve => {
      setTimeout(() => resolve(), 4000);
    });
  }
);

export const checkAvailibility = createAsyncThunk(
  "orderMaterial/checkAvailibility",
  async ({ pids, illCheckUrl }, { rejectWithValue }) => {
    const dingIll = new DingIll(illCheckUrl);
    try {
      return await dingIll.isAvailableForIll(pids);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const orderMaterial = createAsyncThunk(
  "orderMaterial/orderMaterial",
  async (
    { id, pids, pickupBranch, expires },
    { dispatch, rejectWithValue }
  ) => {
    const client = new OpenPlatform();
    try {
      return await client.orderMaterial({ pids, pickupBranch, expires });
    } catch (err) {
      dispatch(resetStatusDelayed({ id }));
      return rejectWithValue(err);
    }
  }
);

export const orderMaterialSlice = createSlice({
  name: "orderMaterial",
  initialState: { status: {} },
  reducers: {
    orderMaterialPending(state, action) {
      state.status[action.payload.id] = "pending";
    },
    orderMaterialAborted(state, action) {
      state.status[action.meta.arg.id] = "failed";
    }
  },
  extraReducers: {
    [checkAvailibility.pending]: (state, action) => {
      state.status[action.meta.arg.id] = "checking";
    },
    [checkAvailibility.fulfilled]: (state, action) => {
      state.status[action.meta.arg.id] = action.payload
        ? "ready"
        : "unavailable";
    },
    [checkAvailibility.rejected]: (state, action) => {
      state.status[action.meta.arg.id] = "failed";
    },
    [orderMaterial.pending]: (state, action) => {
      state.status[action.meta.arg.id] = "processing";
    },
    [orderMaterial.fulfilled]: (state, action) => {
      state.status[action.meta.arg.id] = "finished";
    },
    [orderMaterial.rejected]: (state, action) => {
      state.status[action.meta.arg.id] = "failed";
    },
    [resetStatusDelayed.fulfilled]: (state, action) => {
      state.status[action.meta.arg.id] = "ready";
    }
  }
});

export const {
  orderMaterialPending,
  orderMaterialAborted
} = orderMaterialSlice.actions;

export default orderMaterialSlice.reducer;
