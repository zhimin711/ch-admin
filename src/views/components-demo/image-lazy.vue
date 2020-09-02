<template>

  <div class="hello">
    <ul>
      <li v-for="item in imgUrl" :key="item.src">
        <img v-lazy="item.src" alt="" width="300" height="150">
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ImageLazy',
  data() {
    return {
      imgUrl: [
        { src: 'http://106.12.140.185/upload/images/20200607/2c90808472819df201728f359644000e.png' },
        { src: 'http://106.12.140.185/upload/images/20200607/2c90808472819df201728f34e4e9000d.png' },
        { src: 'http://106.12.140.185/upload/images/20200607/2c90808472819df201728f34e4e9000d.png' },
        { src: 'http://106.12.140.185/upload/images/20200607/2c90808472819df201728f34e4e9000d.png' }
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }

  img {
    transition: all 0.5s;
  }

  img[lazy=loading] {

  }

  img[lazy=loaded] {
    animation: fade 0.5s;
  }

  @keyframes fade {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
