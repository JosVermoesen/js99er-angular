import {CRU} from './cru';
import {Util} from '../../classes/util';
import {VDP} from '../interfaces/vdp';
import {CPU} from '../interfaces/cpu';
import {TI994A} from './ti994a';
import {Settings} from '../../classes/settings';
import {Log} from '../../classes/log';

export enum ScreenMode {
    MODE_GRAPHICS = 0,
    MODE_TEXT = 1,
    MODE_BITMAP = 2,
    MODE_MULTICOLOR = 3,
    MODE_BITMAP_TEXT = 4,
    MODE_BITMAP_MULTICOLOR = 5,
    MODE_ILLEGAL = 6
}

export class TMS9918A implements VDP {

    private canvas: HTMLCanvasElement;
    private console: TI994A;
    private cru: CRU;
    private enableFlicker: boolean;

    private ram: Uint8Array = new Uint8Array(16384); // VDP RAM
    private registers: Uint8Array = new Uint8Array(8);
    private addressRegister: number;
    private statusRegister: number;

    private palette: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [33, 200, 66],
        [94, 220, 120],
        [84, 85, 237],
        [125, 118, 252],
        [212, 82, 77],
        [66, 235, 245],
        [252, 85, 84],
        [255, 121, 120],
        [212, 193, 84],
        [230, 206, 128],
        [33, 176, 59],
        [201, 91, 186],
        [204, 204, 204],
        [255, 255, 255]
    ];

    private latch: boolean;
    private prefetchByte: number;

    private displayOn: boolean;
    private interruptsOn: boolean;
    private screenMode: ScreenMode;
    private bitmapMode: boolean;
    private textMode: boolean;
    private colorTable: number;
    private nameTable: number;
    private charPatternTable: number;
    private spriteAttributeTable: number;
    private spritePatternTable: number;
    private colorTableMask: number;
    private patternTableMask: number;
    private ramMask: number;
    private fgColor: number;
    private bgColor: number;

    private flicker: boolean;
    private redrawRequired: boolean;

    private canvasContext: CanvasRenderingContext2D;
    private imageData: ImageData;
    private width: number;
    private height: number;

    private spritePatternColorMap: {};

    private log: Log = Log.getLog();

    constructor(canvas: HTMLCanvasElement, console: TI994A, settings: Settings) {
        this.canvas = canvas;
        this.canvasContext = canvas.getContext('2d');
        this.console = console;
        this.enableFlicker = settings.isFlickerEnabled();
    }

    reset() {
        this.cru = this.console.getCRU();
        for (let i = 0; i < this.ram.length; i++) {
            this.ram[i] = 0;
        }
        for (let i = 0; i < this.registers.length; i++) {
            this.registers[i] = 0;
        }
        this.addressRegister = 0;
        this.statusRegister = 0;

        this.prefetchByte = 0;
        this.latch = false;

        this.displayOn = false;
        this.interruptsOn = false;
        this.screenMode = ScreenMode.MODE_GRAPHICS;
        this.bitmapMode = false;
        this.textMode = false;
        this.colorTable = 0;
        this.nameTable = 0;
        this.charPatternTable = 0;
        this.spriteAttributeTable = 0;
        this.spritePatternTable = 0;
        this.colorTableMask = 0x3FFF;
        this.patternTableMask = 0x3FFF;
        this.ramMask = 0x3FFF;
        this.fgColor = 0;
        this.bgColor = 0;

        this.flicker = this.enableFlicker;
        this.redrawRequired = true;

        this.canvas.width = 320;
        this.canvas.height = 240;
        this.canvasContext.fillStyle = 'rgba(' + this.palette[7].join(',') + ',1.0)';
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Build the array containing the canvas bitmap (256 * 192 * 4 bytes (r,g,b,a) format each pixel)
        this.imageData = this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.spritePatternColorMap = {};
    }

    drawFrame(timestamp: number) {
        if (this.redrawRequired) {
            for (let y = 0; y < this.height; y++) {
                this.drawScanline(y);
            }
            this.updateCanvas();
            this.redrawRequired = false;
        }
    }

    initFrame(timestamp: number) {
    }

    drawScanline(y: number) {
        const
            imageData = this.imageData.data,
            width = this.width,
            screenMode = this.screenMode,
            textMode = this.textMode,
            bitmapMode = this.bitmapMode,
            drawWidth = !textMode ? 256 : 240,
            drawHeight = 192,
            hBorder = (width - drawWidth) >> 1,
            vBorder = (this.height - drawHeight) >> 1,
            fgColor = this.fgColor,
            bgColor = this.bgColor,
            ram = this.ram,
            nameTable = this.nameTable,
            colorTable = this.colorTable,
            charPatternTable = this.charPatternTable,
            colorTableMask = this.colorTableMask,
            patternTableMask = this.patternTableMask,
            spriteAttributeTable = this.spriteAttributeTable,
            spritePatternTable = this.spritePatternTable,
            spriteSize = (this.registers[1] & 0x2) !== 0,
            spriteMagnify = this.registers[1] & 0x1,
            spriteDimension = (spriteSize ? 16 : 8) << (spriteMagnify ? 1 : 0),
            maxSpritesOnLine = this.flicker ? 4 : 32,
            palette = this.palette;
        let
            imageDataAddr: number = (y * width) << 2,
            collision = false,
            fifthSprite = false,
            fifthSpriteIndex = 31,
            x: number,
            color: number,
            rgbColor: number[],
            name: number,
            tableOffset: number,
            colorByte: number,
            patternByte: number,
            spriteBuffer: Uint8Array;
        if (y >= vBorder && y < vBorder + drawHeight && this.displayOn) {
            const y1 = y - vBorder;
            // Pre-process sprites
            if (!textMode) {
                spriteBuffer = new Uint8Array(drawWidth);
                let spritesOnLine = 0;
                let endMarkerFound = false;
                let spriteAttributeAddr = spriteAttributeTable;
                let s;
                for (s = 0; s < 32 && spritesOnLine <= maxSpritesOnLine && !endMarkerFound; s++) {
                    let sy = ram[spriteAttributeAddr];
                    if (sy !== 0xD0) {
                        if (sy > 0xD0) {
                            sy -= 256;
                        }
                        sy++;
                        const sy1 = sy + spriteDimension;
                        let y2 = -1;
                        if (s < 8 || !bitmapMode) {
                            if (y1 >= sy && y1 < sy1) {
                                y2 = y1;
                            }
                        } else {
                            // Emulate sprite duplication bug
                            const yMasked = y1 & (((this.registers[4] & 0x03) << 6) | 0x3F);
                            if (yMasked >= sy && yMasked < sy1) {
                                y2 = yMasked;
                            } else if (y1 >= 64 && y1 < 128 && y1 >= sy && y1 < sy1) {
                                y2 = y1;
                            }
                        }
                        if (y2 !== -1) {
                            if (spritesOnLine < maxSpritesOnLine) {
                                let sx = ram[spriteAttributeAddr + 1];
                                const sPatternNo = ram[spriteAttributeAddr + 2] & (spriteSize ? 0xFC : 0xFF);
                                const sColor = ram[spriteAttributeAddr + 3] & 0x0F;
                                if ((ram[spriteAttributeAddr + 3] & 0x80) !== 0) {
                                    sx -= 32;
                                }
                                const sLine = (y2 - sy) >> spriteMagnify;
                                const sPatternBase = spritePatternTable + (sPatternNo << 3) + sLine;
                                for (let sx1 = 0; sx1 < spriteDimension; sx1++) {
                                    const sx2 = sx + sx1;
                                    if (sx2 >= 0 && sx2 < drawWidth) {
                                        const sx3 = sx1 >> spriteMagnify;
                                        const sPatternByte = ram[sPatternBase + (sx3 >= 8 ? 16 : 0)];
                                        if ((sPatternByte & (0x80 >> (sx3 & 0x07))) !== 0) {
                                            if (spriteBuffer[sx2] === 0) {
                                                spriteBuffer[sx2] = sColor + 1;
                                            } else {
                                                collision = true;
                                            }
                                        }
                                    }
                                }
                            }
                            spritesOnLine++;
                        }
                        spriteAttributeAddr += 4;
                    } else {
                        endMarkerFound = true;
                    }
                }
                if (spritesOnLine > 4) {
                    fifthSprite = true;
                    fifthSpriteIndex = s;
                }
            }
            // Draw
            const rowOffset = !textMode ? (y1 >> 3) << 5 : (y1 >> 3) * 40;
            let lineOffset = y1 & 7;
            for (x = 0; x < width; x++) {
                if (x >= hBorder && x < hBorder + drawWidth) {
                    const x1 = x - hBorder;
                    // Tiles
                    switch (screenMode) {
                        case ScreenMode.MODE_GRAPHICS:
                            name = ram[nameTable + rowOffset + (x1 >> 3)];
                            colorByte = ram[colorTable + (name >> 3)];
                            patternByte = ram[charPatternTable + (name << 3) + lineOffset];
                            color = (patternByte & (0x80 >> (x1 & 7))) !== 0 ? (colorByte & 0xF0) >> 4 : colorByte & 0x0F;
                            break;
                        case ScreenMode.MODE_BITMAP:
                            name = ram[nameTable + rowOffset + (x1 >> 3)];
                            tableOffset = ((y1 & 0xC0) << 5) + (name << 3);
                            colorByte = ram[colorTable + (tableOffset & colorTableMask) + lineOffset];
                            patternByte = ram[charPatternTable + (tableOffset & patternTableMask) + lineOffset];
                            color = (patternByte & (0x80 >> (x1 & 7))) !== 0 ? (colorByte & 0xF0) >> 4 : colorByte & 0x0F;
                            break;
                        case ScreenMode.MODE_MULTICOLOR:
                            name = ram[nameTable + rowOffset + (x1 >> 3)];
                            lineOffset = (y1 & 0x1C) >> 2;
                            patternByte = ram[charPatternTable + (name << 3) + lineOffset];
                            color = (x1 & 4) === 0 ? (patternByte & 0xF0) >> 4 : patternByte & 0x0F;
                            break;
                        case ScreenMode.MODE_TEXT:
                            name = ram[nameTable + rowOffset + Math.floor(x1 / 6)];
                            patternByte = ram[charPatternTable + (name << 3) + lineOffset];
                            color = (patternByte & (0x80 >> (x1 % 6))) !== 0 ? fgColor : bgColor;
                            break;
                        case ScreenMode.MODE_BITMAP_TEXT:
                            name = ram[nameTable + rowOffset + Math.floor(x1 / 6)];
                            tableOffset = ((y1 & 0xC0) << 5) + (name << 3);
                            patternByte = ram[charPatternTable + (tableOffset & patternTableMask) + lineOffset];
                            color = (patternByte & (0x80 >> (x1 % 6))) !== 0 ? fgColor : bgColor;
                            break;
                        case ScreenMode.MODE_BITMAP_MULTICOLOR:
                            name = ram[nameTable + rowOffset + (x1 >> 3)];
                            lineOffset = (y1 & 0x1C) >> 2;
                            tableOffset = ((y1 & 0xC0) << 5) + (name << 3);
                            patternByte = ram[charPatternTable + (tableOffset & patternTableMask) + lineOffset];
                            color = (x1 & 4) === 0 ? (patternByte & 0xF0) >> 4 : patternByte & 0x0F;
                            break;
                        case ScreenMode.MODE_ILLEGAL:
                            color = (x1 & 4) === 0 ? fgColor : bgColor;
                            break;
                    }
                    if (color === 0) {
                        color = bgColor;
                    }
                    // Sprites
                    if (!textMode) {
                        const spriteColor = spriteBuffer[x1] - 1;
                        if (spriteColor > 0) {
                            color = spriteColor;
                        }
                    }
                } else {
                    color = bgColor;
                }
                rgbColor = palette[color];
                imageData[imageDataAddr++] = rgbColor[0]; // R
                imageData[imageDataAddr++] = rgbColor[1]; // G
                imageData[imageDataAddr++] = rgbColor[2]; // B
                imageDataAddr++; // Skip alpha
            }
        } else {
            // Top/bottom border
            rgbColor = palette[bgColor];
            for (x = 0; x < width; x++) {
                imageData[imageDataAddr++] = rgbColor[0]; // R
                imageData[imageDataAddr++] = rgbColor[1]; // G
                imageData[imageDataAddr++] = rgbColor[2]; // B
                imageDataAddr++; // Skip alpha
            }
        }
        if (y === vBorder + drawHeight) {
            this.statusRegister |= 0x80;
            if (this.interruptsOn) {
                this.cru.setVDPInterrupt(true);
            }
        }
        if (collision) {
            this.statusRegister |= 0x20;
        }
        if ((this.statusRegister & 0x40) === 0) {
            this.statusRegister |= fifthSpriteIndex;
        }
        if (fifthSprite) {
            this.statusRegister |= 0x40;
        }
    }

    updateCanvas() {
        this.canvasContext.putImageData(this.imageData, 0, 0);
    }

    writeAddress(i: number) {
        if (!this.latch) {
            this.addressRegister = (this.addressRegister & 0xFF00) | i;
        } else {
            switch ((i & 0xc0) >> 6) {
                // Set read address
                case 0:
                    this.addressRegister = ((i & 0x3f) << 8) | (this.addressRegister & 0x00FF);
                    this.prefetchByte = this.ram[this.addressRegister++];
                    this.addressRegister &= 0x3FFF;
                    break;
                // Set write address
                case 1:
                    this.addressRegister = ((i & 0x3f) << 8) | (this.addressRegister & 0x00FF);
                    break;
                // Write register
                case 2:
                case 3:
                    this.registers[i & 0x7] = this.addressRegister & 0x00FF;
                    switch (i & 0x7) {
                        // Mode
                        case 0:
                            this.updateMode(this.registers[0], this.registers[1]);
                            break;
                        case 1:
                            this.ramMask = (this.registers[1] & 0x80) !== 0 ? 0x3FFF : 0x1FFF;
                            this.displayOn = (this.registers[1] & 0x40) !== 0;
                            this.interruptsOn = (this.registers[1] & 0x20) !== 0;
                            this.updateMode(this.registers[0], this.registers[1]);
                            break;
                        // Name table
                        case 2:
                            this.nameTable = (this.registers[2] & 0xf) << 10;
                            break;
                        // Color table
                        case 3:
                            if (this.bitmapMode) {
                                this.colorTable = (this.registers[3] & 0x80) << 6;
                            } else {
                                this.colorTable = this.registers[3] << 6;
                            }
                            this.updateTableMasks();
                            break;
                        // Pattern table
                        case 4:
                            if (this.bitmapMode) {
                                this.charPatternTable = (this.registers[4] & 0x4) << 11;
                            } else {
                                this.charPatternTable = (this.registers[4] & 0x7) << 11;
                            }
                            this.updateTableMasks();
                            break;
                        // Sprite attribute table
                        case 5:
                            this.spriteAttributeTable = (this.registers[5] & 0x7f) << 7;
                            break;
                        // Sprite pattern table
                        case 6:
                            this.spritePatternTable = (this.registers[6] & 0x7) << 11;
                            break;
                        // Background
                        case 7:
                            this.fgColor = (this.registers[7] & 0xf0) >> 4;
                            this.bgColor = this.registers[7] & 0x0f;
                            break;
                    }
                    // this.logRegisters();
                    // this.log.info("Name table: " + this.nameTable.toHexWord());
                    // this.log.info("Pattern table: " + this.charPatternTable.toHexWord());
                    break;
            }
            this.redrawRequired = true;
        }
        this.latch = !this.latch;
    }

    private updateMode(reg0: number, reg1: number) {
        this.bitmapMode = (reg0 & 0x02) !== 0;
        this.textMode = (reg1 & 0x10) !== 0;
        // Check bitmap mode bit, not text or multicolor
        if (this.bitmapMode) {
            switch ((reg1 & 0x18) >> 3) {
                case 0:
                    // Bitmap mode
                    this.screenMode = ScreenMode.MODE_BITMAP;
                    break;
                case 1:
                    // Multicolor mode
                    this.screenMode = ScreenMode.MODE_BITMAP_MULTICOLOR;
                    break;
                case 2:
                    // Text mode
                    this.screenMode = ScreenMode.MODE_BITMAP_TEXT;
                    break;
                case 3:
                    // Illegal
                    this.screenMode = ScreenMode.MODE_ILLEGAL;
                    break;
            }
        } else {
            switch ((reg1 & 0x18) >> 3) {
                case 0:
                    // Graphics mode 0
                    this.screenMode = ScreenMode.MODE_GRAPHICS;
                    break;
                case 1:
                    // Multicolor mode
                    this.screenMode = ScreenMode.MODE_MULTICOLOR;
                    break;
                case 2:
                    // Text mode
                    this.screenMode = ScreenMode.MODE_TEXT;
                    break;
                case 3:
                    // Illegal
                    this.screenMode = ScreenMode.MODE_ILLEGAL;
                    break;
            }
        }
        if (this.bitmapMode) {
            this.colorTable = (this.registers[3] & 0x80) << 6;
            this.charPatternTable = (this.registers[4] & 0x4) << 11;
            this.updateTableMasks();
        } else {
            this.colorTable = this.registers[3] << 6;
            this.charPatternTable = (this.registers[4] & 0x7) << 11;
        }
        this.nameTable = (this.registers[2] & 0xf) << 10;
        this.spriteAttributeTable = (this.registers[5] & 0x7f) << 7;
        this.spritePatternTable = (this.registers[6] & 0x7) << 11;
    }

    private updateTableMasks() {
        if (this.screenMode === ScreenMode.MODE_BITMAP) {
            this.colorTableMask = ((this.registers[3] & 0x7F) << 6) | 0x3F; // 000CCCCCCC111111
            this.patternTableMask = ((this.registers[4] & 0x03) << 11) | (this.colorTableMask & 0x7FF); // 000PPCCCCC111111
            // this.log.info("colorTableMask:" + this.colorTableMask);
            // this.log.info("patternTableMask:" + this.patternTableMask);
        } else if (this.screenMode === ScreenMode.MODE_BITMAP_TEXT || this.screenMode === ScreenMode.MODE_BITMAP_MULTICOLOR) {
            this.colorTableMask = this.ramMask;
            this.patternTableMask = ((this.registers[4] & 0x03) << 11) | 0x7FF; // 000PP11111111111
        } else {
            this.colorTableMask = this.ramMask;
            this.patternTableMask = this.ramMask;
        }
    }

    writeData(i: number) {
        this.ram[this.addressRegister++] = i;
        this.addressRegister &= this.ramMask;
        this.redrawRequired = true;
    }

    readStatus(): number {
        const i = this.statusRegister;
        this.statusRegister = 0x1F;
        if (this.interruptsOn) {
            this.cru.setVDPInterrupt(false);
        }
        this.latch = false;
        return i;
    }

    readData(): number {
        const i = this.prefetchByte;
        this.prefetchByte = this.ram[this.addressRegister++];
        this.addressRegister &= this.ramMask;
        return i;
    }

    getRAM(): Uint8Array {
        return this.ram;
    }

    getRegister(r: number): number {
        return this.registers[r];
    }

    private colorTableSize() {
        if (this.screenMode === ScreenMode.MODE_GRAPHICS) {
            return 0x20;
        } else if (this.screenMode === ScreenMode.MODE_BITMAP) {
            return Math.min(this.colorTableMask + 1, 0x1800);
        } else {
            return 0;
        }
    }

    private patternTableSize() {
        if (this.bitmapMode) {
            return Math.min(this.patternTableMask + 1, 0x1800);
        } else {
            return 0x800;
        }
    }

    getRegsString(): string {
        let s = '';
        for (let i = 0; i < this.registers.length; i++) {
            s += 'VR' + i + ':' + Util.toHexByte(this.registers[i]) + ' ';
        }
        s += '\nSIT:' + Util.toHexWord(this.nameTable) +
            ' PDT:' + Util.toHexWord(this.charPatternTable) + ' (' + Util.toHexWord(this.patternTableSize()) + ')' +
            ' CT:' + Util.toHexWord(this.colorTable) + ' (' + Util.toHexWord(this.colorTableSize()) + ')' +
            ' SDT:' + Util.toHexWord(this.spritePatternTable) +
            ' SAL:' + Util.toHexWord(this.spriteAttributeTable) +
            '\nVDP: ' + Util.toHexWord(this.addressRegister);
        return s;
    }

    hexView(start, length, anchorAddr): {lines: string[], anchorLine: number} {
        const lines: string[] = [];
        let anchorLine: number = null;
        let addr = start;
        let lineNo = 0;
        let line = "";
        for (let i = 0; i < length; addr++, i++) {
            if (anchorAddr === addr) {
                anchorLine = lineNo;
            }
            if ((i & 0xF) === 0) {
                line += Util.toHexWord(addr) + ': ';
            }
            line += Util.toHexByteShort(this.ram[addr]);
            if ((i & 0xF) === 0xF) {
                lines.push(line);
                line = "";
                lineNo++;
            } else {
                line += ' ';
            }
        }
        return {lines: lines, anchorLine: anchorLine};
    }

    public getWord(addr: number) {
        return addr < 0x4000 ? this.ram[addr] << 8 | this.ram[addr + 1] : 0;
    }

    getCharAt(x: number, y: number) {
        const
            drawWidth = !this.textMode ? 256 : 240,
            drawHeight = 192,
            hBorder = (this.width - drawWidth) >> 1,
            vBorder = (this.height - drawHeight) >> 1;
        x -= hBorder;
        y -= vBorder;
        if (x < drawWidth && y < drawHeight) {
            if (!this.textMode) {
                return this.ram[this.nameTable + (x >> 3) + (y >> 3) * 32];
            } else {
                return this.ram[this.nameTable + Math.floor(x / 6) + (y >> 3) * 40];
            }
        }
        return 0;
    }

    setFlicker(value: boolean) {
        this.flicker = value;
        this.enableFlicker = value;
    }

    getGPU(): CPU {
        return undefined;
    }

    drawPaletteImage(canvas: HTMLCanvasElement): void {
        const
            size = 32,
            width = canvas.width = 16 * size + 16,
            height = canvas.height = size,
            canvasContext = canvas.getContext("2d");
        canvasContext.fillStyle = "rgba(255, 255, 255, 1)";
        canvasContext.fillRect(0, 0, width, height);
        let color = 0;
        for (let x = 0; x < width; x += size + 1) {
            const rgbColor  = this.palette[color];
            canvasContext.fillStyle = "rgba(" + rgbColor[0] + "," + rgbColor[1] + "," + rgbColor[2] + ",1)";
            canvasContext.fillRect(x, 0, size, size);
            color++;
        }
    }

    drawTilePatternImage(canvas: HTMLCanvasElement, section: number, gap: boolean) {
        const
            baseWidth = 256,
            width = canvas.width = baseWidth + (gap ? 32 : 0),
            baseHeight = 64,
            height = canvas.height = baseHeight + (gap ? 8 : 0),
            canvasContext = canvas.getContext("2d"),
            imageData = canvasContext.createImageData(width, height),
            screenMode = this.screenMode,
            ram = this.ram,
            baseTableOffset = section << 11,
            colorTable = this.colorTable,
            charPatternTable = this.charPatternTable,
            colorTableMask = this.colorTableMask,
            patternTableMask = this.patternTableMask,
            palette = this.palette,
            fgColor = this.fgColor,
            bgColor = this.bgColor,
            imageDataData = imageData.data;
        let
            name: number,
            tableOffset: number,
            colorByte: number,
            patternByte: number,
            color: number,
            rowNameOffset: number,
            lineOffset: number,
            pixelOffset: number,
            rgbColor: number[],
            imageDataAddr = 0;
        for (let y = 0; y < baseHeight; y++) {
            rowNameOffset = (y >> 3) << 5;
            lineOffset = y & 7;
            for (let x = 0; x < baseWidth; x++) {
                color = 0;
                pixelOffset = x & 7;
                switch (screenMode) {
                    case ScreenMode.MODE_GRAPHICS:
                        name = rowNameOffset + (x >> 3);
                        colorByte = ram[colorTable + (name >> 3)];
                        patternByte = ram[charPatternTable + (name << 3) + lineOffset];
                        color = (patternByte & (0x80 >> pixelOffset)) !== 0 ? (colorByte & 0xF0) >> 4 : (colorByte & 0x0F || bgColor);
                        break;
                    case ScreenMode.MODE_BITMAP:
                        name = rowNameOffset + (x >> 3);
                        tableOffset = baseTableOffset + (name << 3);
                        colorByte = ram[colorTable + (tableOffset & colorTableMask) + lineOffset];
                        patternByte = ram[charPatternTable + (tableOffset & patternTableMask) + lineOffset];
                        color = (patternByte & (0x80 >> (x & 7))) !== 0 ? (colorByte & 0xF0) >> 4 : colorByte & 0x0F;
                        break;
                    case ScreenMode.MODE_TEXT:
                        name = rowNameOffset + (x >> 3);
                        patternByte = ram[charPatternTable + (name << 3) + lineOffset];
                        if (pixelOffset < 6) {
                            color = (patternByte & (0x80 >> pixelOffset)) !== 0 ? fgColor : bgColor;
                        } else {
                            color = bgColor;
                        }
                        break;
                }
                rgbColor = palette[color];
                imageDataData[imageDataAddr++] = rgbColor[0]; // R
                imageDataData[imageDataAddr++] = rgbColor[1]; // G
                imageDataData[imageDataAddr++] = rgbColor[2]; // B
                imageDataData[imageDataAddr++] = 255; // Alpha
                if (gap && pixelOffset === 7) {
                    imageDataAddr += 4;
                }
            }
            if (gap && lineOffset === 7) {
                imageDataAddr += width * 4;
            }
        }
        canvasContext.putImageData(imageData, 0, 0);
    }

    drawSpritePatternImage(canvas: HTMLCanvasElement, gap: boolean) {
        const
            baseWidth = 256,
            width = canvas.width = baseWidth + (gap ? 16 : 0),
            baseHeight = 64,
            height = canvas.height = baseHeight + (gap ? 4 : 0),
            canvasContext = canvas.getContext("2d"),
            imageData = canvasContext.createImageData(width, height),
            ram = this.ram,
            spritePatternTable = this.spritePatternTable,
            spriteAttributeTable = this.spriteAttributeTable,
            palette = this.palette,
            patternColorMap = this.spritePatternColorMap,
            imageDataData = imageData.data;
        let
            pattern: number,
            patternByte: number,
            rowPatternOffset: number,
            lineOffset: number,
            pixelOffset: number,
            rgbColor: number[],
            imageDataAddr = 0;
        for (let i = 0; i < 128 && ram[spriteAttributeTable + i] !== 0xd0; i += 4) {
            if (ram[spriteAttributeTable] < 0xbf) {
                pattern = ram[spriteAttributeTable + i + 2];
                patternColorMap[pattern] = ram[spriteAttributeTable + i + 3] & 0x0f;
            }
        }
        for (let y = 0; y < baseHeight; y++) {
            rowPatternOffset = ((y >> 4) << 6) + ((y & 8) >> 3);
            lineOffset = y & 7;
            for (let x = 0; x < baseWidth; x++) {
                pixelOffset = x & 7;
                pattern = rowPatternOffset + ((x >> 3) << 1);
                patternByte = ram[spritePatternTable + (pattern << 3) + lineOffset];
                rgbColor = (patternByte & (0x80 >> pixelOffset)) !== 0 ? palette[(patternColorMap[pattern & 0xfc] || 0)] : [224, 224, 255];
                imageDataData[imageDataAddr++] = rgbColor[0]; // R
                imageDataData[imageDataAddr++] = rgbColor[1]; // G
                imageDataData[imageDataAddr++] = rgbColor[2]; // B
                imageDataData[imageDataAddr++] = 255; // Alpha
                if (gap && pixelOffset === 7 && (x & 8) === 8) {
                    imageDataAddr += 4;
                }
            }
            if (gap && lineOffset === 7 && (y & 8) === 8) {
                imageDataAddr += width * 4;
            }
        }
        canvasContext.putImageData(imageData, 0, 0);
    }

    getState(): object {
        return {
            ram: this.ram,
            registers: this.registers,
            addressRegister: this.addressRegister,
            statusRegister: this.statusRegister,
            latch: this.latch,
            prefetchByte: this.prefetchByte,
            displayOn: this.displayOn,
            interruptsOn: this.interruptsOn,
            screenMode: this.screenMode,
            bitmapMode: this.bitmapMode,
            textMode: this.textMode,
            colorTable: this.colorTable,
            nameTable: this.nameTable,
            charPatternTable: this.charPatternTable,
            spriteAttributeTable: this.spriteAttributeTable,
            spritePatternTable: this.spritePatternTable,
            colorTableMask: this.colorTableMask,
            patternTableMask: this.patternTableMask,
            ramMask: this.ramMask,
            fgColor: this.fgColor,
            bgColor: this.bgColor,
            flicker: this.flicker
        };
    }

    restoreState(state: any) {
        this.ram = state.ram;
        this.registers = state.registers;
        this.addressRegister = state.addressRegister;
        this.statusRegister = state.statusRegister;
        this.latch = state.latch;
        this.prefetchByte = state.prefetchByte;
        this.displayOn = state.displayOn;
        this.interruptsOn = state.interruptsOn;
        this.screenMode = state.screenMode;
        this.bitmapMode = state.bitmapMode;
        this.textMode = state.textMode;
        this.colorTable = state.colorTable;
        this.nameTable = state.nameTable;
        this.charPatternTable = state.charPatternTable;
        this.spriteAttributeTable = state.spriteAttributeTable;
        this.spritePatternTable = state.spritePatternTable;
        this.colorTableMask = state.colorTableMask;
        this.patternTableMask = state.patternTableMask;
        this.ramMask = state.ramMask;
        this.fgColor = state.fgColor;
        this.bgColor = state.bgColor;
        this.flicker = state.flicker;
        this.redrawRequired = true;
    }
}
