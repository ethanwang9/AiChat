export default interface MsgBack<T> {
    code: number;
    message: string;
    data?: T | null;
}