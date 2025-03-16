"use client";
import React, { useState, useEffect } from "react";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle'
import { RateReview, Comment, } from "@mui/icons-material";
import ProtectedRoute from "../../Protected";
import { io } from "socket.io-client";
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  Box, Tabs, Tab, Typography, Card, CardContent, Button, Grid,
  IconButton, Collapse, Divider, Stack, Chip, Avatar 
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { styled, alpha } from '@mui/material/styles';
import { 
  Business, RestaurantMenu, Star, Phone, ExpandMore,
  Inventory, Cancel, CheckCircle, PendingActions, Delete
} from "@mui/icons-material";
import ButtonGroup from '@mui/material/ButtonGroup';

// ==================== Theme Constants ====================
const PRIMARY_COLOR = '#1a237e';
const SECONDARY_COLOR = '#4f5b62';
const ACCENT_COLOR = '#5c6bc0';
const SUCCESS_COLOR = '#43a047';
const ERROR_COLOR = '#d32f2f';
const BACKGROUND_COLOR = '#f5f5f5';

// ==================== Styled Components ====================
const EnterpriseDashboard = styled(Box)(({ theme }) => ({
  maxWidth: 1440,
  margin: '2rem auto',
  padding: '2rem',
  backgroundColor: BACKGROUND_COLOR,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  fontFamily: "'Inter', sans-serif",
}));

const HeaderSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '2rem',
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
});

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

const MetricCard = styled(Card)(({ theme }) => ({
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(PRIMARY_COLOR, 0.1)}`,
  },
}));

const DataGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.5rem',
  margin: '2rem 0',
}));

const OrderCard = styled(Card)(({ theme, status }) => ({
  marginBottom: '1rem',
  borderLeft: `4px solid ${getStatusColor(status)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderLeftWidth: '6px',
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 600,
  backgroundColor: alpha(getStatusColor(status), 0.1),
  color: getStatusColor(status),
  '& .MuiChip-icon': {
    color: getStatusColor(status),
  },
}));

const StyledDeleteButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 3),
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  gap: theme.spacing(1),
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2]
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
    cursor: 'not-allowed'
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem'
  }
}));


const ActionButton = styled(Button)(({ varianttype }) => ({
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 20px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  ...(varianttype === 'primary' && {
    backgroundColor: SUCCESS_COLOR,
    color: 'white',
    '&:hover': {
      backgroundColor: '#388e3c',
    },
  }),
  ...(varianttype === 'secondary' && {
    backgroundColor: ERROR_COLOR,
    color: 'white',
    '&:hover': {
      backgroundColor: '#c62828',
    },
  }),
}));

// ==================== Helper Functions ====================
const getStatusColor = (status) => {
  const statusColors = {
    Waiting: '#f9a825',
    Accepted: '#2e7d32',
    Processing: '#0288d1',
    Delivered: '#558b2f',
    Cancelled: '#d32f2f',
  };
  return statusColors[status] || SECONDARY_COLOR;
};
const getStatusIcon = (status) => {
  const icons = {
    Waiting: <PendingActions fontSize="small" />,
    Accepted: <CheckCircle fontSize="small" />,
    Cancelled: <Cancel fontSize="small" />,
    Delivered: <Inventory fontSize="small" />
  };
  return icons[status] || <PendingActions fontSize="small" />;
};

// ==================== Main Component ====================
export default function EnterpriseHotelDashboard() {

  const { hotelId } = useParams();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0); // New state for Orders sub-tabs
  const [hotelDetails, setHotelDetails] = useState(null);
  const [dishesDetails, setDishesDetails] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch hotel details (Profile Tab)
  useEffect(() => {
    if (!hotelId) return;
    const fetchHotelDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel/details/${hotelId}`, {
          method: "GET",
          credentials: "include",
        });
        if(response.status==(404 || 403))router.push('/');
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to load hotel details");
          return;
        }
        const data = await response.json();
        const hotelData = data.data || data.hotel;
        setHotelDetails(hotelData);
        // Fetch dishes if available
        if (hotelData.dishes?.length > 0) {
          try {
            const dishesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/food/details`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dishIds: hotelData.dishes }),
            });
            if (!dishesResponse.ok) {
              const errorData = await dishesResponse.json();
              toast.error(errorData.message || "Failed to load menu items");
              return;
            }
            const dishesData = await dishesResponse.json();
            setDishesDetails(dishesData.data || dishesData.foods);
          } catch (dishError) {
            console.error("Dish details error:", dishError);
            toast.error("Failed to load menu items");
          }
        }
      } catch (error) {
        console.error("Hotel details error:", error);
        toast.error("Failed to load hotel details");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchHotelDetails();
  }, [hotelId]);

  useEffect(() => {
    if (!hotelId) return;

    // Join the hotel room
    socket.emit("joinHotelRoom", hotelId);
    console.log(`Joined WebSocket room: ${hotelId}`);

    // Listen for order updates
    socket.on("orderUpdated", (updatedOrder) => {
      console.log("Received order update:", updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === updatedOrder.orderId ? updatedOrder : order
        )
      );
      // toast.info(`Order ${updatedOrder.orderId} updated to ${updatedOrder.status}`);
    });

    // Listen for new orders
    socket.on("orderCreated", (newOrder) => {
      console.log("Received new order:", newOrder);
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      toast.info(`New Order ${newOrder.orderId} created with status ${newOrder.status}`);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("orderUpdated");
      socket.off("orderCreated");
    };
  }, [hotelId, setOrders, socket]);

  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel/delete/${hotelId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        document.cookie = 'authToken=; Path=/;';
        toast.success("Hotel deleted successfully");
        setTimeout(() => router.push("/"), 150);
      }
    } catch (error) {
      console.error("Error deleting hotel:", error);
      toast.error("Failed to delete hotel");
    } finally {
      setIsDeleting(false);
      handleClose();
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/update/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.message || "Failed to update order status");
        return;
      }
      toast.success("Order status updated successfully");
      // Refresh orders list by updating state
      const updatedOrders = orders.map((order) =>
        order.orderId === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status");
    }
  };

  // Filter orders based on sub-tab value
  const filteredOrders = orders.filter((order) => {
    if (subTabValue === 0) return order.status === "Waiting";
    if (subTabValue === 1) return order.status === "Accepted";
    if (subTabValue === 2) return order.status === "Cancelled";
  });
  return (
    <ProtectedRoute>
    <EnterpriseDashboard>
      <ToastContainer position="top-right" autoClose={3000} style={{ fontSize: '14px' }} />

      <HeaderSection sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start' }}>
  {/* Avatar with responsive sizing */}
  <Avatar 
    sx={{ 
      bgcolor: PRIMARY_COLOR, 
      width: { xs: 48, sm: 56 }, 
      height: { xs: 48, sm: 56 }, 
      mb: { xs: 2, sm: 0 }, 
      mr: { sm: 2 } 
    }}
  >
    <Business fontSize={window.innerWidth < 600 ? "medium" : "large"} />
  </Avatar>

  {/* Content container */}
  <Box sx={{ width: '100%', overflow: 'hidden' }}>
    {/* Hotel name with responsive truncation */}
    <Typography 
      variant="h4" 
      fontWeight={700} 
      color={PRIMARY_COLOR}
      sx={{
        fontSize: { xs: '1.5rem', sm: '2rem' },
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {hotelDetails?.hotelName}
    </Typography>

    {/* Chips container with responsive layout */}
    <Box 
      sx={{ 
        mt: 1,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        '& .MuiChip-root': {
          maxWidth: { xs: '100%', sm: 'none' },
          width: { xs: '100%', sm: 'auto' }
        }
      }}
    >
      <Chip 
        icon={<Star sx={{ color: '#ffb300', fontSize: { xs: '0.8rem', sm: '1rem' } }} />} 
        label={`${hotelDetails?.currentRating} (${hotelDetails?.numberOfUsersRated})`} 
        sx={{ 
          justifyContent: 'flex-start',
          bgcolor: 'rgba(255, 179, 0, 0.1)'
        }}
      />
      <Chip 
        icon={<Phone sx={{ color: SECONDARY_COLOR, fontSize: { xs: '0.8rem', sm: '1rem' } }} />} 
        label={hotelDetails?.mobileNumber} 
        variant="outlined"
        sx={{ 
          justifyContent: 'flex-start',
          borderColor: 'rgba(0, 0, 0, 0.1)'
        }}
      />
    </Box>
  </Box>
</HeaderSection>


      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{
          '& .MuiTabs-indicator': { backgroundColor: PRIMARY_COLOR },
          mb: 4
        }}
      >
        <Tab 
          label="Profile" 
          icon={<Inventory />} 
          iconPosition="start" 
          sx={{ fontWeight: 600, color: SECONDARY_COLOR }}
        />
        <Tab 
          label="Orders" 
          icon={<PendingActions />} 
          iconPosition="start" 
          sx={{ fontWeight: 600, color: SECONDARY_COLOR }}
        />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <DataGrid>
            <MetricCard>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(SUCCESS_COLOR, 0.1), color: SUCCESS_COLOR }}>
                  <RestaurantMenu />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color={SECONDARY_COLOR}>
                    Total Menu Items
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {dishesDetails.length}
                  </Typography>
                </Box>
              </Stack>
            </MetricCard>

            <MetricCard>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(ACCENT_COLOR, 0.1), color: ACCENT_COLOR }}>
                  <Star />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color={SECONDARY_COLOR}>
                    Average Rating
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {hotelDetails?.currentRating}/5
                  </Typography>
                </Box>
              </Stack>
            </MetricCard>
          </DataGrid>

          <Typography variant="h6" fontWeight={700} mb={3} color={PRIMARY_COLOR}>
            <RestaurantMenu sx={{ mr: 1, verticalAlign: 'middle' }} />
            Menu Catalog
          </Typography>

          <DataGrid>
            {dishesDetails.map(dish => (
              <MetricCard key={dish.id}>
                <img 
                  src={dish.image} 
                  alt={dish.name} 
                  style={{ 
                    width: '100%', 
                    height: '180px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {dish.name}
                </Typography>
                <Chip 
                  label={`₹${dish.price}`} 
                  color="primary" 
                  size="small" 
                  sx={{ mb: 1, fontWeight: 600 }}
                />
                <Typography variant="body2" color={SECONDARY_COLOR}>
                  {dish.description}
                </Typography>
              </MetricCard>
            ))}
          </DataGrid>

          <Box sx={{ mt: 6 }}>
  <Typography variant="h6" fontWeight={700} mb={3} color={PRIMARY_COLOR}>
    <RateReview sx={{ mr: 1, verticalAlign: 'middle' }} />
     Reviews
  </Typography>

  {hotelDetails?.reviews?.length > 0 ? (
    <Grid container spacing={3}>
      {hotelDetails.reviews.map((review, index) => (
        <Grid item xs={12} md={6} key={index}>
          <MetricCard sx={{ height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1), color: PRIMARY_COLOR }}>
                <Comment />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {review.userName}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Star sx={{ color: '#ffb300', fontSize: '1.2rem' }} />
                  <Typography variant="body2" color={SECONDARY_COLOR}>
                    {review.rating}/5
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Typography variant="body2" color={SECONDARY_COLOR} sx={{
              pl: 2,
              borderLeft: `2px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
              fontStyle: 'italic'
            }}>
              "{review.comment}"
            </Typography>
          </MetricCard>
        </Grid>
      ))}
    </Grid>
  ) : (
    <MetricCard>
      <Typography variant="body1" color={SECONDARY_COLOR} textAlign="center" py={4}>
        No customer reviews available yet
      </Typography>
    </MetricCard>
  )}
</Box>
<StyledDeleteButton 
        variant="contained"
        startIcon={<DeleteIcon />}
        onClick={handleClickOpen}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete Hotel'}
      </StyledDeleteButton>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this hotel? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            autoFocus
            disabled={isDeleting}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
  
        </Box>
        
      )}


      {tabValue === 1 && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <ButtonGroup variant="outlined" fullWidth>
              {['Waiting', 'Accepted', 'Cancelled'].map((status, index) => (
                <Button
                  key={status}
                  onClick={() => setSubTabValue(index)}
                  sx={{
                    fontWeight: 600,
                    color: subTabValue === index ? 'white' : SECONDARY_COLOR,
                    backgroundColor: subTabValue === index ? PRIMARY_COLOR : 'transparent',
                    '&:hover': {
                      backgroundColor: subTabValue === index ? PRIMARY_COLOR : alpha(PRIMARY_COLOR, 0.1)
                    }
                  }}
                >
                  {status}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          {filteredOrders.map(order => (
            <OrderCard key={order.orderId} status={order.status}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Order #{order.orderId}
                    </Typography>
                    <StatusChip
                      icon={getStatusIcon(order.status)}
                      label={order.status}
                      status={order.status}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={700} color={PRIMARY_COLOR}>
                    ₹{order.totalPrice}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={4}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Order Details
                    </Typography>
                    {order.cartItems.map(item => (
                      <Typography key={item.id} variant="body2" color={SECONDARY_COLOR}>
                        {item.quantity}x {item.name} (₹{item.price})
                      </Typography>
                    ))}
                  </Box>

                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Customer Information
                    </Typography>
                    <Typography variant="body2" color={SECONDARY_COLOR}>
                      {order.clientPhone}
                    </Typography>
                    <Typography variant="body2" color={SECONDARY_COLOR}>
                      {order.clientAddress}
                    </Typography>
                  </Box>
                </Stack>

                {order.status === 'Waiting' && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <ActionButton
                      varianttype="primary"
                      startIcon={<CheckCircle />}
                      onClick={() => handleStatusUpdate(order.orderId, 'Accepted')}
                    >
                      Accept Order
                    </ActionButton>
                    <ActionButton
                      varianttype="secondary"
                      startIcon={<Cancel />}
                      onClick={() => handleStatusUpdate(order.orderId, 'Cancelled')}
                    >
                      Decline Order
                    </ActionButton>
                  </Box>
                )}
              </CardContent>
            </OrderCard>
          ))}
        </Box>
      )}
    </EnterpriseDashboard>
    </ProtectedRoute>
  );
}

