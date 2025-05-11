import { HTTPAdminManagerLogGet } from './http/admin';

// This declaration merges with existing Promise type
declare module '@/utils/request' {
  export default function request<T = any>(config: any): Promise<T>;
} 