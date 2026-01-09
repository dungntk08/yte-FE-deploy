import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in", "routes/sign-in/SignIn.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("patients", "routes/patients.tsx"),
  route("examinations", "routes/examinations.tsx"),
  route("disease-prevention", "routes/disease-prevention.tsx"),
  route("maternal-childcare", "routes/maternal-childcare.tsx"),
  route("population", "routes/population.tsx"),
  route("medications", "routes/medications.tsx"),
  route("medical-equipment", "routes/medical-equipment.tsx"),
  route("food-safety", "routes/food-safety.tsx"),
  route("appointments", "routes/appointments.tsx"),
  route("medical-records", "routes/medical-records.tsx"),
] satisfies RouteConfig;
