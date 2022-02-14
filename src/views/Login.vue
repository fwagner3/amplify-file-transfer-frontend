<template>
<div class="grid">
    <!-- Logo -->
    <img src="@/assets/mhp-logo.svg" class="logo">

    <div class="interactionfield"></div>

    <form @submit.prevent="() => {}" class="dialog">
        <h1>Login</h1>

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

        <div class="spacer"></div>

        <!-- Register Link -->
        <router-link to="/register">No account? Register</router-link>

        <div class="spacer"></div>

        <!-- Login Button -->
        <Button 
            :disabled="!validateForm()" 
            :loading="loading" 
            @click="signIn()" 
            :text="'Login'">
        </Button>

        <div class="spacer"></div>
    </form>
</div>
</template>

<script>
import { Auth } from 'aws-amplify';
import Button from '../components/Button.vue';
import Constants from '../constants';

export default {
    name: 'FinalLogin',
    components: {
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
                servererror: ''
            },
            loading: false
        }
    },
    methods: {
        async signIn() {
            this.loading = true;
            try {
                // Try to authenticate the user with the given credentials in the AWS Cognito User Pool
                await Auth.signIn(this.form.email.value, this.form.password.value);

                this.clearForm();
                this.loading = false;

                // Redirect the user to the upload page if login was successful
                this.$router.push('/');
            } catch(e) {
                // Retrieve the error string from the server response and make it visible
                const error = e.toString().split(':');
                this.form.servererror = error[1].substring(1);

                this.loading = false;
            }
        },
        validateEmail() {
            // Test the email address with the regex
            this.form.email.valid = Constants.emailRegex.test(this.form.email.value);

            // Set the error state of the email input field
            if (!this.form.email.valid) this.form.email.error = "Invalid Email";
        },
        validatePassword() {
            // Check that the password is longer than 8 characters, otherwise the password can't be correct because of the AWS Cognito configuration
            this.form.password.valid = this.form.password.value.length >= 8;

            // Set the error state of the password input field
            if (!this.form.password.valid) this.form.password.error = "Password required";
        },
        validateForm() {
            // Validate the whole formular indepently to set the login button disabled state, without validating 
            // the input fields before the user has entered something, to implement a dirty state for the input fields
            return this.form.password.value.length != 0 && Constants.emailRegex.test(this.form.email.value);
        },
        clearForm() {
            this.form.email.value = '';
            this.form.password.value = '';
            this.form.servererror = ''
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
    .interactionfield {
        background: url('~@/assets/bg.jpg');
        background-size: cover;
        display: block !important;
    }

    .dialog {
        margin-top: 0;
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