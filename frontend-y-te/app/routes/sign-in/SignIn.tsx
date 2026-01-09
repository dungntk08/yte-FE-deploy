import { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/SignIn";
import {
  Box,
  Card,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  LoginForm,
  type LoginFormValues,
} from "../../components/auth/LoginForm";
import { login } from "../../services/authService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đăng nhập - Trạm y tế" },
    {
      name: "description",
      content: "Đăng nhập vào hệ thống quản lý trạm y tế",
    },
  ];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login({
        username: values.username,
        password: values.password,
      });

      setSnackbar({
        open: true,
        message: "Đăng nhập thành công",
        severity: "success",
      });

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Box
        className="min-h-screen flex items-center justify-center px-4 py-6"
        style={{
          background:
            "radial-gradient(circle at top, rgba(0, 184, 107, 0.08) 0, transparent 60%), #f5f5f5",
        }}
      >
        <Card
          className="w-full max-w-md rounded-2xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] bg-white"
        >
          <Box className="text-center mb-3">
            <Typography
              variant="h4"
              component="h1"
              className="mb-1 font-bold text-2xl"
            >
              Hệ thống trạm y tế
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className="text-gray-500"
            >
              Đăng nhập để bắt đầu sử dụng hệ thống
            </Typography>
          </Box>

          <LoginForm loading={loading} onSubmit={handleSubmit} />
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          className="w-full"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
