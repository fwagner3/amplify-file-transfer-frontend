<template>
    <button :disabled="disabled" v-on:click="$emit('click')">
        <span v-if="!loading">{{text}}</span>
        <div v-if="loading">
            <div class="loading"><div></div><div></div><div></div><div></div></div>
        </div>
    </button>
</template>

<script>
export default {
    props: [
        "loading",
        "disabled",
        "text"
    ]
}
</script>

<style scoped>
</style>