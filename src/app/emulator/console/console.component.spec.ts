import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ConsoleComponent} from './console.component';
import {CommandDispatcherService} from '../../services/command-dispatcher.service';
import {ModuleService} from "../../services/module.service";
import {HttpClient, HttpHandler} from "@angular/common/http";
import {DiskService} from "../../services/disk.service";
import {ObjectLoaderService} from "../../services/object-loader.service";
import {SettingsService} from "../../services/settings.service";
import {ConsoleFactoryService} from "../services/console-factory.service";
import {DiskImage} from "../classes/diskimage";
import {Settings} from "../../classes/settings";
import {Console} from "../interfaces/console";
import {CPU} from "../interfaces/cpu";
import {TMS9901} from "../classes/tms9901";
import {DiskDrive} from "../classes/diskdrive";
import {GoogleDrive} from "../classes/googledrive";
import {Keyboard} from "../classes/keyboard";
import {Memory} from "../classes/memory";
import {PSG} from "../interfaces/psg";
import {Speech} from "../interfaces/speech";
import {Tape} from "../classes/tape";
import {Software} from "../../classes/software";
import {VDP} from "../interfaces/vdp";
import {AudioService} from "../../services/audio.service";
import {TIPI} from "../classes/tipi";
import {TMS9919} from "../classes/tms9919";
import {TMS9900} from "../classes/tms9900";
import {TMS5200} from "../classes/tms5200";
import {TMS9918A} from "../classes/tms9918a";
import {WasmService} from "../../services/wasm.service";

class ConsoleMock implements Console {

    private settings = new Settings();

    frame(skipBreakpoint?: boolean) {
    }
    getCPU(): CPU {
        return new TMS9900(this);
    }
    getCRU(): TMS9901 {
        return new TMS9901(this);
    }
    getDiskDrives(): DiskDrive[] {
        return [];
    }
    getGoogleDrives(): GoogleDrive[] {
        return [];
    }
    getKeyboard(): Keyboard {
        return new Keyboard({} as Document, this.settings);
    }
    getMemory(): Memory {
        return new Memory(this, this.settings);
    }
    getPSG(): PSG {
        return new TMS9919(this.getCPU(), this.getTape());
    }
    getSpeech(): Speech {
        return new TMS5200(this, this.settings);
    }
    getTape(): Tape {
        return new Tape();
    }
    getVDP(): VDP {
        return new TMS9918A({
            getContext(contextId: "2d", options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null {
                return {} as CanvasRenderingContext2D;
            }
        } as HTMLCanvasElement, this, {} as WasmService);
    }
    isRunning() {
    }
    loadSoftware(software: Software) {
    }
    reset(keepCart: boolean) {
    }
    setGoogleDrive() {
    }
    setVDP() {
    }
    setPSG() {
    }
    start(fast: boolean, skipBreakpoint?: boolean) {
    }
    step() {
    }
    stepOver() {
    }
    stop() {
    }
    getTIPI(): TIPI | null {
        return null;
    }
    setTIPI() {
    }
}

class ConsoleFactoryMock {
    create(document: HTMLDocument, canvas: HTMLCanvasElement, diskImages: DiskImage[], settings: Settings, onBreakpoint: (cpu: CPU) => void): Console {
        return new ConsoleMock();
    }
}

describe('ConsoleComponent', () => {
    let component: ConsoleComponent;
    let fixture: ComponentFixture<ConsoleComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ConsoleComponent],
            providers: [
                CommandDispatcherService,
                ModuleService,
                HttpClient,
                HttpHandler,
                DiskService,
                ObjectLoaderService,
                SettingsService,
                AudioService,
                {provide: ConsoleFactoryService, useClass: ConsoleFactoryMock }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConsoleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
