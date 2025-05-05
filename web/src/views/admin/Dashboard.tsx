import {FC, useEffect, useRef} from "react";
import {Card, DatePicker, Flex, Statistic} from "antd";
import {
    MehTwoTone,
    FileTextTwoTone,
    ThunderboltTwoTone,
    BookTwoTone
} from "@ant-design/icons";
import * as echarts from 'echarts';
import type {EChartsOption} from 'echarts';

const {RangePicker} = DatePicker;

const Dashboard: FC = () => {
    // 对话趋势数据
    const chatData = [
        {date: "2025-04", value: 10},
        {date: "2025-05", value: 5},
    ];

    // Token趋势数据
    const tokenData = [
        {date: "2025-04", value: 6223},
        {date: "2025-05", value: 2068},
    ];

    // 图表引用
    const chatChartRef = useRef<HTMLDivElement>(null);
    const tokenChartRef = useRef<HTMLDivElement>(null);

    // 使用echarts绘制图表
    useEffect(() => {
        let chatChart: echarts.ECharts | null = null;
        let tokenChart: echarts.ECharts | null = null;

        if (chatChartRef.current) {
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

        if (tokenChartRef.current) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <Statistic
                        title={
                            <Flex justify="space-between">
                                <p>用户数量</p>
                                <MehTwoTone/>
                            </Flex>
                        }
                        value={1}
                    />
                </Card>
                <Card>
                    <Statistic
                        title={
                            <Flex justify="space-between">
                                <p>今日对话数</p>
                                <FileTextTwoTone/>
                            </Flex>
                        }
                        value={1}
                    />
                </Card>
                <Card>
                    <Statistic
                        title={
                            <Flex justify="space-between">
                                <p>今日消耗 Token</p>
                                <ThunderboltTwoTone/>
                            </Flex>
                        }
                        value={421}
                    />
                </Card>
                <Card>
                    <Statistic
                        title={
                            <Flex justify="space-between">
                                <p>总Token 消耗量</p>
                                <BookTwoTone/>
                            </Flex>
                        }
                        value={8291}
                    />
                </Card>
            </div>

            {/* 对话趋势图 */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-bold">对话趋势</p>
                    <RangePicker/>
                </div>
                {/* 图表容器 */}
                <div ref={chatChartRef} className="h-[300px] w-full"></div>
            </Card>

            {/* Token 趋势图 */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-bold">Token 趋势</p>
                    <RangePicker/>
                </div>
                {/* 图表容器 */}
                <div ref={tokenChartRef} className="h-[300px] w-full"></div>
            </Card>
        </div>
    );
};

export default Dashboard;
