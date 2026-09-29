"use client";

import React, { useState, useRef, useEffect } from "react";
import { TextField, Box, Autocomplete } from "@mui/material";
import type { CityData } from "@/types/weather";

interface SearchBarProps {
  selected: CityData | null;
  searching: boolean;
  onSearchInputChange: (city: string) => void;
  options: CityData[];
  onCitySelect: (city: CityData | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  selected,
  searching,
  onSearchInputChange,
  options,
  onCitySelect,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clear a pending debounce on unmount so a late timer never fires
  // setState / callbacks on an unmounted component.
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

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
        value={selected}
        loading={searching}
        loadingText="Searching…"
        noOptionsText={
          inputValue
            ? "No cities found — try another spelling."
            : "Start typing to search."
        }
        onChange={(event, newValue) => {
          setInputValue("");
          onCitySelect(newValue);
        }}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "input") {
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
                backgroundColor: "rgba(24, 24, 27, 0.7)",
                minHeight: 56,
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.1)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(167, 139, 250, 0.6)",
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
