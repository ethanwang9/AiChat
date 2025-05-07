export type MsgBack<T> = Promise<HTTPBack<T>>

export default interface HTTPBack<T> {
    code: number;
    message: string;
    data?: T | null;
}