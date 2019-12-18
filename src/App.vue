<template>
  <v-app>
    <v-content>
      <app-header></app-header>

    </v-content>
  </v-app>
</template>

<script>
import Header from './components/Views/Header'

export default {
  name: 'App',

  components: {

    'appHeader': Header,
  },

  data: () => ({
    //
  }),
}
</script>
