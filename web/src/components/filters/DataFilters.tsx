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
import { regions } from "../../utils/mockData";

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

  const findRegionName = useCallback((code: string): string => {
    if (code === "all") return "All Regions";

    if (code.startsWith("AU-")) {
      const subRegionCode = code.split("-")[1];
      const region = regions.find((r) => r.code === "AU");
      const subRegion = region?.subRegions?.find(
        (sr) => sr.code === subRegionCode
      );
      return subRegion ? subRegion.name : code;
    }

    const region = regions.find((r) => r.code === code);
    return region ? region.name : code;
  }, []);

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
          renderValue={(selected) => findRegionName(selected)}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 500 },
            },
          }}
        >
          <MenuItem value="all">All Regions</MenuItem>
          {regions.map((region) => (
            <Box key={region.code}>
              <MenuItem
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
                      .map((subRegion) => (
                        <MenuItem
                          key={subRegion.code}
                          value={`AU-${subRegion.code}`}
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
