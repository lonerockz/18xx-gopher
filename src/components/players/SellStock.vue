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

        <v-card-text>
          {{ activeUser }}
          <div
            v-for="companyOwned in ownedCompanies"
            :key="'sell-company'+ companyOwned.company.id"
          >
            <v-row>
              {{ companyOwned.company.initials }} - {{ companyOwned.shares }}
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
    ...mapGetters(['allGameCompanies']),
    ownedCompanies: function () {
      const ownedCos = []
      // console.log(this.activeUser.shares)
      for (const [key, value] of Object.entries(this.activeUser.shares)) {
        console.log('company: ', key, value, this.allGameCompanies)
        ownedCos.push({
          company: this.allGameCompanies.filter(function (company) { return company.initials === key })[0],
          shares: value
        })
      }

      // console.log(ownedCos)
      return ownedCos
    }

  },
  methods: {
    ...mapActions(['addStockAction'])
  }
}

</script>

<style lang="scss" scoped>

</style>
