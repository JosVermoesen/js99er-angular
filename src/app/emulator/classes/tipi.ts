import {CPU} from "../interfaces/cpu";
import {Log} from "../../classes/log";

export class TIPI {

    static TD_OUT = 0x5FFE; // TI Data (output)
    static TC_OUT = 0x5FFC; // TI Control Signal (output)
    static RD_IN = 0x5FFA;  // PI Data (input)
    static RC_IN = 0x5FF8;  // PI Control Signal (input)

    static DSR_ROM = [
        0xaa, 0x01, 0x00, 0x00, 0x4c, 0x40, 0x00, 0x00, 0x4c, 0x44, 0x4c, 0xae, 0x00, 0x00, 0x00, 0x00,
        0x41, 0xd0, 0x40, 0xd4, 0x42, 0x4a, 0x41, 0x4c, 0x00, 0x00, 0x32, 0x30, 0x31, 0x38, 0x2d, 0x30,
        0x34, 0x2d, 0x30, 0x37, 0x20, 0x31, 0x38, 0x3a, 0x35, 0x33, 0x00, 0x00, 0x83, 0xe0, 0x40, 0x30,
        0xc0, 0x2d, 0x00, 0x00, 0x02, 0x60, 0x80, 0x00, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02, 0x06, 0xc0,
        0xd8, 0x00, 0x8c, 0x02, 0x03, 0x80, 0x83, 0xe0, 0x40, 0x4a, 0xc0, 0x2d, 0x00, 0x00, 0xc0, 0x6d,
        0x00, 0x02, 0xc0, 0xad, 0x00, 0x04, 0x02, 0x60, 0x40, 0x00, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02,
        0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02, 0xd8, 0x31, 0x8c, 0x00, 0x06, 0x02, 0x16, 0xfc, 0x03, 0x80,
        0x83, 0xe0, 0x40, 0x74, 0xc0, 0x2d, 0x00, 0x00, 0xc0, 0x6d, 0x00, 0x02, 0xc0, 0xad, 0x00, 0x04,
        0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0xdc, 0x20, 0x88, 0x00,
        0x06, 0x02, 0x16, 0xfc, 0x03, 0x80, 0x83, 0xe0, 0x40, 0x9a, 0xc0, 0x2d, 0x00, 0x00, 0xc0, 0x6d,
        0x00, 0x02, 0xc0, 0xad, 0x00, 0x04, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x06, 0xc1, 0xd8, 0x01,
        0x8c, 0x02, 0xd1, 0x20, 0x88, 0x00, 0x02, 0x60, 0x40, 0x00, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02,
        0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02, 0xd8, 0x04, 0x8c, 0x00, 0x05, 0x80, 0x05, 0x81, 0x06, 0x02,
        0x16, 0xea, 0x03, 0x80, 0x02, 0x02, 0xf1, 0x00, 0xd8, 0x02, 0x5f, 0xfd, 0x90, 0xa0, 0x5f, 0xf9,
        0x16, 0xfd, 0x02, 0x02, 0x02, 0x00, 0xd8, 0x00, 0x5f, 0xff, 0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0,
        0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22, 0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62,
        0x02, 0x00, 0x06, 0xc0, 0xd8, 0x00, 0x5f, 0xff, 0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0, 0x5f, 0xf9,
        0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22, 0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x02, 0x00,
        0x06, 0xc0, 0x02, 0x80, 0x00, 0x00, 0x13, 0x11, 0xd8, 0x11, 0x5f, 0xff, 0xd8, 0x02, 0x5f, 0xfd,
        0xd0, 0xe0, 0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22, 0x01, 0x00, 0x02, 0x42, 0x01, 0x00,
        0x02, 0x62, 0x02, 0x00, 0x05, 0x81, 0x06, 0x00, 0x16, 0xef, 0x04, 0x5b, 0x02, 0x02, 0xf1, 0x00,
        0xd8, 0x02, 0x5f, 0xfd, 0x90, 0xa0, 0x5f, 0xf9, 0x16, 0xfd, 0x02, 0x02, 0x02, 0x00, 0xd8, 0x00,
        0x5f, 0xff, 0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0, 0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22,
        0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x02, 0x00, 0x06, 0xc0, 0xd8, 0x00, 0x5f, 0xff,
        0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0, 0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22, 0x01, 0x00,
        0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x02, 0x00, 0x06, 0xc0, 0x02, 0x80, 0x00, 0x00, 0x13, 0x17,
        0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0xd8, 0x20, 0x88, 0x00,
        0x5f, 0xff, 0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0, 0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22,
        0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x02, 0x00, 0x06, 0x00, 0x16, 0xef, 0x04, 0x5b,
        0x02, 0x02, 0xf1, 0x00, 0xd8, 0x02, 0x5f, 0xfd, 0x90, 0xa0, 0x5f, 0xf9, 0x16, 0xfd, 0x02, 0x02,
        0x06, 0x00, 0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0, 0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22,
        0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x06, 0x00, 0xd1, 0x20, 0x5f, 0xfb, 0x06, 0xc4,
        0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0, 0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22, 0x01, 0x00,
        0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x06, 0x00, 0xd1, 0x20, 0x5f, 0xfb, 0x06, 0xc4, 0x04, 0xc0,
        0x02, 0x84, 0x00, 0x00, 0x13, 0x11, 0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0, 0x5f, 0xf9, 0x90, 0xc2,
        0x16, 0xfc, 0x02, 0x22, 0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x06, 0x00, 0xdc, 0x60,
        0x5f, 0xfb, 0x05, 0x80, 0x81, 0x00, 0x16, 0xef, 0x04, 0x5b, 0x02, 0x02, 0xf1, 0x00, 0xd8, 0x02,
        0x5f, 0xfd, 0x90, 0xa0, 0x5f, 0xf9, 0x16, 0xfd, 0x02, 0x02, 0x06, 0x00, 0xd8, 0x02, 0x5f, 0xfd,
        0xd0, 0xe0, 0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22, 0x01, 0x00, 0x02, 0x42, 0x01, 0x00,
        0x02, 0x62, 0x06, 0x00, 0xd1, 0x20, 0x5f, 0xfb, 0x06, 0xc4, 0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0,
        0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22, 0x01, 0x00, 0x02, 0x42, 0x01, 0x00, 0x02, 0x62,
        0x06, 0x00, 0xd1, 0x20, 0x5f, 0xfb, 0x06, 0xc4, 0x04, 0xc0, 0x02, 0x84, 0x00, 0x00, 0x13, 0x1a,
        0x02, 0x61, 0x40, 0x00, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02,
        0xd8, 0x02, 0x5f, 0xfd, 0xd0, 0xe0, 0x5f, 0xf9, 0x90, 0xc2, 0x16, 0xfc, 0x02, 0x22, 0x01, 0x00,
        0x02, 0x42, 0x01, 0x00, 0x02, 0x62, 0x06, 0x00, 0xd8, 0x20, 0x5f, 0xfb, 0x8c, 0x00, 0x05, 0x80,
        0x81, 0x00, 0x16, 0xee, 0x04, 0x5b, 0xaa, 0x3f, 0xff, 0x11, 0x03, 0x00, 0x02, 0xa5, 0x04, 0xe0,
        0x5f, 0xff, 0x04, 0xe0, 0x5f, 0xfd, 0x1d, 0x01, 0x02, 0x01, 0x02, 0x00, 0x06, 0x01, 0x16, 0xfe,
        0x1e, 0x01, 0x02, 0x8c, 0x11, 0x00, 0x16, 0x14, 0x02, 0x02, 0x37, 0xd7, 0xc8, 0x02, 0x83, 0x70,
        0x02, 0x01, 0x8c, 0x02, 0x05, 0x82, 0x02, 0x62, 0x40, 0x00, 0xd4, 0x65, 0x00, 0x05, 0xd4, 0x42,
        0x04, 0xc2, 0xd8, 0x22, 0x42, 0xd6, 0x8c, 0x00, 0x05, 0x82, 0x02, 0x82, 0x00, 0x05, 0x16, 0xf9,
        0x04, 0x5b, 0x04, 0xc0, 0xd8, 0x00, 0x5f, 0xff, 0xd8, 0x00, 0x5f, 0xfd, 0x04, 0x5b, 0x03, 0x00,
        0x00, 0x00, 0xc8, 0x0b, 0x83, 0x5c, 0x02, 0xaa, 0x02, 0x04, 0x83, 0x56, 0x04, 0xc9, 0xa2, 0x54,
        0x62, 0x60, 0x83, 0x54, 0x02, 0x02, 0x00, 0x0a, 0x62, 0x42, 0xc8, 0x09, 0x83, 0x5a, 0x06, 0xc9,
        0xd8, 0x09, 0x8c, 0x02, 0x06, 0xc9, 0xd8, 0x09, 0x8c, 0x02, 0x02, 0x01, 0x00, 0x09, 0xc0, 0x8a,
        0xd8, 0xa0, 0x88, 0x00, 0xff, 0x84, 0x05, 0x82, 0x06, 0x01, 0x16, 0xfa, 0x02, 0x00, 0x00, 0x0a,
        0xc0, 0x4a, 0x02, 0x21, 0xff, 0x84, 0x06, 0xa0, 0x40, 0xd4, 0xc0, 0x60, 0x83, 0x56, 0x60, 0x60,
        0x83, 0x54, 0x06, 0x01, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02,
        0xd0, 0x20, 0x88, 0x00, 0x09, 0x80, 0x05, 0x81, 0x06, 0xa0, 0x41, 0x4c, 0x02, 0x00, 0x00, 0x01,
        0xc0, 0x4a, 0x02, 0x21, 0x00, 0x13, 0x04, 0xc9, 0x06, 0xa0, 0x41, 0xd0, 0x02, 0x89, 0x00, 0x00,
        0x13, 0x05, 0x02, 0x89, 0x00, 0xff, 0x13, 0x27, 0xc0, 0x49, 0x16, 0x05, 0x06, 0xa0, 0x43, 0x22,
        0xc2, 0xe0, 0x83, 0x5c, 0x04, 0x5b, 0x0b, 0x31, 0xf0, 0x6a, 0xff, 0x85, 0xc0, 0xe0, 0x83, 0x5a,
        0x05, 0x83, 0x02, 0x63, 0x40, 0x00, 0x06, 0xc3, 0xd8, 0x03, 0x8c, 0x02, 0x06, 0xc3, 0xd8, 0x03,
        0x8c, 0x02, 0xd8, 0x01, 0x8c, 0x00, 0x06, 0xa0, 0x43, 0x22, 0xc2, 0xe0, 0x83, 0x5c, 0x05, 0xcb,
        0x04, 0x5b, 0x44, 0x18, 0x44, 0x46, 0x44, 0x4a, 0x44, 0xa8, 0x44, 0xe4, 0x44, 0xe6, 0x44, 0xf4,
        0x45, 0x1c, 0x45, 0x4a, 0x45, 0x1e, 0x04, 0xc1, 0xda, 0xaa, 0xff, 0x84, 0x00, 0x03, 0x0a, 0x11,
        0x02, 0x21, 0x43, 0xf2, 0xc0, 0x51, 0x04, 0x51, 0x02, 0x00, 0x00, 0x01, 0xc0, 0x4a, 0x02, 0x21,
        0x00, 0x12, 0x06, 0xa0, 0x41, 0xd0, 0xc0, 0xe0, 0x83, 0x5a, 0x02, 0x23, 0x00, 0x04, 0x02, 0x63,
        0x40, 0x00, 0x06, 0xc3, 0xd8, 0x03, 0x8c, 0x02, 0x06, 0xc3, 0xd8, 0x03, 0x8c, 0x02, 0xd8, 0x09,
        0x8c, 0x00, 0x04, 0x60, 0x45, 0x4a, 0x04, 0x60, 0x45, 0x4a, 0xc0, 0x2a, 0xff, 0x8a, 0xc0, 0x6a,
        0xff, 0x86, 0x06, 0xa0, 0x42, 0x4a, 0x06, 0xc0, 0xc0, 0xe0, 0x83, 0x5a, 0x02, 0x23, 0x00, 0x05,
        0x02, 0x63, 0x40, 0x00, 0x06, 0xc3, 0xd8, 0x03, 0x8c, 0x02, 0x06, 0xc3, 0xd8, 0x03, 0x8c, 0x02,
        0xd8, 0x00, 0x8c, 0x00, 0xc0, 0x6a, 0xff, 0x84, 0x02, 0x41, 0x00, 0x01, 0x13, 0x66, 0xc0, 0x6a,
        0xff, 0x8a, 0x05, 0x81, 0xc0, 0xe0, 0x83, 0x5a, 0x02, 0x23, 0x00, 0x06, 0x02, 0x63, 0x40, 0x00,
        0x06, 0xc3, 0xd8, 0x03, 0x8c, 0x02, 0x06, 0xc3, 0xd8, 0x03, 0x8c, 0x02, 0xd8, 0x01, 0x8c, 0x00,
        0xd8, 0x2a, 0x00, 0x03, 0x8c, 0x00, 0x10, 0x51, 0x04, 0xc0, 0xd0, 0x6a, 0xff, 0x85, 0x02, 0x41,
        0x10, 0x00, 0x16, 0x03, 0xd0, 0x2a, 0xff, 0x88, 0x10, 0x02, 0xd0, 0x2a, 0xff, 0x89, 0x06, 0xc0,
        0xc0, 0x6a, 0xff, 0x86, 0x06, 0xa0, 0x41, 0x4c, 0x02, 0x00, 0x00, 0x01, 0xc0, 0x4a, 0x02, 0x21,
        0x00, 0x13, 0x04, 0xc9, 0x06, 0xa0, 0x41, 0xd0, 0x02, 0x89, 0x00, 0xff, 0x13, 0xcb, 0xc0, 0x49,
        0x04, 0x60, 0x43, 0xc6, 0x10, 0x32, 0xc0, 0x2a, 0xff, 0x8a, 0xc0, 0x6a, 0xff, 0x86, 0x06, 0xa0,
        0x42, 0x4a, 0x10, 0x2b, 0xc0, 0x2a, 0xff, 0x8a, 0xc0, 0x6a, 0xff, 0x86, 0x06, 0xa0, 0x41, 0x4c,
        0x02, 0x00, 0x00, 0x01, 0xc0, 0x4a, 0x02, 0x21, 0x00, 0x13, 0x04, 0xc9, 0x06, 0xa0, 0x41, 0xd0,
        0x02, 0x89, 0x00, 0xff, 0x13, 0x1a, 0xc0, 0x49, 0x04, 0x60, 0x43, 0xc6, 0x10, 0x16, 0x02, 0x00,
        0x00, 0x01, 0xc0, 0x4a, 0x02, 0x21, 0x00, 0x12, 0x06, 0xa0, 0x41, 0xd0, 0xc0, 0xe0, 0x83, 0x5a,
        0x02, 0x23, 0x00, 0x08, 0x02, 0x63, 0x40, 0x00, 0x06, 0xc3, 0xd8, 0x03, 0x8c, 0x02, 0x06, 0xc3,
        0xd8, 0x03, 0x8c, 0x02, 0xd8, 0x09, 0x8c, 0x00, 0x10, 0x00, 0x06, 0xa0, 0x43, 0x22, 0xc2, 0xe0,
        0x83, 0x5c, 0x05, 0xcb, 0x04, 0x5b, 0x12, 0x13, 0x14, 0x15, 0x17, 0x18, 0x19, 0x1a, 0x03, 0x00,
        0x00, 0x00, 0xc1, 0xcb, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x45, 0x56, 0x06, 0xa0, 0x40, 0xd4,
        0x02, 0x00, 0x00, 0x02, 0x02, 0x01, 0x83, 0x4c, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x0a,
        0xc0, 0x60, 0x83, 0x4e, 0x06, 0xa0, 0x41, 0x4c, 0x04, 0x60, 0x47, 0xe8, 0x03, 0x00, 0x00, 0x00,
        0xc1, 0xcb, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x45, 0x57, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00,
        0x00, 0x01, 0x02, 0x01, 0x83, 0x4c, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x0a, 0xc0, 0x60,
        0x83, 0x4e, 0x06, 0xa0, 0x41, 0x4c, 0x02, 0x00, 0x00, 0x0a, 0xc0, 0x60, 0x83, 0x50, 0x06, 0xa0,
        0x41, 0x4c, 0x04, 0x60, 0x47, 0xe8, 0x03, 0x00, 0x00, 0x00, 0xc1, 0xcb, 0x02, 0x00, 0x00, 0x01,
        0x02, 0x01, 0x45, 0x58, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x02, 0x02, 0x01, 0x83, 0x4c,
        0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x0a, 0xc0, 0x60, 0x83, 0x4e, 0x06, 0xa0, 0x41, 0x4c,
        0x04, 0xc8, 0xd2, 0x20, 0x83, 0x50, 0x06, 0xc8, 0x02, 0x28, 0x83, 0x00, 0x02, 0x00, 0x00, 0x02,
        0xc0, 0x48, 0x05, 0xc1, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x83, 0x50,
        0x06, 0xa0, 0x41, 0xd0, 0x04, 0xc3, 0xd0, 0xe0, 0x83, 0x50, 0x06, 0xc3, 0x02, 0x83, 0x00, 0xff,
        0x13, 0x05, 0x0b, 0x33, 0xd8, 0x03, 0x83, 0x50, 0x04, 0x60, 0x46, 0xfe, 0xd8, 0x03, 0x83, 0x50,
        0x02, 0x00, 0x00, 0x08, 0xc0, 0x48, 0x05, 0xc1, 0x06, 0xa0, 0x41, 0xd0, 0x02, 0x00, 0x00, 0x01,
        0x02, 0x01, 0x83, 0x4d, 0x06, 0xa0, 0x41, 0xd0, 0xd8, 0x20, 0x83, 0x4d, 0x83, 0x4d, 0x13, 0x57,
        0x02, 0x00, 0x01, 0x00, 0xc0, 0x58, 0x06, 0xa0, 0x42, 0x4a, 0x04, 0x60, 0x46, 0xfe, 0x03, 0x00,
        0x00, 0x00, 0xc1, 0xcb, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x45, 0x59, 0x06, 0xa0, 0x40, 0xd4,
        0x02, 0x00, 0x00, 0x02, 0x02, 0x01, 0x83, 0x4c, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x0a,
        0xc0, 0x60, 0x83, 0x4e, 0x06, 0xa0, 0x41, 0x4c, 0x04, 0xc8, 0xd2, 0x20, 0x83, 0x50, 0x06, 0xc8,
        0x02, 0x28, 0x83, 0x00, 0x02, 0x00, 0x00, 0x08, 0xc0, 0x48, 0x05, 0xc1, 0x06, 0xa0, 0x40, 0xd4,
        0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x83, 0x50, 0x06, 0xa0, 0x41, 0xd0, 0x04, 0xc3, 0xd0, 0xe0,
        0x83, 0x50, 0x06, 0xc3, 0x02, 0x83, 0x00, 0xff, 0x13, 0x05, 0x0b, 0x33, 0xd8, 0x03, 0x83, 0x50,
        0x04, 0x60, 0x46, 0xfe, 0x04, 0xc0, 0xd0, 0x20, 0x83, 0x4d, 0x13, 0x09, 0xc0, 0x58, 0x06, 0xa0,
        0x41, 0x4c, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x83, 0x50, 0x06, 0xa0, 0x41, 0xd0, 0x04, 0xc3,
        0xd0, 0xe0, 0x83, 0x50, 0x06, 0xc3, 0x02, 0x83, 0x00, 0xff, 0x13, 0x05, 0x0b, 0x33, 0xd8, 0x03,
        0x83, 0x50, 0x04, 0x60, 0x46, 0xfe, 0xd8, 0x03, 0x83, 0x50, 0x04, 0x60, 0x46, 0xfe, 0xc2, 0xc7,
        0x05, 0xcb, 0x04, 0x5b, 0x03, 0x00, 0x00, 0x00, 0xc1, 0xcb, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01,
        0x45, 0x5a, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x83, 0x4c, 0x06, 0xa0,
        0x40, 0xd4, 0xc0, 0x60, 0x83, 0x4e, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x06, 0xc1, 0xd8, 0x01,
        0x8c, 0x02, 0x04, 0xc0, 0xd0, 0x20, 0x88, 0x00, 0x06, 0xc0, 0xc0, 0x60, 0x83, 0x4e, 0x05, 0x81,
        0x06, 0xa0, 0x41, 0x4c, 0x04, 0x60, 0x47, 0xe8, 0x03, 0x00, 0x00, 0x00, 0xc1, 0xcb, 0x02, 0x00,
        0x00, 0x01, 0x02, 0x01, 0x45, 0x5b, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01,
        0x83, 0x4c, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x0a, 0xc0, 0x60, 0x83, 0x4e, 0x06, 0xa0,
        0x41, 0x4c, 0x04, 0x60, 0x47, 0xe8, 0x03, 0x00, 0x00, 0x00, 0xc1, 0xcb, 0x02, 0x00, 0x00, 0x01,
        0x02, 0x01, 0x45, 0x5c, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x83, 0x4c,
        0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x0a, 0xc0, 0x60, 0x83, 0x4e, 0x06, 0xa0, 0x41, 0x4c,
        0x04, 0x60, 0x47, 0xe8, 0x03, 0x00, 0x00, 0x00, 0xc1, 0xcb, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01,
        0x45, 0x5d, 0x06, 0xa0, 0x40, 0xd4, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x83, 0x4c, 0x06, 0xa0,
        0x40, 0xd4, 0x02, 0x00, 0x00, 0x0a, 0xc0, 0x60, 0x83, 0x4e, 0x06, 0xa0, 0x41, 0x4c, 0x02, 0x00,
        0x00, 0x0a, 0xc0, 0x60, 0x83, 0x50, 0x06, 0xa0, 0x41, 0x4c, 0x04, 0x60, 0x47, 0xe8, 0xc2, 0xc7,
        0x05, 0xcb, 0x04, 0x5b, 0xc2, 0xc7, 0x04, 0x5b, 0x02, 0x00, 0x00, 0x01, 0x02, 0x01, 0x83, 0x50,
        0x06, 0xa0, 0x41, 0xd0, 0xd8, 0x20, 0x83, 0x50, 0x83, 0x50, 0x13, 0xf4, 0x04, 0xc0, 0xd8, 0x20,
        0x83, 0x50, 0x83, 0xe1, 0x02, 0x80, 0x00, 0xff, 0x13, 0x05, 0x0b, 0x30, 0xd8, 0x00, 0x83, 0x50,
        0x04, 0x60, 0x47, 0xde, 0xd8, 0x00, 0x83, 0x50, 0x04, 0x60, 0x47, 0xde, 0x03, 0x00, 0x00, 0x00,
        0xc1, 0xcb, 0x02, 0x8c, 0x11, 0x00, 0x16, 0xde, 0x06, 0xa0, 0x48, 0x30, 0x04, 0x60, 0x47, 0xde,
        0x04, 0xc1, 0xd0, 0x60, 0x83, 0x4c, 0x06, 0xc1, 0x02, 0x81, 0x00, 0x00, 0x13, 0x2a, 0x02, 0x81,
        0x00, 0x0f, 0x15, 0x27, 0x38, 0x60, 0x48, 0x9c, 0xc0, 0x42, 0x02, 0x21, 0x00, 0x06, 0x02, 0x02,
        0x3d, 0xef, 0x60, 0x81, 0xc8, 0x02, 0x83, 0x70, 0xc0, 0x42, 0x05, 0x81, 0x02, 0x61, 0x40, 0x00,
        0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x02, 0x02, 0xaa, 0x3f,
        0xd8, 0x02, 0x8c, 0x00, 0x06, 0xc2, 0xd8, 0x02, 0x8c, 0x00, 0x02, 0x02, 0xff, 0x11, 0xd8, 0x02,
        0x8c, 0x00, 0x06, 0xc2, 0xd8, 0x02, 0x8c, 0x00, 0xd8, 0x20, 0x83, 0x4c, 0x8c, 0x00, 0x04, 0xc1,
        0x10, 0x02, 0x02, 0x01, 0x00, 0x01, 0xd8, 0x01, 0x83, 0x50, 0x04, 0x5b, 0x02, 0x06, 0x3d, 0xef,
        0x04, 0xe0, 0x83, 0x5c, 0x02, 0x00, 0x00, 0x0a, 0x02, 0x01, 0x10, 0x9c, 0x06, 0xa0, 0x41, 0x4c,
        0x02, 0x00, 0x10, 0xa5, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02,
        0x04, 0xc0, 0xd0, 0x20, 0x88, 0x00, 0x06, 0xc0, 0x02, 0x01, 0x10, 0xa6, 0x06, 0xa0, 0x41, 0x4c,
        0x02, 0xaa, 0x02, 0x00, 0x00, 0x01, 0xc0, 0x4a, 0x04, 0xc9, 0x02, 0x21, 0x00, 0x13, 0x06, 0xa0,
        0x41, 0xd0, 0x02, 0x89, 0x00, 0xff, 0x13, 0x02, 0x04, 0x60, 0x49, 0x88, 0x02, 0x00, 0x20, 0x06,
        0x02, 0x01, 0x13, 0x80, 0x06, 0xa0, 0x42, 0x4a, 0x02, 0x00, 0x00, 0x06, 0xa0, 0x0a, 0x02, 0x01,
        0x13, 0x80, 0x02, 0x02, 0x00, 0x06, 0x04, 0x20, 0x40, 0x70, 0xc8, 0x20, 0x83, 0x5c, 0x83, 0x5c,
        0x16, 0x02, 0xc8, 0x05, 0x83, 0x5c, 0xc0, 0x05, 0x02, 0x01, 0x13, 0x86, 0xc0, 0x84, 0x04, 0x20,
        0x40, 0x70, 0xc0, 0xc3, 0x16, 0x05, 0xc8, 0x20, 0x83, 0x5c, 0x83, 0xe8, 0x04, 0x60, 0x4a, 0x10,
        0x02, 0x00, 0x10, 0x9c, 0x02, 0x01, 0x49, 0x8c, 0x02, 0x02, 0x00, 0x08, 0x04, 0x20, 0x40, 0x46,
        0x02, 0x00, 0x10, 0xa5, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02,
        0x04, 0xc1, 0xd0, 0x60, 0x88, 0x00, 0x06, 0xc1, 0xa0, 0x01, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02,
        0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02, 0x04, 0xc1, 0xd0, 0x60, 0x88, 0x00, 0x02, 0x21, 0x01, 0x00,
        0x02, 0x60, 0x40, 0x00, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02, 0x06, 0xc0, 0xd8, 0x00, 0x8c, 0x02,
        0xd8, 0x01, 0x8c, 0x00, 0x04, 0x60, 0x48, 0xa4, 0x04, 0x20, 0x00, 0x00, 0x05, 0x00, 0x13, 0x80,
        0x00, 0x00, 0x20, 0x06, 0x00, 0x0f, 0xc3, 0xcb, 0x06, 0xa0, 0x49, 0xa6, 0xd8, 0x01, 0x8c, 0x00,
        0x06, 0x00, 0x16, 0xfc, 0x04, 0x5f, 0x06, 0xc2, 0xd8, 0x02, 0x8c, 0x02, 0x06, 0xc2, 0xd8, 0x02,
        0x8c, 0x02, 0x04, 0x5b, 0xd8, 0x00, 0x9c, 0x02, 0x06, 0xc0, 0xd8, 0x00, 0x9c, 0x02, 0x04, 0x5b,
        0xd0, 0x20, 0x98, 0x00, 0x06, 0xc0, 0xd0, 0x20, 0x98, 0x00, 0x06, 0xc0, 0x04, 0x5b, 0xc2, 0x8b,
        0x06, 0xa0, 0x49, 0xb4, 0x06, 0xa0, 0x49, 0xc0, 0x02, 0x40, 0x1f, 0xff, 0x02, 0x20, 0x00, 0x03,
        0x06, 0xa0, 0x49, 0xb4, 0x06, 0xa0, 0x49, 0xc0, 0x06, 0xa0, 0x49, 0xb4, 0x06, 0xc1, 0xd8, 0x01,
        0x8c, 0x02, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x04, 0xc0, 0xd8, 0x00, 0x8c, 0x00, 0xc0, 0x03,
        0xd8, 0x20, 0x98, 0x00, 0x8c, 0x00, 0x06, 0x00, 0x16, 0xfb, 0x06, 0x02, 0x16, 0xf6, 0x04, 0x5a,
        0x02, 0x01, 0x4b, 0x04, 0x02, 0x02, 0x00, 0x08, 0x04, 0xc0, 0xd0, 0x31, 0x06, 0xc0, 0x04, 0x20,
        0x40, 0x2c, 0x02, 0x20, 0x01, 0x00, 0x06, 0xc0, 0x06, 0x02, 0x16, 0xf7, 0x02, 0x02, 0x02, 0xff,
        0x04, 0xc1, 0x06, 0xa0, 0x49, 0xa6, 0xd0, 0x60, 0x88, 0x00, 0x02, 0x21, 0xa0, 0x00, 0x02, 0x81,
        0x1f, 0x00, 0x16, 0x02, 0x02, 0x21, 0x01, 0x00, 0x02, 0x62, 0x40, 0x00, 0x06, 0xa0, 0x49, 0xa6,
        0xd8, 0x01, 0x8c, 0x00, 0x02, 0x42, 0x3f, 0xff, 0x06, 0x02, 0x18, 0xeb, 0x02, 0x02, 0x40, 0x00,
        0x02, 0x01, 0x20, 0x00, 0x02, 0x00, 0x10, 0x00, 0x06, 0xa0, 0x49, 0x96, 0x02, 0x03, 0x00, 0x07,
        0x02, 0x00, 0x00, 0x4a, 0x02, 0x01, 0x4b, 0x00, 0x02, 0x02, 0x00, 0x1f, 0x06, 0xa0, 0x49, 0xce,
        0x02, 0x00, 0x00, 0x18, 0x02, 0x01, 0x49, 0x00, 0x02, 0x02, 0x00, 0x40, 0x06, 0xa0, 0x49, 0xce,
        0x02, 0x00, 0x08, 0x50, 0x02, 0x01, 0x4b, 0x0c, 0x02, 0x02, 0x00, 0x08, 0x04, 0x20, 0x40, 0x46,
        0x02, 0x00, 0x08, 0xf0, 0x02, 0x01, 0x4b, 0x14, 0x02, 0x02, 0x00, 0x10, 0x04, 0x20, 0x40, 0x46,
        0x02, 0x02, 0x43, 0x80, 0x02, 0x01, 0x13, 0x00, 0x02, 0x00, 0x00, 0x20, 0x06, 0xa0, 0x49, 0x96,
        0x02, 0xe0, 0x83, 0xe0, 0x02, 0x01, 0x83, 0x00, 0x02, 0x02, 0x00, 0xc0, 0x04, 0xc1, 0x05, 0xc1,
        0x06, 0x42, 0x16, 0xfc, 0x02, 0x01, 0x00, 0x12, 0x02, 0x02, 0x83, 0x20, 0x04, 0xc3, 0xcc, 0xa3,
        0x4a, 0xf2, 0x05, 0xc3, 0x06, 0x41, 0x16, 0xfb, 0xc8, 0x20, 0x83, 0xe8, 0x83, 0x00, 0x04, 0x60,
        0x83, 0x20, 0x1e, 0x00, 0x04, 0xcc, 0x02, 0x0d, 0x98, 0x00, 0x02, 0x0e, 0x01, 0x08, 0x02, 0x0f,
        0x8c, 0x02, 0x04, 0x54, 0x00, 0xe0, 0x00, 0x0e, 0x01, 0x06, 0x00, 0xf3, 0x3c, 0x42, 0x99, 0xa1,
        0xa1, 0x99, 0x42, 0x3c, 0x70, 0x70, 0x70, 0x70, 0x70, 0x70, 0x70, 0x70, 0x00, 0x7e, 0x42, 0x42,
        0x42, 0x42, 0x7e, 0x00, 0x0c, 0x54, 0x49, 0x50, 0x49, 0x2e, 0x54, 0x49, 0x50, 0x49, 0x43, 0x46,
        0x47, 0x00, 0x03, 0x00, 0x00, 0x00, 0x02, 0xe0, 0x83, 0x00, 0xc2, 0x20, 0x83, 0x2c, 0x02, 0x00,
        0x10, 0x9c, 0x02, 0x01, 0x49, 0x8c, 0x02, 0x02, 0x00, 0x0a, 0x04, 0x20, 0x40, 0x46, 0x02, 0x20,
        0x00, 0x09, 0xc0, 0x48, 0x02, 0x21, 0x00, 0x05, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x06, 0xc1,
        0xd8, 0x01, 0x8c, 0x02, 0x04, 0xc9, 0xd2, 0x60, 0x88, 0x00, 0x02, 0x89, 0xb7, 0x00, 0x13, 0x07,
        0x02, 0x01, 0x4b, 0x24, 0x02, 0x02, 0x00, 0x0d, 0x04, 0x20, 0x40, 0x46, 0x10, 0x11, 0xc0, 0x48,
        0x02, 0x21, 0x00, 0x07, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02, 0x06, 0xc1, 0xd8, 0x01, 0x8c, 0x02,
        0x04, 0xc9, 0xd2, 0x60, 0x88, 0x00, 0xc0, 0x89, 0x06, 0xc2, 0x05, 0x82, 0x04, 0x20, 0x40, 0x96,
        0x04, 0x60, 0x48, 0xa0, 0x58, 0x20, 0x83, 0x42, 0x83, 0x42, 0x10, 0x04, 0x02, 0x00, 0x07, 0x00,
        0xd8, 0x00, 0x83, 0x42, 0xc8, 0x08, 0x83, 0x2c, 0x06, 0xc8, 0xd8, 0x08, 0x8c, 0x02, 0x06, 0xc8,
        0xd8, 0x08, 0x8c, 0x02, 0xc2, 0xe0, 0x83, 0x5c, 0x05, 0xcb, 0x02, 0x08, 0x40, 0x00, 0x58, 0x08,
        0x83, 0x54, 0x04, 0x5b, 0x03, 0x00, 0x00, 0x00, 0x02, 0x8c, 0x11, 0x00, 0x16, 0x30, 0xc8, 0x0b,
        0x83, 0x5c, 0x02, 0xa9, 0xc2, 0x20, 0x83, 0x2c, 0x02, 0x28, 0x00, 0x07, 0x06, 0xc8, 0xd8, 0x08,
        0x8c, 0x02, 0x06, 0xc8, 0xd8, 0x08, 0x8c, 0x02, 0xd0, 0xa0, 0x88, 0x00, 0xda, 0x60, 0x88, 0x00,
        0x00, 0x05, 0x02, 0x82, 0xc8, 0x01, 0x16, 0xd2, 0x04, 0xc2, 0xd0, 0xa0, 0x88, 0x00, 0x06, 0xc2,
        0x02, 0x22, 0x00, 0xd0, 0x02, 0x42, 0x00, 0xff, 0x13, 0xc9, 0x02, 0x82, 0x00, 0x09, 0x1b, 0xc6,
        0xd8, 0x29, 0x00, 0x05, 0x83, 0x4c, 0x06, 0xa0, 0x48, 0x30, 0xd8, 0x20, 0x83, 0x50, 0x83, 0x50,
        0x16, 0xbd, 0xc2, 0x20, 0x83, 0x2c, 0x02, 0x28, 0x00, 0x0c, 0x04, 0x60, 0x4b, 0xa4, 0x04, 0x5b,
        0x00, 0x00, 0x42, 0xdc, 0x4c, 0x4e, 0x43, 0x2e, 0x04, 0x54, 0x49, 0x50, 0x49, 0x00, 0x4c, 0x58,
        0x43, 0x2e, 0x04, 0x44, 0x53, 0x4b, 0x30, 0x00, 0x4c, 0x62, 0x43, 0x2e, 0x04, 0x44, 0x53, 0x4b,
        0x31, 0x00, 0x4c, 0x6c, 0x43, 0x2e, 0x04, 0x44, 0x53, 0x4b, 0x32, 0x00, 0x4c, 0x76, 0x43, 0x2e,
        0x04, 0x44, 0x53, 0x4b, 0x33, 0x00, 0x4c, 0x80, 0x43, 0x2e, 0x04, 0x44, 0x53, 0x4b, 0x34, 0x00,
        0x4c, 0x88, 0x43, 0x2e, 0x03, 0x44, 0x53, 0x4b, 0x4c, 0x90, 0x43, 0x2e, 0x02, 0x50, 0x49, 0x00,
        0x4c, 0x9a, 0x43, 0x2e, 0x04, 0x55, 0x52, 0x49, 0x31, 0x00, 0x4c, 0xa4, 0x43, 0x2e, 0x04, 0x55,
        0x52, 0x49, 0x32, 0x00, 0x00, 0x00, 0x43, 0x2e, 0x04, 0x55, 0x52, 0x49, 0x33, 0x00, 0x4c, 0xb8,
        0x4b, 0x31, 0x04, 0x54, 0x49, 0x50, 0x49, 0x00, 0x4c, 0xc2, 0x4b, 0xd4, 0x05, 0x46, 0x49, 0x4c,
        0x45, 0x53, 0x4c, 0xc8, 0x45, 0x5e, 0x01, 0x12, 0x4c, 0xce, 0x45, 0x8c, 0x01, 0x13, 0x4c, 0xd4,
        0x45, 0xc6, 0x01, 0x14, 0x4c, 0xda, 0x46, 0x5e, 0x01, 0x15, 0x4c, 0xe0, 0x48, 0x1c, 0x01, 0x16,
        0x4c, 0xe6, 0x47, 0x04, 0x01, 0x17, 0x4c, 0xec, 0x47, 0x48, 0x01, 0x18, 0x4c, 0xf2, 0x47, 0x76,
        0x01, 0x19, 0x00, 0x00, 0x47, 0xa4, 0x01, 0x1a
    ];

    private cpu: CPU;
    private canvas: HTMLCanvasElement = null;
    private websocket: WebSocket;
    private websocketURI: string;
    private websocketOpen: boolean;
    private td = 0;
    private tc = 0;
    private rd: number = null;
    private rc: number = null;
    private msg = null;
    private msgidx = 0;
    private msglen = 0;
    private mouseX = -1;
    private mouseY = -1;

    constructor(cpu: CPU, websocketURI: string, canvas: HTMLCanvasElement) {
        this.cpu = cpu;
        this.websocketURI = websocketURI;
        this.canvas = canvas;
    }

    reset() {
        if (!this.websocket || !this.websocketOpen) {
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
                this.cpu.setSuspended(true);
                window.setTimeout(
                    () => {
                        if (this.websocket && this.websocket.onclose) {
                            this.reset();
                        }
                    }, 2000
                );
            };
            this.websocket.onmessage = (evt) => {
                const message = evt.data;
                if (typeof message === "string") {
                    const stringMessage: string = message;
                    const prefix = stringMessage.substring(0, 3);
                    if (prefix === "RD=") {
                        this.rd = Number(stringMessage.substring(3));
                    } else if (prefix === "RC=") {
                        this.rc = Number(stringMessage.substring(3));
                    }
                } else if (typeof message === "object") {
                    this.msg = new Uint8Array(message); // create a byte view
                    this.msglen = this.msg.length;
                    // console.log("TIPI websocket msg len=" + this.msglen);
                    this.msgidx = -2;
                    this.processMsg();
                }
            };
            this.canvas.onmousemove = (evt) => { this.mouseMsg(evt); };
            this.canvas.onmouseup = (evt) => { this.mouseMsg(evt); };
            this.canvas.onmousedown = (evt) => { this.mouseMsg(evt); };
        }
    }

    getTD(): number {
        return this.td;
    }

    setTD(value: number) {
        // console.log("TIPI write TD: " + Util.toHexByte(value));
        this.td = value;
        if (this.websocketOpen) {
            // this.websocket.send("TD=" + value);
        }
    }

    getTC(): number {
        return this.tc;
    }

    setTC(value: number) {
        const changed = (this.tc !== value);
        // console.log("TIPI write TC: " + Util.toHexByte(value));
        this.tc = value;
        if (this.websocketOpen && changed) {
            // this.websocket.send("TC=" + value);
            this.processMsg();
        }
    }

    getRD(): number {
        // console.log("TIPI read RD: " + Util.toHexByte(this.rd) + " " + this.rd);
        return this.rd;
    }

    getRC(): number {
        // console.log("TIPI read RC: " + Util.toHexByte(this.rc) + " " + this.rc);
        return this.rc;
    }

    signalReset() {
        console.log("TIPI signal reset");
        if (this.websocketOpen) {
            // This will close the websocket
            this.websocket.send("RESET");
        }
    }

    processMsg() {
        // do websocket processing
        // console.log("TIPI process TC: " + Util.toHexByte(this.tc) + " "+this.msgidx + "/"+this.msglen);
        if (this.tc === 0xf1) { // TSRSET (reset-sync)
            this.msg = null;
            this.msgidx = -2;
            this.rc = this.tc; // ack reset
            this.websocket.send("SYNC");
        } else if ((this.tc & 0xfe) === 0x02) { // TSWB (write-byte)
            if (this.msgidx === -2) {
                this.msglen = this.td << 8;
            } else if (this.msgidx === -1) {
                this.msglen += this.td;
                this.msg = new Uint8Array(new ArrayBuffer(this.msglen));
            } else if (this.msg != null) {
                this.msg[this.msgidx] = this.td;
                if (this.msgidx + 1 === this.msglen) {
                    this.websocket.send(this.msg.buffer);
                    // console.log("Sending msg len="+this.msglen);
                    this.msg = null;
                }
            }
            this.msgidx++;
            this.rc = this.tc; // ack
        } else if ((this.tc & 0xfe) === 0x06) { // TSRB (read-byte)
            if (this.msg != null) {
                if (this.msgidx === -2) {
                    this.rd = (this.msglen >> 8) & 0xff;
                } else if (this.msgidx === -1) {
                    this.rd = this.msglen & 0xff;
                } else {
                    this.rd = this.msg[this.msgidx];
                }
                this.msgidx++;
                this.rc = this.tc; // ack
            }
        } else {
            // console.log("TIPI write TC: " + Util.toHexByte(this.tc) + " (protocol error)");
        }
    }

    mouseMsg(evt) {
        if (this.websocketOpen) {
            const rect = this.canvas.getBoundingClientRect();
            const scale = this.canvas.clientHeight / (240 * 2);
            const tiX = Math.floor((evt.clientX - rect.left) / scale);
            const tiY = Math.floor((evt.clientY - rect.top) / scale);
            if (this.mouseX !== -1 || this.mouseY !== -1) {
                this.websocket.send("MOUSE " + evt.buttons + " " + (tiX - this.mouseX) + " " + (tiY - this.mouseY));
            }
            this.mouseX = tiX;
            this.mouseY = tiY;
        }
    }

    close() {
        if (this.websocket) {
            this.websocket.onclose = null;
            this.websocket.close();
            this.websocketOpen = false;
            this.cpu.setSuspended(false);
        }
    }
}
