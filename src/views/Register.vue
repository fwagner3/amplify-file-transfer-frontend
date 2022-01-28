<template>
<div class="grid">
    <img src="@/assets/mhp-logo.svg" class="logo">
    <div class="interactionfield"></div>
    <form @submit.prevent="signUp" class="dialog">
        <h1>Register</h1>
        <div class="spacer"></div>
        <p v-if="form.servererror.length != 0" class="error">{{form.servererror}}</p>
        <div class="inputlabel">
            <label>Email</label>
            <p v-if="!form.email.valid" class="error">{{form.email.error}}</p>
        </div>
        <input
            v-model="form.email.value"
            @change="validateEmail()"
            :class="{ error: !form.email.valid }"
            type="text"
            placeholder="Enter your email">
        <div class="inputlabel">
            <label>Password</label>
            <p v-if="!form.password.valid" class="error">{{form.password.error}}</p>
        </div>
        <input
            v-model="form.password.value"
            @change="validatePassword()"
            :class="{ error: !form.password.valid }"
            type="password"
            placeholder="Enter your password">
        <div class="inputlabel">
            <label>Repeat Password</label>
            <p v-if="!form.repeatpassword.valid" class="error">{{form.repeatpassword.error}}</p>
        </div>
        <input
            v-model="form.repeatpassword.value"
            @change="validateRepeatPassword()"
            :class="{ error: !form.repeatpassword.valid }"
            type="password"
            placeholder="Repeat your password">
        <div class="spacer"></div>
        <router-link to="/login">Login to existing account</router-link>
        <div class="spacer"></div>
        <input :disabled="!validateForm()" type="submit" value="Register">
        <div class="spacer"></div>
    </form>
    <Modal v-show="showSuccessModal" @close="closeModal">
        <template v-slot:header>
            Successful
        </template>
        <template v-slot:body>
            Your registration was successful. Confirm your account by clicking on the link, that was send to your email address.
        </template>
    </Modal>
</div>
</template>

<script>
import Modal from '../components/Modal.vue';
import { Auth } from 'aws-amplify';

export default {
    name: 'Register',
    components: {
        Modal,
    },
    data: function() {
        return {
            form: {
                email: {
                    value: '',
                    valid: true,
                    error: ''
                },
                password: {
                    value: '',
                    valid: true,
                    error: ''
                },
                repeatpassword: {
                    value: '',
                    valid: true,
                    error: ''
                },
                servererror: ''
            },
            showSuccessModal: false
        }
    },
    methods: {
        async signUp() {
            try {
                await Auth.signUp({username: this.form.email, password: this.form.password, email: this.form.email});
                this.form.servererror = '';
                this.showModal();
            } catch (e) {
                if (e.toString().includes("EMAIL_NOT_ALLOWED")) {
                    this.form.servererror = "Email address not allowed for signing up";
                } else {
                    this.form.servererror = 'Error during signup process';
                }
            }
        },
        validateEmail() {
            var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            this.form.email.valid = emailRegex.test(this.form.email.value);
            if (!this.form.email.valid) this.form.email.error = "Invalid Email";
        },
        validatePassword() {
            this.form.password.valid = this.form.password.value.length != 0;
            if (!this.form.password.valid) this.form.password.error = "Password required";
        },
        validateRepeatPassword() {
            this.form.repeatpassword.valid = this.form.repeatpassword.value == this.form.password.value;
            if (!this.form.repeatpassword.valid) this.form.repeatpassword.error = "No match";
        },
        validateForm() {
            var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var emailValid = emailRegex.test(this.form.email.value);
            var passwordValid = this.form.password.value.length != 0;
            var repeatPasswordValid = this.form.password.value == this.form.repeatpassword.value;
            return emailValid && passwordValid && repeatPasswordValid;
        },
        showModal() { this.showSuccessModal = true; },
        closeModal() { 
            this.showSuccessModal = false;
            this.$router.push('/login');
        }
    }
}
</script>

<style scoped>
/* Portrait default */
.dialog {
    margin-top: 104px;
}

.interactionfield {
    display: none !important;
}

/* Small devices (landscape phones) */
@media screen and (min-width: 576px) and (orientation: landscape) {
    .dialog {
        margin-top: 0;
    }

    .interactionfield {
        display: block !important;
        background: url('~@/assets/bg.jpg');
        background-size: cover;
    }
}

/* Medium devices (tablets) */
@media screen and (min-width: 768px) {
    .dialog {
        padding-top: calc(1rem + 64px);
    }

    .interactionfield {
        display: none I !important;
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