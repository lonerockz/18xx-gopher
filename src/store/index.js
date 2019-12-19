import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Vue from 'vue'
import Vuex from 'vuex'
import firebaseConfig from '../../firebaseConfig'

// console.log(firebaseConfig)

const db = firebase.initializeApp(firebaseConfig).firestore()
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    games: [],
    gameTemplates: []
  },
  getters: {
    games: state => state.games,
    gameTemplates: state => state.gameTemplates
  },
  mutations: { ...vuexfireMutations },
  actions: {
    bindGames: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('games', db.collection('games'))
    }),
    bindGameTemplates: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('gameTemplates', db.collection('gameTemplates'))
    })
  },
  modules: {
  }

})
