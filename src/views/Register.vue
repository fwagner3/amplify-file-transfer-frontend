<template>
<div class="grid">
    <!-- Logo -->
    <img src="@/assets/mhp-logo.svg" class="logo">

    <div class="interactionfield"></div>

    <form @submit.prevent="signUp" class="dialog">
        <h1>Register</h1>

        <div class="spacer"></div>

        <!-- Server Error -->
        <p v-if="form.servererror.length != 0" class="error">{{form.servererror}}</p>

        <!-- Email Input Field -->
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

        <!-- Password Input Field -->
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

        <!-- Repeat Password Input Field -->
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

        <!-- Login Link -->
        <router-link to="/login">Login to existing account</router-link>

        <div class="spacer"></div>

        <!-- Register Button -->
        <Button :disabled="!validateForm()" :loading="loading" @click="signUp" :text="'Register'"></Button>

        <div class="spacer"></div>
    </form>

    <!-- Success Modal -->
    <Modal
        v-show="showSuccessModal"
        @close="closeModal"
        :headline="'Successful'"
        :body="'Your registration was successful. Confirm your account by clicking on the link, that was send to your email address.'">
    </Modal>
</div>
</template>

<script>
import Modal from '../components/Modal.vue';
import { Auth } from 'aws-amplify';
import Button from '../components/Button.vue';
import Constants from '../constants';

export default {
    name: 'Register',
    components: {
        Modal,
        Button
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
            showSuccessModal: false,
            loading: false
        }
    },
    methods: {
        async signUp() {
            this.loading = true;
            try {
                // Try to sign the user up with the given credentials in the AWS Cognito User Pool
                await Auth.signUp({username: this.form.email, password: this.form.password, email: this.form.email});
                
                this.form.servererror = '';
                this.clearForm();
                this.loading = false;

                // Show a success modal, that the registration was successful
                this.showModal();
            } catch (e) {
                this.loading = false;

                // Show an error message based on the response of the server
                if (e.toString().includes("EMAIL_NOT_ALLOWED")) {
                    this.form.servererror = "Email address not allowed for signing up";
                } else {
                    this.form.servererror = 'Error during signup process';
                }
            }
        },
        validateEmail() {
            // Test the email address with the regex
            this.form.email.valid = Constants.emailRegex.test(this.form.email.value);

            // Set the error state of the email input field
            if (!this.form.email.valid) this.form.email.error = "Invalid Email";
        },
        validatePassword() {
            // Test the password with the regex
            this.form.password.valid = Constants.passwordRegex.test(this.form.password.value);

            // Set the error state of the password input field
            if (!this.form.password.valid) this.form.password.error = "Password invalid";
        },
        validateRepeatPassword() {
            // Check that the repeated password matches the other one
            this.form.repeatpassword.valid = this.form.repeatpassword.value == this.form.password.value;

            // Set the error state of the repeat password input field
            if (!this.form.repeatpassword.valid) this.form.repeatpassword.error = "No match";
        },
        validateForm() {
            // Validate the whole formular indepently to set the register button disabled state, without validating 
            // the input fields before the user has entered something, to implement a dirty state for the input fields
            var emailValid = Constants.emailRegex.test(this.form.email.value);
            var passwordValid = Constants.passwordRegex.test(this.form.password.value);
            var repeatPasswordValid = this.form.password.value == this.form.repeatpassword.value;
            return emailValid && passwordValid && repeatPasswordValid;
        },
        showModal() { this.showSuccessModal = true; },
        closeModal() { 
            // Redirect the user to the login page when the success modal was closed
            this.showSuccessModal = false;
            this.$router.push('/login');
        },
        clearForm() {
            this.form.email.value = '';
            this.form.password.value = '';
            this.form.repeatpassword.value = '';
            this.form.servererror = '';
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
        display: none !important;
    }
}
</style>