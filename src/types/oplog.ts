
export interface OperationLog {
    id: number;
    username: string;
    type: string;
    target: string;
    content: string;
    ip: string;
    status: number;
    date: string;
}
