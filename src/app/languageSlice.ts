import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface LanguageState {
    language: 'ja' | 'en';
}

const initialState = { language: 'en' } as LanguageState;

export const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<'ja' | 'en'>) => {
            return Object.assign({}, state, { language: action.payload });
        },
    },
});

export const { setLanguage } = languageSlice.actions;

export const selectLanguage = (state: RootState): LanguageState =>
    state.language;

export default languageSlice.reducer;
