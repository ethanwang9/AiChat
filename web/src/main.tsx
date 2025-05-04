import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Provider } from "react-redux";
import { store } from "@/stores";
import router from "@/routers";
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router}></RouterProvider>
    </ConfigProvider>
  </Provider>
);
