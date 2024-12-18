import {Util} from "./util";

export class MemoryBlock {

    private _address: number;
    private _data: Uint8Array;

    constructor(address: number, data: Uint8Array) {
        this._address = address;
        this._data = data;
    }

    get address(): number {
        return this._address;
    }

    set address(value: number) {
        this._address = value;
    }

    get data(): Uint8Array {
        return this._data;
    }

    set data(value: Uint8Array) {
        this._data = value;
    }
}

export class Software {

    private _name: string;
    private _inverted: boolean;
    private _cruBankSwitched: boolean;
    private _url: string;
    private _rom: Uint8Array;
    private _grom: Uint8Array;
    private _groms: Uint8Array[];
    private _ramAt0000 = false;
    private _ramAt4000 = false;
    private _ramAt6000 = false;
    private _ramAt7000 = false;
    private _ramFG99Paged = false;
    private _startAddress: number;
    private _workspaceAddress: number;
    private _memoryBlocks: MemoryBlock[];
    private _socketId: string;
    private _secondBank: boolean;

    constructor(data?: any) {
        if (data) {
            this.parseData(data);
        }
    }

    parseData(data: any) {
        this.inverted = !!data.inverted;
        this.cruBankSwitched = !!data.cruBankSwitched;
        if (data.startAddress) {
            this.startAddress = Util.parseNumber(data.startAddress);
        }
        if (data.rom != null) {
            this.rom = Util.hexArrayToByteArray(data.rom);
        }
        if (data.grom != null) {
            this.grom = Util.hexArrayToByteArray(data.grom);
        }
        if (data.groms != null) {
            this.groms = [];
            for (let g = 0; g < data.groms.length; g++) {
                this.groms[g] = Util.hexArrayToByteArray(data.groms[g]);
            }
        }
        if (data.memoryBlocks != null) {
            this.memoryBlocks = [];
            for (let i = 0; i < data.memoryBlocks.length; i++) {
                this.memoryBlocks[i] = new MemoryBlock(
                    Util.parseNumber(data.memoryBlocks[i].address),
                    Util.hexArrayToByteArray(data.memoryBlocks[i].data)
                );
            }
        }
        this.ramAt0000 = !!data.ramAt0000;
        this.ramAt4000 = !!data.ramAt4000;
        this.ramAt6000 = !!data.ramAt6000;
        this.ramAt7000 = !!data.ramAt7000;
        this.ramFG99Paged = !!data.ramFG99Paged;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get inverted(): boolean {
        return this._inverted;
    }

    set inverted(value: boolean) {
        this._inverted = value;
    }

    get cruBankSwitched(): boolean {
        return this._cruBankSwitched;
    }

    set cruBankSwitched(value: boolean) {
        this._cruBankSwitched = value;
    }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this._url = value;
    }

    get rom(): Uint8Array {
        return this._rom;
    }

    set rom(value: Uint8Array) {
        this._rom = value;
    }

    get grom(): Uint8Array {
        return this._grom;
    }

    set grom(value: Uint8Array) {
        this._grom = value;
    }

    get groms(): Uint8Array[] {
        return this._groms;
    }

    set groms(value: Uint8Array[]) {
        this._groms = value;
    }

    get ramAt0000(): boolean {
        return this._ramAt0000;
    }

    set ramAt0000(value: boolean) {
        this._ramAt0000 = value;
    }

    get ramAt4000(): boolean {
        return this._ramAt4000;
    }

    set ramAt4000(value: boolean) {
        this._ramAt4000 = value;
    }

    get ramAt6000(): boolean {
        return this._ramAt6000;
    }

    set ramAt6000(value: boolean) {
        this._ramAt6000 = value;
    }

    get ramAt7000(): boolean {
        return this._ramAt7000;
    }

    set ramAt7000(value: boolean) {
        this._ramAt7000 = value;
    }

    get ramFG99Paged(): boolean {
        return this._ramFG99Paged;
    }

    set ramFG99Paged(value: boolean) {
        this._ramFG99Paged = value;
    }

    get startAddress(): number {
        return this._startAddress;
    }

    set startAddress(value: number) {
        this._startAddress = value;
    }

    get workspaceAddress(): number {
        return this._workspaceAddress;
    }

    set workspaceAddress(value: number) {
        this._workspaceAddress = value;
    }

    get memoryBlocks(): MemoryBlock[] {
        return this._memoryBlocks;
    }

    set memoryBlocks(value: MemoryBlock[]) {
        this._memoryBlocks = value;
    }

    get socketId(): string {
        return this._socketId;
    }

    set socketId(value: string) {
        this._socketId = value;
    }

    get secondBank(): boolean {
        return this._secondBank;
    }

    set secondBank(value: boolean) {
        this._secondBank = value;
    }
}
