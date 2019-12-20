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
            Players
            <v-icon>mdi-account-group</v-icon>
          </v-tab>

          <v-tab
            href="#mobile-tabs-5-2"
            class="primary--text"
          >
            Companies
            <v-icon>mdi-train-variant</v-icon>
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-model="tabs">
      <v-tab-item
        key="players-1"
        value="mobile-tabs-5-1"
      >
        <v-expansion-panels>
          <v-expansion-panel
            v-for="(player) in activeGamePlayers"
            :key="player.id"
          >
            <v-expansion-panel-header>{{ player.player.name }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              {{ player.currentCash }}
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-tab-item>
      <v-tab-item
        key="companies-2"
        value="mobile-tabs-5-2"
      >
        <div
          v-for="(company) in activeGameCompanies"
          :key="company.id"
        >
          <v-card>
            <v-card-text v-text="company" />
          </v-card>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
// import NavMenu from './NavMenu.vue'
import { mapGetters, mapActions } from 'vuex'

export default {

  components: {
    // appNavMenu: NavMenu,
  },
  computed: {
    ...mapGetters(['activeGame', 'activeGamePlayers', 'activeGameCompanies'])
  },
  methods: {
    ...mapActions(['bindActiveGame', 'bindActiveGamePlayers', 'bindActiveGameCompanies'])
  },
  beforeCreate () {
    this.$store.dispatch('bindActiveGame')
    this.$store.dispatch('bindActiveGamePlayers')
    this.$store.dispatch('bindActiveGameCompanies')
  },
  created () {
    // console.log(this.games)
    // console.log('--- Players ---')
    // console.log(this.activeGame)
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
