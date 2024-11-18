import { ControllerStatus } from "./controllerStatus.types";

export interface Controller {
    id?: string;
    name?: string;
    model?: string;
    application?: string;
    ipAddress?: string;
    status?: string;
    serialNumber?: string;
    intervalMs?: number;
    maxConnection?: number;
    location?: string;
    controllerStatus?: ControllerStatus   
}