<template>
<div class="download">
    <BG/>
    <Header/>
    <div class="download-viewer-wrapper">
        <div class="download-viewer">
            <div class="download-viewer-preview"></div>
            <div class="download-viewer-spacer"></div>
            <div class="download-viewer-meta">
                <h1>Filename.xyz</h1>
                <p>File Sender | dd.mm.yyyyy</p>
                <p>00,00GB</p>
                <div class="download-viewer-meta-spacer"></div>
                <button class="primary-button">Download</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import BG from '../components/BG.vue';
import Header from '../components/Header.vue';

export default {
    name: 'Download',
    components: {
        BG,
        Header
    }
}
</script>

<style scoped>
.download {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(29,34,44);
    background: linear-gradient(0deg, rgba(29,34,44,1) 0%, rgba(40,55,64,1) 100%);
}

.download-viewer-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.download-viewer {
    width: 72.92vw;
    height: 60.6vh;
    background: linear-gradient(-15deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%);
    z-index: 2;
    backdrop-filter: blur(166px);
    border-radius: 14px;
    border: solid 1px rgba(255, 255, 255, 0.6);
    box-shadow: 0px 4px 24px -1px rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3.1vh;
}

.download-viewer-preview {
    height: 100%;
    width: 68%;
    background-color: white;
    border-radius: 14px;
}

.download-viewer-spacer {
    height: 100%;
    width: 2px;
    background-color: white;
    background-blend-mode: overlay;
}

.download-viewer-meta {
    height: 100%;
    width: 28%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}

.download-viewer-meta > h1 {
    font-size: 4vh;
    margin: 0;
}

.download-viewer-meta > p {
    font-size: 1.8vh;
    margin-bottom: 0;
}

.download-viewer-meta-spacer {
    flex: 1;
}
</style>