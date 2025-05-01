import { FC, useEffect } from "react";

import { Layout } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router";

const { Content, Sider } = Layout;

const ChatPanel: FC = () => {
  // 初始化
  const location = useLocation();
  const navigate = useNavigate();

  // 监听默认地址
  useEffect(() => {
    if (location.pathname === "/service") {
      navigate("/service/chat");
    }
  }, [location.pathname]);

  return (
    <Layout hasSider>
      <Sider width={80} className="">
        <div className="flex flex-col justify-between items-center h-screen w-full p-4">
          <div className="w-12 h-12 flex justify-center items-center">
            <img src="/logo.svg" alt="LOGO" className="w-8" />
          </div>
          <div className="rounded-full overflow-hidden w-10 h-10">
            <img src="/logo.svg" alt="LOGO" />
          </div>
        </div>
      </Sider>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default ChatPanel;
