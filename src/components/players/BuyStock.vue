<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          color="red lighten-2"
          dark
          v-on="on"
        >
          Buy Stock
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Select Stock to Buy
        </v-card-title>

        <v-card-text>
          <div
            v-for="company in companiesWithPresidents"
            :key="'buy-company'+ company.id"
          >
            <v-row v-if="shouldShowBuyAction(company, 'par')">
              <v-btn @click="addStockAction({'player': activeUser.id, 'action': 'buy', 'company': company.initials,'companyID': company.id, 'source': 'par'}); dialog = false">
                Par {{ company.initials }} @ {{ company.parPrice }}
              </v-btn>
            </v-row>
            <v-row v-if="shouldShowBuyAction(company, 'market')">
              <v-btn @click="addStockAction({'player': activeUser.id, 'action': 'buy', 'company': company.initials,'companyID': company.id, 'source': 'market'}); dialog = false">
                Market {{ company.initials }} @ {{ company.stockPrice }}
              </v-btn>
            </v-row>
          </div>
          <div
            v-if="(activeUser.currentCash > 134)"
          >
            <v-row
              v-for="company in companiesWithoutPresidents"
              :key="'start-company'+ company.id"
            >
              <v-btn @click="addStockAction([{'player': activeUser.id, 'action': 'buyPresedincy', 'company': company.initials, 'companyID': company.id, 'source': 'par', 'parPrice': 67}]); dialog = false">
                presidnecy {{ company.initials }}
              </v-btn>
            </v-row>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { isUndefined } from 'lodash-es'

function playerCanBuy (state, company) {
  let playerCanBuy = false
  const userShares = state.getSharesByPlayerID(state.activeUser.id)
  if (!userShares) {
    // doesn't own shares so can buy anything that is available
    console.log('Player has no shares')
    playerCanBuy = true
  } else if (isUndefined(userShares[company.initials])) {
    playerCanBuy = true
  } else if (userShares[company.initials] * 10 < state.gameOptions.normalShareMaxPercentage) {
    playerCanBuy = true
  }

  return playerCanBuy
}

export default {
  data () {
    return {
      dialog: false
    }
  },
  props: {
    activeUser: {
      type: Object,
      default: function () {
        return { default: { id: 'Error' } }
      }
    }
  },
  computed: {
    ...mapGetters(['gameOptions', 'getSharesByPlayerID', 'companiesWithoutPresidents', 'companiesWithPresidents', 'getShareholders'])
  },
  methods: {
    ...mapActions(['addStockAction']),
    shouldShowBuyAction: function (company, type) {
      let showBuy = false
      if (playerCanBuy(this, company)) {
        const shareholders = this.getShareholders(company)
        if (type === 'par') {
          if ((!isUndefined(shareholders.par)) &&
              (company.parPrice < this.activeUser.currentCash)) {
            showBuy = true
          }
        } else if (type === 'market') {
          if ((!isUndefined(shareholders.market)) && (company.stockPrice < this.activeUser.currentCash)) {
            showBuy = true
          }
        }
      }
      return showBuy
    }
  },
  created () {

  }
}
</script>

<style lang="scss" scoped>

</style>
