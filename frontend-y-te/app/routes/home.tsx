import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { isAuthenticated } from "../services/authService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trạm y tế" },
    { name: "description", content: "Hệ thống quản lý trạm y tế" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate]);

  return null;
}
