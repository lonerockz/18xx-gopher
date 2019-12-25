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
    console.log(this.ownedCompanies)
    this.ownedCompanies.forEach(function (company, id) {
      const maxShares = company.shares > (5 - company.company.marketShares) ? 6 - company.company.marketShares : company.shares + 1
      console.log(id, company.company.initials)
      localSaleStocks.push({ company: company.company.initials, sharesAvailalbeToSell: [...Array(maxShares).keys()], value: '0' })
    })
    this.saleStocks = localSaleStocks
    console.log(localSaleStocks)
  },
  beforeDestroy () {
    console.log(this.saleStocks)
    const _this = this
    const stockSales = []
    this.saleStocks.forEach(function (sale) {
      if (sale.value !== '0') {
        stockSales.push({ player: _this.activeUser.id, action: 'sell', company: sale.company, numberOfShares: sale.value })
      }
    })
    this.addStockAction(stockSales)
    console.log('local', stockSales)
  },
  computed: {
    ...mapGetters(['allGameCompanies']),
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
