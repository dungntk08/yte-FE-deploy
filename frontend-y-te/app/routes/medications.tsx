import type { Route } from "./+types/medications";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Add, Search, Medication, Warning } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../services/authService";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản lý Thuốc - Trạm y tế" },
    {
      name: "description",
      content: "Quản lý thuốc và dược phẩm",
    },
  ];
}

interface Medication {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  status: "available" | "low-stock" | "expired";
}

const fakeMedications: Medication[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    code: "PAR-500",
    quantity: 150,
    unit: "Viên",
    expiryDate: "2026-12-31",
    status: "available",
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    code: "AMX-250",
    quantity: 25,
    unit: "Viên",
    expiryDate: "2025-06-30",
    status: "low-stock",
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    code: "IBU-400",
    quantity: 0,
    unit: "Viên",
    expiryDate: "2025-03-15",
    status: "expired",
  },
];

export default function MedicationsPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [medications] = useState<Medication[]>(fakeMedications);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const filteredMedications = medications.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCount = medications.filter((m) => m.status === "available").length;
  const lowStockCount = medications.filter((m) => m.status === "low-stock").length;
  const expiredCount = medications.filter((m) => m.status === "expired").length;

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box className="mb-3">
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Quản lý Thuốc & Dược phẩm
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý tồn kho thuốc, dược phẩm và vật tư y tế
          </Typography>
        </Box>

        <Grid container spacing={3} className="mb-3">
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <Medication className="text-[40px] text-green-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {availableCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thuốc có sẵn
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
                  <Warning className="text-[40px] text-amber-500" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {lowStockCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sắp hết hàng
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
                  <Warning className="text-[40px] text-red-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {expiredCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đã hết hạn
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
              placeholder="Tìm kiếm theo tên hoặc mã thuốc..."
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
              onClick={() => navigate("/medications/new")}
            >
              Nhập thuốc mới
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên thuốc</TableCell>
                  <TableCell>Mã thuốc</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Đơn vị</TableCell>
                  <TableCell>Hạn sử dụng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMedications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-4">
                      <Typography color="text.secondary">
                        Không tìm thấy thuốc nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedications.map((medication, index) => (
                    <TableRow key={medication.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{medication.name}</TableCell>
                      <TableCell>{medication.code}</TableCell>
                      <TableCell>{medication.quantity}</TableCell>
                      <TableCell>{medication.unit}</TableCell>
                      <TableCell>{medication.expiryDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            medication.status === "available"
                              ? "Có sẵn"
                              : medication.status === "low-stock"
                              ? "Sắp hết"
                              : "Hết hạn"
                          }
                          color={
                            medication.status === "available"
                              ? "success"
                              : medication.status === "low-stock"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
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

