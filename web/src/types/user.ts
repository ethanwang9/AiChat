/**
 * 用户相关类型定义
 */

/**
 * 用户状态枚举
 */
export enum UserStatus {
  /**
   * 正常
   */
  USE = 'use',
  /**
   * 禁用
   */
  STOP = 'stop',
  /**
   * 注销
   */
  DESTROY = 'destroy'
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  /**
   * 用户
   */
  USER = 'user',
  /**
   * 管理员
   */
  ADMIN = 'admin'
}

/**
 * 用户接口定义
 */
export interface User {
  /**
   * 用户ID - 主键，自增
   */
  uid: number;
  /**
   * 用户名
   */
  name: string;
  /**
   * 邮箱 - 唯一索引
   */
  mail: string;
  /**
   * 手机号 - 唯一索引
   */
  phone: string;
  /**
   * 头像地址
   */
  avatar: string;
  /**
   * 使用状态 - 默认值: use
   */
  status: UserStatus;
  /**
   * 权限 - 默认值: user
   */
  role: UserRole;
}

/**
 * 默认用户信息
 */
export const defaultUser: User = {
  uid: 0,
  name: '',
  mail: '',
  phone: '',
  avatar: '',
  status: UserStatus.USE,
  role: UserRole.USER
} 