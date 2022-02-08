<template>
<div class="grid">
    <!-- Logo -->
    <img src="@/assets/mhp-logo.svg" class="logo">

    <!-- Preview field for the file -->
    <div class="interactionfield">
        <div v-if="loading" class="loading"><div></div><div></div><div></div><div></div></div>
        <img v-if="!loading && !preview" src="@/assets/file-icon.svg" class="file">
        <p v-if="!loading && !preview">No preview available</p>
        <img v-if="!loading && preview" class="preview" ref="preview">
    </div>

    <!-- Dialog with information about the file and the download button -->
    <div class="dialog">
        <h1>{{title}}</h1>
        <p>{{description}}</p>
        <div class="spacer"></div>
        <button v-if="!loading" v-on:click="downloadFile()">Download</button>
    </div>

    <!-- Error Modal -->
    <Modal 
        v-show="showErrorModal"
        @close="closeModal"
        :headline="'Error'"
        :body="'An error occurred. Make sure that the file, that youre trying to download exists'">
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
            // Initialize the AppSync client to make calls to the API
            const client = new AWSAppSyncClient({
                url: process.env.VUE_APP_APPSYNC_ENDPOINT,
                region: process.env.VUE_APP_APPSYNC_REGION,
                auth: {
                    type: process.env.VUE_APP_APPSYNC_AUTH_TYPE,
                    jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken()
                }
            });

            // Query to retrieve the metadata of the file
            const query = gql`
                query GetFileMetadata {
                    getFileMetadata(
                        id: "${this.$route.params.id}"
                    ) {
                        signedURL, 
                        name, 
                        description, 
                        type
                    }
                }
            `;

            try {
                // Extract the data from the response
                const data = await client.query({query: query});
                this.signedUrl = data.data.getFileMetadata.signedURL;
                this.title = data.data.getFileMetadata.name;
                this.description = data.data.getFileMetadata.description;

                // Show a preview of the file if it is an image file
                if(data.data.getFileMetadata.type == 'image/jpeg' || data.data.getFileMetadata.type == 'image/png') {
                    this.showImagePreview();
                } else {
                    this.loading = false;
                }
            } catch (e) {
                // Show the error modal if an error occurred
                this.showModal();
            }
        },
        downloadFile() {
            if (this.signedUrl) {
                // Fetch the file that should be downloaded from the signed S3 url
                fetch(this.signedUrl, {})
                .then(res => res.blob())
                .then(blob => {
                    let url = window.URL.createObjectURL(blob);

                    // Create an invisible download button and click it programmatically to start the download of the file
                    let el = document.createElement('a');
                        el.setAttribute('href', url);
                        el.setAttribute('download', "file.jpg");

                        el.style.display = 'none';

                        document.body.appendChild(el);

                        el.click();

                        document.body.removeChild(el);
                })
                .catch(() => {
                    this.showModal();
                });
            }
        },
        showImagePreview() {
            // Fetch the image file from the signed S3 url
            fetch(this.signedUrl, {})
            .then(res => res.blob())
            .then(blob => {
                // Read the file data into a blob
                let reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = () => {
                    this.loading = false;
                    this.preview = true;

                    // Wait for the next rerender of the page, otherwise the image preview element is not present and the ref is invalid
                    this.$nextTick(() => {
                        this.$refs.preview.src = reader.result;
                    })
                }
            })
            .catch(() => {
                this.showModal();
            });
        },
        showModal() { this.showErrorModal= true; },
        closeModal() { 
            // Route the user to the login page, when the error modal is closed
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
</style>