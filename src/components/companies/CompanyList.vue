<template>
  <div>
    <v-tab-item
      key="companies-2"
      value="mobile-tabs-5-2"
    >
      <div
        v-for="(company) in activeGameCompanies"
        :key="company.id"
      >
        <v-card>
          <v-card-text v-text="company" />
        </v-card>
      </div>
    </v-tab-item>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['activeGame', 'activeGameCompanies'])
  },
  methods: {
    ...mapActions(['bindActiveGameCompanies'])
  },
  beforeCreate () {
    this.$store.dispatch('bindActiveGameCompanies')
  },
  created () {

  },

  data () {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>

</style>
