<template>
    <el-alert style="margin-bottom: 20px;" :show-icon="true" :closable="false"
        title="Please carefully review the assignment requirements and verify the files you are about to submit. Each group may submit the assignment only once. Your work will be presented in the last class."
        type="warning" effect="dark"></el-alert>
    <el-form :model="uploadForm" ref="uploadFormRef" label-width="240px" v-loading.fullscreen="loading"
        element-loading-text="Uploading your files...">
        <el-form-item label="Class" :required="true">
            <el-select v-model="uploadForm.class_id" @change="fetchGroups" placeholder="Select Class">
                <el-option v-for="cls in classes" :key="cls.id" :label="cls.name" :value="cls.id" />
            </el-select>
        </el-form-item>

        <el-form-item label="Group" :required="true">
            <el-select v-model="uploadForm.group_id" @change="isUploaded" placeholder="Select Group">
                <el-option v-for="grp in groups" :key="grp.id" :label="grp.name" :value="grp.id" />
            </el-select>
        </el-form-item>

        <el-form-item label="Video Title" :required="true">
            <el-input v-model="uploadForm.video_title" placeholder="Enter Video Title" />
        </el-form-item>

        <!-- Updated Upload Fields -->
        <el-form-item label="Video File" :required="true">
            <el-upload ref="videoUploader" :file-list="videoFileList" :on-change="handleFileChange('video')"
                accept=".mp4" :auto-upload="false" list-type="text" :limit="1">
                <el-button>Choose Video File</el-button>
                <template #tip>
                    <div class="el-upload__tip">
                        Please upload the final version of your assignment video. It should be a 2-4 minute short AI
                        based film,
                        in MP4 format, with a resolution of 1080p and an average bitrate of 2000Kbps.
                    </div>
                </template>
            </el-upload>
        </el-form-item>

        <el-form-item label="Project Report" :required="true">
            <el-upload ref="reportUploader" :file-list="reportFileList" :on-change="handleFileChange('report')"
                accept=".pdf" :auto-upload="false" list-type="text" :limit="1">
                <el-button>Choose Report File</el-button>
                <template #tip>
                    <div class="el-upload__tip">
                        Please upload the task report, which should include details on the AI tools used and the
                        division of labor within the group.
                    </div>
                </template>
            </el-upload>
        </el-form-item>

        <el-form-item label="Script File" :required="true">
            <el-upload ref="scriptUploader" :file-list="scriptFileList" :on-change="handleFileChange('script')"
                accept=".doc,.docx" :auto-upload="false" list-type="text" :limit="1">
                <el-button>Choose Script File</el-button>
                <template #tip>
                    <div class="el-upload__tip">
                        Please upload the video script in Word format.
                    </div>
                </template>
            </el-upload>
        </el-form-item>

        <el-form-item label="Screenshots" :required="true">
            <el-upload ref="screenshotUploader" :file-list="screenshotFileList"
                :on-change="handleFileChange('screenshot')" accept=".jpg,.png" :auto-upload="false" multiple
                list-type="picture">
                <el-button>Choose Screenshots</el-button>
                <template #tip>
                    <div class="el-upload__tip">
                        Kindly upload no fewer than 10 screenshots documenting the process.
                    </div>
                </template>
            </el-upload>
        </el-form-item>

        <el-form-item label="Screen Recording File(s)" :required="true">
            <el-upload ref="recordingUploader" :file-list="recordingFileList" :on-change="handleFileChange('recording')"
                accept=".mp4" :auto-upload="false" list-type="text" multiple>
                <el-button>Choose Recording File</el-button>
                <template #tip>
                    <div class="el-upload__tip">
                        You may upload multiple video files, provided that their combined duration is no less than 30
                        minutes.
                    </div>
                </template>
            </el-upload>
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="submitUpload">Submit</el-button>
        </el-form-item>
    </el-form>
    <!-- Progress Bar -->
    <el-progress v-if="uploadProgress > 0" :percentage="uploadProgress" :status="uploadStatus" :text-inside="true"
        :stroke-width="22" style="margin-top: 20px;"></el-progress>

</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus'
import { v4 as uuidv4 } from 'uuid';
export default {
    setup() {
        const uploadForm = ref({
            class_id: null,
            group_id: null,
            video_title: '',
        });
        const videoFileList = ref([]);
        const reportFileList = ref([]);
        const scriptFileList = ref([]);
        const screenshotFileList = ref([]);
        const recordingFileList = ref([]);
        const uploadFormRef = ref(null);
        const classes = ref([]);
        const groups = ref([]);
        const ossSignature = ref("");
        const uploadProgress = ref(0);
        const uploadStatus = ref('');
        const loading = ref(false);

        const fetchOssSignature = async () => {
            try {
                const response = await axios.get('/generate-oss-signature');
                ossSignature.value = response.data;
            } catch (error) {
                ElMessage.error('Failed to fetch OSS signature,please contact teacher.');
                console.error('Failed to fetch OSS signature:', error);
            }
        };
        const uploadFileToOss = async (file) => {
            const formData = new FormData();
            const guid = uuidv4();
            const ossFileName = `${uploadForm.value.class_id}_${uploadForm.value.group_id}_${guid}-${file.name}`;

            formData.append('key', ossFileName);
            formData.append('OSSAccessKeyId', ossSignature.value.accessKeyId);
            formData.append('policy', ossSignature.value.policy);
            formData.append('Signature', ossSignature.value.signature);
            formData.append('file', file.raw);

            try {
                await axios.post('https://eng-assignment-sz.oss-cn-hangzhou.aliyuncs.com', formData, {
                    onUploadProgress: progressEvent => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        uploadProgress.value = percentCompleted;
                    }
                });
                return ossFileName;
            } catch (error) {
                console.error('Failed to upload file to OSS:', error);
                ElMessage.error(`Failed to upload file to OSS:${error},please contact teacher.`);
                uploadStatus.value = 'exception';
                return;
            }
        };

        const fetchClasses = async () => {
            const response = await axios.get('/classes');
            classes.value = response.data;
        };

        const fetchGroups = async (classId) => {
            const response = await axios.get(`/groups/${classId}`);
            groups.value = response.data;
        };

        const isUploaded = async (groupId) => {
            const response = await axios.get(`/is_uploaded/${groupId}`);
            if (!response.data.success) {
                ElMessage({
                    type: 'error',
                    message: `The assignment of your group has already been uploaded.`,
                    duration: 0,
                    showClose: true
                });
                uploadForm.value.group_id = null;
            }
        }

        const handleFileChange = (type) => (file, fileList) => {
            switch (type) {
                case 'video':
                    videoFileList.value = fileList;
                    break;
                case 'report':
                    reportFileList.value = fileList;
                    break;
                case 'script':
                    scriptFileList.value = fileList;
                    break;
                case 'screenshot':
                    screenshotFileList.value = fileList;
                    break;
                case 'recording':
                    recordingFileList.value = fileList;
                    break;
            }
        };

        const submitUpload = async () => {
            await uploadFormRef.value.validate();
            try {
                try {
                    await ElMessageBox.confirm(
                        'Each group may submit the assignment only once. Please ensure that the version you are submitting is the final one. Are you sure you want to submit?',
                        'Warning',
                        {
                            confirmButtonText: 'Submit',
                            cancelButtonText: 'Cancel',
                            type: 'warning',
                        }
                    );
                } catch (error) {
                    return;
                }


                const formData = new FormData();
                await fetchOssSignature();
                loading.value = true;

                // Append each file list to FormData
                for (const file of videoFileList.value) {
                    try {
                        const ossFileName = await uploadFileToOss(file);
                        formData.append('video', ossFileName);
                    } catch (error) {
                        console.error(`Upload file ${file.name} failed:`, error);
                        ElMessage({
                            type: 'error',
                            message: `Upload file ${file.name} failed:` + error,
                        });
                        return;
                    }
                }
                for (const file of reportFileList.value) {
                    try {
                        const ossFileName = await uploadFileToOss(file);
                        formData.append('report', ossFileName);
                    } catch (error) {
                        console.error(`Upload file ${file.name} failed:`, error);
                        ElMessage({
                            type: 'error',
                            message: `Upload file ${file.name} failed:` + error,
                        });
                        return;
                    }
                }
                for (const file of scriptFileList.value) {
                    try {
                        const ossFileName = await uploadFileToOss(file);
                        formData.append('script', ossFileName);
                    } catch (error) {
                        console.error(`Upload file ${file.name} failed:`, error);
                        ElMessage({
                            type: 'error',
                            message: `Upload file ${file.name} failed:` + error,
                        });
                        return;
                    }
                }
                for (const file of screenshotFileList.value) {
                    try {
                        const ossFileName = await uploadFileToOss(file);
                        formData.append('screenshot', ossFileName);
                    } catch (error) {
                        console.error(`Upload file ${file.name} failed:`, error);
                        ElMessage({
                            type: 'error',
                            message: `Upload file ${file.name} failed:` + error,
                        });
                        return;
                    }
                }
                for (const file of recordingFileList.value) {
                    try {
                        const ossFileName = await uploadFileToOss(file);
                        formData.append('recording', ossFileName);
                    } catch (error) {
                        console.error(`Upload file ${file.name} failed:`, error);
                        ElMessage({
                            type: 'error',
                            message: `Upload file ${file.name} failed:` + error,
                        });
                        return;
                    }
                }

                // Append other fields
                Object.entries(uploadForm.value).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                const uploadMsg = await axios.post('/upload', formData);
                if (uploadMsg.data.success) {
                    ElMessage({
                        type: 'success',
                        message: uploadMsg.data.data,
                        duration: 0,
                        showClose: true
                    })
                } else {
                    ElMessage({
                        type: 'warning',
                        message: uploadMsg.data.data,
                        duration: 0,
                        showClose: true
                    })
                }

                videoFileList.value = [];
                reportFileList.value = [];
                scriptFileList.value = [];
                screenshotFileList.value = [];
                recordingFileList.value = [];
                uploadForm.value.class_id = null;
                uploadForm.value.group_id = null;
                uploadForm.value.video_title = '';
                uploadFormRef.value.resetFields();
                uploadProgress.value = 0;
                uploadStatus.value = '';
                loading.value = false;


            } catch (error) {
                console.error(error);
                ElMessage({
                    type: 'error',
                    message: 'Submit failed.' + error,
                    duration: 0,
                    showClose: true
                })
                loading.value = false;
            }
        };

        onMounted(() => {
            fetchClasses();
        });

        return {
            uploadForm,
            videoFileList,
            reportFileList,
            scriptFileList,
            screenshotFileList,
            recordingFileList,
            uploadFormRef,
            classes,
            groups,
            fetchGroups,
            handleFileChange,
            submitUpload,
            ossSignature,
            fetchOssSignature,
            uploadFileToOss,
            uploadProgress,
            uploadStatus,
            loading,
            isUploaded
        };
    },
};
</script>
<style scoped>
.file-alert {
    margin-top: 10px;
}

.loading-modal .el-message-box__header {
    display: none;
}
</style>