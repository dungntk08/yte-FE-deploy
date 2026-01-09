import type { Route } from "./+types/medical-equipment";
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
} from "@mui/material";
import { Add, MedicalServices, Build } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../services/authService";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản lý Thiết bị Y tế - Trạm y tế" },
    {
      name: "description",
      content: "Quản lý thiết bị y tế",
    },
  ];
}

interface Equipment {
  id: string;
  name: string;
  code: string;
  status: "available" | "in-use" | "maintenance" | "broken";
  lastMaintenance: string;
  nextMaintenance: string;
}

const fakeEquipment: Equipment[] = [
  {
    id: "1",
    name: "Máy đo huyết áp điện tử",
    code: "BP-001",
    status: "available",
    lastMaintenance: "2024-12-01",
    nextMaintenance: "2025-03-01",
  },
  {
    id: "2",
    name: "Máy đo đường huyết",
    code: "BG-002",
    status: "in-use",
    lastMaintenance: "2024-11-15",
    nextMaintenance: "2025-02-15",
  },
  {
    id: "3",
    name: "Máy siêu âm",
    code: "US-003",
    status: "maintenance",
    lastMaintenance: "2025-01-10",
    nextMaintenance: "2025-04-10",
  },
];

export default function MedicalEquipmentPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [equipment] = useState<Equipment[]>(fakeEquipment);

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const availableCount = equipment.filter((e) => e.status === "available").length;
  const inUseCount = equipment.filter((e) => e.status === "in-use").length;
  const maintenanceCount = equipment.filter((e) => e.status === "maintenance" || e.status === "broken").length;

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box className="mb-3">
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Quản lý Thiết bị Y tế
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý và bảo trì thiết bị y tế
          </Typography>
        </Box>

        <Grid container spacing={3} className="mb-3">
          <Grid item xs={12} sm={4} component={"div" as any}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <MedicalServices className="text-[40px] text-green-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {availableCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thiết bị sẵn sàng
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} component={"div" as any}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <MedicalServices className="text-[40px] text-sky-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {inUseCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đang sử dụng
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} component={"div" as any}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <Build className="text-[40px] text-amber-500" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {maintenanceCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bảo trì/Sửa chữa
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper className="p-3">
          <Box className="mb-3 flex items-center justify-between">
            <Typography variant="h6" fontWeight="bold">
              Danh sách thiết bị
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/medical-equipment/new")}
            >
              Thêm thiết bị mới
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên thiết bị</TableCell>
                  <TableCell>Mã thiết bị</TableCell>
                  <TableCell>Bảo trì gần nhất</TableCell>
                  <TableCell>Bảo trì tiếp theo</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.lastMaintenance}</TableCell>
                    <TableCell>{item.nextMaintenance}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          item.status === "available"
                            ? "Sẵn sàng"
                            : item.status === "in-use"
                            ? "Đang dùng"
                            : item.status === "maintenance"
                            ? "Bảo trì"
                            : "Hỏng"
                        }
                        color={
                          item.status === "available"
                            ? "success"
                            : item.status === "in-use"
                            ? "info"
                            : item.status === "maintenance"
                            ? "warning"
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

