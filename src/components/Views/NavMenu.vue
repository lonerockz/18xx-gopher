<template>
  <div>
    <v-list-item>
      <v-list-item-avatar>
        <v-img src="https://randomuser.me/api/portraits/men/78.jpg" />
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>John Leider</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider />

    <v-list dense>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        link
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
export default {
  data () {
    return {

      items: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard' },
        { title: 'Games', icon: 'mdi-image' },
        { title: 'About', icon: 'mdi-help-box' }
      ],
      tabs: 1,
      right: null
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
