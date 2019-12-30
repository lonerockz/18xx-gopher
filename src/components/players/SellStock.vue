<template>
  <v-card-text>
    {{ activeUser }}
    <template v-if="companiesOwnedByPlayer(activeUser)">
      <div
        v-for="companyOwned in companiesOwnedByPlayer(activeUser)"
        :key="'sell-company'+ companyOwned.company.id"
      >
        <v-row>
          {{ companyOwned.company.initials }} - {{ companyOwned.shares }} : {{ companyOwned.company.marketShares }}
        </v-row>
        <v-row
          v-if="getPossiblePresidents(companyOwned.company.initials) > 1"
        >
          {{ ownerRecord }}
        </v-row>
      </div><div
        v-for="saleStock in saleStocks"
        :key="'sell-co' + saleStock.company"
      >
        <v-select
          :items="saleStock.sharesAvailalbeToSell"
          v-model="saleStock.value"
          :label="saleStock.company"
        />
      </div>
    </template>
    <template v-else>
      <div>
        No stocks owned
      </div>
    </template>
  </v-card-text>
</template>

<script>
// import store from '../../store/index'

import { mapGetters, mapActions } from 'vuex'
import { isEmpty } from 'lodash-es'

export default {
  data () {
    return {
      saleStocks: [],
      dialog: false
    }
  },
  methods: {
    ...mapActions(['addStockAction'])

  },
  props: {
    activeUser: {
      type: Object,
      default: function () {
        return { default: { id: 'Error' } }
      }
    }
  },
  created () {
    if (!isEmpty(this.companiesOwnedByPlayer(this.activeUser))) {
      const localSaleStocks = []
      // console.log(this.ownedCompanies)
      const _this = this
      this.companiesOwnedByPlayer(this.activeUser).forEach(function (company, id) {
        // console.log(company.company.initials, company.shares)
        let maxShares = company.shares + 1
        if (!isEmpty(company.company.president)) {
          if ((_this.getPossiblePresidents(company.company.iniitals).length < 2) &&
        (company.company.president.id === _this.activeUser.id)) {
            // console.log(id, company.company.initials)
            maxShares -= 2
          }
        }
        if (company.company.marketShares) {
          maxShares = Math.min(6 - company.company.marketShares, maxShares)
        }
        // console.log('max Shares', maxShares)
        // let maxShares = company.shares > (5 - company.company.marketShares) ? 6 - company.company.marketShares : company.shares + 1
        if (maxShares > 0) {
          localSaleStocks.push({ company: company.company.initials, companyID: company.company.id, sharesAvailalbeToSell: [...Array(maxShares).keys()], value: '0' })
        } else {
          localSaleStocks.push({ company: company.company.initials, companyID: company.company.id, sharesAvailalbeToSell: [0], value: '0' })
        }
      })
      // console.log('sale stocks array', localSaleStocks)
      this.saleStocks = localSaleStocks
    }
    // console.log(localSaleStocks)
  },
  beforeDestroy () {
    // console.log(this.saleStocks)
    const _this = this
    const stockSales = []
    this.saleStocks.forEach(function (sale) {
      if (sale.value > 0) {
        stockSales.push({ player: _this.activeUser.id, action: 'sell', company: sale.company, companyID: sale.companyID, numberOfShares: sale.value })
      }
    })
    this.addStockAction(stockSales)
    // console.log('local', stockSales)
  },
  computed: {
    ...mapGetters(['allGameCompanies', 'getShareholders', 'getPossiblePresidents', 'companiesOwnedByPlayer'])

  }
}

</script>

<style lang="scss" scoped>

</style>
