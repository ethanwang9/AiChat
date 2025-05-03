import { createBrowserRouter } from "react-router";
import Home from "@/views/Home";
import ChatPanel from "@/views/chat/Panel";
import Chat from "@/views/chat/Chat";
import Agent from "@/views/chat/Agent";
import PK from "@/views/chat/PK";
import AdminPanel from "@/views/admin/Panel";
import Userinfo from "@/views/admin/Userinfo";
import History from "@/views/admin/History";
import Dashboard from "@/views/admin/Dashboard";
import ChatManage from "@/views/admin/ChatManage";
import ModelManage from "@/views/admin/ModelManage";
import UserManage from "@/views/admin/UserManage";
import System from "@/views/admin/System";
import LogManage from "@/views/admin/LogManage.tsx";
import AgentManage from "@/views/admin/AgentManage.tsx";
import NotFound from "@/views/NotFound";
import AgentChat from "@/views/chat/AgentChat";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "service",
    Component: ChatPanel,
    // loader: () => redirect("/service/chat"),
    children: [
      {
        path: "chat",
        Component: Chat,
      },
      {
        path: "agent",
        Component: Agent,
        children: [
          {
            path: "chat",
            Component: AgentChat,
          },
        ],
      },
      {
        path: "pk",
        Component: PK,
      },
    ],
  },
  {
    path: "admin",
    Component: AdminPanel,
    children: [
      {
        path: "userinfo",
        Component: Userinfo,
      },
      {
        path: "history",
        Component: History,
      },
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "agent",
        Component: AgentManage,
      },
      {
        path: "chat",
        Component: ChatManage,
      },
      {
        path: "model",
        Component: ModelManage,
      },
      {
        path: "user",
        Component: UserManage,
      },
      {
        path: "log",
        Component: LogManage,
      },
      {
        path: "system",
        Component: System,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

export default router;
