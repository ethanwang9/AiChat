import {useAppDispatch, useAppSelector} from '@/hooks/reduxHooks';
import {logout, setAvatar, setToken, setRole} from '@/stores/userSlice';

export const useUserStore = () => {
    const user = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();

    return {
        user,
        setAvatar: (avatar: string) => dispatch(setAvatar(avatar)),
        setRole: (role: string) => dispatch(setRole(role)),
        setToken: (token: string) => dispatch(setToken(token)),
        logout: () => dispatch(logout()),
    };
};