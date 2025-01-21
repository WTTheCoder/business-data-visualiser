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
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { setDateRange, setRegion } from "../../store/slices/dataSlice";

interface Region {
  code: string;
  name: string;
  flag: string;
  subRegions?: Region[];
}

const regions: Region[] = [
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    subRegions: [
      { code: "AU-ALL", name: "All Australia", flag: "ALL" },
      { code: "AU-NSW", name: "New South Wales", flag: "NSW" },
      { code: "AU-QLD", name: "Queensland", flag: "QLD" },
      { code: "AU-SA", name: "South Australia", flag: "SA" },
      { code: "AU-TAS", name: "Tasmania", flag: "TAS" },
      { code: "AU-VIC", name: "Victoria", flag: "VIC" },
      { code: "AU-WA", name: "Western Australia", flag: "WA" },
      { code: "AU-ACT", name: "Australian Capital Territory", flag: "ACT" },
      { code: "AU-NT", name: "Northern Territory", flag: "NT" },
    ],
  },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "CN", name: "China(Main Land)", flag: "🇨🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "MO", name: "Macau", flag: "🇲🇴" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
].sort((a, b) => {
  if (a.code === "AU") return -1;
  if (b.code === "AU") return 1;
  if (a.code === "SG") return -1;
  if (b.code === "SG") return 1;
  return a.name.localeCompare(b.name);
});

const DataFilters: FC = () => {
  const dispatch = useAppDispatch();
  const { dateRange, region } = useAppSelector((state) => state.data.filters);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const handleDateChange = (newValue: Date | null, isStart: boolean) => {
    dispatch(
      setDateRange({
        startDate: isStart ? newValue : dateRange.startDate,
        endDate: isStart ? dateRange.endDate : newValue,
      })
    );
  };

  const handleRegionClick = (code: string) => {
    if (code === "AU") {
      setExpandedRegion(expandedRegion === "AU" ? null : "AU");
    } else if (!code.startsWith("AU-")) {
      dispatch(setRegion(code));
      setExpandedRegion(null);
    }
  };

  const getSelectedRegionName = () => {
    if (region === "all") return "All Regions";

    const findRegion = (regions: Region[]): string => {
      for (const r of regions) {
        if (r.code === region) return r.name;
        if (r.subRegions) {
          const subRegion = r.subRegions.find((sr) => sr.code === region);
          if (subRegion) return subRegion.name;
        }
      }
      return "Select Region";
    };

    return findRegion(regions);
  };

  const renderRegionMenuItem = (region: Region) => (
    <MenuItem
      key={region.code}
      value={region.code}
      onClick={() => handleRegionClick(region.code)}
      sx={{
        display: "flex",
        alignItems: "center",
        paddingY: 1,
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Typography variant="body1">{region.flag}</Typography>
      </ListItemIcon>
      <ListItemText primary={region.name} />
      {region.code === "AU" && region.subRegions && (
        <IconButton size="small">
          {expandedRegion === region.code ? <ExpandMore /> : <ChevronRight />}
        </IconButton>
      )}
    </MenuItem>
  );

  return (
    <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Start Date"
          value={dateRange.startDate}
          onChange={(value) => handleDateChange(value, true)}
          renderInput={(params) => (
            <TextField {...params} sx={{ width: 200 }} />
          )}
        />
        <DatePicker
          label="End Date"
          value={dateRange.endDate}
          onChange={(value) => handleDateChange(value, false)}
          renderInput={(params) => (
            <TextField {...params} sx={{ width: 200 }} />
          )}
        />
      </LocalizationProvider>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Region</InputLabel>
        <Select
          value={region}
          label="Region"
          onChange={(e) => dispatch(setRegion(e.target.value))}
          displayEmpty
          renderValue={() => getSelectedRegionName()}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 500 },
            },
          }}
        >
          <MenuItem value="all">
            <ListItemText primary="All Regions" />
          </MenuItem>
          {regions.map((region) => (
            <Box key={region.code}>
              {renderRegionMenuItem(region)}
              {region.code === "AU" && expandedRegion === "AU" && (
                <Collapse in={true}>
                  {region.subRegions?.map((subRegion) => (
                    <MenuItem
                      key={subRegion.code}
                      value={subRegion.code}
                      sx={{ pl: 4 }}
                      onClick={() => {
                        dispatch(setRegion(subRegion.code));
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          }}
                        >
                          {subRegion.flag}
                        </Typography>
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
