<template>
  <div>
    {{ company }}
  </div>
</template>

<script>
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
  }
}
</script>

<style lang="scss" scoped>

</style>
