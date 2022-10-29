<template>
    <i-frame v-model:src="url"></i-frame>
</template>

<script setup>
import IFrame from '@/components/IFrame';

const url = ref(import.meta.env.VITE_APP_BASE_API + '/druid/login.html');
</script>
