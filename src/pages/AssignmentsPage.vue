<template>
    <el-table :data="assignments" border style="width: 100%">
        <el-table-column prop="group_id" label="Group ID" />
        <el-table-column prop="video_title" label="Video Title" />
        <el-table-column label="Actions">
            <template #default="scope">
                <el-button type="primary" @click="navigateToGrading(scope.row.id)">Grade</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const assignments = ref([]);
        const router = useRouter();

        const fetchAssignments = async () => {
            const response = await axios.get('/assignments');
            assignments.value = response.data;
        };

        const navigateToGrading = (assignmentId) => {
            router.push(`/grading/${assignmentId}`);
        };

        onMounted(() => {
            fetchAssignments();
        });

        return {
            assignments,
            navigateToGrading,
        };
    },
};
</script>