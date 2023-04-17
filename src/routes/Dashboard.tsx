import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import {useIsNavigating} from '../hooks/hooks';

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
        <div>
            <button type="button" onClick={viewLastMonth} disabled={disableButtons}>Last Month</button>
            <button type="button" onClick={viewThisMonth} disabled={disableButtons}>This Month</button>
        </div>
    );
}
