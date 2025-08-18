"use client";

import React, { useState, useRef } from "react";
import { TextField, Box, Autocomplete } from "@mui/material";

interface CityData {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  label: string; // For Autocomplete display
}

interface SearchBarProps {
  onSearchInputChange: (city: string) => void; // New prop for debounced input changes
  options: CityData[];
  onCitySelect: (city: CityData | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchInputChange, options, onCitySelect }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (newInputValue: string) => {
    setInputValue(newInputValue);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      onSearchInputChange(newInputValue); // Call the new prop
    }, 300); // Debounce for 300ms
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        mt: 2,
        mb: 2,
      }}
    >
      <Autocomplete
        fullWidth
        options={options}
        getOptionLabel={(option) => option.label}
        filterOptions={(x) => x} // Disable built-in filtering as API handles it
        includeInputInList
        filterSelectedOptions
        value={null} // Controlled by inputValue
        onChange={(event, newValue) => {
          onCitySelect(newValue);
        }}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === 'input') {
            handleInputChange(newInputValue);
          }
        }}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Enter city name"
            variant="outlined"
            value={inputValue} // Use inputValue as the controlled value
            sx={{
              input: { color: "white" },
              label: { color: "rgba(255, 255, 255, 0.7)" },
              borderRadius: 25,
              "& .MuiOutlinedInput-root": {
                borderRadius: 25,
                backgroundColor: "rgba(33, 33, 33, 0.7)",
                minHeight: 56, // Standard Material-UI input height
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
        )}
        sx={{
          flexGrow: 1, // Allow Autocomplete to grow and take available space
          marginRight: 2, // Add margin instead of gap
          "& .MuiAutocomplete-inputRoot": {
            borderRadius: 25,
            // Removed paddingRight: "0px !important",
          },
        }}
      />
    </Box>
  );
};


export default SearchBar;