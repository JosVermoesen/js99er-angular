export interface CruDevice {
    getId(): string;
    getCruAddress(): number;
    readCruBit(bit: number): boolean;
    writeCruBit(bit: number, value: boolean): void;
}