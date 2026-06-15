<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :page-change="changePage" :refresh="getData" :hasToolbar="true">
                <template #toolbarBtn>
                    <el-button type="danger" :icon="Delete" @click="handleClear">清空日志</el-button>
                </template>
                <template #type="{ rows }">
                    <el-tag :type="getTagType(rows.type)">{{ rows.type }}</el-tag>
                </template>
                <template #status="{ rows }">
                    <el-tag :type="rows.status === 1 ? 'success' : 'danger'">
                        {{ rows.status === 1 ? '成功' : '失败' }}
                    </el-tag>
                </template>
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

<script setup lang="ts" name="system-oplog">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, View } from '@element-plus/icons-vue';
import { OperationLog } from '@/types/oplog';
import { fetchOpLogData } from '@/api';
import { useOplogStore } from '@/store/oplog';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOptionList } from '@/types/form-option';

const oplogStore = useOplogStore();

// 查询相关
const query = reactive({
    username: '',
    type: '',
    date: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '操作人：', prop: 'username' },
    {
        type: 'select', label: '操作类型：', prop: 'type', opts: [
            { label: '登录', value: '登录' },
            { label: '登出', value: '登出' },
            { label: '新增', value: '新增' },
            { label: '编辑', value: '编辑' },
            { label: '删除', value: '删除' },
            { label: '查看', value: '查看' },
            { label: '导出', value: '导出' },
        ]
    },
    { type: 'date', label: '操作日期：', prop: 'date', format: 'YYYY-MM-DD' },
]);
const handleSearch = () => {
    changePage(1);
};

// 表格相关
const columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'username', label: '操作人' },
    { prop: 'type', label: '操作类型', width: 100 },
    { prop: 'target', label: '操作模块' },
    { prop: 'content', label: '操作内容' },
    { prop: 'ip', label: 'IP地址', width: 140 },
    { prop: 'status', label: '状态', width: 80 },
    { prop: 'date', label: '操作时间', width: 180 },
    { prop: 'operator', label: '操作', width: 100 },
]);
const page = reactive({
    index: 1,
    size: 10,
    total: 0,
});

const allData = ref<OperationLog[]>([]);
const tableData = computed(() => {
    let filtered = allData.value;
    if (query.username) {
        filtered = filtered.filter(item => item.username.includes(query.username));
    }
    if (query.type) {
        filtered = filtered.filter(item => item.type === query.type);
    }
    if (query.date) {
        filtered = filtered.filter(item => item.date.startsWith(query.date));
    }
    page.total = filtered.length;
    const start = (page.index - 1) * page.size;
    return filtered.slice(start, start + page.size);
});

const getData = async () => {
    const res = await fetchOpLogData();
    const mockList: OperationLog[] = res.data.list || [];
    // 合并 mock 数据和本地存储的日志，按时间倒序
    const localLogs = oplogStore.logs;
    const merged = [...localLogs, ...mockList];
    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    allData.value = merged;
};
getData();

const changePage = (val: number) => {
    page.index = val;
};

// 操作类型标签颜色
const getTagType = (type: string) => {
    const map: Record<string, string> = {
        '登录': '',
        '登出': 'info',
        '新增': 'success',
        '编辑': 'warning',
        '删除': 'danger',
        '查看': '',
        '导出': 'info',
    };
    return map[type] || '';
};

// 查看详情弹窗
const visible = ref(false);
const viewData = ref({
    row: {},
    list: [] as any[],
});
const handleView = (row: OperationLog) => {
    viewData.value.row = { ...row };
    viewData.value.list = [
        { prop: 'id', label: '日志ID' },
        { prop: 'username', label: '操作人' },
        { prop: 'type', label: '操作类型' },
        { prop: 'target', label: '操作模块' },
        { prop: 'content', label: '操作内容' },
        { prop: 'ip', label: 'IP地址' },
        { prop: 'status', label: '状态' },
        { prop: 'date', label: '操作时间' },
    ];
    visible.value = true;
};

// 清空日志
const handleClear = () => {
    ElMessageBox.confirm('确定要清空所有本地操作日志吗？', '提示', {
        type: 'warning',
    })
        .then(() => {
            oplogStore.clearLogs();
            getData();
            ElMessage.success('清空成功');
        })
        .catch(() => {});
};
</script>

<style scoped></style>
