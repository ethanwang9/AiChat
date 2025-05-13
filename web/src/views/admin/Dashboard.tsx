import { FC, useEffect, useRef, useState } from "react";
import { Card, DatePicker, Flex, Statistic, Spin } from "antd";
import {
    MehTwoTone,
    FileTextTwoTone,
    ThunderboltTwoTone,
    BookTwoTone
} from "@ant-design/icons";
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useRequest } from "ahooks";
import { GetAdminPanelBase, GetAdminPanelChat, GetAdminPanelToken } from "@/apis/admin";
import { HTTPAdminPanelBaseGet, HTTPAdminPanelChatGet } from "@/types/http/admin";
import dayjs, { Dayjs } from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';
import { formatDate2 } from "@/utils/tools";

const { RangePicker } = DatePicker;

const Dashboard: FC = () => {
    // 获取当月第一天和最后一天
    const getMonthRange = (): [Dayjs, Dayjs] => {
        const start = dayjs().startOf('month');
        const end = dayjs().endOf('month');
        return [start, end];
    };

    // 日期范围状态
    const [chatDateRange, setChatDateRange] = useState<[Dayjs, Dayjs]>(getMonthRange());
    const [tokenDateRange, setTokenDateRange] = useState<[Dayjs, Dayjs]>(getMonthRange());

    // 面板数据
    const [panelData, setPanelData] = useState<HTTPAdminPanelBaseGet>({
        today_chat: 0,
        today_token: 0,
        token: 0,
        user: 0
    });

    // 获取面板数据
    const { loading: panelLoading } = useRequest(GetAdminPanelBase, {
        onSuccess: (response) => {
            const data = response as unknown as HTTPAdminPanelBaseGet;
            setPanelData(data);
        }
    });

    // 对话趋势数据
    const [chatData, setChatData] = useState<HTTPAdminPanelChatGet[]>([]);

    // 获取对话趋势数据
    const { loading: chatLoading } = useRequest(
        () => GetAdminPanelChat(
            chatDateRange[0].format('YYYY-MM-DD'),
            chatDateRange[1].format('YYYY-MM-DD')
        ),
        {
            onSuccess: (response) => {
                const data = response as unknown as HTTPAdminPanelChatGet[];
                data.map((v) => {
                    v.date = formatDate2(v.date)
                })
                setChatData(data);
            },
            refreshDeps: [chatDateRange]
        }
    );

    // Token趋势数据
    const [tokenData, setTokenData] = useState<{date: string, value: number}[]>([]);
    
    // 获取Token趋势数据
    const { loading: tokenLoading } = useRequest(
        () => GetAdminPanelToken(
            tokenDateRange[0].format('YYYY-MM-DD'),
            tokenDateRange[1].format('YYYY-MM-DD')
        ),
        {
            onSuccess: (response) => {
                const data = response as unknown as {date: string, value: number}[];
                data.map((v) => {
                    v.date = formatDate2(v.date)
                })
                setTokenData(data);
            },
            refreshDeps: [tokenDateRange]
        }
    );

    // 图表引用
    const chatChartRef = useRef<HTMLDivElement>(null);
    const tokenChartRef = useRef<HTMLDivElement>(null);

    // 处理对话日期范围变化
    const handleChatDateRangeChange: RangePickerProps['onChange'] = (dates) => {
        if (dates && dates[0] && dates[1]) {
            setChatDateRange([dates[0], dates[1]]);
        }
    };

    // 处理Token日期范围变化
    const handleTokenDateRangeChange: RangePickerProps['onChange'] = (dates) => {
        if (dates && dates[0] && dates[1]) {
            setTokenDateRange([dates[0], dates[1]]);
        }
    };

    // 使用echarts绘制图表
    useEffect(() => {
        let chatChart: echarts.ECharts | null = null;
        let tokenChart: echarts.ECharts | null = null;

        if (chatChartRef.current && chatData.length > 0) {
            chatChart = echarts.init(chatChartRef.current);
            const option: EChartsOption = {
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        const dataIndex = params[0].dataIndex;
                        return `${chatData[dataIndex].date}: ${chatData[dataIndex].value}`;
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    top: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: chatData.map(item => item.date),
                    axisLine: {
                        lineStyle: {
                            color: '#f0f0f0'
                        }
                    },
                    axisLabel: {
                        color: '#666'
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#f0f0f0'
                        }
                    },
                    axisLabel: {
                        color: '#666'
                    }
                },
                series: [
                    {
                        name: '对话数量',
                        type: 'line',
                        stack: '总量',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            width: 2,
                            color: '#1890ff'
                        },
                        itemStyle: {
                            color: '#1890ff',
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(24, 144, 255, 0.3)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(24, 144, 255, 0.1)'
                                }
                            ])
                        },
                        data: chatData.map(item => item.value)
                    }
                ]
            };
            chatChart.setOption(option);
        }

        if (tokenChartRef.current && tokenData.length > 0) {
            tokenChart = echarts.init(tokenChartRef.current);
            const option: EChartsOption = {
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        const dataIndex = params[0].dataIndex;
                        return `${tokenData[dataIndex].date}: ${tokenData[dataIndex].value}`;
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    top: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: tokenData.map(item => item.date),
                    axisLine: {
                        lineStyle: {
                            color: '#f0f0f0'
                        }
                    },
                    axisLabel: {
                        color: '#666'
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#f0f0f0'
                        }
                    },
                    axisLabel: {
                        color: '#666'
                    }
                },
                series: [
                    {
                        name: 'Token数量',
                        type: 'line',
                        stack: '总量',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            width: 2,
                            color: '#1890ff'
                        },
                        itemStyle: {
                            color: '#1890ff',
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(24, 144, 255, 0.3)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(24, 144, 255, 0.1)'
                                }
                            ])
                        },
                        data: tokenData.map(item => item.value)
                    }
                ]
            };
            tokenChart.setOption(option);
        }

        // 响应窗口大小变化
        const handleResize = () => {
            chatChart?.resize();
            tokenChart?.resize();
        };

        window.addEventListener('resize', handleResize);

        // 清理函数
        return () => {
            chatChart?.dispose();
            tokenChart?.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [chatData, tokenData]);

    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            {/*标题*/}
            <p className="font-bold text-2xl">仪表盘</p>

            {/* 统计卡片 */}
            <Spin spinning={panelLoading}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <Statistic
                            title={
                                <Flex justify="space-between">
                                    <p>用户数量</p>
                                    <MehTwoTone />
                                </Flex>
                            }
                            value={panelData.user}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title={
                                <Flex justify="space-between">
                                    <p>今日对话数</p>
                                    <FileTextTwoTone />
                                </Flex>
                            }
                            value={panelData.today_chat}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title={
                                <Flex justify="space-between">
                                    <p>今日消耗Token</p>
                                    <ThunderboltTwoTone />
                                </Flex>
                            }
                            value={panelData.today_token}
                        />
                    </Card>
                    <Card>
                        <Statistic
                            title={
                                <Flex justify="space-between">
                                    <p>总Token消耗量</p>
                                    <BookTwoTone />
                                </Flex>
                            }
                            value={panelData.token}
                        />
                    </Card>
                </div>
            </Spin>

            {/* 对话趋势图 */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-bold">对话趋势</p>
                    <RangePicker
                        value={chatDateRange}
                        onChange={handleChatDateRangeChange}
                    />
                </div>
                {/* 图表容器 */}
                <Spin spinning={chatLoading}>
                    <div ref={chatChartRef} className="h-[300px] w-full"></div>
                </Spin>
            </Card>

            {/* Token 趋势图 */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-bold">Token 趋势</p>
                    <RangePicker 
                        value={tokenDateRange}
                        onChange={handleTokenDateRangeChange}
                    />
                </div>
                {/* 图表容器 */}
                <Spin spinning={tokenLoading}>
                    <div ref={tokenChartRef} className="h-[300px] w-full"></div>
                </Spin>
            </Card>
        </div>
    );
};

export default Dashboard;
