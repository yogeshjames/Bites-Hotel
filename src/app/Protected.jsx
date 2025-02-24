"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
//                
// NOT USEDDD


  useEffect(() => {
    // Here, you could check if the auth token exists, 
    // or try to fetch a minimal protected resource.
    // For demonstration, let's assume a function checkAuth returns a promise.
    async function checkAuth() {
      try {
        // For example, check authentication by calling a protected API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check`, {
          credentials: "include",
        });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push("/login");
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // If authenticated, render children; otherwise, nothing (redirect happens).
  return isAuthenticated ? children : null;
}
