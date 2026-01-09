import type { Route } from "./+types/disease-prevention";
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
import {
  Vaccines,
  HealthAndSafety,
  Coronavirus,
  Add,
  LocalHospital,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser } from "../services/authService";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Phòng bệnh & Dịch bệnh - Trạm y tế" },
    {
      name: "description",
      content: "Quản lý phòng bệnh và giám sát dịch bệnh",
    },
  ];
}

interface DiseaseCase {
  id: string;
  diseaseName: string;
  patientName: string;
  date: string;
  status: "monitoring" | "treated" | "recovered";
  type: "infectious" | "non-infectious";
}

const fakeDiseaseCases: DiseaseCase[] = [
  {
    id: "1",
    diseaseName: "Cúm A",
    patientName: "Nguyễn Văn An",
    date: "2025-01-10",
    status: "monitoring",
    type: "infectious",
  },
  {
    id: "2",
    diseaseName: "Tiểu đường",
    patientName: "Trần Thị Bình",
    date: "2025-01-08",
    status: "treated",
    type: "non-infectious",
  },
  {
    id: "3",
    diseaseName: "Sốt xuất huyết",
    patientName: "Lê Văn Cường",
    date: "2025-01-12",
    status: "recovered",
    type: "infectious",
  },
];

export default function DiseasePreventionPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [diseaseCases] = useState<DiseaseCase[]>(fakeDiseaseCases);

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const infectiousCount = diseaseCases.filter((c) => c.type === "infectious").length;
  const nonInfectiousCount = diseaseCases.filter((c) => c.type === "non-infectious").length;
  const monitoringCount = diseaseCases.filter((c) => c.status === "monitoring").length;

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box className="mb-3">
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Phòng bệnh & Giám sát Dịch bệnh
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý phòng chống dịch bệnh truyền nhiễm và bệnh không lây nhiễm
          </Typography>
        </Box>

        <Grid container spacing={3} className="mb-3">
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box className="flex items-center gap-2">
                  <Coronavirus className="text-[40px] text-red-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {infectiousCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bệnh truyền nhiễm
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
                  <HealthAndSafety className="text-[40px] text-amber-500" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {nonInfectiousCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bệnh không lây nhiễm
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
                  <Vaccines className="text-[40px] text-sky-600" />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {monitoringCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đang giám sát
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
              Danh sách ca bệnh
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/disease-prevention/new")}
            >
              Thêm ca bệnh mới
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên bệnh</TableCell>
                  <TableCell>Bệnh nhân</TableCell>
                  <TableCell>Ngày phát hiện</TableCell>
                  <TableCell>Loại bệnh</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diseaseCases.map((case_, index) => (
                  <TableRow key={case_.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{case_.diseaseName}</TableCell>
                    <TableCell>{case_.patientName}</TableCell>
                    <TableCell>{case_.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={case_.type === "infectious" ? "Truyền nhiễm" : "Không lây nhiễm"}
                        color={case_.type === "infectious" ? "error" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          case_.status === "monitoring"
                            ? "Đang giám sát"
                            : case_.status === "treated"
                            ? "Đang điều trị"
                            : "Đã khỏi"
                        }
                        color={
                          case_.status === "monitoring"
                            ? "info"
                            : case_.status === "treated"
                            ? "warning"
                            : "success"
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

