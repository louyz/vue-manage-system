export interface OperLog {
    id: number;
    username: string;
    operType: string;
    module: string;
    content: string;
    ip: string;
    result: string;
    operTime: string;
}

export type OperType = '登录' | '退出' | '新增' | '编辑' | '删除' | '查询' | '导出' | '导入' | '授权' | '清空';

export type OperModule = '用户管理' | '角色管理' | '菜单管理' | '操作日志' | '系统登录' | '基础表格' | '主题设置';
