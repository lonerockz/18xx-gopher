<template>
  <div>
    <v-bottom-navigation
      fixed
      v-model="bottomNav"
    >
      <v-row>
        <v-col cols="2">
          <v-btn value="recent">
            <v-icon>mdi-history</v-icon>
          </v-btn>
        </v-col>
        <v-col
          cols="10"
          class="caption red--text"
        >
          Fred Simpson Buys 1 share of the New York Central for $67
        </v-col>
      </v-row>
    </v-bottom-navigation>
  </div>
</template>

<script>
export default {
  data () {
    return {
      bottomNav: 'recent'
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
