"use client";

import React, { useState, useRef } from "react";
import { TextField, Box, Autocomplete } from "@mui/material";

interface CityData {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  label: string;
}

interface SearchBarProps {
  onSearchInputChange: (city: string) => void;
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
      onSearchInputChange(newInputValue);
    }, 300);
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
        filterOptions={(x) => x}
        includeInputInList
        filterSelectedOptions
        value={null}
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
            value={inputValue}
            sx={{
              input: { color: "white" },
              label: { color: "rgba(255, 255, 255, 0.7)" },
              borderRadius: 25,
              "& .MuiOutlinedInput-root": {
                borderRadius: 25,
                backgroundColor: "rgba(33, 33, 33, 0.7)",
                minHeight: 56,
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
              },
            }}
          />
        )}
        sx={{
          flexGrow: 1,
          marginRight: 2,
          "& .MuiAutocomplete-inputRoot": {
            borderRadius: 25,
          },
        }}
      />
    </Box>
  );
};


export default SearchBar;