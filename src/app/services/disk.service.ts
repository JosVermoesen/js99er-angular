import {Injectable} from '@angular/core';
import {Log} from '../classes/log';
import {DiskDrive} from '../emulator/classes/disk-drive';
import {CommandDispatcherService} from './command-dispatcher.service';
import {Observable} from 'rxjs';
import {Subject} from 'rxjs';
import {ObjectLoaderService} from './object-loader.service';
import {DiskImage, DiskImageEvent} from '../emulator/classes/disk-image';
import {EventDispatcherService} from './event-dispatcher.service';
import saveAs from 'file-saver';
import {Command, CommandType} from '../classes/command';
import {ConsoleEvent, ConsoleEventType} from '../classes/console-event';
import {DiskFile} from '../emulator/classes/disk-file';
import {DatabaseService} from "./database.service";
import {forkJoin} from "rxjs";
import {BlobReader, BlobWriter, Entry, ZipReader} from "@zip.js/zip.js";
import {Software} from "../classes/software";
import {HttpClient} from "@angular/common/http";
import {Util} from "../classes/util";
import {SettingsService} from "./settings.service";

@Injectable()
export class DiskService {

    private diskImages: DiskImage[] = [];
    private diskImageCharCode = 65;
    private log: Log = Log.getLog();

    constructor(
        private commandDispatcherService: CommandDispatcherService,
        private eventDispatcherService: EventDispatcherService,
        private objectLoaderService: ObjectLoaderService,
        private databaseService: DatabaseService,
        private settingsService: SettingsService,
        private httpClient: HttpClient
    ) {
        this.commandDispatcherService.subscribe(this.onCommand.bind(this));
        this.eventDispatcherService.subscribe(this.onEvent.bind(this));
    }

    createDefaultDiskImages(): DiskImage[] {
        for (let i = 0; i < 3; i++) {
            this.createDiskImage('Disk ' + String.fromCharCode(this.diskImageCharCode++));
        }
        return this.diskImages;
    }

    createDiskImage(name: string): DiskImage {
        const diskImage = new DiskImage(name, this.onDiskImageChanged.bind(this));
        this.diskImages.push(diskImage);
        return diskImage;
    }

    onDiskImageChanged(event: DiskImageEvent) {
       this.eventDispatcherService.diskChanged(event.diskImage);
       if (event.type === 'PHYSICAL_PROPERTIES_CHANGED' && this.settingsService.getDisk() === 'TIFDC' && event.diskImage) {
           if (event.diskImage.getPhysicalProperties().totalSectors > 720) {
               this.log.warn("Disk image too big for the TI Floppy Disk Controller");
           }
       }
    }

    loadDiskFiles(files: [File], diskDrive: DiskDrive): Observable<DiskImage | null> {
        const subject = new Subject<DiskImage | null>();
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file != null) {
                const extension = file.name.split('.').pop();
                if (extension != null && extension.toLowerCase() === 'zip') {
                    // Zip file
                    new ZipReader(new BlobReader(file)).getEntries().then(
                        (entries: Entry[]) => {
                            const observables: Observable<DiskImage>[] = [];
                            entries.forEach(entry => {
                                if (!entry.directory) {
                                    observables.push(this.loadDiskFileFromZipEntry(entry, diskDrive));
                                }
                            });
                            forkJoin(observables).subscribe(
                                (diskImages: DiskImage[]) => {
                                    subject.next(diskImages.length ? diskImages[0] : null);
                                },
                                (message) => {
                                    this.log.error(message);
                                    subject.error(message);
                                }
                            );
                        }
                    ).catch(
                        (message) => {
                            this.log.error(message);
                            subject.error(message);
                        }
                    );
                } else if (extension != null && extension.toLowerCase() === 'obj') {
                    // Object file
                    this.log.info('Loading object file.');
                    const reader = new FileReader();
                    reader.onload = () => {
                        this.objectLoaderService.loadObjFile(reader.result as string);
                        this.commandDispatcherService.loadSoftware(
                            this.objectLoaderService.getSoftware()
                        );
                        subject.next(null);
                    };
                    reader.onerror = () => {
                        subject.error(reader.error?.name);
                    };
                    reader.readAsText(file);
                } else if (extension != null && extension.toLowerCase() === 'json') {
                    // JSON software
                    this.log.info('Loading JSON file.');
                    const reader = new FileReader();
                    reader.onload = () => {
                        const data = JSON.parse(reader.result as string);
                        this.commandDispatcherService.loadSoftware(
                            new Software(data)
                        );
                        subject.next(null);
                    };
                    reader.onerror = () => {
                        subject.error(reader.error?.name);
                    };
                    reader.readAsText(file);
                } else {
                    // Single file (DSK image, TIFILE, V9T9)
                    this.loadDiskFile(file.name, file, diskDrive, true).subscribe(subject);
                }
            }
        }
        return subject.asObservable();
    }

    loadDiskFileFromZipEntry(entry: Entry, diskDrive: DiskDrive): Observable<DiskImage> {
        const subject = new Subject<DiskImage>();
        entry.getData!(new BlobWriter()).then(
            (blob: Blob) => {
                this.loadDiskFile(entry.filename.split('/').pop() || '', blob, diskDrive, false).subscribe(subject);
            }
        );
        return subject.asObservable();
    }

    loadDiskFile(filename: string, file: Blob, diskDrive: DiskDrive, acceptDiskImage: boolean): Observable<DiskImage> {
        const subject = new Subject<DiskImage>();
        const reader = new FileReader();
        const service = this;
        reader.onload = function () {
            // reader.result contains the contents of blob as a typed array
            const fileBuffer = new Uint8Array(this.result as ArrayBuffer);
            let diskImage: DiskImage | null;
            if (acceptDiskImage && Util.isDiskImage(fileBuffer)) {
                diskImage = diskDrive.loadBinaryImage(filename, fileBuffer, service.onDiskImageChanged.bind(service));
            } else {
                diskImage = diskDrive.getDiskImage();
                if (!diskImage) {
                    diskImage = service.addDisk();
                    diskDrive.setDiskImage(diskImage);
                    service.eventDispatcherService.diskInserted(diskDrive, diskImage);
                }
                diskImage.loadTIFile(filename, fileBuffer, false);
            }
            subject.next(diskImage);
        };
        reader.onerror = function () {
            subject.error(reader.error?.name);
        };
        reader.readAsArrayBuffer(file);
        return subject.asObservable();
    }

    fetchAndLoadDiskFileFromURL(url: string, diskDrive: DiskDrive): Observable<DiskImage> {
        const subject = new Subject<DiskImage>();
        this.fetchDiskFileFromURL(url).subscribe({
            next: (file) => {
                this.loadDiskFile(file.name, file, diskDrive, true).subscribe({
                    next: (diskImage) => {
                        subject.next(diskImage);
                        subject.complete();
                    },
                    error: (error) => {
                        subject.error(error);
                    }
                });
            },
            error: (error) => {
                subject.error(error);
            }
        });
        return subject.asObservable();
    }

    fetchDiskFileFromURL(url: string): Observable<File> {
        const subject = new Subject<File>();
        if (url.startsWith('http')) {
            url = 'proxy?url=' + url;
        } else {
            url = 'assets/' + url;
        }
        this.httpClient.get(url, {responseType: 'blob'}).subscribe({
            next: (blob) => {
                const filename = url.split('/').pop() || 'unknown';
                const file = new File([blob], filename);
                subject.next(file);
                subject.complete();
            },
            error: (error) => {
                subject.error(error);
            }
        });
        return subject.asObservable();
    }

    addDisk(): DiskImage {
        const diskImage: DiskImage = this.createDiskImage('Disk ' + String.fromCharCode(this.diskImageCharCode++));
        this.eventDispatcherService.diskAdded(diskImage);
        return diskImage;
    }

    deleteDisk(diskImage: DiskImage) {
        const index = this.diskImages.indexOf(diskImage);
        if (index !== -1) {
            this.diskImages.splice(index, 1);
            this.eventDispatcherService.diskDeleted(diskImage);
        }
    }

    deleteFiles(diskImage: DiskImage, diskFiles: DiskFile[]) {
        diskFiles.forEach((diskFile: DiskFile) => {
            diskImage.deleteFile(diskFile.getName());
        });
        this.eventDispatcherService.diskChanged(diskImage);
    }

    saveFiles(diskImage: DiskImage, diskFiles: DiskFile[]) {
        for (const diskFile of diskFiles) {
            const tiFile = diskImage.createTIFile(diskFile.getName());
            if (tiFile) {
                const blob = new Blob([tiFile], { type: "application/octet-stream" });
                saveAs(blob, diskFile.getName() + ".tifiles");
            }
        }
    }

    saveDiskImageAs(diskImage: DiskImage) {
        const imageFile = diskImage.getBinaryImage();
        const blob = new Blob([imageFile], { type: "application/octet-stream" });
        saveAs(blob, diskImage.getName() + ".dsk");
    }

    onCommand(command: Command) {
        switch (command.type) {
            case CommandType.ADD_DISK:
                this.addDisk();
                break;
            case CommandType.SAVE_DISK_FILES:
                this.saveFiles(command.data.diskImage, command.data.diskFiles);
                break;
            case CommandType.SAVE_DISK:
                this.saveDiskImageAs(command.data);
                break;
            case CommandType.DELETE_DISK:
                this.deleteDisk(command.data);
                break;
            case CommandType.DELETE_DISK_FILES:
                this.deleteFiles(command.data.diskImage, command.data.diskFiles);
                break;
        }
    }

    onEvent(event: ConsoleEvent) {
        switch (event.type) {
            case ConsoleEventType.DISK_INSERTED:
                const diskImage: DiskImage = event.data.diskImage;
                if (this.diskImages.indexOf(diskImage) === -1) {
                    this.diskImages.push(diskImage);
                }
                break;
        }
    }

    saveDiskImages(diskImages: DiskImage[]): Observable<void[]> {
        const observables: Observable<void>[] = [];
        diskImages.forEach((diskImage: DiskImage) => {
            observables.push(this.databaseService.putDiskImage(diskImage));
        });
        return forkJoin(observables);
    }

    saveDiskDrives(diskDrives: DiskDrive[]): Observable<void[]> {
        const observables: Observable<void>[] = [];
        diskDrives.forEach((diskDrive: DiskDrive) => {
            observables.push(this.databaseService.putDiskDrive(diskDrive));
        });
        return forkJoin(observables);
    }

    restoreDiskDrives(diskDrives: DiskDrive[], diskImages: DiskImage[]): Observable<void[]> {
        const observables: Observable<void>[] = [];
        diskDrives.forEach((diskDrive: DiskDrive) => {
            observables.push(this.restoreDiskDrive(diskDrive, diskImages));
        });
        return forkJoin(observables);
    }

    restoreDiskDrive(diskDrive: DiskDrive, diskImages: DiskImage[]): Observable<void> {
        const subject = new Subject<void>();
        this.databaseService.getDiskDrive(diskDrive.getName()).subscribe(
            (diskDriveState: any) => {
                if (diskDriveState) {
                    if (diskDriveState.diskImage) {
                        const diskImage = diskImages.find(diskImage => diskImage.getName() === diskDriveState.diskImage);
                        diskDrive.setDiskImage(diskImage || null);
                        this.log.info("Disk image " + diskDrive.getDiskImage()?.getName() + " restored to " + diskDrive.getName() + ".");
                    } else {
                        diskDrive.setDiskImage(null);
                    }
                    subject.next();
                } else {
                    subject.error("Failed to restore disk drive " + diskDrive.getName());
                }
            }
        );
        return subject.asObservable();
    }
}
