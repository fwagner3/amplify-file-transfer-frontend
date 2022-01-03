<template>
<div class="header">
    <img class="mhp-logo" src="@/assets/mhp-logo.svg">
    <div class="header-spacer"></div>
    <p class="header-title">File Transfer</p>
</div>
</template>

<script>
</script>

<style scoped>
.header {
  position: absolute;
  left: 0;
  width: 100vw;
  height: 44px;
  margin-top: 54px;
  padding: 0px 78px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.mhp-logo {
  height: 100%;
}

.header-spacer {
  width: 2px;
  height: 100%;
  background: #C4C4C4;
  margin: 0 42px;
}

.header-title {
  font-weight: 700;
  font-size: 32px;
}
</style>
