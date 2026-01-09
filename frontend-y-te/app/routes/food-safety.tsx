import type { Route } from "./+types/food-safety";
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
import { Add, Restaurant, CheckCircle, Warning } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../services/authService";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "An toàn Thực phẩm - Trạm y tế" },
    {
      name: "description",
      content: "Quản lý giám sát an toàn thực phẩm",
    },
  ];
}

interface FoodSafetyInspection {
  id: string;
  facilityName: string;
  address: string;
  inspectionDate: string;
  result: "passed" | "failed" | "warning";
  nextInspection: string;
}

const fakeInspections: FoodSafetyInspection[] = [
  {
    id: "1",
    facilityName: "Nhà hàng ABC",
    address: "123 Đường XYZ",
    inspectionDate: "2025-01-10",
    result: "passed",
    nextInspection: "2025-04-10",
  },
  {
    id: "2",
    facilityName: "Quán ăn DEF",
    address: "456 Đường UVW",
    inspectionDate: "2025-01-08",
    result: "warning",
    nextInspection: "2025-02-08",
  },
  {
    id: "3",
    facilityName: "Cửa hàng GHI",
    address: "789 Đường RST",
    inspectionDate: "2025-01-12",
    result: "failed",
    nextInspection: "2025-01-26",
  },
];

export default function FoodSafetyPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [inspections] = useState<FoodSafetyInspection[]>(fakeInspections);

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const passedCount = inspections.filter((i) => i.result === "passed").length;
  const warningCount = inspections.filter((i) => i.result === "warning").length;
  const failedCount = inspections.filter((i) => i.result === "failed").length;

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box className="mb-3">
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            An toàn Thực phẩm
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Giám sát và kiểm tra an toàn thực phẩm tại các cơ sở trên địa bàn
          </Typography>
        </Box>

        <Grid container spacing={3} className="mb-3">
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <CheckCircle className="text-[40px] text-green-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {passedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đạt tiêu chuẩn
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
                      {warningCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cảnh báo
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
                  <Restaurant className="text-[40px] text-red-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {failedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Không đạt
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
              Danh sách kiểm tra
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/food-safety/new")}
            >
              Tạo phiếu kiểm tra mới
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên cơ sở</TableCell>
                  <TableCell>Địa chỉ</TableCell>
                  <TableCell>Ngày kiểm tra</TableCell>
                  <TableCell>Kết quả</TableCell>
                  <TableCell>Kiểm tra tiếp theo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inspections.map((inspection, index) => (
                  <TableRow key={inspection.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{inspection.facilityName}</TableCell>
                    <TableCell>{inspection.address}</TableCell>
                    <TableCell>{inspection.inspectionDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          inspection.result === "passed"
                            ? "Đạt"
                            : inspection.result === "warning"
                            ? "Cảnh báo"
                            : "Không đạt"
                        }
                        color={
                          inspection.result === "passed"
                            ? "success"
                            : inspection.result === "warning"
                            ? "warning"
                            : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{inspection.nextInspection}</TableCell>
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

