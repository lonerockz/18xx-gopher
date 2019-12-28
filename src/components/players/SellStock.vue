<template>
  <v-card-text>
    {{ activeUser }}
    <div
      v-for="companyOwned in ownedCompanies"
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
  </v-card-text>
</template>

<script>
// import store from '../../store/index'

import { mapGetters, mapActions } from 'vuex'
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
    const localSaleStocks = []
    // console.log(this.ownedCompanies)
    const _this = this
    this.ownedCompanies.forEach(function (company, id) {
      let maxShares = company.shares
      if ((_this.getPossiblePresidents(company.company.iniitals).length < 2) &&
      (company.company.president.id === _this.activeUser.id)) {
      // console.log(id, company.company.initials)
        maxShares -= 2
      }
      maxShares = Math.min(5 - company.company.marketShares, maxShares) + 1
      // console.log(maxShares)
      // let maxShares = company.shares > (5 - company.company.marketShares) ? 6 - company.company.marketShares : company.shares + 1
      localSaleStocks.push({ company: company.company.initials, companyID: company.company.id, sharesAvailalbeToSell: [...Array(maxShares).keys()], value: '0' })
    })
    this.saleStocks = localSaleStocks
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
    ...mapGetters(['allGameCompanies', 'getShareholders', 'getPossiblePresidents']),
    ownedCompanies: function () {
      const ownedCos = []
      for (const [key, value] of Object.entries(this.activeUser.shares)) {
        ownedCos.push({
          company: this.allGameCompanies.filter(function (company) { return company.initials === key })[0],
          shares: value
        })
      }
      return ownedCos
    }

  }
}

</script>

<style lang="scss" scoped>

</style>
