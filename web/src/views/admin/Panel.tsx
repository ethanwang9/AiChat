import { FC } from "react";
import { Outlet } from "react-router";

const AdminPanel: FC = () => {
  return (
    <>
      <h1>管理员面板页面</h1>
      <Outlet />
    </>
  );
};

export default AdminPanel;
