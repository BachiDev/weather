"use client";

import React, { useState} from "react";
import { TextField, Button, Box, Autocomplete } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface CityData {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  label: string; // For Autocomplete display
}

interface SearchBarProps {
  onSearch: (city: string) => void;
  options: CityData[];
  onCitySelect: (city: CityData | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, options, onCitySelect }) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };

  const handleInputChange = (newInputValue: string) => {
    setInputValue(newInputValue);
    // Trigger search for options only when user types, not on selection
    if (newInputValue.trim()) {
      onSearch(newInputValue);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
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
          // Removed marginRight: 2,
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