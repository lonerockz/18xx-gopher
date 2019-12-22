<template>
  <div>
    <v-tab-item
      key="players-1"
      value="mobile-tabs-5-1"
    >
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(player) in activeGamePlayers"
          :key="player.id"
        >
          <v-expansion-panel-header>
            <template v-slot:default="{ open }">
              <v-fade-transition leave-absolute>
                <v-row
                  no-gutters
                  v-if="open"
                  key="0"
                >
                  <v-col class="headline font-weight-black">
                    {{ player.player.name }}
                  </v-col>
                </v-row>
                <v-row
                  no-gutters
                  v-else
                  key="1"
                >
                  <v-col
                    cols="3"
                    class="font-weight-black"
                  >
                    {{ player.player.initials }}
                  </v-col>
                  <v-col cols="6">
                    <span
                      v-for="(pres, id) in player.presidencies"
                      :key="'pres-'+player.player.initials+id"
                    >
                      {{ pres }}
                    </span>
                  </v-col>
                  <v-col
                    cols="2"
                    class="text-right"
                  >
                    ${{ player.currentCash }}
                  </v-col>
                </v-row>
              </v-fade-transition>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <app-player-info :player="player" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-tab-item>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PlayerInfo from './PlayerInfo.vue'

export default {

  components: {
    appPlayerInfo: PlayerInfo
  },
  computed: {
    ...mapGetters(['activeGame', 'activeGamePlayers'])
  },
  methods: {
    ...mapActions(['bindActiveGamePlayers'])
  },
  beforeCreate () {

  },
  created () {

  },

  data () {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>

</style>
