import { LockOutlined, PersonOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

interface LoginFormProps {
  loading?: boolean;
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
}

export function LoginForm({ loading, onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      newErrors.username = "Vui lòng nhập tài khoản!";
    }
    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (onSubmit) {
      await onSubmit({
        username,
        password,
        remember,
      });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className="w-full"
    >
      <Typography
        variant="h5"
        component="h1"
        className="mb-1 text-center font-semibold"
      >
        Đăng nhập
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        className="block mb-3 text-center text-gray-500"
      >
        Vui lòng nhập tài khoản để truy cập hệ thống trạm y tế
      </Typography>

      <TextField
        fullWidth
        label="Tài khoản"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (errors.username) {
            setErrors({ ...errors, username: undefined });
          }
        }}
        error={!!errors.username}
        helperText={errors.username}
        placeholder="Nhập tài khoản"
        autoComplete="username"
        margin="normal"
        InputProps={{
          startAdornment: (
            <PersonOutlined className="mr-1 text-gray-500" />
          ),
        }}
      />

      <TextField
        fullWidth
        label="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) {
            setErrors({ ...errors, password: undefined });
          }
        }}
        error={!!errors.password}
        helperText={errors.password}
        placeholder="Nhập mật khẩu"
        autoComplete="current-password"
        margin="normal"
        InputProps={{
          startAdornment: (
            <LockOutlined className="mr-1 text-gray-500" />
          ),
        }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
        }
        label="Ghi nhớ đăng nhập"
        className="mt-1"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
        className="mt-3"
        size="large"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </Box>
  );
}
