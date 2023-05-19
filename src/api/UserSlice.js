import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: {
            id: '',
            name: '',
            surname: '',
            phone: '',
            age: '',
            card: '',
            specialization: '',
            userType: '',
        }, 
    },
    reducers: {
        saveUser: (state, action) => {
            state.user.id = action.payload.id;
            state.user.name = action.payload.name;
            state.user.age = action.payload.age;
            state.user.card = action.payload.card;
            state.user.specialization = action.payload.specialization;
            state.user.surname = action.payload.surname;
            state.user.phone = action.payload.phone;
            state.user.userType = action.payload.user_type;
        },
    },
})

export const { saveUser } = userSlice.actions

export default userSlice.reducer