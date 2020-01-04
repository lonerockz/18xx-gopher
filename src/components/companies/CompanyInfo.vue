<template>
  <div>
    {{ company }}
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    company: {
      type: Object,
      // Object or array defaults must be returned from
      // a factory function
      default: function () {
        return {
          name: 'Something has Gone Wrong',
          initials: 'err',
          operatingOrder: 1000,
          parShares: 0,
          stockPrice: 0
        }
      }
    }
  },
  computed: {
    ...mapGetters(['getShareholdersCollection'])
  },
  created () {
    console.log('company info')
    this.getShareholdersCollection(this.company)
  }
}
</script>

<style lang="scss" scoped>

</style>
