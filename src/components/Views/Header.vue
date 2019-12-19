<template>
  <v-card>
    <v-toolbar
      flat
      fixed
    >
      <v-app-bar-nav-icon />
      <v-toolbar-title>18xx Gopher</v-toolbar-title>
      <v-spacer />

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs
          v-model="tabs"
          fixed-tabs
        >
          <v-tabs-slider />
          <v-tab
            href="#mobile-tabs-5-1"
            class="primary--text"
          >
            <v-icon>mdi-phone</v-icon>
          </v-tab>

          <v-tab
            href="#mobile-tabs-5-2"
            class="primary--text"
          >
            <v-icon>mdi-heart</v-icon>
          </v-tab>

          <v-tab
            href="#mobile-tabs-5-3"
            class="primary--text"
          >
            <v-icon>mdi-account-box</v-icon>
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-model="tabs">
      <v-tab-item
        v-for="i in 3"
        :key="i"
        :value="'mobile-tabs-5-' + i"
      >
        <v-card flat>
          <v-card-text v-text="text" />
        </v-card>
      </v-tab-item>
    </v-tabs-items>
    <div
      v-for="(game) in gameTemplates"
      :key="game.id"
    >
      <v-card>
        <v-card-text v-text="game.name" />
      </v-card>
    </div>
  </v-card>
</template>

<script>
// import NavMenu from './NavMenu.vue'
import { mapGetters } from 'vuex'

export default {

  components: {
    // appNavMenu: NavMenu,
  },
  computed: {
    ...mapGetters(['games', 'gameTemplates'])
  },
  data () {
    return {
      drawer: true,
      items: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard' },
        { title: 'Photos', icon: 'mdi-image' },
        { title: 'About', icon: 'mdi-help-box' }
      ],
      tabs: null,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. It necessary to declare properties with their initial values in state. For the RTDB, using an Array as the initial value will bind the Reference as an array, otherwise it is bound as an object. For Firestore, collections and queries are bound as arrays while documents are bound as objects.',
      right: null
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
