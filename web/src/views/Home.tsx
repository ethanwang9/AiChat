import Orb from "@/components/ui/Orb";
import {ArrowRightOutlined} from "@ant-design/icons";
import {Button} from "antd";
import {FC} from "react";
import {useNavigate} from "react-router";
import {GetHomeBase} from "@/apis/home.ts";
import {useRequest} from "ahooks";
import {HttpHomeBase} from "@/types/http/home.ts";

const Home: FC = () => {
    // 初始化
    const navigate = useNavigate();
    const { data: systemInfo } = useRequest(GetHomeBase) as { data: HttpHomeBase | undefined };

    // 跳转对话模型
    const goto = () => {
        navigate("/service/chat");
    };

    return (
        <div className="w-screen h-screen bg-[#16191E]">
            {/* LOGO */}
            <div className="w-full text-white flex justify-center items-center gap-3 py-4">
                <img src="/logo.svg" alt="LOGO" className="w-6"/>
                <p className="font-bold text-lg">{systemInfo?.name}</p>
            </div>
            {/* 内容 */}
            <div className="flex justify-center gap-8 w-full  mt-8">
                <div className="text-white">
                    <p className="text-5xl leading-[1.6em] font-bold">你好，</p>
                    <p className="text-5xl leading-[1.6em] font-bold">欢迎探索恐龙伙伴</p>
                    <p className="text-3xl leading-[2.6em] text-gray-300">
                        让聪明的
                        <span className="m-2 rounded-xl bg-indigo-500 p-2 font-bold text-gray-300">
              小恐龙
            </span>
                        帮你解决吧！
                    </p>
                    <Button
                        className="mt-2"
                        type="primary"
                        size="large"
                        icon={<ArrowRightOutlined/>}
                        onClick={goto}
                    >
                        立刻体验
                    </Button>
                </div>
                <div className="postion-relative">
                    <Orb
                        hue={12}
                        hoverIntensity={0.5}
                        rotateOnHover={false}
                        forceHoverState={true}
                    />
                </div>
            </div>
            {/* 卡片 */}
            <div className="flex justify-center gap-8 mt-16">
                <div className="text-white backdrop-blur-md w-[22em] h-40 p-6 bg-[#262931]/60 rounded-xl">
                    <p className="text-xl font-bold">支持多种模型对话</p>
                    <p className="pt-2 text-sm">
                        系统支持与多种模型对话，已接入DeepSeek-R1、DeepSekk V3、GPT
                        4.1、GPT-4O等各大厂商大模型服务。
                    </p>
                </div>
                <div className="text-white backdrop-blur-md w-[22em] h-40 p-6 bg-[#262931]/60 rounded-xl">
                    <p className="text-xl font-bold">支持更多功能</p>
                    <p className="pt-2 text-sm">
                        除传统问答服务外，还支持智能体和擂台功能。提供角色扮演类智能体，输出定制化内容；多个模型擂台角斗，看看谁的能力更加强吧！
                    </p>
                </div>
            </div>
            {/* footer */}
            <div className="absolute bottom-4 flex w-screen items-center justify-center gap-8 text-xs text-gray-600">
                <p>Copyright &copy; 2025 小橙子科技工作室</p>
                <p>{systemInfo?.icp}</p>
                <p>{systemInfo?.gov}</p>
            </div>
        </div>
    );
};

export default Home;
