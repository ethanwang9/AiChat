import dayjs from 'dayjs';

// 格式化日期函数
export const formatDate = (dateString: string): string => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
};

// 格式化日期函数
export const formatDate2 = (dateString: string): string => {
    return dayjs(dateString).format('MM-DD');
};