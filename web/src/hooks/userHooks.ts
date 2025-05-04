import {useAppDispatch, useAppSelector} from '@/hooks/reduxHooks';
import {login, logout, setUsername, setAvatar, UserState} from '@/stores/userSlice';

export const useUserStore = () => {
    const user = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();

    return {
        user,
        setAvatar: (avatar: string) => dispatch(setAvatar(avatar)),
        setUsername: (username: string) => dispatch(setUsername(username)),
        login: (data: UserState) => dispatch(login({...data})),
        logout: () => dispatch(logout()),
    };
};