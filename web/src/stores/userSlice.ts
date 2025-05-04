import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import VisitorsIcon from "@/assets/icon/visitors.svg";

export interface UserState {
    avatar: string;
    username: string;
    role: string;
    token: string;
}

const initialState: UserState = {
    avatar: VisitorsIcon,
    username: '',
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
        setUsername: (state, action: PayloadAction<UserState['username']>) => {
            state.username = action.payload;
        },
        login: (state, action: PayloadAction<UserState>) => {
            state.avatar = action.payload.avatar;
            state.username = action.payload.username;
            state.token = action.payload.token;
            state.role = action.payload.role;
        },
        logout: (state) => {
            state.avatar = VisitorsIcon;
            state.username = '';
            state.token = '';
            state.role = '';
        },
    },
});

export const {setAvatar, setUsername, login, logout} = userSlice.actions;

export default userSlice.reducer; 