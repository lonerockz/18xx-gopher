<template>
  <v-row no-gutters>
    <v-row no-gutters>
      <v-col
        cols="8"
      >
        <v-row>
          <v-col class="text-center headline">
            Cash: ${{ player.currentCash }}
            {{ player.id }}
          </v-col>
        </v-row>
        <v-row
          v-for="shares in getSharesByPlayerID(player.id)"
          :key="'shares' + player.id + shares.company"
        >
          <v-col
            cols="2"
            v-if="presidencyCheck(shares.company)"
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
            {{ shares.company }}
          </v-col>
          <v-col
            cols="3"
            class="text-center title py-a"
          >
            {{ shares.shares }}
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
          <div class="text-center">
            <v-dialog
              v-model="sellDialog"
              width="500"
              persistent
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  color="red lighten-2"
                  dark
                  v-on="on"
                >
                  Sell Stock
                </v-btn>
              </template>
              <v-card>
                <v-card-title
                  class="headline grey lighten-2"
                  primary-title
                >
                  Select Stock to Sell
                </v-card-title>

                <app-sell-stock
                  v-if="sellDialog"
                  :active-user="player"
                />
                <v-divider />

                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    color="primary"
                    text
                    @click="sellDialog = false"
                  >
                    Sell Selected Shares
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>

          <app-buy-stock :active-user="player" />
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
import { mapActions, mapGetters } from 'vuex'
import BuyStock from './BuyStock'
import SellStock from './SellStock'

export default {
  data () {
    return {
      sellDialog: false
    }
  },
  components: {
    appBuyStock: BuyStock,
    appSellStock: SellStock
  },
  computed: {
    ...mapGetters(['getSharesByPlayerID'])
  },
  props: {

    player: {
      type: Object,
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
  },
  methods: {
    ...mapActions(['buyStocks']),
    buyStock: function (playerID) {
      this.$store.dispatch('buyStocks', { playerID })
      // console.log(this.player.id)
    },
    presidencyCheck: function (company) {
      let result = false
      if (this.player.presidencies) {
        if (Object.getOwnPropertyNames(this.player.presidencies).length === 0) {
          if (this.player.presidencies.includes(company)) {
            result = true
          }
        }
      }
      return result
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
