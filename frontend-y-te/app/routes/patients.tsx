import type { Route } from "./+types/patients";
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
} from "@mui/material";
import { Add, Search, Edit, Visibility } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../services/authService";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản lý bệnh nhân - Trạm y tế" },
    {
      name: "description",
      content: "Quản lý thông tin bệnh nhân",
    },
  ];
}

interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
}

const fakePatients: Patient[] = [
  {
    id: "1",
    fullName: "Nguyễn Văn An",
    dateOfBirth: "1985-05-15",
    gender: "Nam",
    address: "123 Đường ABC, Phường XYZ",
    phone: "0901234567",
    status: "active",
  },
  {
    id: "2",
    fullName: "Trần Thị Bình",
    dateOfBirth: "1990-08-20",
    gender: "Nữ",
    address: "456 Đường DEF, Phường UVW",
    phone: "0912345678",
    status: "active",
  },
  {
    id: "3",
    fullName: "Lê Văn Cường",
    dateOfBirth: "1975-12-10",
    gender: "Nam",
    address: "789 Đường GHI, Phường RST",
    phone: "0923456789",
    status: "active",
  },
];

export default function PatientsPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [patients] = useState<Patient[]>(fakePatients);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const filteredPatients = patients.filter((patient) =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box className="mb-3 flex items-center justify-between">
          <Typography variant="h4" component="h1" fontWeight="bold">
            Quản lý Bệnh nhân
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/patients/new")}
          >
            Thêm bệnh nhân
          </Button>
        </Box>

        <Paper className="p-3">
          <Box className="mb-3">
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>Ngày sinh</TableCell>
                  <TableCell>Giới tính</TableCell>
                  <TableCell>Địa chỉ</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" className="py-4">
                      <Typography color="text.secondary">
                        Không tìm thấy bệnh nhân nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient, index) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{patient.fullName}</TableCell>
                      <TableCell>{patient.dateOfBirth}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.address}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={patient.status === "active" ? "Hoạt động" : "Không hoạt động"}
                          color={patient.status === "active" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/patients/${patient.id}/edit`)}
                        >
                          <Edit />
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

