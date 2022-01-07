<template>
<div class="login">
    <BG/>
    <Header/>
    <div class="login-form-wrapper">
        <form @submit.prevent="signIn" class="login-form">
            <h1>Login</h1>
            <p v-show="form.formError!=''">{{ form.formError }}</p>
            <input v-model="form.email" v-on:input="validateFormInput" type="text" placeholder="Email">
            <input v-model="form.password" v-on:input="validateFormInput" type="password" placeholder="Password">
            <div class="login-form-spacer"></div>
            <input :disabled="!form.valid" type="submit" value="Login">
            <div class="login-form-spacer"></div>
            <router-link to="/register" class="secondary-button">Register</router-link>
        </form>
    </div>
</div>
</template>

<script>
import BG from '../components/BG.vue';
import Header from '../components/Header.vue';
import { Auth } from 'aws-amplify';

export default {
    name: "Login",
    components: {
        BG,
        Header
    },
    data: function() {
        return {
            form: {
                email: '',
                password: '',
                valid: false,
                formError: ''
            }
        }
    },
    methods: {
        async signIn() {
            const { email, password } = this.form;
            try {
                await Auth.signIn(email, password);
                this.$router.push('/');
            } catch(e) {
                const splitError = e.toString().split(':');
                this.form.formError = splitError[1].substring(1);
            }
        },
        validateFormInput() {
            var validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            let isEmailValid = this.form.email.match(validEmailRegex);
            let isPasswordValid = this.form.password.length != 0;

            this.form.valid = isEmailValid && isPasswordValid;
        }
    }
}
</script>

<style scoped>
.login {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(29,34,44);
    background: linear-gradient(0deg, rgba(29,34,44,1) 0%, rgba(40,55,64,1) 100%);
}

.login-form-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-form {
    width: 33.6vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    z-index: 2;
}

.login-form > h1 {
    text-align: left;
    font-size: 4vh;
}

.login-form-spacer {
    height: 2vh;
}

.login-form > p {
    color: #FF2D55;
}
</style>