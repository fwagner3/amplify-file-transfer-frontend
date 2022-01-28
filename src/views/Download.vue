<template>
<div class="grid">
    <img src="@/assets/mhp-logo.svg" class="logo">
    <div class="interactionfield">
        <div v-if="loading" class="lds-ring"><div></div><div></div><div></div><div></div></div>
        <img v-if="!loading && !preview" src="@/assets/file-icon.svg" class="file">
        <p v-if="!loading && !preview">No preview available</p>
        <img v-if="!loading && preview" class="preview" ref="preview">
    </div>
    <div class="dialog">
        <h1>{{title}}</h1>
        <p>{{description}}</p>
        <button v-if="!loading" v-on:click="downloadFile()">Download</button>
    </div>
    <Modal v-show="showErrorModal" @close="closeModal">
        <template v-slot:header>
            Error
        </template>
        <template v-slot:body>
            An error occurred. Make sure that the file, that you're trying to download exists
        </template>
    </Modal>
</div>
</template>

<script>
import Modal from '../components/Modal.vue';
import AWSAppSyncClient from 'aws-appsync';
import gql from 'graphql-tag';
import { Auth } from 'aws-amplify';

export default {
    name: 'Download',
    components: {
        Modal
    },
    data: function() {
        return {
            signedUrl: '',
            title: '',
            description: '',
            loading: false,
            preview: false,
            showErrorModal: false
        }
    },
    methods: {
        async getMetadata() {
            const client = new AWSAppSyncClient({
                url: process.env.VUE_APP_APPSYNC_ENDPOINT,
                region: process.env.VUE_APP_APPSYNC_REGION,
                auth: {
                    type: process.env.VUE_APP_APPSYNC_AUTH_TYPE,
                    jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken()
                }
            });

            const query = gql`
                query GetFileMetadata {
                    getFileMetadata(
                        id: "${this.$route.params.id}"
                    ) {
                        signedURL, 
                        name, 
                        description, 
                        sender, 
                        recipient,
                        type
                    }
                }
            `;

            try {
                const data = await client.query({query: query});
                this.signedUrl = data.data.getFileMetadata.signedURL;
                this.title = data.data.getFileMetadata.name;
                this.description = data.data.getFileMetadata.description;

                if(data.data.getFileMetadata.type == 'image/jpeg' || data.data.getFileMetadata.type == 'image/png') {
                    this.showImagePreview();
                } else {
                    this.loading = false;
                }
            } catch (e) {
                this.showModal();
            }
        },
        downloadFile() {
            if (this.signedUrl) {

                fetch(this.signedUrl, {})
                .then(res => res.blob())
                .then(blob => {
                    let url = window.URL.createObjectURL(blob);

                    let el = document.createElement('a');
                        el.setAttribute('href', url);
                        el.setAttribute('download', "file.jpg");

                        el.style.display = 'none';

                        document.body.appendChild(el);

                        el.click();

                        document.body.removeChild(el);
                });
            }
        },
        showImagePreview() {
            fetch(this.signedUrl, {})
            .then(res => res.blob())
            .then(blob => {
                let reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = () => {
                    this.loading = false;
                    this.preview = true;
                    this.$nextTick(() => {
                        this.$refs.preview.src = reader.result;
                    })
                }
            })
        },
        showModal() { this.showErrorModal= true; },
        closeModal() { 
            this.showErrorModal = false; 
            this.$router.push('/login');
        }
    },
    mounted: function() {
        this.loading = true;
        this.getMetadata();
    }
}
</script>

<style scoped>
/* Portrait default */
.dialog {
    margin-top: 168px;
}

.file {
    width: 64px; height: 64px;
}

.preview {
    height: 128px;
}

h1 {
    margin: 0;
}

.dialog > p {
    margin: 0;
}

.lds-ring {
  display: inline-block;
  position: relative;
  width: 50px;
  height: 50px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 38px;
  height: 38px;
  margin: 6px;
  border: 6px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Small devices (landscape phones) */
@media screen and (min-width: 576px) and (orientation: landscape) {
    .dialog {
        margin-top: 0;
    }

    .preview {
        width: 100%;
        height: initial;
    }
}

/* Medium devices (tablets) */
@media screen and (min-width: 768px) {
    .dialog {
        padding-top: calc(1rem + 64px);
    }

    .file {
        width: 128px; height: 128px;
    }
}

/* Small desktop devices (laptops) */
@media screen and (min-width: 992px) {
    
}

/* Medium desktop devices (desktops) */
@media screen and (min-width: 1200px) {

}

/* Large desktop devices (large desktops) */
@media screen and (min-width: 1400px) {

}

/* Extra large desktop devices */
@media screen and (min-width: 2000px) {

}
</style>