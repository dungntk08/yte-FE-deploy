import type { Route } from "./+types/medical-records";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import { Add, Search, Assignment } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../services/authService";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hồ sơ Bệnh án - Trạm y tế" },
    {
      name: "description",
      content: "Quản lý hồ sơ bệnh án",
    },
  ];
}

interface MedicalRecord {
  id: string;
  patientName: string;
  recordNumber: string;
  date: string;
  diagnosis: string;
  doctor: string;
}

const fakeRecords: MedicalRecord[] = [
  {
    id: "1",
    patientName: "Nguyễn Văn An",
    recordNumber: "HS-2025-001",
    date: "2025-01-15",
    diagnosis: "Cảm cúm thông thường",
    doctor: "Bác sĩ Nguyễn Thị Lan",
  },
  {
    id: "2",
    patientName: "Trần Thị Bình",
    recordNumber: "HS-2025-002",
    date: "2025-01-14",
    diagnosis: "Viêm họng cấp",
    doctor: "Bác sĩ Lê Văn Hùng",
  },
];

export default function MedicalRecordsPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [records] = useState<MedicalRecord[]>(fakeRecords);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const filteredRecords = records.filter(
    (record) =>
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box className="mb-3 flex items-center justify-between">
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Hồ sơ Bệnh án
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý hồ sơ bệnh án của bệnh nhân
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/medical-records/new")}
          >
            Tạo hồ sơ mới
          </Button>
        </Box>

        <Paper className="p-3">
          <Box className="mb-3">
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên bệnh nhân hoặc số hồ sơ..."
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
                  <TableCell>Số hồ sơ</TableCell>
                  <TableCell>Bệnh nhân</TableCell>
                  <TableCell>Ngày khám</TableCell>
                  <TableCell>Chẩn đoán</TableCell>
                  <TableCell>Bác sĩ</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-4">
                      <Typography color="text.secondary">
                        Không tìm thấy hồ sơ nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record, index) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{record.recordNumber}</TableCell>
                      <TableCell>{record.patientName}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell>{record.doctor}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<Assignment />}
                          onClick={() => navigate(`/medical-records/${record.id}`)}
                        >
                          Xem chi tiết
                        </Button>
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

