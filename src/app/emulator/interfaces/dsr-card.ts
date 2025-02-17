import {PeripheralCard} from "./peripheral-card";

export interface DSRCard extends PeripheralCard {
    getDSR(): number[];
    getDSRBankOffset(): number;
}
