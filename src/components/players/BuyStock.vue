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
            v-for="company in companiesWithPresidentsArray"
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
          {{ minParPrice }}
          <div
            v-if="minParPrice"
          >
            <v-row>
              <v-select
                :items="parPricesObject.prices"
                v-model="parPricesObject.value"
                :label="parPricesObject.name"
              />
            </v-row>
            <v-row>
              <v-select
                :items="this.companiesWithoutPresidentsArray"
                item-text="name"
                item-value="id"
                v-model="parCompanyObject"
                label="Choose a Company"
                return-object
              />
            </v-row>
            <v-row>
              <v-btn @click="addStockAction({'player': activeUser.id, 'action': 'buyPresedincy', 'company': parCompanyObject.name,'companyID': parCompanyObject.id, 'source': 'par', 'parPrice': parPricesObject.value}); dialog = false">
                Buy Presediency of <br> {{ parCompanyObject.name }} <br> @ {{ parPricesObject.value }}
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
  const userShares = state.getSharesByPlayerIDCollection(state.activeUser.id)
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

function createParPriceSelectList (state) {
  let localParPricesObject = {}
  const pricesArray = []
  Object.values(state.gameParPricesArray).forEach(parPrice => {
    if (state.activeUser.currentCash > state.gameOptions.presidentsShareSize * parPrice.price) {
      pricesArray.push(parPrice.price)
    }
  })
  localParPricesObject = { prices: pricesArray, value: 0, name: 'Select a Par Price' }
  return localParPricesObject
}

function createMinParPrice (pricesArray) {
  if (pricesArray.length > 0) {
    return Math.min(...pricesArray)
  } else {
    return false
  }
}

export default {
  data () {
    return {
      parPricesObject: {},
      dialog: false,
      minParPrice: false,
      parCompanyObject: { name: '', id: '' }
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
    ...mapGetters(['gameParPricesArray', 'gameOptions', 'getSharesByPlayerIDCollection', 'companiesWithoutPresidentsArray', 'companiesWithPresidentsArray', 'getShareholdersCollection'])
  },
  methods: {
    ...mapActions(['addStockAction']),
    shouldShowBuyAction: function (company, type) {
      let showBuy = false
      if (playerCanBuy(this, company)) {
        const shareholders = this.getShareholdersCollection(company)
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
    this.parPricesObject = createParPriceSelectList(this)
    if (this.parPricesObject) {
      this.minParPrice = createMinParPrice(this.parPricesObject.prices)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
