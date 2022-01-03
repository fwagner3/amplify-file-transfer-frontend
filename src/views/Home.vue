<template>
<div class="home">
  <BG/>
  <Header/>
  <form @submit.prevent="submitForm" class="transfer">
    <div ref="uploadField" v-on:click="openUploadDialog" class="transfer-upload">
      <input type="file" ref="hiddenUpload" @change="dialogUpload" hidden/>
      <div v-if="files.length == 0" class="plus-canvas">
        <svg width="19.8vh" height="19.8vh" viewBox="0 0 204 204">
          <polygon points="95 0, 109 0, 109 95, 204 95, 204 109, 109 109, 109 204, 95 204, 95 109, 0 109, 0 95, 95 95" />
        </svg>
      </div>
      <p v-if="files.length == 0">Add your file here</p>
      <img v-if="files.length == 1" ref="previewImage">
      <p v-if="files.length == 1">{{this.files[0].name}}</p>
    </div>
    <div class="transfer-config">
      <input v-model="form.title" v-on:input="validateFormInput" type="text" placeholder="Title">
      <textarea v-model="form.description" v-on:input="validateFormInput" placeholder="Description"></textarea>
      <div class="transfer-config-spacer"></div>
      <div class="transfer-config-createmode">
        <label for="sendEmail" class="switch-container">
          <input v-model="form.createmode" v-on:change="validateFormInput" type="radio" class="radio-left" name="transferMode" id="sendEmail" value="sendEmail"/>
          <span>Send Email</span>
        </label>
        <label for="getLink" class="switch-container">
          <input v-model="form.createmode" v-on:change="validateFormInput" type="radio" class="radio-right" name="transferMode" id="getLink" value="getLink"/>
          <span>Get Link</span>
        </label>
      </div>
      <input v-if="form.createmode == 'sendEmail'" v-model="form.recipient" v-on:input="validateFormInput" type="text" placeholder="Recipient">
      <input v-if="form.createmode == 'sendEmail'" v-model="form.sender" v-on:input="validateFormInput" type="text" placeholder="Your Email">
      <div class="transfer-config-spacer"></div>
      <input :disabled="!form.valid" type="submit" value="Transfer">
    </div>
  </form>
</div>
</template>

<script>
import BG from '../components/BG.vue';
import Header from '../components/Header.vue';

export default {
  name: 'Home',
  components: {
    BG,
    Header
  },
  data: function() {
    return {
      form: {
        title: '',
        description: '',
        createmode: 'sendEmail',
        recipient: '',
        sender: '',
        valid: false
      },
      dragDropCapable: false,
      files: [],
    }
  },
  methods: {
    submitForm() {
      console.log(this.form);
    },
    determineDragDropCapable() {
      var div = document.createElement('div');
      return ( ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div) ) && 'FormData' in window && 'FileReader' in window;
    },
    getImagePreview() {
      if (this.files.length == 1) {
        if (/.(jpe?g|png|gif)$/i.test(this.files[0].name)) {
          let reader = new FileReader();

          reader.addEventListener("load", function() {
            this.$refs.previewImage.src = reader.result;
          }.bind(this), false);

          reader.readAsDataURL(this.files[0]);
        }
      }
    },
    validateFormInput() {
      let isTitleValid = this.form.title.length != 0;
      let isDescriptionValid = this.form.description.length != 0;

      let isTransferMethodValid = false;
      if (this.form.createmode == "sendEmail") {
        var validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        let isRecipientValid = this.form.recipient.match(validEmailRegex);
        let isSenderValid = this.form.sender.match(validEmailRegex);

        isTransferMethodValid = isRecipientValid && isSenderValid;
      } else {
        isTransferMethodValid = true;
      }

      let isFilePresent = this.files.length == 1;

      this.form.valid = isTitleValid && isDescriptionValid && isTransferMethodValid && isFilePresent; 
    },
    openUploadDialog() {
      if (this.files.length == 0) {
        this.$refs.hiddenUpload.click();
      }
    },
    dialogUpload() {
      this.files.push(this.$refs.hiddenUpload.files[0]);
      this.getImagePreview();
      this.validateFormInput();
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
        this.validateFormInput();
      } else {
        alert("You can only upload one file at a time")
      }
    }.bind(this));
  }
}
</script>

<style scoped>
.home {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgb(29,34,44);
  background: linear-gradient(0deg, rgba(29,34,44,1) 0%, rgba(40,55,64,1) 100%);
}

.transfer {
  position: absolute;
  height: 60.6vh;
  display: flex;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.transfer-upload {
  width: 60.6vh;
  height: 60.6vh;
  background: linear-gradient(-15deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%);
  z-index: 2;
  backdrop-filter: blur(166px);
  border-radius: 14px;
  border: solid 1px rgba(255, 255, 255, 0.6);
  box-shadow: 0px 4px 24px -1px rgba(0, 0, 0, 0.25);
  margin-right: 5.5vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
}

.transfer-upload > p {
  font-size: 3.5vh;
  line-height: 3.5vh;
  color: rgba(255, 255, 255, 0.8);
  background-blend-mode: overlay;
}

.transfer-config {
  width: 33.6vh;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.transfer-config-spacer {
  flex: 1;
}

.transfer-config-createmode {
  width: 100%;
  height: 6.7vh;
  background: linear-gradient(-15deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%);
  backdrop-filter: blur(166px);
  border-radius: 14px;
  border: solid 1px rgba(255, 255, 255, 0.6);
  margin-bottom: 1.6vh;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 4px 0;
  box-shadow: 0px 4px 24px -1px rgba(0, 0, 0, 0.25);
}

.switch-container {
  margin-top: calc(((6.7vh - 8px) - 2vh) / 2 + 4px);
}

input[type="radio"] {
  opacity: 0;
  position: absolute;
}

input[type="radio"] + span {
  transform: translateX(calc(((6.7vh - 8px) - 2vh) / 2));
  padding-top: calc(((6.7vh - 8px) - 2vh) / 2);
  padding-bottom: calc(((6.7vh - 8px) - 2vh) / 2) ;
  min-width: 100px;
  font-size: 2vh;
  color: rgba(255, 255, 255, 0.8);
  background-blend-mode: overlay;
  line-height: 2vh;
  transition: all 0.4s;
}

.radio-left + span {
  padding-left: calc((((33.6vh / 2) - 8px) - 11.62vh) / 2);
  padding-right: calc((((33.6vh / 2) - 8px) - 11.62vh) / 2);
}

.radio-right + span {
  padding-left: calc((((33.6vh / 2) - 8px) - 8.6vh) / 2);
  padding-right: calc((((33.6vh / 2) - 8px) - 8.6vh) / 2);
}

input[type="radio"]:checked + span {
  background-color: #f5c500;
  border-radius: 10px;
  color: white;
  background-blend-mode: normal;
  box-shadow: 0px 4px 24px -1px rgba(0, 0, 0, 0.25);
}

input[type="radio"]:not(:checked) + span {
  cursor: pointer;
}

svg {
  fill: rgba(255, 255, 255, 0.8);
  background-blend-mode: overlay;
}

.plus-canvas {
  margin-top: 5.2vh; 
}

.transfer-upload > img {
  width: 100%;
  border-radius: 14px;
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.25);
}
</style>
