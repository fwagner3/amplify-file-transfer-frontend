<template>
<div class="grid">
    <!--Logo-->
    <img src="@/assets/mhp-logo.svg" class="logo">

    <!-- Empty File Upload Field -->
    <div v-if="files.length == 0" class="interactionfield" ref="uploadField" v-on:click="openUploadDialog()">
        <!-- Hidden Upload Input Field -->
        <input type="file" ref="hiddenupload" @change="dialogUpload" hidden/>
        <!-- Plus Icon -->
        <svg class="plus" viewBox="0 0 204 204">
            <polygon points="95 0, 109 0, 109 95, 204 95, 204 109, 109 109, 109 204, 95 204, 95 109, 0 109, 0 95, 95 95" />
        </svg>
        <p>Add your file here</p>
    </div>

    <!-- Filled File Upload Field -->
    <div v-if="files.length == 1" class="interactionfield">
        <!-- Delete Button -->
        <img v-on:click="removeFiles" src="@/assets/cross.svg" class="delete">
        <!-- Image Preview -->
        <img v-if="preview" ref="previewimage" class="preview">
        <!-- Non-Image File Icon -->
        <img v-if="!preview" src="@/assets/file-icon.svg" class="file">
        <p>{{this.files[0].name}}</p>
    </div>

    <form @submit.prevent="submitForm()" class="dialog">
        <h1>Upload</h1>

        <!-- Selector for form page -->
        <div class="pageselector">
            <!-- Selector Links -->
            <div class="selector">
                <!-- Information Tab -->
                <label v-on:click="switchPage(1)" for="1" :class="{ active: this.page == 1, inactive: this.page != 1 }">
                    <input type="radio" name="page" value="1">
                    <span>Information</span>
                </label>
                <!-- Transfer Tab -->
                <label v-on:click="switchPage(2)" for="2" :class="{ active: this.page == 2, inactive: this.page != 2 }">
                    <input type="radio" name="page" value="2">
                    <span>Transfer</span>
                </label>
            </div>
            <!-- Active Page Line Indicators -->
            <div class="indicator">
                <div :class="{ active: (page == 1), inactive: (page != 1) }"></div>
                <div :class="{ active: (page == 2), inactive: (page != 2)}"></div>
            </div>
        </div>

        <div class="spacer"></div>

        <!-- Title Input Field --> 
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
        
        <!-- Description Textarea -->
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

        <!-- Next Button -->
        <button :disabled="!validateFirstPage()" v-if="page == 1" v-on:click="page = 2">Next</button>

        <!-- Transfer Mode Selector -->
        <div v-if="page == 2" class="selector">
            <!-- Email Mode -->
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
            <!-- Link Mode -->
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

        <!-- Recipient Input Field -->
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

        <!-- Sender Input Field -->
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

        <!-- Transfer Button -->
        <Button v-if="page == 2" :disabled="!validateTransfer()" :loading="transferInProgress" @click="submitForm()" :text="'Transfer'"></Button>

        <div class="spacer"></div>
    </form>

    <!-- Logout Button -->
    <button class="logout">Logout</button>

    <!-- Error Modal -->
    <Modal
        v-show="errorModal"
        @close="closeErrorModal"
        :headline="'Error'"
        :body="'An error occurred during the transfer. Try again later.'">
    </Modal>

    <!-- Success Modal -->
    <Modal
        v-show="successModal"
        @close="closeSuccessModal"
        :headline="'Success'"
        :body="(this.form.transfermode == 'link') ? 'The upload was successful. Share the link ' + this.generatedLink : 'The upload was successful'">
    </Modal>
</div>
</template>

<script>
import Modal from '../components/Modal.vue'
import AWSAppSyncClient from 'aws-appsync';
import gql from 'graphql-tag';
import { Auth } from 'aws-amplify';
import Button from '../components/Button.vue';
import Constants from '../constants';

export default {
    name: 'Upload',
    components: {
        Modal,
        Button
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
            preview: false,
            generatedLink: ''
        }
    },
    mounted: function() {
        // Determine whether the browser is capable of dragging and dropping files
        this.dragDropCapable = this.determineDragDropCapable();
    
        // Prevent the default behavior of the browser when a file is dragged and dropped (default is opening the file in a new tab)
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach( function( event ) {
            this.$refs.uploadField.addEventListener(event, function(e) {
                e.preventDefault();
                e.stopPropagation();
            }.bind(this), false); 
        }.bind(this));

        // Add the dropped file to the files array
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
            // Check the test element for the drag and drop attributes
            var div = document.createElement('div');
            return ( ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div) ) && 'FormData' in window && 'FileReader' in window;
        },
        getImagePreview() {
            // Read the file that should be transferred in if it is an image and make it visible
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
            // Click on the hidden file input
            if (this.files.length == 0) {
                this.$refs.hiddenupload.click();
            }
        },
        dialogUpload() {
            this.files.push(this.$refs.hiddenupload.files[0]);
            this.getImagePreview();
        },
        removeFiles() {
            // Clear file array
            this.files = [];

            // Set up the event handlers for the upload field again after the field is empty again
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
            // Title can't be empty
            this.form.title.valid = this.form.title.value.length != 0;
            if (!this.form.title.valid) this.form.title.error = "Title required";
        },
        validateDescription() {
            // Description can't be empty
            this.form.description.valid = this.form.description.value.length != 0;
            if (!this.form.description.valid) this.form.description.error = "Description required";
        },
        validateFirstPage() {
            // Check that no input field on the information page is empty
            return this.form.title.value.length != 0 && this.form.description.value.length != 0; 
        },
        validateRecipient() {
            // Validate the recipient's email address
            this.form.recipient.valid = Constants.emailRegex.test(this.form.recipient.value);
            if (!this.form.recipient.valid) this.form.recipient.error = "Invalid Email";
        },
        validateSender() {
            // Validate the sender's email address
            this.form.sender.valid = Constants.emailRegex.test(this.form.sender.value);
            if (!this.form.sender.valid) this.form.sender.error = "Invalid Email"
        },
        validateTransfer() {
            var firstPageValid = this.validateFirstPage();
            // Check that there is exactly one file in the files array
            var fileValid = this.files.length == 1;
            // Check the email addresses if the email transfer mode was selected
            if (this.form.transfermode == 'email') {
                var recipientValid = Constants.emailRegex.test(this.form.recipient.value);
                var senderValid = Constants.emailRegex.test(this.form.sender.value);
                return firstPageValid && fileValid && recipientValid && senderValid;
            } else {
                return firstPageValid && fileValid;
            }
        },
        async submitForm() {
            // Set the transfer button to the loading state
            this.transferInProgress = true;

            // Create an AWS AppSync Client that handles the connection to the GraphQL endpoint
            const client = new AWSAppSyncClient({
                url: process.env.VUE_APP_APPSYNC_ENDPOINT,
                region: process.env.VUE_APP_APPSYNC_REGION,
                auth: {
                    type: process.env.VUE_APP_APPSYNC_AUTH_TYPE,
                    jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken()
                },
                disableOffline: true
            });

            // Define the mutation query that prepares the file upload
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
                // Send the request
                const data = await client.mutate({mutation: query});

                // Extract the upload URL from the signedURL object, that the server returned
                const signedURL = JSON.parse(data.data.prepareFileUpload.signedURL).uploadURL;

                // Extract the generated share link when the link transfer mode was selected
                if (this.form.transfermode == 'link') {
                    this.generatedLink = data.data.prepareFileUpload.link;
                }

                // Trigger the file upload process
                this.uploadFile(signedURL);
            } catch (e) {
                this.transferInProgress = false;

                // Show the error modal
                this.showErrorModal();
            }
        },
        async uploadFile(signedURL) {
            // Create a blob with the file to upload
            const body = new Blob(this.files, { type: this.files[0].type });
            try {
                // Upload the file
                await fetch(signedURL, {
                    method: 'PUT',
                    body: body
                });
                this.showSuccessModal();
                this.clearForm();
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
        },
        clearForm() {
            this.form.name.value = '';
            this.form.description.value = '';
            this.form.recipient.value = '';
            this.form.sender.value = '';
            this.form.transfermode = 'email';
            this.form.servererror = '';
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