<template>
<div class="grid">
    <img src="@/assets/mhp-logo.svg" class="logo">
    <div v-if="files.length == 0" class="interactionfield" ref="uploadField" v-on:click="openUploadDialog()">
        <input type="file" ref="hiddenupload" @change="dialogUpload" hidden/>
        <svg class="plus" viewBox="0 0 204 204">
            <polygon points="95 0, 109 0, 109 95, 204 95, 204 109, 109 109, 109 204, 95 204, 95 109, 0 109, 0 95, 95 95" />
        </svg>
        <p>Add your file here</p>
    </div>
    <div v-if="files.length == 1" class="interactionfield">
        <img v-on:click="removeFiles" src="@/assets/cross.svg" class="delete">
        <img v-if="preview" ref="previewimage" class="preview">
        <img v-if="!preview" src="@/assets/file-icon.svg" class="file">
        <p>{{this.files[0].name}}</p>
    </div>
    <form class="dialog">
        <h1>Upload</h1>
        <div class="pageselector">
            <div class="selector">
                <label v-on:click="switchPage(1)" for="1" :class="{ active: this.page == 1, inactive: this.page != 1 }">
                    <input type="radio" name="page" value="1">
                    <span>Information</span>
                </label>
                <label v-on:click="switchPage(2)" for="2" :class="{ active: this.page == 2, inactive: this.page != 2 }">
                    <input type="radio" name="page" value="2">
                    <span>Transfer</span>
                </label>
            </div>
            <div class="indicator">
                <div :class="{ active: (page == 1), inactive: (page != 1) }"></div>
                <div :class="{ active: (page == 2), inactive: (page != 2)}"></div>
            </div>
        </div>
        <div class="spacer"></div>
        <div v-if="page == 1" class="inputlabel">
            <label>Title</label>
            <p v-if="!form.title.valid" class="error">{{form.title.error}}</p>
        </div>
        <input 
            v-if="page == 1" 
            v-model="form.title.value"
            @change="validateTitle()"
            :class="{ error: !form.title.valid }"
            type="text" 
            placeholder="Enter your file title">
        <div v-if="page == 1" class="inputlabel">
            <label>Description</label>
            <p v-if="!form.description.valid" class="error">{{form.description.error}}</p>
        </div>
        <textarea 
            v-if="page == 1" 
            v-model="form.description.value"
            @change="validateDescription()"
            :class="{ error: !form.description.valid }"
            placeholder="Enter a description">
        </textarea>
        <div class="spacer"></div>
        <button :disabled="!validateFirstPage()" v-if="page == 1" v-on:click="page = 2">Next</button>
        <div v-if="page == 2" class="selector">
            <label 
                v-on:click="form.transfermode = 'email'" 
                for="email" 
                :class="{ 
                    active: this.form.transfermode == 'email', 
                    inactive: this.form.transfermode != 'email'
                }">
                <input v-model="form.transfermode" type="radio" name="transfermode" value="email">
                <span>Email</span>
            </label>
            <label 
                v-on:click="form.transfermode = 'link'" 
                for="link" 
                :class="{ 
                    active: this.form.transfermode == 'link', 
                    inactive: this.form.transfermode != 'link'
                }">
                <input v-model="form.transfermode" type="radio" name="transfermode" value="link">
                <span>Link</span>
            </label>
        </div>
        <div class="spacer"></div>
        <div v-if="page == 2 && form.transfermode == 'email'" class="inputlabel">
            <label>Recipient</label>
            <p v-if="!form.recipient.valid" class="error">{{form.recipient.error}}</p>
        </div>
        <input 
            v-if="page == 2 && form.transfermode == 'email'"
            v-model="form.recipient.value"
            @change="validateRecipient()"
            :class="{ error: !form.recipient.valid }" 
            type="text" 
            placeholder="Enter the recpient's email">
        <div v-if="page == 2 && form.transfermode == 'email'" class="inputlabel">
            <label>Sender</label>
            <p v-if="!form.sender.valid" class="error">{{form.sender.error}}</p>
        </div>
        <input 
            v-if="page == 2 && form.transfermode == 'email'" 
            v-model="form.sender.value"
            @change="validateSender()"
            :class="{ error: !form.sender.valid }"
            type="text" 
            placeholder="Enter your email">
        <div class="spacer"></div>
        <button :disabled="!validateTransfer()" v-on:click="submitForm()" v-if="page == 2">
            <span v-if=!transferInProgress>Transfer</span>
            <div v-if="transferInProgress">
                <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
        </button>
        <div class="spacer"></div>
    </form>
    <button class="logout">Logout</button>
    <Modal v-show="errorModal" @close="closeErrorModal">
        <template v-slot:header>
            Error
        </template>
        <template v-slot:body>
            An error occurred during the transfer. Try again later.
        </template>
    </Modal>
    <Modal v-show="successModal" @close="closeSuccessModal">
        <template v-slot:header>
            Success
        </template>
        <template v-slot:body>
            The upload was successful
        </template>
    </Modal>
</div>
</template>

<script>
import Modal from '../components/Modal.vue'
import AWSAppSyncClient from 'aws-appsync';
import gql from 'graphql-tag';
import { Auth } from 'aws-amplify';

export default {
    name: 'Upload',
    components: {
        Modal,
    },
    data: function() {
        return {
            form: {
                title: {
                    value: '',
                    valid: true,
                    error: ''
                },
                description: {
                    value: '',
                    valid: true,
                    error: ''
                },
                recipient: {
                    value: '',
                    valid: true,
                    error: ''
                },
                sender: {
                    value: '',
                    valid: true,
                    error: ''
                },
                servererror: '',
                transfermode: 'email'
            },
            files: [],
            page: 1,
            errorModal: false,
            successModal: false,
            transferInProgress: false,
            preview: false
        }
    },
    mounted: function() {
        this.dragDropCapable = this.determineDragDropCapable();
    
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach( function( event ) {
            this.$refs.uploadField.addEventListener(event, function(e) {
                e.preventDefault();
                e.stopPropagation();
            }.bind(this), false); 
        }.bind(this));

        this.$refs.uploadField.addEventListener('drop', function(e) {
            if (this.files.length == 0) {
                this.files.push(e.dataTransfer.files[0]);
                this.getImagePreview();
            } else {
                alert("You can only upload one file at a time")
            }
        }.bind(this));
    },
    methods: {
        determineDragDropCapable() {
            var div = document.createElement('div');
            return ( ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div) ) && 'FormData' in window && 'FileReader' in window;
        },
        getImagePreview() {
            if (this.files.length == 1) {
                if (/.(jpe?g|png|gif)$/i.test(this.files[0].name)) {
                    this.preview = true;
                    let reader = new FileReader();

                    reader.addEventListener("load", function() {
                        this.$refs.previewimage.src = reader.result;
                    }.bind(this), false);

                    reader.readAsDataURL(this.files[0]);
                } else {
                    this.preview = false;
                }
            }
        },
        openUploadDialog() {
            if (this.files.length == 0) {
                this.$refs.hiddenupload.click();
            }
        },
        dialogUpload() {
            this.files.push(this.$refs.hiddenupload.files[0]);
            this.getImagePreview();
        },
        removeFiles() {
            this.files = [];

            this.$nextTick(() => {
                ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach( function( event ) {
                    this.$refs.uploadField.addEventListener(event, function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }.bind(this), false);
                }.bind(this));

                this.$refs.uploadField.addEventListener('drop', function(e) {
                    if (this.files.length == 0) {
                        this.files.push(e.dataTransfer.files[0]);
                        this.getImagePreview();
                    } else {
                        alert("You can only upload one file at a time");
                    }
                }.bind(this));
            });
        },
        validateTitle() {
            this.form.title.valid = this.form.title.value.length != 0;
            if (!this.form.title.valid) this.form.title.error = "Title required";
        },
        validateDescription() {
            this.form.description.valid = this.form.description.value.length != 0;
            if (!this.form.description.valid) this.form.description.error = "Description required";
        },
        validateFirstPage() {
            return this.form.title.value.length != 0 && this.form.description.value.length != 0; 
        },
        validateRecipient() {
            var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            this.form.recipient.valid = emailRegex.test(this.form.recipient.value);
            if (!this.form.recipient.valid) this.form.recipient.error = "Invalid Email";
        },
        validateSender() {
            var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            this.form.sender.valid = emailRegex.test(this.form.sender.value);
            if (!this.form.sender.valid) this.form.sender.error = "Invalid Email"
        },
        validateTransfer() {
            var firstPageValid = this.validateFirstPage();
            var fileValid = this.files.length == 1;
            if (this.form.transfermode == 'email') {
                var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                var recipientValid = emailRegex.test(this.form.recipient.value);
                var senderValid = emailRegex.test(this.form.sender.value);
                return firstPageValid && fileValid && recipientValid && senderValid;
            } else {
                return firstPageValid && fileValid;
            }
        },
        async submitForm() {
            this.transferInProgress = true;

            const client = new AWSAppSyncClient({
                url: process.env.VUE_APP_APPSYNC_ENDPOINT,
                region: process.env.VUE_APP_APPSYNC_REGION,
                auth: {
                    type: process.env.VUE_APP_APPSYNC_AUTH_TYPE,
                    jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken()
                }
            });

            const query = gql`
                mutation PrepareFileUpload {
                    prepareFileUpload(
                        type: "${this.files[0].type}",
                        name: "${this.files[0].name}",
                        title: "${this.form.title.value}",
                        description: "${this.form.description.value}",
                        mode: "${(this.form.transfermode == "email") ? "Email" : "Link"}",
                        recipient: "${this.form.recipient.value}",
                        sender: "${this.form.sender.value}"
                    ) {
                        signedURL,
                        link
                    }
                }
            `;

            try {
                const data = await client.mutate({mutation: query});
                const signedURL = JSON.parse(data.data.prepareFileUpload.signedURL).uploadURL;
                this.uploadFile(signedURL);
            } catch (e) {
                this.transferInProgress = false;
                this.showModal();
            }
        },
        async uploadFile(signedURL) {
            const body = new Blob(this.files, { type: 'image/jpeg' });
            try {
                await fetch(signedURL, {
                    method: 'PUT',
                    body: body
                });
                this.showSuccessModal();
                this.transferInProgress = false;
            } catch (e) {
                this.transferInProgress = false;
                this.showModal();
            }
        },
        showErrorModal() { this.errorModal = true; },
        closeErrorModal() { this.errorModal = false; },
        showSuccessModal() { this.successModal = true; },
        closeSuccessModal() { this.successModal = false; },
        switchPage(page) {
            if (page == 2) {
                if (this.validateFirstPage()) {
                    this.page = 2;
                } else {
                    return
                }
            } else {
                this.page = 1;
            }
        }
    }
}
</script>

<style scoped>
/* Portrait default */
.plus {
    fill: white;
    width: 64px; height: 64px;
}

.preview {
    height: 64px;
}

.delete {
    width: 32px; height: 32px;
    cursor: pointer;
}

.dialog {
    margin-top: 104px;
}

.pageselector {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
}

.pageselector > .selector {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border: none;
    box-sizing: border-box;
}

.pageselector > .selector > label.active {
    background: none;
}

.pageselector > .selector > label.active > span { 
    color: white; 
    cursor: default;
}

.pageselector > .selector > label.inactive {
    background: none;
    cursor: default;
}

.pageselector > .selector > label.inactive > span { 
    color: #525252;
    cursor: pointer;
}

.indicator {
    width: 100%;
    height: 4px;
    display: flex;
    flex-direction: row;
}

.indicator > div {
    flex: 1;
    height: 100%;
}

.indicator > div.active {
    background: #009BD2;
}

.indicator > div.inactive {
    background: #525252;
}

.file {
    width: 64px; height: 64px;
}

.lds-ring {
  display: inline-block;
  position: relative;
  width: 1rem;
  height: 1rem;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: calc(1rem - 4px);
  height: calc(1rem - 4px);
  margin: 2px;
  border: 2px solid #fff;
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
        height: initial;
        width: 100%;
    }

    .delete {
        align-self: flex-end;
    }
}

/* Medium devices (tablets) */
@media screen and (min-width: 768px) {
    .plus {
        width: 128px; height: 128px;
    }

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