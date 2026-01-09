import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  LocalHospital,
  Assignment,
  EventNote,
  Medication,
  MedicalServices,
  Restaurant,
  ChildCare,
  AccountCircle,
  Logout,
  Vaccines,
  HealthAndSafety,
} from "@mui/icons-material";
import { getCurrentUser, logout } from "../../services/authService";

const DRAWER_WIDTH = 280;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: "Tổng quan", icon: <Dashboard />, path: "/dashboard" },
  { text: "Quản lý bệnh nhân", icon: <People />, path: "/patients" },
  { text: "Khám chữa bệnh", icon: <LocalHospital />, path: "/examinations" },
  { text: "Phòng bệnh & Dịch bệnh", icon: <Vaccines />, path: "/disease-prevention" },
  { text: "Chăm sóc Bà mẹ & Trẻ em", icon: <ChildCare />, path: "/maternal-childcare" },
  { text: "Quản lý dân số", icon: <HealthAndSafety />, path: "/population" },
  { text: "Quản lý thuốc", icon: <Medication />, path: "/medications" },
  { text: "Thiết bị y tế", icon: <MedicalServices />, path: "/medical-equipment" },
  { text: "An toàn thực phẩm", icon: <Restaurant />, path: "/food-safety" },
  { text: "Lịch hẹn", icon: <EventNote />, path: "/appointments" },
  { text: "Hồ sơ bệnh án", icon: <Assignment />, path: "/medical-records" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/sign-in");
  };

  const drawer = (
    <Box>
      <Toolbar className="bg-primary text-white flex items-center gap-1">
        <LocalHospital />
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          Trạm Y Tế
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                className="data-[mui-selected=true]:bg-primary-main data-[mui-selected=true]:text-white data-[mui-selected=true]:hover:bg-primary-dark"
              >
                <ListItemIcon
                  className={isActive ? "text-white" : undefined}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box className="flex min-h-screen">
      <AppBar
        position="fixed"
        className="bg-primary text-white md:w-[calc(100%-280px)] md:ml-[280px]"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="mr-2 md:hidden"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" className="grow md:hidden">
            Hệ thống Quản lý Trạm Y Tế
          </Typography>
          <Box className="flex items-center gap-1 ml-auto">
            <Typography variant="body2" className="hidden sm:block">
              {user?.name}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
            >
              <AccountCircle />
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        className="md:w-[280px] md:shrink-0"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          className="block md:hidden"
          PaperProps={{
            className: "box-border w-[280px]",
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          className="hidden md:block"
          PaperProps={{
            className: "box-border w-[280px]",
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        className="grow p-3 md:w-[calc(100%-280px)] bg-[#f5f5f5] min-h-screen"
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

