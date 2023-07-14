import {Fab, Menu, MenuItem}  from '@mui/material';
import {Outlet, useNavigate} from 'react-router-dom';
import {ExpenseEndpoint, ExpenseTemplateEndpoint, ScheduledExpenseEndpoint} from '../endpoints/expense-endpoints';
import AddIcon from '@mui/icons-material/Add';
import {useState} from 'react';
import {getAddUrl} from './Endpoint-Routes';
import {ModifyingEndpoint} from '../endpoints/endpoint';

function AddMenuItem<T>({endpoint, close}: {endpoint: ModifyingEndpoint<T>, close: () => void}) {
    const navigate = useNavigate();

    return (
        <MenuItem
            onClick={() => {
                close();
                navigate(getAddUrl(endpoint));
            }}
        >
            {endpoint.addText}
        </MenuItem>
    );
}

export default function Root() {
    const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | undefined>();
    const openAddMenu = addMenuAnchor !== undefined;
    const closeAddMenu = () => setAddMenuAnchor(undefined);

    const expenseEndpoint = new ExpenseEndpoint();
    const expenseTemplateEndpoint = new ExpenseTemplateEndpoint();
    const scheduledExpenseEndpoint = new ScheduledExpenseEndpoint();

    return (
        <div>
            <Outlet/>
            <Fab
                color='primary'
                sx={{position: 'absolute', bottom: 16, right: 16}}
                onClick={event => setAddMenuAnchor(event.currentTarget)}
            >
                <AddIcon/>
            </Fab>
            <Menu
                open={openAddMenu}
                anchorEl={addMenuAnchor}
                onClose={closeAddMenu}
            >
                <AddMenuItem endpoint={expenseEndpoint} close={closeAddMenu}/>
                <AddMenuItem endpoint={expenseTemplateEndpoint} close={closeAddMenu}/>
                <AddMenuItem endpoint={scheduledExpenseEndpoint} close={closeAddMenu}/>
            </Menu>
        </div>
    );
}
