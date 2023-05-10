import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: {
            id: '',
            name: '',
            surname: '',
            phone: '',
            userType: '',
        }, 
        cards: [],
    },
    reducers: {
        saveUser: (state, action) => {
            state.user.id = action.payload.id;
            state.user.name = action.payload.name;
            state.user.surname = action.payload.surname;
            state.user.phone = action.payload.phone;
            state.user.userType = action.payload.user_type;
        },
        saveCards: (state, action) => {
            state.cards = action.payload;
        },
    },
})

export const { saveUser, saveCards } = userSlice.actions

export default userSlice.reducer