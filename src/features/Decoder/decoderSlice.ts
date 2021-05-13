import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface DecoderState {
    filePath?: string;
    fileName?: string;
    fmMode?: number;
    decodeResultHex?: string;
    decodeResultChar?: string;
}

const initialState: DecoderState = {
    filePath: '',
    fileName: '',
    fmMode: undefined,
    decodeResultHex: '',
    decodeResultChar: '',
};

export const decoderSlice = createSlice({
    name: 'decoder',
    initialState,
    reducers: {
        resetDecoderState: (state) => {
            return Object.assign({}, state, initialState);
        },
        setDecoderState: (state, action: PayloadAction<DecoderState>) => {
            return Object.assign({}, state, action.payload);
        },
    },
});

export const { resetDecoderState, setDecoderState } = decoderSlice.actions;

export const selectDecoderState = (state: RootState): DecoderState =>
    state.decoder;

export default decoderSlice.reducer;
