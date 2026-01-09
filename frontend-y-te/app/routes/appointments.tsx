import type { Route } from "./+types/appointments";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { Add, EventNote } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../services/authService";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lịch hẹn - Trạm y tế" },
    {
      name: "description",
      content: "Quản lý lịch hẹn khám bệnh",
    },
  ];
}

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled";
}

const fakeAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Nguyễn Văn An",
    date: "2025-01-16",
    time: "08:00",
    doctor: "Bác sĩ Nguyễn Thị Lan",
    type: "Khám tổng quát",
    status: "scheduled",
  },
  {
    id: "2",
    patientName: "Trần Thị Bình",
    date: "2025-01-16",
    time: "09:30",
    doctor: "Bác sĩ Lê Văn Hùng",
    type: "Tái khám",
    status: "scheduled",
  },
];

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [appointments] = useState<Appointment[]>(fakeAppointments);

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box className="mb-3 flex items-center justify-between">
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Lịch hẹn
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý lịch hẹn khám bệnh
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/appointments/new")}
          >
            Tạo lịch hẹn mới
          </Button>
        </Box>

        <Paper className="p-3">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Bệnh nhân</TableCell>
                  <TableCell>Ngày hẹn</TableCell>
                  <TableCell>Giờ hẹn</TableCell>
                  <TableCell>Bác sĩ</TableCell>
                  <TableCell>Loại khám</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment, index) => (
                  <TableRow key={appointment.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.doctor}</TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          appointment.status === "scheduled"
                            ? "Đã đặt"
                            : appointment.status === "completed"
                            ? "Hoàn thành"
                            : "Đã hủy"
                        }
                        color={
                          appointment.status === "scheduled"
                            ? "primary"
                            : appointment.status === "completed"
                            ? "success"
                            : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </DashboardLayout>
  );
}

