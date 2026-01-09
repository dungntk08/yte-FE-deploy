import type { Route } from "./+types/examinations";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Add, Search, Visibility, LocalHospital } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../services/authService";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Khám chữa bệnh - Trạm y tế" },
    {
      name: "description",
      content: "Quản lý khám chữa bệnh",
    },
  ];
}

interface Examination {
  id: string;
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  diagnosis: string;
  status: "pending" | "completed" | "cancelled";
}

const fakeExaminations: Examination[] = [
  {
    id: "1",
    patientName: "Nguyễn Văn An",
    date: "2025-01-15",
    time: "08:00",
    doctor: "Bác sĩ Nguyễn Thị Lan",
    diagnosis: "Cảm cúm thông thường",
    status: "completed",
  },
  {
    id: "2",
    patientName: "Trần Thị Bình",
    date: "2025-01-15",
    time: "09:30",
    doctor: "Bác sĩ Lê Văn Hùng",
    diagnosis: "Đang chờ khám",
    status: "pending",
  },
  {
    id: "3",
    patientName: "Lê Văn Cường",
    date: "2025-01-15",
    time: "10:00",
    doctor: "Bác sĩ Nguyễn Thị Lan",
    diagnosis: "Viêm họng",
    status: "completed",
  },
];

export default function ExaminationsPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [examinations] = useState<Examination[]>(fakeExaminations);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const filteredExaminations = examinations.filter(
    (examination) =>
      examination.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examination.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayExaminations = examinations.filter(
    (ex) => ex.date === new Date().toISOString().split("T")[0]
  );
  const pendingCount = examinations.filter((ex) => ex.status === "pending").length;
  const completedCount = examinations.filter((ex) => ex.status === "completed").length;

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box className="mb-3">
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Khám chữa bệnh
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các ca khám bệnh, chữa bệnh tại trạm y tế
          </Typography>
        </Box>

        <Grid container spacing={3} className="mb-3">
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <LocalHospital className="text-[40px] text-blue-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {todayExaminations.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Khám hôm nay
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <LocalHospital className="text-[40px] text-amber-500" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {pendingCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đang chờ khám
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <LocalHospital className="text-[40px] text-green-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {completedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đã hoàn thành
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper className="p-3">
          <Box className="mb-3 flex items-center justify-between">
            <TextField
              placeholder="Tìm kiếm theo tên bệnh nhân hoặc chẩn đoán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[400px] max-w-full"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/examinations/new")}
            >
              Tạo phiếu khám mới
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Bệnh nhân</TableCell>
                  <TableCell>Ngày khám</TableCell>
                  <TableCell>Giờ khám</TableCell>
                  <TableCell>Bác sĩ</TableCell>
                  <TableCell>Chẩn đoán</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExaminations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-4">
                      <Typography color="text.secondary">
                        Không tìm thấy phiếu khám nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExaminations.map((examination, index) => (
                    <TableRow key={examination.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{examination.patientName}</TableCell>
                      <TableCell>{examination.date}</TableCell>
                      <TableCell>{examination.time}</TableCell>
                      <TableCell>{examination.doctor}</TableCell>
                      <TableCell>{examination.diagnosis}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            examination.status === "completed"
                              ? "Hoàn thành"
                              : examination.status === "pending"
                              ? "Đang chờ"
                              : "Đã hủy"
                          }
                          color={
                            examination.status === "completed"
                              ? "success"
                              : examination.status === "pending"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/examinations/${examination.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </DashboardLayout>
  );
}

