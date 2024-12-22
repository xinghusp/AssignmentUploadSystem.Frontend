<template>
    <div>
        <qrcode-vue :value="qrValue" :size="size" />
    </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue';

export default {
    components: { QrcodeVue },
    props: {
        qrValue: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            default: 200,
        },
    },
};
</script>

<style scoped>
/* 可根据需要自定义样式 */
</style>
