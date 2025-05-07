import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import VisitorsIcon from "@/assets/icon/visitors.svg";

export interface UserState {
    avatar: string;
    role: string;
    token: string;
}

const initialState: UserState = {
    avatar: VisitorsIcon,
    role: '',
    token: '',
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setAvatar: (state, action: PayloadAction<UserState['avatar']>) => {
            state.avatar = action.payload;
        },
        setRole: (state, action: PayloadAction<UserState['role']>) => {
            state.role = action.payload;
        },
        setToken: (state, action: PayloadAction<UserState['token']>) => {
            state.token = action.payload;
        },
        logout: (state) => {
            state.avatar = VisitorsIcon;
            state.token = '';
            state.role = '';
        },
    },
});

export const {setAvatar, setRole, setToken, logout} = userSlice.actions;

export default userSlice.reducer; 