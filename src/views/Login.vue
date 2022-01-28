<template>
<div class="grid">
    <img src="@/assets/mhp-logo.svg" class="logo">
    <div class="interactionfield"></div>
    <form @submit.prevent="signIn" class="dialog">
        <h1>Login</h1>
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
        <router-link to="/register">No account? Register</router-link>
        <input :disabled="!validateForm()" type="submit" value="Login">
    </form>
</div>
</template>

<script>
import { Auth } from 'aws-amplify';

export default {
    name: 'FinalLogin',
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
            }
        }
    },
    methods: {
        async signIn() {
            try {
                await Auth.signIn(this.form.email.value, this.form.password.value);
                this.$router.push('/');
            } catch(e) {
                const error = e.toString().split(':');
                this.form.servererror = error[1].substring(1);
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
        validateForm() {
            var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return this.form.password.value.length != 0 && emailRegex.test(this.form.email.value);
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