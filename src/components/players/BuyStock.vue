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
            v-for="company in allGameCompanies"
            :key="'buy-company'+ company.id"
          >
            <v-row v-if="((company.parShares < 10) && (company.parShares > 0))">
              Buy par share of
              <v-chip @click="addStockAction({'action': 'buy', 'company': company.initials, 'source': 'par'})">
                {{ company.initials }}
              </v-chip>
              at a Par price of: {{ company.parPrice }}
            </v-row>
            <v-row v-if="company.marketShares > 0">
              Buy market share of
              <v-chip @click="addStockAction({'action': 'buy', 'company': company.initials, 'source': 'market'})">
                {{ company.initials }}
              </v-chip>
              at a market price of: {{ company.stockPrice }}
            </v-row>
          </div>
          <div
            v-for="company in allGameCompanies"
            :key="'start-company'+ company.id"
          >
            <v-row v-if="company.parShares === 10">
              Buy Presiendy of
              <v-chip @click="addStockAction({'action': 'buyPresedincy', 'company': company.initials, 'source': 'par', 'parPrice': '67'}); dialog = false">
                {{ company.initials }}
              </v-chip>
              at a Par price of:
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
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data () {
    return {
      dialog: false
    }
  },
  computed: {
    ...mapGetters(['allGameCompanies'])
  },
  methods: {
    ...mapActions(['addStockAction'])
  }
}
</script>

<style lang="scss" scoped>

</style>
