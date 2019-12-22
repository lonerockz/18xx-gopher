<template>
  <v-card>
    <v-toolbar
      flat
      fixed
    >
      <v-app-bar-nav-icon />
      <v-toolbar-title>18xx Gopher</v-toolbar-title>

      <v-col class="text-right header font-weight-black">
        Bank: $8538
      </v-col>
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
      <app-player-list />
      <app-company-list />
    </v-tabs-items>
  </v-card>
</template>

<script>
// import NavMenu from './NavMenu.vue'
import PlayerList from '../players/Playerlist.vue'
import CompanyList from '../companies/CompanyList.vue'
import { mapGetters, mapActions } from 'vuex'

export default {

  components: {
    // appNavMenu: NavMenu,
    appPlayerList: PlayerList,
    appCompanyList: CompanyList
  },
  computed: {
    ...mapGetters(['activeGame'])
  },
  methods: {
    ...mapActions(['bindActiveGame'])
  },
  beforeCreate () {
    this.$store.dispatch('bindActiveGame')
    this.$store.dispatch('bindActiveGamePlayers')
    this.$store.dispatch('bindActiveGameCompanies')
    this.$store.dispatch('bindAllGameCompanies')
  },
  created () {

  },

  data () {
    return {
      drawer: true

    }
  }
}
</script>

<style lang="scss" scoped>

</style>
