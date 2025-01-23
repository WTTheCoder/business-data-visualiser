import { FC, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  ListItemIcon,
  ListItemText,
  IconButton,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { regions } from "../../utils/mockData";
import type { RegionData } from "../../utils/mockData";

interface DataFilterProps {
  onFilterChange: (
    region: string,
    startDate: Date | null,
    endDate: Date | null
  ) => void;
  defaultRegion?: string;
}

const DataFilters: FC<DataFilterProps> = ({
  onFilterChange,
  defaultRegion = "all",
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(defaultRegion);
  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 0, 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date(2025, 0, 31));
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  // Sort regions (Australia first, then alphabetically)
  const sortedRegions = [...regions].sort((a: RegionData, b: RegionData) => {
    if (a.code === "AU") return -1;
    if (b.code === "AU") return 1;
    return a.name.localeCompare(b.name);
  });

  const handleRegionSelect = (event: SelectChangeEvent<string>) => {
    const newRegion = event.target.value;
    console.log("Region selection changed to:", newRegion);
    setSelectedRegion(newRegion);
    onFilterChange(newRegion, startDate, endDate);

    // Handle Australia expansion
    if (newRegion === "AU" || newRegion.startsWith("AU-")) {
      setExpandedRegion("AU");
    } else {
      setExpandedRegion(null);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    console.log("Start date changed:", date);
    setStartDate(date);
    onFilterChange(selectedRegion, date, endDate);
  };

  const handleEndDateChange = (date: Date | null) => {
    console.log("End date changed:", date);
    setEndDate(date);
    onFilterChange(selectedRegion, startDate, date);
  };

  const handleStateSelect = (code: string) => {
    console.log("AU state selected:", code);
    setSelectedRegion(code);
    onFilterChange(code, startDate, endDate);
  };

  const handleAUExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRegion(expandedRegion === "AU" ? null : "AU");
  };

  return (
    <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            minDate={new Date(2024, 0, 1)}
            maxDate={new Date(2025, 0, 31)}
            renderInput={(params) => (
              <TextField {...params} sx={{ width: "200px" }} />
            )}
          />
        </Box>
        <Box>
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={handleEndDateChange}
            minDate={startDate || new Date(2024, 0, 1)}
            maxDate={new Date(2025, 0, 31)}
            renderInput={(params) => (
              <TextField {...params} sx={{ width: "200px" }} />
            )}
          />
        </Box>
      </LocalizationProvider>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="region-select-label">Region</InputLabel>
        <Select
          labelId="region-select-label"
          value={selectedRegion}
          label="Region"
          onChange={handleRegionSelect}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 500 },
            },
          }}
        >
          <MenuItem value="all">All Regions</MenuItem>
          {sortedRegions.map((region) => (
            <Box key={region.code}>
              <MenuItem
                value={region.code}
                onClick={() => {
                  if (region.code !== "AU") {
                    handleRegionSelect({
                      target: { value: region.code },
                    } as SelectChangeEvent<string>);
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  paddingY: 1,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      fontFamily: "monospace",
                    }}
                  >
                    {region.flag}
                  </span>
                </ListItemIcon>
                <ListItemText primary={region.name} />
                {region.code === "AU" && region.subRegions && (
                  <IconButton size="small" onClick={handleAUExpand}>
                    {expandedRegion === "AU" ? (
                      <ExpandMore />
                    ) : (
                      <ChevronRight />
                    )}
                  </IconButton>
                )}
              </MenuItem>
              {region.code === "AU" &&
                expandedRegion === "AU" &&
                region.subRegions && (
                  <Collapse in={true} timeout="auto">
                    {region.subRegions
                      .filter((sr) => sr.code !== "ALL")
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((subRegion) => (
                        <MenuItem
                          key={subRegion.code}
                          value={`AU-${subRegion.code}`}
                          onClick={() =>
                            handleStateSelect(`AU-${subRegion.code}`)
                          }
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <span
                              style={{
                                fontSize: "1rem",
                                fontWeight: "bold",
                                fontFamily: "monospace",
                              }}
                            >
                              {subRegion.flag}
                            </span>
                          </ListItemIcon>
                          <ListItemText primary={subRegion.name} />
                        </MenuItem>
                      ))}
                  </Collapse>
                )}
            </Box>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default DataFilters;
