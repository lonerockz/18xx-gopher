<template>
  <v-app>
    <app-header />
    <app-footer />
  </v-app>
</template>

<script>
import Header from './components/Views/Header'
import Footer from './components/Views/Footer'
import { mapActions } from 'vuex'

export default {
  name: 'App',

  components: {
    appHeader: Header,
    appFooter: Footer
  },
  methods: {
    ...mapActions(['bindGameTemplates', 'bindGames'])
  },
  beforeCreate () {
    this.$store.dispatch('bindGames')
    this.$store.dispatch('bindGameTemplates')
  },

  data: () => ({
    //
  })
}
</script>
