import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import VisitorsIcon from "@/assets/icon/visitors.svg";

export interface UserState {
    avatar: string;
    role: string;
    token: string;
}

// 从localStorage获取初始状态
const loadState = (): UserState => {
    const serializedState = localStorage.getItem('user');
    if (serializedState === null) {
        return {
            avatar: VisitorsIcon,
            role: '',
            token: '',
        };
    }
    return JSON.parse(serializedState);
};

// 保存状态到localStorage
const saveState = (state: UserState) => {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('user', serializedState);
};

const initialState: UserState = loadState();

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setAvatar: (state, action: PayloadAction<UserState['avatar']>) => {
            state.avatar = action.payload;
            saveState(state);
        },
        setRole: (state, action: PayloadAction<UserState['role']>) => {
            state.role = action.payload;
            saveState(state);
        },
        setToken: (state, action: PayloadAction<UserState['token']>) => {
            state.token = action.payload;
            saveState(state);
        },
        logout: (state) => {
            state.avatar = VisitorsIcon;
            state.token = '';
            state.role = '';
            saveState(state);
        },
    },
});

export const { setAvatar, setRole, setToken, logout } = userSlice.actions;

export default userSlice.reducer; 