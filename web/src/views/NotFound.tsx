import { FC } from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router";
import {ArrowLeftOutlined} from "@ant-design/icons";
import Orb from "@/components/ui/Orb";

const NotFound: FC = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#16191E]">
      {/* LOGO */}
      <div className="absolute top-0 flex w-full items-center justify-center gap-3 py-4 text-white">
        <img src="/logo.svg" alt="LOGO" className="w-6" />
        <p className="text-lg font-bold">DinoPals</p>
      </div>

      {/* 卡片 */}
      <div className="z-10 flex flex-col items-center">
        <Result
          status="404"
          title={<span className="text-4xl font-bold text-white">404</span>}
          subTitle={
            <span className="text-xl text-gray-300">
              抱歉，您访问的页面不存在
            </span>
          }
          extra={
            <Button
              type="primary"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={goHome}
            >
              返回首页
            </Button>
          }
          className="rounded-xl bg-[#262931]/60 p-8 backdrop-blur-md w-2xl"
        />
      </div>

      {/* Background Orb */}
      <div className="absolute -right-40 -bottom-40 h-[600px] w-[600px] opacity-50">
        <Orb
          hue={200}
          hoverIntensity={0.5}
          rotateOnHover={false}
          forceHoverState={true}
        />
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 flex w-screen items-center justify-center gap-8 text-xs text-gray-600">
        <p>Copyright &copy; 2025 小橙子科技工作室</p>
        <p>渝ICP备2025053725号-1</p>
        <p>渝公网安备50010302000814号</p>
      </div>
    </div>
  );
};

export default NotFound;
