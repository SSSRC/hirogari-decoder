import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface VisibilityState {
    sendPage?: boolean;
}

const initialState: VisibilityState = {
    sendPage: false,
};

export const visibilitySlice = createSlice({
    name: 'visibility',
    initialState,
    reducers: {
        setVisibility: (state, action: PayloadAction<VisibilityState>) => {
            return Object.assign({}, state, action.payload);
        },
    },
});

export const { setVisibility } = visibilitySlice.actions;

export const selectVisibility = (state: RootState): VisibilityState =>
    state.visibility;

export default visibilitySlice.reducer;
