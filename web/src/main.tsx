import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import router from "@/routers";
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ConfigProvider locale={zhCN}>
    <RouterProvider router={router}></RouterProvider>
  </ConfigProvider>
);
