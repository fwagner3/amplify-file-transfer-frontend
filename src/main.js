import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/main.css';
import '@/assets/grid.css';

import Amplify/*, * as AmplifyModules*/ from "aws-amplify";
import awsmobile from "@/aws-exports";

Amplify.Logger.LOG_LEVEL = 'DEBUG';
console.log(awsmobile.Auth);
console.log(process.env);
Amplify.configure(awsmobile);

createApp(App).use(router/*,AmplifyPlugin,AmplifyModules*/).mount('#app')
