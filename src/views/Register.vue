<template>
<div class="register">
    <BG/>
    <Header/>
    <div class="register-form-wrapper">
        <form @submit.prevent="submitForm" class="register-form">
            <h1>Register</h1>
            <input v-model="form.email" v-on:input="validateFormInput" type="text" placeholder="Email"/>
            <input v-model="form.password" v-on:input="validateFormInput" type="password" placeholder="Password"/>
            <input v-model="form.repeatPassword" v-on:input="validateFormInput" type="password" placeholder="Repeat Password"/>
            <div class="register-form-spacer"></div>
            <input :disabled="!form.valid" type="submit" value="Register"/>
            <div class="register-form-spacer"></div>
            <router-link to="/login" class="secondary-button">Login</router-link>
        </form>
    </div>
</div>
</template>

<script>
import BG from '../components/BG.vue'
import Header from '../components/Header.vue'

export default {
    name: 'Register',
    components: {
        BG,
        Header
    },
    data: function() {
        return {
            form: {
                email: '',
                password: '',
                repeatPassword: '',
                valid: false
            }
        }
    },
    methods: {
        submitForm() {
            console.log(this.form);
        },
        validateFormInput() {
            var validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            let isEmailValid = this.form.email.match(validEmailRegex);
            let isPasswordValid = this.form.password.length != 0;
            let doPasswordsMatch = this.form.password == this.form.repeatPassword;

            this.form.valid = isEmailValid && isPasswordValid && doPasswordsMatch;
        }
    }
}
</script>

<style scoped>
.register {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(29,34,44);
    background: linear-gradient(0deg, rgba(29,34,44,1) 0%, rgba(40,55,64,1) 100%);
}

.register-form-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.register-form {
    width: 33.6vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    z-index: 2;
}

.register-form > h1 {
    text-align: left;
    font-size: 4vh;
}

.register-form-spacer {
    height: 2vh;
}
</style>