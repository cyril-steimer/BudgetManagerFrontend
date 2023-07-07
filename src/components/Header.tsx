import {AppBar, Box, Button, IconButton, InputBase, Menu, MenuItem, Toolbar, Typography, alpha, styled} from '@mui/material';
import {useState} from 'react';
import SearchIcon from '@mui/icons-material/Search';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import {useIsNavigating} from '../hooks/hooks';
import {useNavigate} from 'react-router-dom';

// Search: https://mui.com/material-ui/react-app-bar/#app-bar-with-search-field
const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '20ch'
        },
    },
}));

function monthString(month: number): string {
    switch (month) {
        case 0:
            return 'January';
        case 1:
            return 'February';
        case 2:
            return 'March';
        case 3:
            return 'April';
        case 4:
            return 'May';
        case 5:
            return 'June';
        case 6:
            return 'July';
        case 7:
            return 'August';
        case 8:
            return 'September';
        case 9:
            return 'October';
        case 10:
            return 'November';
        case 11:
            return 'December';
        default:
            return 'Unknown Month';
    }
}

const JANUARY = 0;
const DECEMBER = 11;

function rangeString(params: TimeRange): string {
    const monthPrefix = params.activeMonth === undefined ? '' : monthString(params.activeMonth) + ' ';
    return monthPrefix + params.activeYear.toString();
}

function previousRange(range: TimeRange): TimeRange {
    if (range.activeMonth === undefined) {
        return new SimpleTimeRange(range.activeYear - 1);
    }
    const previousMonth = range.activeMonth - 1;
    return previousMonth < JANUARY ? new SimpleTimeRange(range.activeYear - 1, DECEMBER) : new SimpleTimeRange(range.activeYear, previousMonth); 
}

function nextRange(range: TimeRange): TimeRange {
    if (range.activeMonth === undefined) {
        return new SimpleTimeRange(range.activeYear + 1);
    }
    const nextMonth = range.activeMonth + 1;
    return nextMonth > DECEMBER ? new SimpleTimeRange(range.activeYear + 1, JANUARY) : new SimpleTimeRange(range.activeYear, nextMonth);
}

function drillUpRange(range: TimeRange): TimeRange | undefined {
    if (range.activeMonth === undefined) {
        return undefined;
    }
    return new SimpleTimeRange(range.activeYear);
}

function drillDownRanges(range: TimeRange): TimeRange[] {
    if (range.activeMonth === undefined) {
        return Array.from(Array(DECEMBER + 1)).map((_, month) => new SimpleTimeRange(range.activeYear, month));
    }
    return [];
}

interface TimeRange {
    activeYear: number;
    activeMonth?: number;
}

class SimpleTimeRange implements TimeRange {
    constructor(readonly activeYear: number, readonly activeMonth?: number) {
    }
}

export interface TimeRangeParameters extends TimeRange {    
    setActiveTimeRange: (range: TimeRange) => void;
}

export interface HeaderParameters {
    timeRange?: TimeRangeParameters;
    setFilter?: (filter: string) => void;
}

function TimeRangeNavigation({timeRange}: {timeRange: TimeRangeParameters}) {
    const previous = previousRange(timeRange);
    const next = nextRange(timeRange);

    const drillUp = drillUpRange(timeRange);
    const drillDown = drillDownRanges(timeRange);

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const openMenu = menuAnchor != null;
    const closeMenu = () => setMenuAnchor(null);

    const isNavigating = useIsNavigating();

    return (
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button disabled={isNavigating} startIcon={<WestIcon/>} onClick={() => timeRange.setActiveTimeRange(previous)} color='inherit'>
                {rangeString(previous)}
            </Button>
            {drillUp && (
                <Button disabled={isNavigating} endIcon={<NorthIcon/>} onClick={() => timeRange.setActiveTimeRange(drillUp)} color='inherit'>
                    {rangeString(drillUp)}
                </Button>
            )}
            {drillDown.length > 0 && (
                <div>
                    <IconButton disabled={isNavigating} onClick={event => setMenuAnchor(event.currentTarget)} color='inherit'>
                        <SouthIcon/>
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        open={openMenu}
                        onClose={closeMenu}
                    >
                        {drillDown.map(drillDown => (
                            <MenuItem key={drillDown.activeMonth} onClick={() => {
                                timeRange.setActiveTimeRange(drillDown);
                                closeMenu();
                            }}>
                                {rangeString(drillDown)}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>
            )}
            <Button disabled={isNavigating} endIcon={<EastIcon/>} onClick={() => timeRange.setActiveTimeRange(next)} color='inherit'>
                {rangeString(next)}
            </Button>
        </Box>
    );
}

export function Header({timeRange, setFilter}: HeaderParameters) {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position='static'>
                <Toolbar>
                    <Typography
                        variant='h6'
                        component='div'
                        sx = {{ flexGrow: 1, ':hover': { cursor: 'pointer' }  }}
                        onClick={() => navigate('/expenses')}
                    >
                        Dashboard
                    </Typography>
                    {timeRange && (
                        <Typography 
                            variant='h6'
                            component='div'
                            sx = {{ marginRight: '20px' }}
                        >
                            {rangeString(timeRange)}
                        </Typography>
                    )}
                    {timeRange && <TimeRangeNavigation timeRange={timeRange}/>}
                    {setFilter && 
                        <Search>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder='Search...'
                                value={search}
                                onChange={event => {
                                    setSearch(event.target.value);
                                    setFilter(event.target.value);
                                }}
                            />
                        </Search>
                    }
                </Toolbar>
            </AppBar>
        </Box>
    );
}