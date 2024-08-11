export interface Robot {
    id: string;
    name: string;
    model: string;
    ipAddress: string;
    status: string;
    serialNumber: string;
    intervalMs: number;
    maxConnection: number;
    location: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
}