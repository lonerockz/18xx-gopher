<template>
  <v-card-text>
    {{ activeUser }}
    <template v-if="getSharesByPlayerIDCollection(this.activeUser.id)">
      <div
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
import { isUndefined } from 'lodash-es'

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
    const _this = this
    console.log('sell stock', this.activeUser.id)
    const ownedStock = this.getSharesByPlayerIDCollection(this.activeUser.id)
    let marketShares = this.getSharesByPlayerIDCollection('market')
    if (!marketShares) {
      marketShares = {}
    }
    console.log('owned stock: ', ownedStock)
    if (ownedStock) {
      const localSaleStocks = []
      console.log(ownedStock)
      for (const [stock, shares] of Object.entries(ownedStock)) {
        console.log('object entries:', stock, shares)
        const activeCompany = _this.getCompanyByInitials(stock)
        console.log(stock, ' : ', activeCompany)
        let maxShares = shares + 1
        if (activeCompany.certificates.presidentsCertificate.owner === _this.activeUser.id) {
          console.log('president!!!')
          maxShares -= 2
        }
        console.log(localSaleStocks, maxShares)
        if (!isUndefined(marketShares[stock])) {
          maxShares = Math.min(6 - marketShares[stock], maxShares)
        }
        if (maxShares > 0) {
          localSaleStocks.push({ company: activeCompany.initials, companyID: activeCompany.id, sharesAvailalbeToSell: [...Array(maxShares).keys()], value: '0' })
        } else {
          localSaleStocks.push({ company: activeCompany.initials, companyID: activeCompany.id, sharesAvailalbeToSell: [0], value: '0' })
        }
      }
      console.log('sale stocks array', localSaleStocks)
      this.saleStocks = localSaleStocks
    }
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
    ...mapGetters(['getCompanyByInitials', 'allGameCompanies', 'getSharesByPlayerIDCollection'])

  }
}

</script>

<style lang="scss" scoped>

</style>
