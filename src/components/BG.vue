<template>
<div class="bg">
    <p class="bg-green-circle"></p>
    <p class="bg-yellow-circle"></p>
    <p class="bg-blue-circle"></p>
</div>
</template>

<script>
</script>

<style scoped>
.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-green-circle {
  position: absolute;
  left: 5.5%;
  top: 36.1%;
  width: 18.2vw;
  height: 18.2vw;
  background: #87BC49;
  background: linear-gradient(135deg, rgb(191, 226, 149) 0%, rgb(135, 188, 73) 45%, rgb(32, 44, 19) 85%);
  box-shadow: inset 10px 10px 7px 0px rgba(255, 255, 255, 0.25), inset -10px -10px 17px 0px rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  z-index: 1;
}

.bg-yellow-circle {
  position: absolute;
  left: 32.3%;
  top: 57%;
  width: 38.8vw;
  height: 38.8vw;
  background: #f5c500;
  background: linear-gradient(135deg, rgb(233, 211, 121) 0%, rgb(245, 197, 0) 45%, rgb(57, 50, 18) 85%);
  box-shadow: inset 10px 10px 7px 0px rgba(255, 255, 255, 0.25), inset -10px -10px 17px 0px rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  z-index: 1;
}

.bg-blue-circle {
  position: absolute;
  left: 64%;
  top: 15.5%;
  width: 26.8vw;
  height: 26.8vw;
  background: #009bd2;
  background: linear-gradient(135deg, rgb(140, 204, 226) 0%, rgb(0, 155, 210) 45%, rgb(21, 51, 62) 85%);
  box-shadow: inset 10px 10px 7px 0px rgba(255, 255, 255, 0.25), inset -10px -10px 17px 0px rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  z-index: 1;
}
</style>