<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :page-change="changePage" :has-pagination="true">
                <template #toolbarBtn>
                    <el-button type="danger" :icon="Delete" @click="handleClear">清空日志</el-button>
                </template>
                <!-- 操作类型列自定义渲染 -->
                <template #operType="{ rows }">
                    <el-tag :type="getOperTagType(rows.operType)">{{ rows.operType }}</el-tag>
                </template>
                <!-- 结果列自定义渲染 -->
                <template #result="{ rows }">
                    <el-tag :type="rows.result === '成功' ? 'success' : 'danger'">{{ rows.result }}</el-tag>
                </template>
                <!-- 隐藏操作列的默认按钮 -->
                <template #operator="{ rows }">
                    <el-button type="warning" size="small" :icon="View" @click="handleView(rows)">
                        查看
                    </el-button>
                </template>
            </TableCustom>
        </div>
        <el-dialog title="日志详情" v-model="visible" width="700px" destroy-on-close>
            <TableDetail :data="viewData"></TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="oper-log">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, View } from '@element-plus/icons-vue';
import { OperLog } from '@/types/oper-log';
import { useOperLogStore } from '@/store/oper-log';
import { fetchOperLogData } from '@/api';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOptionList } from '@/types/form-option';

const operLogStore = useOperLogStore();

// 查询相关
const query = reactive({
    username: '',
    operType: '',
    module: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '操作人：', prop: 'username', placeholder: '请输入操作人' },
    {
        type: 'select', label: '操作类型：', prop: 'operType', placeholder: '请选择',
        opts: [
            { label: '登录', value: '登录' },
            { label: '退出', value: '退出' },
            { label: '新增', value: '新增' },
            { label: '编辑', value: '编辑' },
            { label: '删除', value: '删除' },
            { label: '查询', value: '查询' },
            { label: '导出', value: '导出' },
            { label: '导入', value: '导入' },
            { label: '授权', value: '授权' },
            { label: '清空', value: '清空' },
        ]
    },
    {
        type: 'select', label: '所属模块：', prop: 'module', placeholder: '请选择',
        opts: [
            { label: '系统登录', value: '系统登录' },
            { label: '用户管理', value: '用户管理' },
            { label: '角色管理', value: '角色管理' },
            { label: '菜单管理', value: '菜单管理' },
            { label: '操作日志', value: '操作日志' },
            { label: '基础表格', value: '基础表格' },
            { label: '主题设置', value: '主题设置' },
        ]
    },
]);

// 表格列定义
const columns = ref([
    { type: 'index', label: '序号', width: 65, align: 'center' },
    { prop: 'username', label: '操作人', width: 100 },
    { prop: 'operType', label: '操作类型', width: 100 },
    { prop: 'module', label: '所属模块', width: 120 },
    { prop: 'content', label: '操作内容' },
    { prop: 'ip', label: 'IP地址', width: 140 },
    { prop: 'result', label: '结果', width: 80 },
    { prop: 'operTime', label: '操作时间', width: 180 },
    { prop: 'operator', label: '操作', width: 120 },
]);

// 分页相关
const page = reactive({
    index: 1,
    size: 10,
    total: 0,
});
const tableData = ref<OperLog[]>([]);

// 获取数据（合并 store 中的真实日志 + mock 数据）
const getData = async () => {
    // 优先使用 store 中的日志（实时记录的操作）
    let allLogs: OperLog[] = [];

    if (operLogStore.logs.length > 0) {
        allLogs = [...operLogStore.logs];
    } else {
        // 首次使用，加载 mock 数据作为演示
        try {
            const res = await fetchOperLogData();
            allLogs = res.data.list;
        } catch {
            allLogs = [];
        }
    }

    // 前端过滤
    if (query.username) {
        allLogs = allLogs.filter((l) => l.username.includes(query.username));
    }
    if (query.operType) {
        allLogs = allLogs.filter((l) => l.operType === query.operType);
    }
    if (query.module) {
        allLogs = allLogs.filter((l) => l.module === query.module);
    }

    page.total = allLogs.length;
    const start = (page.index - 1) * page.size;
    tableData.value = allLogs.slice(start, start + page.size);
};

getData();

const handleSearch = () => {
    changePage(1);
};

const changePage = (val: number) => {
    page.index = val;
    getData();
};

// 操作类型标签颜色映射
const getOperTagType = (type: string) => {
    const map: Record<string, string> = {
        '登录': 'success',
        '退出': 'info',
        '新增': '',
        '编辑': 'warning',
        '删除': 'danger',
        '查询': 'info',
        '导出': '',
        '导入': '',
        '授权': 'warning',
        '清空': 'danger',
    };
    return map[type] || 'info';
};

// 查看详情
const visible = ref(false);
const viewData = ref({
    row: {},
    list: []
});
const handleView = (row: OperLog) => {
    viewData.value.row = { ...row };
    viewData.value.list = [
        { prop: 'id', label: '日志ID' },
        { prop: 'username', label: '操作人' },
        { prop: 'operType', label: '操作类型' },
        { prop: 'module', label: '所属模块' },
        { prop: 'content', label: '操作内容' },
        { prop: 'ip', label: 'IP地址' },
        { prop: 'result', label: '操作结果' },
        { prop: 'operTime', label: '操作时间' },
    ];
    visible.value = true;
};

// 清空日志
const handleClear = () => {
    ElMessageBox.confirm('确定要清空所有操作日志吗？此操作不可恢复。', '提示', {
        type: 'warning',
    }).then(() => {
        operLogStore.clearLogs();
        ElMessage.success('日志已清空');
        getData();
    }).catch(() => { });
};
</script>

<style scoped>
.container {
    padding: 20px 30px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
}
</style>
