<template>
  <v-row no-gutters>
    <v-row no-gutters>
      <v-col
        cols="8"
      >
        <v-row>
          <v-col class="text-center headline">
            Cash: ${{ player.currentCash }}
          </v-col>
        </v-row>
        <v-row
          no-gutters
          v-for="([company, shares], id) in Object.entries(player.shares)"
          :key="id+player.player.initials"
        >
          <v-col
            cols="2"
            v-if="player.presidencies.includes(company)"
          >
            <v-chip class="deep-purple text-center white--text font-weight-black">
              P
            </v-chip>
          </v-col>
          <v-col
            cols="2"
            v-else
          />
          <v-col
            cols="5"
            class="text-center title py-a"
          >
            {{ company }}
          </v-col>
          <v-col
            cols="3"
            class="text-center title py-a"
          >
            {{ shares }}
          </v-col>
        </v-row>
      </v-col>
      <v-col
        cols="4"
        align="center"
      >
        <div
          class="text-center"
        >
          <v-btn
            class="my-1"
            color="light-green"
          >
            Sell
          </v-btn>
          <v-btn
            class="my-1"
            color="light-green"
          >
            Buy
          </v-btn>
          <v-btn
            class="my-1"
            color="light-green"
          >
            Sell
          </v-btn>
          <v-btn
            class="my-1"
            color="light-blue"
          >
            Commit
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-row>
</template>

<script>
export default {
  props: {
    player: {
      type: Object,
      // Object or array defaults must be returned from
      // a factory function
      default: function () {
        return {
          Player: {
            name: 'Something has Gone Wrong',
            initials: 'err',
            preferedColor: 'black'
          },
          currentCash: -1

        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
