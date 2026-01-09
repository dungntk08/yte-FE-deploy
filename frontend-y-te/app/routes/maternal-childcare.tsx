import type { Route } from "./+types/maternal-childcare";
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
import { Add, ChildCare, PregnantWoman } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../services/authService";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chăm sóc Bà mẹ & Trẻ em - Trạm y tế" },
    {
      name: "description",
      content: "Quản lý chăm sóc sức khỏe bà mẹ và trẻ em",
    },
  ];
}

interface MaternalChildcareRecord {
  id: string;
  name: string;
  type: "mother" | "child";
  dateOfBirth: string;
  lastCheckup: string;
  nextCheckup: string;
  status: "normal" | "attention" | "urgent";
}

const fakeRecords: MaternalChildcareRecord[] = [
  {
    id: "1",
    name: "Nguyễn Thị Lan",
    type: "mother",
    dateOfBirth: "1990-05-15",
    lastCheckup: "2025-01-10",
    nextCheckup: "2025-01-25",
    status: "normal",
  },
  {
    id: "2",
    name: "Trần Văn An",
    type: "child",
    dateOfBirth: "2024-08-20",
    lastCheckup: "2025-01-12",
    nextCheckup: "2025-02-12",
    status: "normal",
  },
  {
    id: "3",
    name: "Lê Thị Hoa",
    type: "mother",
    dateOfBirth: "1988-12-10",
    lastCheckup: "2025-01-08",
    nextCheckup: "2025-01-22",
    status: "attention",
  },
];

export default function MaternalChildcarePage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [records] = useState<MaternalChildcareRecord[]>(fakeRecords);

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const mothersCount = records.filter((r) => r.type === "mother").length;
  const childrenCount = records.filter((r) => r.type === "child").length;
  const attentionCount = records.filter((r) => r.status === "attention" || r.status === "urgent").length;

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box className="mb-3">
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Chăm sóc Bà mẹ & Trẻ em
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý chăm sóc sức khỏe bà mẹ mang thai và trẻ em
          </Typography>
        </Box>

        <Grid container spacing={3} className="mb-3">
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <PregnantWoman className="text-[40px] text-blue-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {mothersCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bà mẹ đang theo dõi
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
                  <ChildCare className="text-[40px] text-green-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {childrenCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trẻ em đang theo dõi
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
                  <ChildCare className="text-[40px] text-amber-500" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {attentionCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cần chú ý
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
              Danh sách theo dõi
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/maternal-childcare/new")}
            >
              Thêm hồ sơ mới
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Ngày sinh</TableCell>
                  <TableCell>Lần khám gần nhất</TableCell>
                  <TableCell>Lần khám tiếp theo</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.type === "mother" ? "Bà mẹ" : "Trẻ em"}
                        color={record.type === "mother" ? "primary" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{record.dateOfBirth}</TableCell>
                    <TableCell>{record.lastCheckup}</TableCell>
                    <TableCell>{record.nextCheckup}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          record.status === "normal"
                            ? "Bình thường"
                            : record.status === "attention"
                            ? "Cần chú ý"
                            : "Khẩn cấp"
                        }
                        color={
                          record.status === "normal"
                            ? "success"
                            : record.status === "attention"
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

