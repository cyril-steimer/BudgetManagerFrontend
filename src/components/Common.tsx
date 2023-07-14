import {useContext} from "react";
import {CurrencyContext} from "../context/contexts";
import {ModifyingEndpoint} from "../endpoints/endpoint";
import EditIcon from '@mui/icons-material/Edit';
import {IconButton, Tooltip} from "@mui/material";
import {useNavigate } from "react-router-dom";
import {getEditUrl} from "../routes/Endpoint-Routes";
import {useIsNavigating} from "../hooks/hooks";

export function CurrencyCell({value}: {value: number}) {
    const currency = useContext(CurrencyContext);
    return <span>{value.toFixed(2)} {currency}</span>;
}

export function EditButton<T>({endpoint, id}: {endpoint: ModifyingEndpoint<T>, id: string}) {
    const navigate = useNavigate();

    return (
        <Tooltip title='Edit'>
            <IconButton
                onClick={() => navigate(getEditUrl(endpoint, id))}
                disabled={useIsNavigating()}
            >
                <EditIcon/>
            </IconButton>
        </Tooltip>
    );
}