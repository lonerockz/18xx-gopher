<template>
  <div>
    <v-tab-item
      key="companies-2"
      value="mobile-tabs-5-2"
    >
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(company) in allGameCompanies"
          :key="company.id"
        >
          <v-expansion-panel-header>
            <template v-slot:default="{ open }">
              <v-fade-transition leave-absolute>
                <v-row
                  no-gutters
                  v-if="open"
                  key="0"
                >
                  <v-col class="font-weight-black my-auto title">
                    {{ company.name }}
                  </v-col>
                </v-row>
                <v-row
                  v-if="company.stockPrice"
                  no-gutters
                  key="1"
                >
                  <v-col
                    cols="3"
                    class="font-weight-black my-auto title"
                  >
                    {{ company.initials }}
                  </v-col>
                  <v-col
                    cols="2"
                    class="text-center"
                  >
                    <v-chip :class="company.president.player.preferedColor + ' lighten-4'">
                      {{ company.president.player.initials }}
                    </v-chip>
                  </v-col>
                  <v-col
                    cols="2"
                    class="text-center my-auto "
                  >
                    <template
                      v-for="(train) in company.trains"
                    >
                      {{ train }}
                    </template>
                  </v-col>
                  <v-col
                    cols="2"
                    class="text-right  my-auto "
                  >
                    {{ company.stockPrice }}
                  </v-col>
                  <v-col
                    cols="3"
                    class="text-right font-weight-black my-auto title"
                  >
                    {{ company.cash }}
                  </v-col>
                </v-row>
                <v-row v-else>
                  <v-col cols="12">
                    {{ company.name }} - Not Started
                  </v-col>
                </v-row>
              </v-fade-transition>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <app-company-info :company="company" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-tab-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CompanyInfo from './CompanyInfo.vue'

export default {
  components: {
    appCompanyInfo: CompanyInfo
  },
  computed: {
    ...mapGetters(['activeGame', 'activeGameCompanies', 'allGameCompanies'])
  },
  methods: {

  },
  beforeCreate () {

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
