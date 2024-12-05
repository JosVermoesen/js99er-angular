import {Stateful} from '../interfaces/stateful';
import {TMS9919} from './tms9919';
import {Cru} from './cru';
import {Tape} from './tape';
import {Keyboard} from './keyboard';
import {TMS5200} from './tms5200';
import {Memory} from './memory';
import {TMS9900} from './tms9900';
import {Log} from '../../classes/log';
import {F18A} from './f18a';
import {GoogleDrive} from './google-drive';
import {VDP} from '../interfaces/vdp';
import {CPU} from '../interfaces/cpu';
import {TMS9918A} from './tms9918a';
import {F18AGPU} from './f18a-gpu';
import {System} from './system';
import {Software} from '../../classes/software';
import {Settings} from '../../classes/settings';
import {PSG} from '../interfaces/psg';
import {Speech} from '../interfaces/speech';
import {DiskDrive} from './disk-drive';
import {DiskImage} from './disk-image';
import {Console} from "../interfaces/console";
import {TIPI} from "./tipi";
import {WasmService} from "../../services/wasm.service";
import $ from "jquery";
import {V9938} from "./v9938";
import {Forti} from "./forti";
import {TiFdc} from "./ti-fdc";
import {GenericFdc} from "./generic-fdc";
import {GoogleDriveFdc} from "./google-drive-fdc";
import {Observable, Subject} from "rxjs";
import {FDC} from "../interfaces/fdc";

export class TI994A implements Console, Stateful {

    static FRAME_MS = 1000 / 60;
    static FPS_MS = 4000;

    private canvas: HTMLCanvasElement;
    private document: HTMLDocument;
    private settings: Settings;
    private wasmService: WasmService;
    private onBreakpoint: (cpu: CPU) => void;

    private memory: Memory;
    private cpu: CPU;
    private vdp: VDP;
    private psg: PSG;
    private speech: Speech;
    private cru: Cru;
    private keyboard: Keyboard;
    private tape: Tape;
    private diskDrives: DiskDrive[];
    private fdc: FDC | null;
    private googleFdc: GoogleDriveFdc;
    private googleDrives: GoogleDrive[];
    private tipi: TIPI | null;

    private running: boolean;
    private cpuSpeed: number;
    private activeCPU: CPU;
    private wasRunning = false;
    private wasFast = false;
    private useVsync = false;

    private frameCount: number;
    private frameInterval: number;
    private lastFrameTime: number | null;
    private fpsFrameCount: number;
    private fpsInterval: number;
    private lastFpsTime: number | null;
    private cyclesSubject: Subject<number>;

    private log: Log;

    constructor(document: Document, canvas: HTMLCanvasElement, diskImages: DiskImage[], settings: Settings, wasmService: WasmService, onBreakpoint: (cpu: CPU) => void) {
        this.document = document;
        this.canvas = canvas;
        this.settings = settings;
        this.wasmService = wasmService;
        this.cyclesSubject = new Subject<number>();
        this.onBreakpoint = onBreakpoint;
        this.log = Log.getLog();

        this.assemble(diskImages);
        this.attachListeners();

        this.running = false;
        this.cpuSpeed = 1;
        this.activeCPU = this.cpu;
        this.wasRunning = false;
        this.wasFast = false;
        this.useVsync = navigator.userAgent.indexOf('Firefox') !== -1;

        this.frameCount = 0;
        this.lastFrameTime = null;
        this.fpsFrameCount = 0;
        this.lastFpsTime = null;
    }

    private assemble(diskImages: DiskImage[]) {
        this.cru = new Cru(this);
        this.memory = new Memory(this, this.settings);
        this.cpu = new TMS9900(this);
        this.tape = new Tape();
        this.setVDP();
        this.setPSG();
        this.speech = new TMS5200(this.settings.isSpeechEnabled());
        this.keyboard = new Keyboard(this.document, this, this.settings);
        this.diskDrives = [
            new DiskDrive("DSK1", diskImages[0]),
            new DiskDrive("DSK2", diskImages[1]),
            new DiskDrive("DSK3", diskImages[2])
        ];
        this.setFDC();
        this.setGoogleDrive();
        this.setTIPI();
    }

    private attachListeners() {
        this.speech.isReady().subscribe(
            (ready) => {
                this.cpu.setSuspended(!ready);
            }
        );
        $(window).on("blur", () => {
            if (this.settings.isPauseOnFocusLostEnabled() || this.useVsync) {
                this.wasRunning = this.isRunning();
                this.wasFast = this.isFast();
                if (this.wasRunning) {
                    this.stop();
                }
            }
        });
        $(window).on("focus", () => {
            if (this.settings.isPauseOnFocusLostEnabled() || this.useVsync) {
                if (this.wasRunning) {
                    this.start(this.wasFast);
                }
            }
        });
    }

    public setVDP() {
        switch (this.settings.getVDP()) {
            case 'TMS9918A':
                this.vdp = new TMS9918A(this.canvas, this, this.wasmService);
                break;
            case 'F18A':
                this.vdp = new F18A(this.canvas, this, this.wasmService);
                break;
            case 'V9938':
                this.vdp = new V9938(this.canvas, this);
                break;
        }
    }

    public setPSG() {
        switch (this.settings.getPSG()) {
            case 'STANDARD':
                this.psg = new TMS9919(this.cpu, this.tape);
                break;
            case 'FORTI':
                this.psg = new Forti(this.cpu, this.tape);
                break;
        }
    }

    public setFDC() {
        if (this.fdc) {
            this.memory.deregisterPeripheralCard(this.fdc);
        }
        switch (this.settings.getDisk()) {
            case 'GENERIC':
                this.fdc = new GenericFdc(this, this.diskDrives);
                break;
            case 'TIFDC':
                this.fdc = new TiFdc(this.diskDrives);
                break;
            case 'NONE':
                this.fdc = null;
                break;
        }
        if (this.fdc) {
            this.memory.registerPeripheralCard(this.fdc);
        }
    }

    public setGoogleDrive() {
        if (this.googleFdc) {
            this.memory.deregisterPeripheralCard(this.googleFdc);
        }
        if (this.settings.isGoogleDriveEnabled()) {
            this.googleDrives = [
                new GoogleDrive("GDR1", "Js99erDrives/GDR1"),
                new GoogleDrive("GDR2", "Js99erDrives/GDR2"),
                new GoogleDrive("GDR3", "Js99erDrives/GDR3")
            ];
            this.googleFdc = new GoogleDriveFdc(this, this.googleDrives);
            this.memory.registerPeripheralCard(this.googleFdc);
        } else {
            this.googleDrives = [];
        }
    }

    public setTIPI() {
        if (this.tipi) {
            this.tipi.close();
            this.memory.deregisterPeripheralCard(this.tipi);
        }
        if (this.settings.getTIPI() !== 'NONE') {
            this.tipi = new TIPI(
                this.cpu,
                this.settings.getTIPIWebsocketURI() || '',
                this.canvas,
                this.settings.getTIPI() === 'FULL',
                this.settings.getTIPI() === 'MOUSE'
            );
            this.memory.registerPeripheralCard(this.tipi);
        } else {
            this.tipi = null;
        }
    }

    reset(keepCart: boolean) {
        // Components
        this.memory.reset(keepCart);
        this.cpu.reset();
        this.vdp.reset();
        this.psg.reset();
        this.speech.reset();
        this.cru.reset();
        this.keyboard.reset();
        this.tape.reset();
        if (this.fdc) {
            this.fdc.reset();
        }
        for (let i = 0; i < this.googleDrives.length; i++) {
            this.googleDrives[i].reset();
        }
        if (this.tipi) {
            this.tipi.reset();
        }
        // Other
        this.resetFps();
        this.cpuSpeed = 1;
    }

    start(fast: boolean, skipBreakpoint?: boolean) {
        this.cpuSpeed = fast ? 3 : 1;
        if (!this.isRunning()) {
            this.cpu.setSuspended(false);
            this.tape.setPaused(false);
            this.keyboard.start();
            if (this.useVsync) {
                this.lastFrameTime = null;
                this.runWithVsync(skipBreakpoint);
            } else {
                this.runWithInterval(skipBreakpoint);
            }
            this.resetFps();
            this.printFps();
            this.fpsInterval = window.setInterval(
                () => {
                    this.printFps();
                },
                TI994A.FPS_MS
            );
        }
        this.running = true;
    }

    runWithVsync(skipBreakpoint?: boolean) {
        window.requestAnimationFrame(
            (time) => {
                if (this.running) {
                    if (this.lastFrameTime === null || time - this.lastFrameTime - TI994A.FRAME_MS > -1.0) {
                        this.frame(skipBreakpoint);
                        this.lastFrameTime = time;
                    }
                    this.runWithVsync(skipBreakpoint);
                }
            }
        );
    }

    runWithInterval(skipBreakpoint?: boolean) {
        this.frameInterval = window.setInterval(
            () => {
                this.frame(skipBreakpoint);
            },
            Math.ceil(TI994A.FRAME_MS)
        );
    }

    frame(skipBreakpoint?: boolean) {
        const cpuSpeed = this.cpuSpeed;
        let cyclesToRun = TMS9900.CYCLES_PER_FRAME * cpuSpeed;
        const cyclesPerScanline = TMS9900.CYCLES_PER_SCANLINE * cpuSpeed;
        const f18ACyclesPerScanline = F18AGPU.CYCLES_PER_SCANLINE;
        let extraCycles = 0;
        let y = 0;
        this.vdp.initFrame();
        while (cyclesToRun > 0) {
            if (y < 240) {
                this.vdp.drawScanline(y);
            } else {
                this.vdp.drawInvisibleScanline(y);
            }
            y = y + 1;
            const cpu = this.cpu;
            if (!cpu.isSuspended()) {
                this.activeCPU = cpu;
                extraCycles = cpu.run(cyclesPerScanline - extraCycles, skipBreakpoint);
                if (cpu.isStoppedAtBreakpoint()) {
                    if (this.onBreakpoint) {
                        this.onBreakpoint(cpu);
                    }
                    return;
                }
            }
            // F18A GPU
            const gpu: CPU | undefined = this.vdp.getGPU();
            if (gpu && !gpu.isIdle()) {
                this.activeCPU = gpu;
                gpu.run(f18ACyclesPerScanline, skipBreakpoint);
                if (gpu.isStoppedAtBreakpoint()) {
                    if (this.onBreakpoint) {
                        this.onBreakpoint(gpu);
                    }
                    return;
                }
                if (gpu.isIdle()) {
                    this.activeCPU = cpu;
                }
            }
            this.cyclesSubject.next(cyclesPerScanline);
            cyclesToRun -= cyclesPerScanline;
            skipBreakpoint = false;
        }
        this.fpsFrameCount++;
        this.frameCount++;
        this.vdp.updateCanvas();
    }

    step() {
        this.activeCPU.run(1, true);
    }

    stepOver() {
        this.activeCPU.breakAfterNext();
        this.start(false, true);
    }

    stop() {
        if (this.frameInterval) {
            window.clearInterval(this.frameInterval);
        }
        window.clearInterval(this.fpsInterval);
        this.psg.mute();
        this.tape.setPaused(true);
        this.keyboard.stop();
        this.vdp.updateCanvas();
        this.running = false;
        this.cpu.dumpProfile();
    }

    resetFps() {
        this.lastFpsTime = null;
        this.fpsFrameCount = 0;
    }

    printFps() {
        const now = +new Date();
        let s = 'Frame ' + this.frameCount + ' running';
        if (this.lastFpsTime) {
            s += ': '
                + (this.fpsFrameCount / ((now - this.lastFpsTime) / 1000)).toFixed(1)
                + ' / '
                + (1000 / TI994A.FRAME_MS).toFixed(1)
                + ' FPS';
        }
        this.log.info(s);
        this.fpsFrameCount = 0;
        this.lastFpsTime = now;
    }

    getCPU(): CPU {
        return this.cpu;
    }

    getVDP(): VDP {
        return this.vdp;
    }

    getPSG(): PSG {
        return this.psg;
    }

    getSpeech(): Speech {
        return this.speech;
    }

    getCRU(): Cru {
        return this.cru;
    }

    getMemory(): Memory {
        return this.memory;
    }

    getKeyboard(): Keyboard {
        return this.keyboard;
    }

    getTape(): Tape {
        return this.tape;
    }

    getDiskDrives(): DiskDrive[] {
        return this.diskDrives;
    }

    getFDC(): FDC | null {
        return this.fdc;
    }

    getGoogleDrivesFdc(): GoogleDriveFdc {
        return this.googleFdc;
    }

    getTIPI(): TIPI | null {
        return this.tipi;
    }

    isRunning() {
        return this.running;
    }

    isFast() {
        return this.cpuSpeed > 1;
    }

    getPC() {
        return this.activeCPU.getPc();
    }

    isGPUActive(): boolean {
        return this.activeCPU === this.vdp.getGPU();
    }

    getStatusString(detailed: boolean) {
        return this.activeCPU.getInternalRegsString(detailed) + " " + this.cru.getStatusString(detailed) + "\n" +
        this.activeCPU.getRegsStringFormatted(detailed) + this.vdp.getRegsString(detailed) + " " + this.memory.getStatusString(detailed) +
        (detailed ? "\nPSG: " + this.psg.getRegsString(detailed) : "");
    }

    loadSoftware(sw: Software) {
        const wasRunning = this.isRunning();
        if (wasRunning) {
            this.stop();
        }
        this.reset(!!sw.memoryBlocks);
        if (sw.memoryBlocks) {
            for (let i = 0; i < sw.memoryBlocks.length; i++) {
                const memoryBlock = sw.memoryBlocks[i];
                this.memory.loadRAM(memoryBlock.address, memoryBlock.data);
            }
        }
        this.memory.setRAMAt0000(sw.ramAt0000);
        this.memory.setRAMAt4000(sw.ramAt4000);
        if (sw.rom) {
            this.memory.setCartridgeImage(
                sw.rom,
                sw.inverted,
                sw.cruBankSwitched,
                sw.ramAt6000,
                sw.ramAt7000,
                sw.ramFG99Paged
            );
        }
        if (sw.grom) {
            this.memory.loadGROM(sw.grom, 3, 0);
        }
        if (sw.groms) {
            for (let g = 0; g < sw.groms.length; g++) {
                this.memory.loadGROM(sw.groms[g], 3, g);
            }
        }
        this.cpu.setWp(sw.workspaceAddress ? sw.workspaceAddress : (System.ROM[0] << 8 | System.ROM[1]));
        this.cpu.setPc(sw.startAddress ? sw.startAddress : (System.ROM[2] << 8 | System.ROM[3]));
        if (wasRunning) {
            this.start(false);
        }
    }

    cyclesPassed(): Observable<number> {
        return this.cyclesSubject.asObservable();
    }

    getState(): any {
        return {
            cpu: this.cpu.getState(),
            memory: this.memory.getState(),
            cru: this.cru.getState(),
            keyboard: this.keyboard.getState(),
            vdp: this.vdp.getState(),
            psg: this.psg.getState(),
            speech: this.speech.getState(),
            tape: this.tape.getState(),
            fdc: this.fdc ? this.fdc.getState() : null
        };
    }

    restoreState(state: any) {
        if (state.cpu) {
            this.cpu.restoreState(state.cpu);
        }
        if (state.memory) {
            this.memory.restoreState(state.memory);
        }
        if (state.cru) {
            this.cru.restoreState(state.cru);
        }
        if (state.keyboard) {
            this.keyboard.restoreState(state.keyboard);
        }
        if (state.vdp) {
            this.vdp.restoreState(state.vdp);
        }
        if (state.psg) {
            this.psg.restoreState(state.psg);
        }
        if (state.speech) {
            this.speech.restoreState(state.speech);
        }
        if (state.tape) {
            this.tape.restoreState(state.tape);
        }
        if (state.fdc) {
            this.setVDP();
            if (this.fdc) {
                this.fdc.restoreState(state.fdc);
            }
        }
    }
}
