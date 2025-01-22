import { FC, useState, useEffect, useCallback } from "react";
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
import { regions, RegionData } from "../../utils/mockData";

interface DataFilterProps {
  onFilterChange: (
    region: string,
    startDate: Date | null,
    endDate: Date | null
  ) => void;
}

const DataFilters: FC<DataFilterProps> = ({ onFilterChange }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 0, 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date(2025, 0, 31));
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const handleRegionChange = useCallback((event: SelectChangeEvent<string>) => {
    const newRegion = event.target.value;
    setSelectedRegion(newRegion);
    if (newRegion === "AU") {
      setExpandedRegion("AU");
    } else {
      setExpandedRegion(null);
    }
  }, []);

  useEffect(() => {
    onFilterChange(selectedRegion, startDate, endDate);
  }, [selectedRegion, startDate, endDate, onFilterChange]);

  const renderRegionMenuItem = useCallback(
    (region: RegionData) => (
      <MenuItem
        key={region.code}
        value={region.code}
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
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedRegion(expandedRegion === "AU" ? null : "AU");
            }}
          >
            {expandedRegion === "AU" ? <ExpandMore /> : <ChevronRight />}
          </IconButton>
        )}
      </MenuItem>
    ),
    [expandedRegion]
  );

  const renderSubRegions = useCallback(
    (subRegions: RegionData[]) => (
      <Collapse in={true} timeout="auto">
        {subRegions.map((subRegion) => (
          <MenuItem key={subRegion.code} value={subRegion.code} sx={{ pl: 4 }}>
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
    ),
    []
  );

  return (
    <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue: Date | null) => setStartDate(newValue)}
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
            onChange={(newValue: Date | null) => setEndDate(newValue)}
            minDate={startDate || new Date(2024, 0, 1)}
            maxDate={new Date(2025, 0, 31)}
            renderInput={(params) => (
              <TextField {...params} sx={{ width: "200px" }} />
            )}
          />
        </Box>
      </LocalizationProvider>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Region</InputLabel>
        <Select
          value={selectedRegion}
          label="Region"
          onChange={handleRegionChange}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 500 },
            },
          }}
        >
          <MenuItem value="all">All Regions</MenuItem>
          {regions.map((region) => (
            <Box key={region.code}>
              {renderRegionMenuItem(region)}
              {region.code === "AU" &&
                expandedRegion === "AU" &&
                region.subRegions &&
                renderSubRegions(region.subRegions)}
            </Box>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default DataFilters;
