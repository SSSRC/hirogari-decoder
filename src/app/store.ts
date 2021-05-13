import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
import visibilityReducer from './visibilitySlice';
import decoderReducer from '../features/Decoder/decoderSlice';

export const store = configureStore({
    reducer: {
        language: languageReducer,
        visibility: visibilityReducer,
        decoder: decoderReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
