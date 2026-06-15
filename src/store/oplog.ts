import { defineStore } from 'pinia';
import { OperationLog } from '@/types/oplog';

const STORAGE_KEY = 'vuems_oplog';

export const useOplogStore = defineStore('oplog', {
    state: () => {
        const logs: OperationLog[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return { logs };
    },
    actions: {
        addLog(log: Omit<OperationLog, 'id' | 'date' | 'ip'>) {
            const newLog: OperationLog = {
                id: Date.now(),
                ip: '127.0.0.1',
                date: new Date().toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                }).replace(/\//g, '-'),
                ...log,
            };
            this.logs.unshift(newLog);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
        },
        clearLogs() {
            this.logs = [];
            localStorage.removeItem(STORAGE_KEY);
        },
    },
});
