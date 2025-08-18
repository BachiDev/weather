"use client";

import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBarProps {
  onSearch: (city: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [city, setCity] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (city.trim()) {
      onSearch(city);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        gap: 2,
        width: "100%",
        maxWidth: 500,
        mt: 2,
        mb: 2,
      }}
    >
      <TextField
        label="Enter city name"
        variant="outlined"
        fullWidth
        value={city}
        onChange={(e) => setCity(e.target.value)}
        sx={{
          input: { color: "white" },
          label: { color: "rgba(255, 255, 255, 0.7)" },
          borderRadius: 25,
          "& .MuiOutlinedInput-root": {
            borderRadius: 25,
            backgroundColor: "rgba(33, 33, 33, 0.7)",
            "& fieldset": {
              borderColor: "transparent", // Remove default border
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.3)", // Lighter border on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgba(255, 255, 255, 0.5)", // Even lighter border on focus
            },
          },
        }}
      />
      <Button
        type="submit"
        endIcon={<SearchIcon />}
        sx={{
          borderRadius: 25,
          px: 4, // More horizontal padding
          backgroundColor: "rgba(33, 33, 33, 0.7)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(33, 33, 33, 0.9)", // Darker on hover
          },
        }}
      >
        Search
      </Button>
    </Box>
  );
};

export default SearchBar;
