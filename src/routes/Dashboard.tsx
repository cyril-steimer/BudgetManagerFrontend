import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import {useIsNavigating} from '../hooks/hooks';

export default function Dashboard() {
    const navigate = useNavigate();
    const disableButtons = useIsNavigating();

    function viewMonthlyExpenses() {
        const now = dayjs();
        const url = `/expenses/year/${now.year()}/month/${now.month() + 1}`;
        navigate(url);
    }

    return (
        <button type="button" onClick={viewMonthlyExpenses} disabled={disableButtons}>Monthly Expenses</button>
    );
}
