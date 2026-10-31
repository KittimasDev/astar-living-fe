import {
  Layout,
  Avatar,
  Typography,
  Dropdown,
  Menu,
  message,
  Spin,
} from "antd";
import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthAPIs } from "../../networks/auth.api";
import { meQueryKey, useMe } from "../../hooks/useMe";

const { Text } = Typography;

export default function Footer(props: any) {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "-";

  return (
    <div
      className="flex justify-center items-center bg-white text-[#747474] px-6 py-4"
      style={{
        top: 0,
        zIndex: 10,
      }}
    >
      Copyright © 2026 A STAR TECHNOLOGY CO., LTD. (v.{appVersion})
    </div>
  );
}
