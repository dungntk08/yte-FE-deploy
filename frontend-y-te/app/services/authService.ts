export interface LoginPayload {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Fake data - danh sách user giả
const FAKE_USERS = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "Nguyễn Văn Admin",
    role: "Quản trị viên",
    email: "admin@tramyte.vn",
  },
  {
    id: "2",
    username: "doctor",
    password: "doctor123",
    name: "Bác sĩ Nguyễn Thị Lan",
    role: "Bác sĩ",
    email: "doctor@tramyte.vn",
  },
  {
    id: "3",
    username: "nurse",
    password: "nurse123",
    name: "Y tá Trần Văn Hùng",
    role: "Y tá",
    email: "nurse@tramyte.vn",
  },
  {
    id: "4",
    username: "user",
    password: "user123",
    name: "Người dùng Test",
    role: "Nhân viên",
    email: "user@tramyte.vn",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // Simulate API call delay
  await delay(800);

  // Find user in fake data
  const user = FAKE_USERS.find(
    (u) => u.username === payload.username && u.password === payload.password
  );

  if (!user) {
    throw new Error("Tài khoản hoặc mật khẩu không đúng");
  }

  // Create response with user data (without password)
  const { password, ...userWithoutPassword } = user;
  const response: LoginResponse = {
    user: userWithoutPassword,
    token: `fake_token_${user.id}_${Date.now()}`,
  };

  // Store in localStorage for persistence
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  }

  return response;
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("auth_token");
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }
}
