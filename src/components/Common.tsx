import {useContext} from "react";
import {CurrencyContext} from "../context/contexts";

export function CurrencyCell({value}: {value: number}) {
    const currency = useContext(CurrencyContext);
    return <span>{value.toFixed(2)} {currency}</span>;
}