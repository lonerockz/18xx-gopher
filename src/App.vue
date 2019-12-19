<template>
  <v-app>
    <app-header />
    <v-content />
    <app-footer />
  </v-app>
</template>

<script>
import Header from './components/Views/Header'
import Footer from './components/Views/Footer'

export default {
  name: 'App',

  components: {
    appHeader: Header,
    appFooter: Footer,
  },

  data: () => ({
    //
  }),
}
</script>
