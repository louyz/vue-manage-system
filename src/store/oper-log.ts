import { defineStore } from 'pinia';
import { OperLog } from '@/types/oper-log';

const STORAGE_KEY = 'oper-log-list';

const getLocalLogs = (): OperLog[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveLocalLogs = (logs: OperLog[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const useOperLogStore = defineStore('operLog', {
    state: () => {
        return {
            logs: getLocalLogs() as OperLog[],
        };
    },
    getters: {
        logCount: (state) => state.logs.length,
    },
    actions: {
        /** 添加一条操作日志 */
        addLog(log: Omit<OperLog, 'id' | 'operTime'>) {
            const newLog: OperLog = {
                ...log,
                id: Date.now(),
                operTime: new Date().toLocaleString(),
            };
            this.logs.unshift(newLog);
            saveLocalLogs(this.logs);
        },

        /** 清空所有操作日志 */
        clearLogs() {
            this.logs = [];
            saveLocalLogs(this.logs);
        },

        /** 按条件查询日志（前端过滤） */
        queryLogs(params: { username?: string; operType?: string; module?: string }) {
            let result = [...this.logs];
            if (params.username) {
                result = result.filter((l) => l.username.includes(params.username!));
            }
            if (params.operType) {
                result = result.filter((l) => l.operType === params.operType);
            }
            if (params.module) {
                result = result.filter((l) => l.module === params.module);
            }
            return result;
        },
    },
});
