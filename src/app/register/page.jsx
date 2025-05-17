"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Button,
  IconButton,
  Input,
  Card,
  Avatar,
  CircularProgress,
  useTheme
} from "@mui/material";
import { AddPhotoAlternate, Add, Delete, Hotel, Person, Phone } from "@mui/icons-material";
import { deepPurple, teal, orange } from "@mui/material/colors";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HotelRegistration = () => {
  const theme = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    owner: "",
    hotelName: "",
    mobileNumber: "",
    password: "",
    hotelImage: null,
    foodItems: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    setFormData({ ...formData, hotelImage: e.target.files[0] });
  };

  const addFoodItem = () => {
    setFormData({
      ...formData,
      foodItems: [...formData.foodItems, { name: "", price: "", image: null }],
    });
  };

  const handleFoodChange = (index, key, value) => {
    const updatedFoodItems = [...formData.foodItems];
    updatedFoodItems[index][key] = value;
    setFormData({ ...formData, foodItems: updatedFoodItems });
  };

  const handleFoodImageUpload = (index, e) => {
    const updatedFoodItems = [...formData.foodItems];
    updatedFoodItems[index].image = e.target.files[0];
    setFormData({ ...formData, foodItems: updatedFoodItems });
  };

  const removeFoodItem = (index) => {
    const updatedFoodItems = formData.foodItems.filter((_, i) => i !== index);
    setFormData({ ...formData, foodItems: updatedFoodItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);  // Start loading
    const submissionData = new FormData();
  
    // Append text fields correctly
    submissionData.append("owner", formData.owner);
    submissionData.append("hotelName", formData.hotelName);
    submissionData.append("mobileNumber", formData.mobileNumber);
    submissionData.append("password", formData.password);

    // Append hotel image
    if (formData.hotelImage) {
      submissionData.append("hotelImage", formData.hotelImage);
    }
  
    // Append food items as JSON
    submissionData.append("foodItems", JSON.stringify(formData.foodItems.map(({ name, price }) => ({ name, price }))));
  
    // Append food images separately
    formData.foodItems.forEach((item) => {
      if (item.image) {
        submissionData.append("foodImages", item.image); // Append each image under "foodImages"
      }
    });
  
   try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel/register`, {
    method: "POST",
    body: submissionData,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (jsonError) {
    // No valid JSON response
  }

  if (response.ok) {
    toast.success("Hotel registered successfully! 🎉");
    setFormData({ owner: "", hotelName: "", mobileNumber: "", hotelImage: null, foodItems: [] });
    router.push("/");
  } else {
    toast.error(data?.error || `Failed to register hotel (Status: ${response.status})`);
  }
} catch (error) {
  console.error("Upload Failed:", error);
  toast.error("Upload failed, try a different format.");
} finally {
  setIsLoading(false);

    }
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 4, mt: 4, backgroundColor: "background.paper", borderRadius: 4, boxShadow: 3, position: "relative" }}>
      {/* Overlay spinner */}
      {isLoading && (
        <Box sx={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          backgroundColor: "rgba(255,255,255,0.8)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Registering your hotel...</Typography>
        </Box>
      )}

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar sx={{ bgcolor: deepPurple[500], width: 56, height: 56, mx: 'auto', mb: 2 }}>
          <Hotel fontSize="large" />
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 700, color: deepPurple[700], letterSpacing: 1, [theme.breakpoints.down('sm')]: { fontSize: '2rem' } }}>
          Register Your Hotel
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {[ 
            { label: "Owner Name", name: "owner", icon: <Person /> },
            { label: "Hotel Name", name: "hotelName", icon: <Hotel /> },
            { label: "Mobile Number", name: "mobileNumber", icon: <Phone />, type: "number" },
            { label: "Password", name: "password", type: "password" },
          ].map((field, index) => (
            <Grid item xs={12} key={index}>
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                type={field.type || "text"}
                value={formData[field.name]}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <Box sx={{ color: 'action.active', mr: 1, mt: '8px' }}>
                      {field.icon}
                    </Box>
                  )
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: deepPurple[200],
                    },
                  }
                }}
              />
            </Grid>
          ))}
<Typography color="error" variant="body2" sx={{ mt: 2 }}>
      Only JPG and PNG formats are allowed
    </Typography>
          {/* Hotel Image Upload */}
          <Grid item xs={12}>
            <Box sx={{
              border: `2px dashed ${deepPurple[200]}`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              '&:hover': {
                borderColor: deepPurple[400],
                backgroundColor: deepPurple[50]
              }
            }}>
              <Input
                type="file"
                onChange={handleImageUpload}
                inputProps={{ accept: "image/*" }}
                sx={{ display: 'none' }}
                id="hotel-image-upload"
              />
              <label htmlFor="hotel-image-upload">
                <IconButton component="span">
                  <AddPhotoAlternate sx={{ fontSize: 40, color: formData.hotelImage ? teal[500] : deepPurple[500] }} />
                </IconButton>
              </label>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {formData.hotelImage ? formData.hotelImage.name : 'Upload Hotel Image'}
              </Typography>
            </Box>
          </Grid>

          {/* Food Items Section */}
          <Grid item xs={12}>
            {formData.foodItems.map((food, index) => (
              <Card key={index} sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: orange[50] }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Food Name"
                      value={food.name}
                      onChange={(e) => handleFoodChange(index, "name", e.target.value)}
                      required
                      variant="standard"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={food.price}
                      onChange={(e) => handleFoodChange(index, "price", e.target.value)}
                      required
                      variant="standard"
                      InputProps={{
                        startAdornment: (
                          <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Input
                        type="file"
                        onChange={(e) => handleFoodImageUpload(index, e)}
                        inputProps={{ accept: "image/*" }}
                        sx={{ display: 'none' }}
                        id={`food-image-${index}`}
                      />
                      <label htmlFor={`food-image-${index}`}>
                        <IconButton component="span">
                          <AddPhotoAlternate sx={{ color: teal[500] }} />
                        </IconButton>
                      </label>
                      <Typography variant="caption">
                        {food.image ? food.image.name : 'Upload Image'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton onClick={() => removeFoodItem(index)} sx={{ color: theme.palette.error.main }}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}
            
            <Button 
              startIcon={<Add />} 
              onClick={addFoodItem}
              sx={{ mt: 1, color: teal[700], '&:hover': { backgroundColor: teal[50] } }}
            >
              Add Food Item
            </Button>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              disabled={isLoading}
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 2,
                borderRadius: 2,
                backgroundColor: deepPurple[500],
                '&:hover': {
                  backgroundColor: deepPurple[700]
                },
                fontSize: '1.1rem',
                fontWeight: 600,
                letterSpacing: 1
              }}
            >
              Register Hotel
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default HotelRegistration;
