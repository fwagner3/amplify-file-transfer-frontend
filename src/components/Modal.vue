<template>
    <div class="modal-backdrop">
        <div class="modal">
            <header class="modal-header">
                {{headline}}
                <button type="button" class="buttonn-close" @click="close">x</button>
            </header>
            <section class="modal-body">
                {{body}}
            </section>
            <footer class="modal-footer">
                <button type="button" class="button" @click="close">Close</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    name: "Modal",
    methods: {
        close() {
            this.$emit('close');
        }
    },
    props: [
        "headline",
        "body",
    ]
}
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0; bottom: 0; left: 0; right: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.modal {
    background-color: #111119;
    overflow-x: auto;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    z-index: 11;
}

.modal-header,
.modal-footer {
    display: flex;
    padding: 20px 32px;
}

.modal-header {
    position: relative;
    background-color: #232330;
    justify-content: space-between;
}

.modal-footer {
    border-top: 1px solid #232330;
    flex-direction: column;
    justify-content: flex-end;
}

.modal-body {
    position: relative;
    padding: 20px 32px;
}

.button-close {
    position: absolute;
    top: 0; right: 0;
    border: none;
    font-size: 20px;
    padding: 20px 32px;
    cursor: pointer;
    font-weight: bold;
    background: transparent;
}
</style>