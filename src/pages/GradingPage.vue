<template>
    <div>
        <el-row>
            <el-col :span="24">
                <qrcode-vue :value="qrCodeValue" :size="200" />
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { ref } from 'vue';
import QrcodeVue from '../components/QrcodeComponent.vue';

export default {
    components: { QrcodeVue },
    setup() {
        const qrCodeValue = ref(`${window.location.origin}/grade`);
        return { qrCodeValue };
    },
};
</script>