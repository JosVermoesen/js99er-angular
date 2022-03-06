import {CPU} from "../interfaces/cpu";
import {Log} from "../../classes/log";
import {Util} from "../../classes/util";

export class TIPI {

    static TD_OUT = 0x5FFE; // TI Data (output)
    static TC_OUT = 0x5FFC; // TI Control Signal (output)
    static RD_IN = 0x5FFA;  // PI Data (input)
    static RC_IN = 0x5FF8;  // PI Control Signal (input)

    static DSR_ROM = [
        0xAA, 0x01, 0x00, 0x00, 0x4C, 0x1C, 0x00, 0x00,
        0x4C, 0x20, 0x4C, 0x8A, 0x00, 0x00, 0x00, 0x00,
        0x41, 0xD0, 0x40, 0xD4, 0x42, 0x4A, 0x41, 0x4C,
        0x00, 0x00, 0x32, 0x30, 0x32, 0x31, 0x2D, 0x30,
        0x32, 0x2D, 0x32, 0x34, 0x54, 0x32, 0x31, 0x3A,
        0x34, 0x36, 0x3A, 0x31, 0x38, 0x2D, 0x30, 0x38,
        0x3A, 0x30, 0x30, 0x00, 0x83, 0xE0, 0x40, 0x38,
        0xC0, 0x1D, 0x02, 0x60, 0x80, 0x00, 0x06, 0xC0,
        0xD8, 0x00, 0x8C, 0x02, 0x06, 0xC0, 0xD8, 0x00,
        0x8C, 0x02, 0x03, 0x80, 0x83, 0xE0, 0x40, 0x50,
        0xC0, 0x1D, 0xC0, 0x6D, 0x00, 0x02, 0xC0, 0xAD,
        0x00, 0x04, 0x02, 0x60, 0x40, 0x00, 0x06, 0xC0,
        0xD8, 0x00, 0x8C, 0x02, 0x06, 0xC0, 0xD8, 0x00,
        0x8C, 0x02, 0xD8, 0x31, 0x8C, 0x00, 0x06, 0x02,
        0x16, 0xFC, 0x03, 0x80, 0x83, 0xE0, 0x40, 0x78,
        0xC0, 0x1D, 0xC0, 0x6D, 0x00, 0x02, 0xC0, 0xAD,
        0x00, 0x04, 0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02,
        0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02, 0xDC, 0x20,
        0x88, 0x00, 0x06, 0x02, 0x16, 0xFC, 0x03, 0x80,
        0x83, 0xE0, 0x40, 0x9C, 0xC0, 0x1D, 0xC0, 0x6D,
        0x00, 0x02, 0xC0, 0xAD, 0x00, 0x04, 0x06, 0xC1,
        0xD8, 0x01, 0x8C, 0x02, 0x06, 0xC1, 0xD8, 0x01,
        0x8C, 0x02, 0xD1, 0x20, 0x88, 0x00, 0x02, 0x60,
        0x40, 0x00, 0x06, 0xC0, 0xD8, 0x00, 0x8C, 0x02,
        0x06, 0xC0, 0xD8, 0x00, 0x8C, 0x02, 0xD8, 0x04,
        0x8C, 0x00, 0x05, 0x80, 0x05, 0x81, 0x06, 0x02,
        0x16, 0xEA, 0x03, 0x80, 0x02, 0x02, 0xF1, 0x00,
        0xD8, 0x02, 0x5F, 0xFD, 0x90, 0xA0, 0x5F, 0xF9,
        0x16, 0xFD, 0x02, 0x02, 0x02, 0x00, 0xD8, 0x00,
        0x5F, 0xFF, 0xD8, 0x02, 0x5F, 0xFD, 0xD0, 0xE0,
        0x5F, 0xF9, 0x90, 0xC2, 0x16, 0xFC, 0x02, 0x22,
        0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62,
        0x02, 0x00, 0x06, 0xC0, 0xD8, 0x00, 0x5F, 0xFF,
        0xD8, 0x02, 0x5F, 0xFD, 0xD0, 0xE0, 0x5F, 0xF9,
        0x90, 0xC2, 0x16, 0xFC, 0x02, 0x22, 0x01, 0x00,
        0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x02, 0x00,
        0x06, 0xC0, 0x02, 0x80, 0x00, 0x00, 0x13, 0x11,
        0xD8, 0x11, 0x5F, 0xFF, 0xD8, 0x02, 0x5F, 0xFD,
        0xD0, 0xE0, 0x5F, 0xF9, 0x90, 0xC2, 0x16, 0xFC,
        0x02, 0x22, 0x01, 0x00, 0x02, 0x42, 0x01, 0x00,
        0x02, 0x62, 0x02, 0x00, 0x05, 0x81, 0x06, 0x00,
        0x16, 0xEF, 0x04, 0x5B, 0x02, 0x02, 0xF1, 0x00,
        0xD8, 0x02, 0x5F, 0xFD, 0x90, 0xA0, 0x5F, 0xF9,
        0x16, 0xFD, 0x02, 0x02, 0x02, 0x00, 0xD8, 0x00,
        0x5F, 0xFF, 0xD8, 0x02, 0x5F, 0xFD, 0xD0, 0xE0,
        0x5F, 0xF9, 0x90, 0xC2, 0x16, 0xFC, 0x02, 0x22,
        0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62,
        0x02, 0x00, 0x06, 0xC0, 0xD8, 0x00, 0x5F, 0xFF,
        0xD8, 0x02, 0x5F, 0xFD, 0xD0, 0xE0, 0x5F, 0xF9,
        0x90, 0xC2, 0x16, 0xFC, 0x02, 0x22, 0x01, 0x00,
        0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x02, 0x00,
        0x06, 0xC0, 0x02, 0x80, 0x00, 0x00, 0x13, 0x17,
        0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02, 0x06, 0xC1,
        0xD8, 0x01, 0x8C, 0x02, 0xD8, 0x20, 0x88, 0x00,
        0x5F, 0xFF, 0xD8, 0x02, 0x5F, 0xFD, 0xD0, 0xE0,
        0x5F, 0xF9, 0x90, 0xC2, 0x16, 0xFC, 0x02, 0x22,
        0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62,
        0x02, 0x00, 0x06, 0x00, 0x16, 0xEF, 0x04, 0x5B,
        0x02, 0x02, 0xF1, 0x00, 0xD8, 0x02, 0x5F, 0xFD,
        0x90, 0xA0, 0x5F, 0xF9, 0x16, 0xFD, 0x02, 0x02,
        0x06, 0x00, 0xD8, 0x02, 0x5F, 0xFD, 0xD0, 0xE0,
        0x5F, 0xF9, 0x90, 0xC2, 0x16, 0xFC, 0x02, 0x22,
        0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62,
        0x06, 0x00, 0xD1, 0x20, 0x5F, 0xFB, 0x06, 0xC4,
        0xD8, 0x02, 0x5F, 0xFD, 0xD0, 0xE0, 0x5F, 0xF9,
        0x90, 0xC2, 0x16, 0xFC, 0x02, 0x22, 0x01, 0x00,
        0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x06, 0x00,
        0xD1, 0x20, 0x5F, 0xFB, 0x06, 0xC4, 0x04, 0xC0,
        0x02, 0x84, 0x00, 0x00, 0x13, 0x11, 0xD8, 0x02,
        0x5F, 0xFD, 0xD0, 0xE0, 0x5F, 0xF9, 0x90, 0xC2,
        0x16, 0xFC, 0x02, 0x22, 0x01, 0x00, 0x02, 0x42,
        0x01, 0x00, 0x02, 0x62, 0x06, 0x00, 0xDC, 0x60,
        0x5F, 0xFB, 0x05, 0x80, 0x81, 0x00, 0x16, 0xEF,
        0x04, 0x5B, 0x02, 0x02, 0xF1, 0x00, 0xD8, 0x02,
        0x5F, 0xFD, 0x90, 0xA0, 0x5F, 0xF9, 0x16, 0xFD,
        0x02, 0x02, 0x06, 0x00, 0xD8, 0x02, 0x5F, 0xFD,
        0xD0, 0xE0, 0x5F, 0xF9, 0x90, 0xC2, 0x16, 0xFC,
        0x02, 0x22, 0x01, 0x00, 0x02, 0x42, 0x01, 0x00,
        0x02, 0x62, 0x06, 0x00, 0xD1, 0x20, 0x5F, 0xFB,
        0x06, 0xC4, 0xD8, 0x02, 0x5F, 0xFD, 0xD0, 0xE0,
        0x5F, 0xF9, 0x90, 0xC2, 0x16, 0xFC, 0x02, 0x22,
        0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62,
        0x06, 0x00, 0xD1, 0x20, 0x5F, 0xFB, 0x06, 0xC4,
        0x04, 0xC0, 0x02, 0x84, 0x00, 0x00, 0x13, 0x1A,
        0x02, 0x61, 0x40, 0x00, 0x06, 0xC1, 0xD8, 0x01,
        0x8C, 0x02, 0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02,
        0xD8, 0x02, 0x5F, 0xFD, 0xD0, 0xE0, 0x5F, 0xF9,
        0x90, 0xC2, 0x16, 0xFC, 0x02, 0x22, 0x01, 0x00,
        0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x06, 0x00,
        0xD8, 0x20, 0x5F, 0xFB, 0x8C, 0x00, 0x05, 0x80,
        0x81, 0x00, 0x16, 0xEE, 0x04, 0x5B, 0xAA, 0x3F,
        0xFF, 0x11, 0x03, 0x00, 0x02, 0xA5, 0x04, 0xE0,
        0x5F, 0xFF, 0x04, 0xE0, 0x5F, 0xFD, 0x1D, 0x01,
        0x02, 0x01, 0x02, 0x00, 0x06, 0x01, 0x16, 0xFE,
        0x1E, 0x01, 0x02, 0x8C, 0x11, 0x00, 0x16, 0x14,
        0x02, 0x02, 0x37, 0xD7, 0xC8, 0x02, 0x83, 0x70,
        0x02, 0x01, 0x8C, 0x02, 0x05, 0x82, 0x02, 0x62,
        0x40, 0x00, 0xD4, 0x65, 0x00, 0x05, 0xD4, 0x42,
        0x04, 0xC2, 0xD8, 0x22, 0x42, 0xD6, 0x8C, 0x00,
        0x05, 0x82, 0x02, 0x82, 0x00, 0x05, 0x16, 0xF9,
        0x04, 0x5B, 0x04, 0xC0, 0xD8, 0x00, 0x5F, 0xFF,
        0xD8, 0x00, 0x5F, 0xFD, 0x04, 0x5B, 0x03, 0x00,
        0x00, 0x00, 0xC8, 0x0B, 0x83, 0x5C, 0x02, 0xAA,
        0x02, 0x04, 0x83, 0x56, 0x04, 0xC9, 0xA2, 0x54,
        0x62, 0x60, 0x83, 0x54, 0x02, 0x02, 0x00, 0x0A,
        0x62, 0x42, 0xC8, 0x09, 0x83, 0x5A, 0x06, 0xC9,
        0xD8, 0x09, 0x8C, 0x02, 0x06, 0xC9, 0xD8, 0x09,
        0x8C, 0x02, 0x02, 0x01, 0x00, 0x09, 0xC0, 0x8A,
        0xD8, 0xA0, 0x88, 0x00, 0xFF, 0x84, 0x05, 0x82,
        0x06, 0x01, 0x16, 0xFA, 0x02, 0x00, 0x00, 0x0A,
        0xC0, 0x4A, 0x02, 0x21, 0xFF, 0x84, 0x06, 0xA0,
        0x40, 0xD4, 0xC0, 0x60, 0x83, 0x56, 0x60, 0x60,
        0x83, 0x54, 0x06, 0x01, 0x06, 0xC1, 0xD8, 0x01,
        0x8C, 0x02, 0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02,
        0xD0, 0x20, 0x88, 0x00, 0x09, 0x80, 0x05, 0x81,
        0x06, 0xA0, 0x41, 0x4C, 0x02, 0x00, 0x00, 0x01,
        0xC0, 0x4A, 0x02, 0x21, 0x00, 0x13, 0x04, 0xC9,
        0x06, 0xA0, 0x41, 0xD0, 0x02, 0x89, 0x00, 0x00,
        0x13, 0x05, 0x02, 0x89, 0x00, 0xFF, 0x13, 0x27,
        0xC0, 0x49, 0x16, 0x05, 0x06, 0xA0, 0x43, 0x22,
        0xC2, 0xE0, 0x83, 0x5C, 0x04, 0x5B, 0x0B, 0x31,
        0xF0, 0x6A, 0xFF, 0x85, 0xC0, 0xE0, 0x83, 0x5A,
        0x05, 0x83, 0x02, 0x63, 0x40, 0x00, 0x06, 0xC3,
        0xD8, 0x03, 0x8C, 0x02, 0x06, 0xC3, 0xD8, 0x03,
        0x8C, 0x02, 0xD8, 0x01, 0x8C, 0x00, 0x06, 0xA0,
        0x43, 0x22, 0xC2, 0xE0, 0x83, 0x5C, 0x05, 0xCB,
        0x04, 0x5B, 0x44, 0x18, 0x44, 0x46, 0x44, 0x4A,
        0x44, 0xA8, 0x44, 0xE4, 0x44, 0xE6, 0x44, 0xF4,
        0x45, 0x1C, 0x45, 0x4A, 0x45, 0x1E, 0x04, 0xC1,
        0xDA, 0xAA, 0xFF, 0x84, 0x00, 0x03, 0x0A, 0x11,
        0x02, 0x21, 0x43, 0xF2, 0xC0, 0x51, 0x04, 0x51,
        0x02, 0x00, 0x00, 0x01, 0xC0, 0x4A, 0x02, 0x21,
        0x00, 0x12, 0x06, 0xA0, 0x41, 0xD0, 0xC0, 0xE0,
        0x83, 0x5A, 0x02, 0x23, 0x00, 0x04, 0x02, 0x63,
        0x40, 0x00, 0x06, 0xC3, 0xD8, 0x03, 0x8C, 0x02,
        0x06, 0xC3, 0xD8, 0x03, 0x8C, 0x02, 0xD8, 0x09,
        0x8C, 0x00, 0x04, 0x60, 0x45, 0x4A, 0x04, 0x60,
        0x45, 0x4A, 0xC0, 0x2A, 0xFF, 0x8A, 0xC0, 0x6A,
        0xFF, 0x86, 0x06, 0xA0, 0x42, 0x4A, 0x06, 0xC0,
        0xC0, 0xE0, 0x83, 0x5A, 0x02, 0x23, 0x00, 0x05,
        0x02, 0x63, 0x40, 0x00, 0x06, 0xC3, 0xD8, 0x03,
        0x8C, 0x02, 0x06, 0xC3, 0xD8, 0x03, 0x8C, 0x02,
        0xD8, 0x00, 0x8C, 0x00, 0xC0, 0x6A, 0xFF, 0x84,
        0x02, 0x41, 0x00, 0x10, 0x16, 0x66, 0xC0, 0x6A,
        0xFF, 0x8A, 0x05, 0x81, 0xC0, 0xE0, 0x83, 0x5A,
        0x02, 0x23, 0x00, 0x06, 0x02, 0x63, 0x40, 0x00,
        0x06, 0xC3, 0xD8, 0x03, 0x8C, 0x02, 0x06, 0xC3,
        0xD8, 0x03, 0x8C, 0x02, 0xD8, 0x01, 0x8C, 0x00,
        0xD8, 0x2A, 0x00, 0x03, 0x8C, 0x00, 0x10, 0x51,
        0x04, 0xC0, 0xD0, 0x6A, 0xFF, 0x85, 0x02, 0x41,
        0x10, 0x00, 0x16, 0x03, 0xD0, 0x2A, 0xFF, 0x88,
        0x10, 0x02, 0xD0, 0x2A, 0xFF, 0x89, 0x06, 0xC0,
        0xC0, 0x6A, 0xFF, 0x86, 0x06, 0xA0, 0x41, 0x4C,
        0x02, 0x00, 0x00, 0x01, 0xC0, 0x4A, 0x02, 0x21,
        0x00, 0x13, 0x04, 0xC9, 0x06, 0xA0, 0x41, 0xD0,
        0x02, 0x89, 0x00, 0xFF, 0x13, 0xCB, 0xC0, 0x49,
        0x04, 0x60, 0x43, 0xC6, 0x10, 0x32, 0xC0, 0x2A,
        0xFF, 0x8A, 0xC0, 0x6A, 0xFF, 0x86, 0x06, 0xA0,
        0x42, 0x4A, 0x10, 0x2B, 0xC0, 0x2A, 0xFF, 0x8A,
        0xC0, 0x6A, 0xFF, 0x86, 0x06, 0xA0, 0x41, 0x4C,
        0x02, 0x00, 0x00, 0x01, 0xC0, 0x4A, 0x02, 0x21,
        0x00, 0x13, 0x04, 0xC9, 0x06, 0xA0, 0x41, 0xD0,
        0x02, 0x89, 0x00, 0xFF, 0x13, 0x1A, 0xC0, 0x49,
        0x04, 0x60, 0x43, 0xC6, 0x10, 0x16, 0x02, 0x00,
        0x00, 0x01, 0xC0, 0x4A, 0x02, 0x21, 0x00, 0x12,
        0x06, 0xA0, 0x41, 0xD0, 0xC0, 0xE0, 0x83, 0x5A,
        0x02, 0x23, 0x00, 0x08, 0x02, 0x63, 0x40, 0x00,
        0x06, 0xC3, 0xD8, 0x03, 0x8C, 0x02, 0x06, 0xC3,
        0xD8, 0x03, 0x8C, 0x02, 0xD8, 0x09, 0x8C, 0x00,
        0x10, 0x00, 0x06, 0xA0, 0x43, 0x22, 0xC2, 0xE0,
        0x83, 0x5C, 0x05, 0xCB, 0x04, 0x5B, 0x12, 0x13,
        0x14, 0x15, 0x17, 0x18, 0x19, 0x1A, 0x03, 0x00,
        0x00, 0x00, 0xC1, 0xCB, 0x02, 0x00, 0x00, 0x01,
        0x02, 0x01, 0x45, 0x56, 0x06, 0xA0, 0x40, 0xD4,
        0x02, 0x00, 0x00, 0x02, 0x02, 0x01, 0x83, 0x4C,
        0x06, 0xA0, 0x40, 0xD4, 0x02, 0x00, 0x00, 0x0A,
        0xC0, 0x60, 0x83, 0x4E, 0x06, 0xA0, 0x41, 0x4C,
        0x04, 0x60, 0x47, 0xD6, 0x03, 0x00, 0x00, 0x00,
        0xC1, 0xCB, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01,
        0x45, 0x57, 0x06, 0xA0, 0x40, 0xD4, 0x02, 0x00,
        0x00, 0x01, 0x02, 0x01, 0x83, 0x4C, 0x06, 0xA0,
        0x40, 0xD4, 0x02, 0x00, 0x00, 0x0A, 0xC0, 0x60,
        0x83, 0x4E, 0x06, 0xA0, 0x41, 0x4C, 0x02, 0x00,
        0x00, 0x0A, 0xC0, 0x60, 0x83, 0x50, 0x06, 0xA0,
        0x41, 0x4C, 0x04, 0x60, 0x47, 0xD6, 0x03, 0x00,
        0x00, 0x00, 0xC1, 0xCB, 0x02, 0x00, 0x00, 0x01,
        0x02, 0x01, 0x45, 0x58, 0x06, 0xA0, 0x40, 0xD4,
        0x02, 0x00, 0x00, 0x02, 0x02, 0x01, 0x83, 0x4C,
        0x06, 0xA0, 0x40, 0xD4, 0x02, 0x00, 0x00, 0x0A,
        0xC0, 0x60, 0x83, 0x4E, 0x06, 0xA0, 0x41, 0x4C,
        0x04, 0xC8, 0xD2, 0x20, 0x83, 0x50, 0x06, 0xC8,
        0x02, 0x28, 0x83, 0x00, 0x02, 0x00, 0x00, 0x02,
        0xC0, 0x48, 0x05, 0xC1, 0x06, 0xA0, 0x40, 0xD4,
        0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x83, 0x50,
        0x06, 0xA0, 0x41, 0xD0, 0x04, 0xC3, 0xD0, 0xE0,
        0x83, 0x50, 0x06, 0xC3, 0x02, 0x83, 0x00, 0xFF,
        0x13, 0x04, 0x0B, 0x33, 0xD8, 0x03, 0x83, 0x50,
        0x10, 0x65, 0xD8, 0x03, 0x83, 0x50, 0x02, 0x00,
        0x00, 0x08, 0xC0, 0x48, 0x05, 0xC1, 0x06, 0xA0,
        0x41, 0xD0, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01,
        0x83, 0x4D, 0x06, 0xA0, 0x41, 0xD0, 0xD8, 0x20,
        0x83, 0x4D, 0x83, 0x4D, 0x13, 0x53, 0x02, 0x00,
        0x01, 0x00, 0xC0, 0x58, 0x06, 0xA0, 0x42, 0x4A,
        0x10, 0x4D, 0x03, 0x00, 0x00, 0x00, 0xC1, 0xCB,
        0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x45, 0x59,
        0x06, 0xA0, 0x40, 0xD4, 0x02, 0x00, 0x00, 0x02,
        0x02, 0x01, 0x83, 0x4C, 0x06, 0xA0, 0x40, 0xD4,
        0x02, 0x00, 0x00, 0x0A, 0xC0, 0x60, 0x83, 0x4E,
        0x06, 0xA0, 0x41, 0x4C, 0x04, 0xC8, 0xD2, 0x20,
        0x83, 0x50, 0x06, 0xC8, 0x02, 0x28, 0x83, 0x00,
        0x02, 0x00, 0x00, 0x08, 0xC0, 0x48, 0x05, 0xC1,
        0x06, 0xA0, 0x40, 0xD4, 0x02, 0x00, 0x00, 0x01,
        0x02, 0x01, 0x83, 0x50, 0x06, 0xA0, 0x41, 0xD0,
        0x04, 0xC3, 0xD0, 0xE0, 0x83, 0x50, 0x06, 0xC3,
        0x02, 0x83, 0x00, 0xFF, 0x13, 0x04, 0x0B, 0x33,
        0xD8, 0x03, 0x83, 0x50, 0x10, 0x1B, 0x04, 0xC0,
        0xD0, 0x20, 0x83, 0x4D, 0x13, 0x09, 0xC0, 0x58,
        0x06, 0xA0, 0x41, 0x4C, 0x02, 0x00, 0x00, 0x01,
        0x02, 0x01, 0x83, 0x50, 0x06, 0xA0, 0x41, 0xD0,
        0x04, 0xC3, 0xD0, 0xE0, 0x83, 0x50, 0x06, 0xC3,
        0x02, 0x83, 0x00, 0xFF, 0x13, 0x04, 0x0B, 0x33,
        0xD8, 0x03, 0x83, 0x50, 0x10, 0x03, 0xD8, 0x03,
        0x83, 0x50, 0x10, 0x00, 0xC2, 0xC7, 0x05, 0xCB,
        0x04, 0x5B, 0x03, 0x00, 0x00, 0x00, 0xC1, 0xCB,
        0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x45, 0x5A,
        0x06, 0xA0, 0x40, 0xD4, 0x02, 0x00, 0x00, 0x01,
        0x02, 0x01, 0x83, 0x4C, 0x06, 0xA0, 0x40, 0xD4,
        0xC0, 0x60, 0x83, 0x4E, 0x06, 0xC1, 0xD8, 0x01,
        0x8C, 0x02, 0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02,
        0x04, 0xC0, 0xD0, 0x20, 0x88, 0x00, 0x06, 0xC0,
        0xC0, 0x60, 0x83, 0x4E, 0x05, 0x81, 0x06, 0xA0,
        0x41, 0x4C, 0x10, 0x4D, 0x03, 0x00, 0x00, 0x00,
        0xC1, 0xCB, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01,
        0x45, 0x5B, 0x06, 0xA0, 0x40, 0xD4, 0x02, 0x00,
        0x00, 0x01, 0x02, 0x01, 0x83, 0x4C, 0x06, 0xA0,
        0x40, 0xD4, 0x02, 0x00, 0x00, 0x0A, 0xC0, 0x60,
        0x83, 0x4E, 0x06, 0xA0, 0x41, 0x4C, 0x10, 0x37,
        0x03, 0x00, 0x00, 0x00, 0xC1, 0xCB, 0x02, 0x00,
        0x00, 0x01, 0x02, 0x01, 0x45, 0x5C, 0x06, 0xA0,
        0x40, 0xD4, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01,
        0x83, 0x4C, 0x06, 0xA0, 0x40, 0xD4, 0x02, 0x00,
        0x00, 0x0A, 0xC0, 0x60, 0x83, 0x4E, 0x06, 0xA0,
        0x41, 0x4C, 0x10, 0x21, 0x03, 0x00, 0x00, 0x00,
        0xC1, 0xCB, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01,
        0x45, 0x5D, 0x06, 0xA0, 0x40, 0xD4, 0x02, 0x00,
        0x00, 0x01, 0x02, 0x01, 0x83, 0x4C, 0x06, 0xA0,
        0x40, 0xD4, 0x02, 0x00, 0x00, 0x0A, 0xC0, 0x60,
        0x83, 0x4E, 0x06, 0xA0, 0x41, 0x4C, 0x02, 0x00,
        0x00, 0x0A, 0xC0, 0x60, 0x83, 0x50, 0x06, 0xA0,
        0x41, 0x4C, 0x10, 0x05, 0xC2, 0xC7, 0x05, 0xCB,
        0x04, 0x5B, 0xC2, 0xC7, 0x04, 0x5B, 0x02, 0x00,
        0x00, 0x01, 0x02, 0x01, 0x83, 0x50, 0x06, 0xA0,
        0x41, 0xD0, 0xD8, 0x20, 0x83, 0x50, 0x83, 0x50,
        0x13, 0xF4, 0x04, 0xC0, 0xD8, 0x20, 0x83, 0x50,
        0x83, 0xE1, 0x02, 0x80, 0x00, 0xFF, 0x13, 0x04,
        0x0B, 0x30, 0xD8, 0x00, 0x83, 0x50, 0x10, 0xE6,
        0xD8, 0x00, 0x83, 0x50, 0x10, 0xE3, 0x03, 0x00,
        0x00, 0x00, 0xC1, 0xCB, 0x02, 0x8C, 0x11, 0x00,
        0x16, 0xE0, 0x06, 0xA0, 0x48, 0x18, 0x10, 0xDA,
        0x04, 0xC1, 0xD0, 0x60, 0x83, 0x4C, 0x06, 0xC1,
        0x02, 0x81, 0x00, 0x00, 0x13, 0x2A, 0x02, 0x81,
        0x00, 0x0F, 0x15, 0x27, 0x38, 0x60, 0x48, 0x84,
        0xC0, 0x42, 0x02, 0x21, 0x00, 0x06, 0x02, 0x02,
        0x3D, 0xEF, 0x60, 0x81, 0xC8, 0x02, 0x83, 0x70,
        0xC0, 0x42, 0x05, 0x81, 0x02, 0x61, 0x40, 0x00,
        0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02, 0x06, 0xC1,
        0xD8, 0x01, 0x8C, 0x02, 0x02, 0x02, 0xAA, 0x3F,
        0xD8, 0x02, 0x8C, 0x00, 0x06, 0xC2, 0xD8, 0x02,
        0x8C, 0x00, 0x02, 0x02, 0xFF, 0x11, 0xD8, 0x02,
        0x8C, 0x00, 0x06, 0xC2, 0xD8, 0x02, 0x8C, 0x00,
        0xD8, 0x20, 0x83, 0x4C, 0x8C, 0x00, 0x04, 0xC1,
        0x10, 0x02, 0x02, 0x01, 0x00, 0x01, 0xD8, 0x01,
        0x83, 0x50, 0x04, 0x5B, 0x02, 0x06, 0x04, 0xE0,
        0x83, 0x5C, 0x02, 0x00, 0x00, 0x0A, 0x02, 0x01,
        0x10, 0x9C, 0x06, 0xA0, 0x41, 0x4C, 0x02, 0x00,
        0x10, 0xA5, 0x06, 0xC0, 0xD8, 0x00, 0x8C, 0x02,
        0x06, 0xC0, 0xD8, 0x00, 0x8C, 0x02, 0x04, 0xC0,
        0xD0, 0x20, 0x88, 0x00, 0x06, 0xC0, 0x02, 0x01,
        0x10, 0xA6, 0x06, 0xA0, 0x41, 0x4C, 0x02, 0xAA,
        0x02, 0x00, 0x00, 0x01, 0xC0, 0x4A, 0x04, 0xC9,
        0x02, 0x21, 0x00, 0x13, 0x06, 0xA0, 0x41, 0xD0,
        0x02, 0x89, 0x00, 0xFF, 0x13, 0x01, 0x10, 0x4C,
        0x02, 0x00, 0x20, 0x06, 0x02, 0x01, 0x13, 0x80,
        0x06, 0xA0, 0x42, 0x4A, 0x02, 0x00, 0x00, 0x06,
        0xA0, 0x0A, 0x02, 0x01, 0x13, 0x80, 0x02, 0x02,
        0x00, 0x06, 0x04, 0x20, 0x40, 0x74, 0xC8, 0x20,
        0x83, 0x5C, 0x83, 0x5C, 0x16, 0x02, 0xC8, 0x05,
        0x83, 0x5C, 0xC0, 0x05, 0x02, 0x01, 0x13, 0x86,
        0xC0, 0x84, 0x04, 0x20, 0x40, 0x74, 0xC0, 0xC3,
        0x16, 0x04, 0xC8, 0x20, 0x83, 0x5C, 0x83, 0xE8,
        0x10, 0x6F, 0x02, 0x00, 0x10, 0x9C, 0x02, 0x01,
        0x49, 0x6C, 0x02, 0x02, 0x00, 0x08, 0x04, 0x20,
        0x40, 0x4C, 0x02, 0x00, 0x10, 0xA5, 0x06, 0xC0,
        0xD8, 0x00, 0x8C, 0x02, 0x06, 0xC0, 0xD8, 0x00,
        0x8C, 0x02, 0x04, 0xC1, 0xD0, 0x60, 0x88, 0x00,
        0x06, 0xC1, 0xA0, 0x01, 0x06, 0xC0, 0xD8, 0x00,
        0x8C, 0x02, 0x06, 0xC0, 0xD8, 0x00, 0x8C, 0x02,
        0x04, 0xC1, 0xD0, 0x60, 0x88, 0x00, 0x02, 0x21,
        0x01, 0x00, 0x02, 0x60, 0x40, 0x00, 0x06, 0xC0,
        0xD8, 0x00, 0x8C, 0x02, 0x06, 0xC0, 0xD8, 0x00,
        0x8C, 0x02, 0xD8, 0x01, 0x8C, 0x00, 0x10, 0x91,
        0x04, 0x20, 0x00, 0x00, 0x05, 0x00, 0x13, 0x80,
        0x00, 0x00, 0x20, 0x06, 0x00, 0x0F, 0xC3, 0xCB,
        0x06, 0xA0, 0x49, 0x86, 0xD8, 0x01, 0x8C, 0x00,
        0x06, 0x00, 0x16, 0xFC, 0x04, 0x5F, 0x06, 0xC2,
        0xD8, 0x02, 0x8C, 0x02, 0x06, 0xC2, 0xD8, 0x02,
        0x8C, 0x02, 0x04, 0x5B, 0xD8, 0x00, 0x9C, 0x02,
        0x06, 0xC0, 0xD8, 0x00, 0x9C, 0x02, 0x04, 0x5B,
        0xD0, 0x20, 0x98, 0x00, 0x06, 0xC0, 0xD0, 0x20,
        0x98, 0x00, 0x06, 0xC0, 0x04, 0x5B, 0xC2, 0x8B,
        0x06, 0xA0, 0x49, 0x94, 0x06, 0xA0, 0x49, 0xA0,
        0x02, 0x40, 0x1F, 0xFF, 0x02, 0x20, 0x00, 0x03,
        0x06, 0xA0, 0x49, 0x94, 0x06, 0xA0, 0x49, 0xA0,
        0x06, 0xA0, 0x49, 0x94, 0x06, 0xC1, 0xD8, 0x01,
        0x8C, 0x02, 0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02,
        0x04, 0xC0, 0xD8, 0x00, 0x8C, 0x00, 0xC0, 0x03,
        0xD8, 0x20, 0x98, 0x00, 0x8C, 0x00, 0x06, 0x00,
        0x16, 0xFB, 0x06, 0x02, 0x16, 0xF6, 0x04, 0x5A,
        0x02, 0x01, 0x4A, 0xE2, 0x02, 0x02, 0x00, 0x08,
        0x04, 0xC0, 0xD0, 0x31, 0x06, 0xC0, 0x04, 0x20,
        0x40, 0x34, 0x02, 0x20, 0x01, 0x00, 0x06, 0xC0,
        0x06, 0x02, 0x16, 0xF7, 0x02, 0x02, 0x02, 0xFF,
        0x04, 0xC1, 0x06, 0xA0, 0x49, 0x86, 0xD0, 0x60,
        0x88, 0x00, 0x02, 0x21, 0xA0, 0x00, 0x02, 0x81,
        0x1F, 0x00, 0x16, 0x02, 0x02, 0x21, 0x01, 0x00,
        0x02, 0x62, 0x40, 0x00, 0x06, 0xA0, 0x49, 0x86,
        0xD8, 0x01, 0x8C, 0x00, 0x02, 0x42, 0x3F, 0xFF,
        0x06, 0x02, 0x18, 0xEB, 0x02, 0x02, 0x40, 0x00,
        0x02, 0x01, 0x20, 0x00, 0x02, 0x00, 0x10, 0x00,
        0x06, 0xA0, 0x49, 0x76, 0x02, 0x03, 0x00, 0x07,
        0x02, 0x00, 0x00, 0x4A, 0x02, 0x01, 0x4B, 0x00,
        0x02, 0x02, 0x00, 0x1F, 0x06, 0xA0, 0x49, 0xAE,
        0x02, 0x00, 0x00, 0x18, 0x02, 0x01, 0x49, 0x00,
        0x02, 0x02, 0x00, 0x40, 0x06, 0xA0, 0x49, 0xAE,
        0x02, 0x00, 0x08, 0x50, 0x02, 0x01, 0x4A, 0xEA,
        0x02, 0x02, 0x00, 0x08, 0x04, 0x20, 0x40, 0x4C,
        0x02, 0x00, 0x08, 0xF0, 0x02, 0x01, 0x4A, 0xF2,
        0x02, 0x02, 0x00, 0x10, 0x04, 0x20, 0x40, 0x4C,
        0x02, 0x02, 0x43, 0x80, 0x02, 0x01, 0x13, 0x00,
        0x02, 0x00, 0x00, 0x20, 0x06, 0xA0, 0x49, 0x76,
        0x02, 0xE0, 0x83, 0xE0, 0x02, 0x01, 0x83, 0x00,
        0x02, 0x02, 0x00, 0xC0, 0x04, 0xF1, 0x06, 0x42,
        0x16, 0xFD, 0x02, 0x01, 0x00, 0x12, 0x02, 0x02,
        0x83, 0x20, 0x04, 0xC3, 0xCC, 0xA3, 0x4A, 0xD0,
        0x05, 0xC3, 0x06, 0x41, 0x16, 0xFB, 0xC8, 0x20,
        0x83, 0xE8, 0x83, 0x00, 0x04, 0x60, 0x83, 0x20,
        0x1E, 0x00, 0x04, 0xCC, 0x02, 0x0D, 0x98, 0x00,
        0x02, 0x0E, 0x01, 0x08, 0x02, 0x0F, 0x8C, 0x02,
        0x04, 0x54, 0x00, 0xE0, 0x00, 0x0E, 0x01, 0x06,
        0x00, 0xF3, 0x3C, 0x42, 0x99, 0xA1, 0xA1, 0x99,
        0x42, 0x3C, 0x70, 0x70, 0x70, 0x70, 0x70, 0x70,
        0x70, 0x70, 0x00, 0x7E, 0x42, 0x42, 0x42, 0x42,
        0x7E, 0x00, 0x0C, 0x54, 0x49, 0x50, 0x49, 0x2E,
        0x54, 0x49, 0x50, 0x49, 0x43, 0x46, 0x47, 0x00,
        0x03, 0x00, 0x00, 0x00, 0x02, 0xE0, 0x83, 0x00,
        0xC2, 0x20, 0x83, 0x2C, 0x02, 0x00, 0x10, 0x9C,
        0x02, 0x01, 0x49, 0x6C, 0x02, 0x02, 0x00, 0x0A,
        0x04, 0x20, 0x40, 0x4C, 0x02, 0x20, 0x00, 0x09,
        0xC0, 0x48, 0x02, 0x21, 0x00, 0x05, 0x06, 0xC1,
        0xD8, 0x01, 0x8C, 0x02, 0x06, 0xC1, 0xD8, 0x01,
        0x8C, 0x02, 0x04, 0xC9, 0xD2, 0x60, 0x88, 0x00,
        0x02, 0x89, 0xB7, 0x00, 0x13, 0x07, 0x02, 0x01,
        0x4B, 0x02, 0x02, 0x02, 0x00, 0x0D, 0x04, 0x20,
        0x40, 0x4C, 0x10, 0x11, 0xC0, 0x48, 0x02, 0x21,
        0x00, 0x07, 0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02,
        0x06, 0xC1, 0xD8, 0x01, 0x8C, 0x02, 0x04, 0xC9,
        0xD2, 0x60, 0x88, 0x00, 0xC0, 0x89, 0x06, 0xC2,
        0x05, 0x82, 0x04, 0x20, 0x40, 0x98, 0x04, 0x60,
        0x48, 0x86, 0x58, 0x20, 0x83, 0x42, 0x83, 0x42,
        0x10, 0x04, 0x02, 0x00, 0x07, 0x00, 0xD8, 0x00,
        0x83, 0x42, 0xC8, 0x08, 0x83, 0x2C, 0x06, 0xC8,
        0xD8, 0x08, 0x8C, 0x02, 0x06, 0xC8, 0xD8, 0x08,
        0x8C, 0x02, 0xC2, 0xE0, 0x83, 0x5C, 0x05, 0xCB,
        0x02, 0x08, 0x40, 0x00, 0x58, 0x08, 0x83, 0x54,
        0x04, 0x5B, 0x03, 0x00, 0x00, 0x00, 0x02, 0x8C,
        0x11, 0x00, 0x16, 0x2F, 0xC8, 0x0B, 0x83, 0x5C,
        0x02, 0xA9, 0xC2, 0x20, 0x83, 0x2C, 0x02, 0x28,
        0x00, 0x07, 0x06, 0xC8, 0xD8, 0x08, 0x8C, 0x02,
        0x06, 0xC8, 0xD8, 0x08, 0x8C, 0x02, 0xD0, 0xA0,
        0x88, 0x00, 0xDA, 0x60, 0x88, 0x00, 0x00, 0x05,
        0x02, 0x82, 0xC8, 0x01, 0x16, 0xD2, 0x04, 0xC2,
        0xD0, 0xA0, 0x88, 0x00, 0x06, 0xC2, 0x02, 0x22,
        0x00, 0xD0, 0x02, 0x42, 0x00, 0xFF, 0x13, 0xC9,
        0x02, 0x82, 0x00, 0x09, 0x1B, 0xC6, 0xD8, 0x29,
        0x00, 0x05, 0x83, 0x4C, 0x06, 0xA0, 0x48, 0x18,
        0xD8, 0x20, 0x83, 0x50, 0x83, 0x50, 0x16, 0xBD,
        0xC2, 0x20, 0x83, 0x2C, 0x02, 0x28, 0x00, 0x0C,
        0x10, 0xB4, 0x04, 0x5B, 0x00, 0x00, 0x42, 0xDC,
        0x4C, 0x2A, 0x43, 0x2E, 0x04, 0x54, 0x49, 0x50,
        0x49, 0x00, 0x4C, 0x34, 0x43, 0x2E, 0x04, 0x44,
        0x53, 0x4B, 0x30, 0x00, 0x4C, 0x3E, 0x43, 0x2E,
        0x04, 0x44, 0x53, 0x4B, 0x31, 0x00, 0x4C, 0x48,
        0x43, 0x2E, 0x04, 0x44, 0x53, 0x4B, 0x32, 0x00,
        0x4C, 0x52, 0x43, 0x2E, 0x04, 0x44, 0x53, 0x4B,
        0x33, 0x00, 0x4C, 0x5C, 0x43, 0x2E, 0x04, 0x44,
        0x53, 0x4B, 0x34, 0x00, 0x4C, 0x64, 0x43, 0x2E,
        0x03, 0x44, 0x53, 0x4B, 0x4C, 0x6C, 0x43, 0x2E,
        0x02, 0x50, 0x49, 0x00, 0x4C, 0x76, 0x43, 0x2E,
        0x04, 0x55, 0x52, 0x49, 0x31, 0x00, 0x4C, 0x80,
        0x43, 0x2E, 0x04, 0x55, 0x52, 0x49, 0x32, 0x00,
        0x00, 0x00, 0x43, 0x2E, 0x04, 0x55, 0x52, 0x49,
        0x33, 0x00, 0x4C, 0x94, 0x4B, 0x0F, 0x04, 0x54,
        0x49, 0x50, 0x49, 0x00, 0x4C, 0x9E, 0x4B, 0xB2,
        0x05, 0x46, 0x49, 0x4C, 0x45, 0x53, 0x4C, 0xA4,
        0x45, 0x5E, 0x01, 0x12, 0x4C, 0xAA, 0x45, 0x8C,
        0x01, 0x13, 0x4C, 0xB0, 0x45, 0xC6, 0x01, 0x14,
        0x4C, 0xB6, 0x46, 0x5A, 0x01, 0x15, 0x4C, 0xBC,
        0x48, 0x06, 0x01, 0x16, 0x4C, 0xC2, 0x46, 0xFA,
        0x01, 0x17, 0x4C, 0xC8, 0x47, 0x3C, 0x01, 0x18,
        0x4C, 0xCE, 0x47, 0x68, 0x01, 0x19, 0x00, 0x00,
        0x47, 0x94, 0x01, 0x1A, 0x00, 0x00, 0x00, 0x00
    ];

    private cpu: CPU;
    private canvas: HTMLCanvasElement = null;
    private enableWebsocket: boolean;
    private fastMouseEmulation: boolean;
    private websocket: WebSocket;
    private websocketURI: string;
    private websocketOpen: boolean;
    private closing: boolean;
    private td = 0;
    private tc = 0;
    private rd: number = null;
    private rc: number = null;
    private txMsg: Uint8Array;
    private txLen: number = 0;
    private txIdx: number = -2;
    private rxMsgs: Uint8Array[] = [];
    private rxIdx: number = -2;

    private mouseX = -1;
    private mouseY = -1;
    private tiX = -1;
    private tiY = -1;
    private buttons = 0;
    private mouseRequested = false;

    constructor(cpu: CPU, websocketURI: string, canvas: HTMLCanvasElement, enableWebsocket: boolean, fastMouseEmulation: boolean) {
        this.cpu = cpu;
        this.websocketURI = websocketURI;
        this.canvas = canvas;
        this.enableWebsocket = enableWebsocket;
        this.fastMouseEmulation = fastMouseEmulation;
        this.canvas.addEventListener('mousemove', this.mouseHandler.bind(this));
        this.canvas.addEventListener('mouseup', this.mouseHandler.bind(this));
        this.canvas.addEventListener('mousedown', this.mouseHandler.bind(this));
    }

    reset() {
        if (this.enableWebsocket && (!this.websocket || !this.websocketOpen)) {
            console.log("TIPI creating websocket");
            this.websocket = new WebSocket(this.websocketURI);
            this.websocket.binaryType = "arraybuffer";
            this.websocket.onopen = (evt) => {
                console.log("TIPI websocket opened");
                Log.getLog().info("TIPI websocket opened");
                this.websocketOpen = true;
                this.cpu.setSuspended(false);
            };
            this.websocket.onclose = (evt) => {
                console.log("TIPI websocket closed");
                this.websocketOpen = false;
                if (!this.closing) {
                    this.cpu.setSuspended(true);
                }
                window.setTimeout(
                    () => {
                        if (!this.closing) {
                            this.reset();
                        }
                    }, 2000
                );
            };
            this.websocket.onmessage = (evt) => {
                const message = evt.data;
                if (typeof message === "object") {
                    this.rxMsgs.push(new Uint8Array(message));
                }
            };
        }
    }

    /*
      DSR sequences:

      Reset handshake:
        TCOUT = TSRESET(0xF1)
        while RCIN != 0xF1 {}

      Transmit handshake: byte R2
        TCOUT = R2
        while RCIN != R2 {}
        R2 ^= 1

      Send message:
        do reset handshake
        R2 = TSWB(0x02)
        TDOUT = MSB(length)
        do transmit handshake TSWB(0x02)
        TDOUT = LSB(length)
        do transmit handshake TSWB(0x02)
        while (length-- != 0) {
          TDOUT = *data++
          do transmit handshake TSWB(0x02)
        }

      Recv message:
        do reset handshake
        R2 = TSRB(0x06)
        do transmit handshake TSRB(0x06)
        MSB(length) = RDIN
        do transmit handshake TSRB(0x06)
        LSB(length) = RDIN
        while (length-- != 0) {
          do transmit handshake TSRB(0x06)
          *data++ = RDIN
        }
    */


    getTD(): number {
        return this.td;    // TDOUT - TI Data
    }

    setTD(value: number) {
        this.td = value;   // TDOUT - TI Data
    }

    getTC(): number {
        return this.tc;    // TCOUT - TI Control
    }

    setTC(value: number) {
        this.tc = value;  // TCOUT - TI Control
        this.processMsg();
    }

    getRD(): number {
        return this.rd;  // RDIN - RPi Data
    }

    getRC(): number {
        this.processMsg();
        return this.rc;  // RCIN - RPi Control
    }

    signalReset() {
        console.log("TIPI signal reset");
        if (this.websocketOpen) {
            // This will close the websocket
            this.websocket.send("RESET");
        }
    }

    processMsg() {
        if (this.tc === 0xf1) {
            // TSRSET (reset-sync)
            this.rc = this.tc; // ack reset
            if (this.rxIdx != -2) {
              console.log("TSRSET rxMsg is out of sync");
            }
            this.rxIdx = -2;
            if (this.txMsg != null && this.txIdx != -2) {
              console.log("TSRSET txMsg is out of sync");
              this.txMsg = null;
            }
            this.txIdx = -2;

            // Note: sync handshake is no longer needed --
            // websocket server is asynchronous, and client emulation
            // must store multiple received messages (this.rxMsgs FIFO)

            //console.log("TIPI TSRESET");
            //if (this.websocketOpen) {
            //    this.websocket.send("SYNC");
            //}
        } else if (this.tc === this.rc) {
            // already acked, nothing to do

        } else if ((this.tc & 0xfe) === 0x02) {
            // TSWB (write-byte)
            // idx=-2  message length high byte
            // idx=-1  message length low byte
            // idx>=0  message data bytes
            if (this.txIdx === -2) {
                this.txLen = this.td << 8;
            } else if (this.txIdx === -1) {
                this.txLen += this.td;
                this.txMsg = new Uint8Array(new ArrayBuffer(this.txLen));
            } else if (this.txMsg != null) {
                this.txMsg[this.txIdx] = this.td;
            }
            this.txIdx++;
            if (this.txMsg && this.txIdx === this.txLen) {
                if (this.fastMouseEmulation && this.txLen === 1 && this.txMsg[0] === 0x20) {
                    this.mouseRequested = true;
                } else {
                    if (this.websocketOpen) {
                        this.websocket.send(this.txMsg.buffer);
                    }
                    this.txMsg = null;
                    this.txIdx = -2;
                }
                //console.log("txMsg len="+this.txLen);
            }
            this.rc = this.tc; // ack
        } else if ((this.tc & 0xfe) === 0x06) {
            // TSRB (read-byte)
            if (this.mouseRequested) {
                this.createMouseMsg();
                this.mouseRequested = false;
            }
            if (this.rxMsgs.length > 0) {
                var msg = this.rxMsgs[0];
                // idx=-2  message length high byte
                // idx=-1  message length low byte
                // idx>=0  message data bytes
                if (this.rxIdx === -2) {
                    //console.log("rxMsg len="+msg.length);
                    this.rd = (msg.length >> 8) & 0xff;
                } else if (this.rxIdx === -1) {
                    this.rd = msg.length & 0xff;
                } else {
                    this.rd = msg[this.rxIdx];
                }
                this.rxIdx++;
                if (this.rxIdx == msg.length) {
                  this.rxMsgs.shift();
                  this.rxIdx = -2;
                }
                this.rc = this.tc; // ack
            }
        } else {
            //console.log("TIPI write TC: " + Util.toHexByte(this.tc) + " (protocol error)");
        }
    }

    mouseHandler(evt) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.canvas.clientHeight / 240;
        this.tiX = Math.floor((evt.clientX - rect.left) / scale);
        this.tiY = Math.floor((evt.clientY - rect.top) / scale);
        this.buttons = evt.buttons;
        if (this.websocketOpen && !this.fastMouseEmulation) {
            if (this.mouseX !== -1 || this.mouseY !== -1) {
                const dx = this.tiX - this.mouseX;
                const dy = this.tiY - this.mouseY;
                this.websocket.send("MOUSE " + evt.buttons + " " + dx + " " + dy);
            }
            this.mouseX = this.tiX;
            this.mouseY = this.tiY;
        }
    }

    createMouseMsg() {
        const dx = this.mouseX !== -1 ? this.tiX - this.mouseX : 0;
        const dy = this.mouseY !== -1 ? this.tiY - this.mouseY : 0;
        const mouseMsg = new Uint8Array(3);
        mouseMsg[0] = dx;
        mouseMsg[1] = dy;
        mouseMsg[2] = this.buttons;
        this.txMsg = mouseMsg;
        this.txIdx = -2;
        this.txLen = 3;
        this.mouseX = this.tiX;
        this.mouseY = this.tiY;
    }

    close() {
        if (this.websocket) {
            this.closing = true;
            this.websocket.onclose = () => {
                this.websocketOpen = false;
            };
            this.websocket.close();
            this.cpu.setSuspended(false);
        }
        this.canvas.removeEventListener('mousemove', this.mouseHandler);
        this.canvas.removeEventListener('mouseup', this.mouseHandler);
        this.canvas.removeEventListener('mousedown', this.mouseHandler);
    }
}
