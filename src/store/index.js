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
    gameTemplates: [],
    players: [],
    activeGame: {},
    activeGamePlayers: []
  },
  getters: {
    games: state => state.games,
    gameTemplates: state => state.gameTemplates,
    activeGamePlayers: state => state.activeGamePlayers
  },
  mutations: { ...vuexfireMutations },

  actions: {
    bindGames: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('games', db.collection('games'))
    }),
    bindGameTemplates: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('gameTemplates', db.collection('gameTemplates'))
    }),
    bindActiveGamePlayers: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('activeGamePlayers', db.collection('players').doc('pUYZlRukPEuB8LgFmhb5'))
      // return bindFirestoreRef('activeGamePlayers', db.collection('players').where('id', 'in', ['pUYZlRukPEuB8LgFmhb5', 'acHpmffMOspxdMYfOcKf']))
    }),
    bindActiveGame: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('activeGame', db.collection('games').doc('SXkOIfauym3VxeRH6djV'))
      // return bindFirestoreRef('activeGamePlayers', db.collection('players').where('id', 'in', ['pUYZlRukPEuB8LgFmhb5', 'acHpmffMOspxdMYfOcKf']))
    })
  },
  modules: {
  }

})
