import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import {useIsNavigating} from '../hooks/hooks';
import {Button, ButtonGroup} from '@mui/material';

export default function Dashboard() {
    const navigate = useNavigate();
    const disableButtons = useIsNavigating();

    function viewThisMonth() {
        viewMonthlyExpenses(dayjs())
    }

    function viewLastMonth() {
        viewMonthlyExpenses(dayjs().subtract(1, 'month'))
    }

    function viewMonthlyExpenses(date: dayjs.Dayjs) {
        const url = `/expenses/year/${date.year()}/month/${date.month() + 1}`;
        navigate(url);
    }

    return (
        <ButtonGroup variant="outlined" disabled={disableButtons}>
            <Button type="button" onClick={viewLastMonth}>Last Month</Button>
            <Button type="button" onClick={viewThisMonth}>This Month</Button>
        </ButtonGroup>
    );
}
