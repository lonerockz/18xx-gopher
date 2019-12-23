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
    activeGamePlayers: [],
    activeGameCompanies: [],
    allGameCompanies: [],
    navDrawer: true
  },
  getters: {
    games: state => state.games,
    gameTemplates: state => state.gameTemplates,
    activeGamePlayers: state => state.activeGamePlayers,
    activeGame: state => state.activeGame,
    activeGameCompanies: state => state.activeGameCompanies,
    allGameCompanies: state => state.allGameCompanies
  },
  mutations: {
    ...vuexfireMutations,
    showNavDrawer: (state) => {
      state.navDrawer = !state.navDrawer
    }
  },

  actions: {
    showNavDrawer: ({ commit }) => {
      commit('showNavDrawer')
    },
    bindGames: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('games', db.collection('games'))
    }),
    bindGameTemplates: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('gameTemplates', db.collection('gameTemplates'))
    }),
    bindActiveGamePlayers: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('activeGamePlayers', db.collection('games').doc('SXkOIfauym3VxeRH6djV').collection('players'))
    }),
    bindActiveGameCompanies: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('activeGameCompanies', db.collection('games').doc('SXkOIfauym3VxeRH6djV').collection('companies')
        .where('operatingOrder', '>', 0).orderBy('operatingOrder'))
    }),
    bindAllGameCompanies: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('allGameCompanies', db.collection('games').doc('SXkOIfauym3VxeRH6djV')
        .collection('companies').orderBy('operatingOrder'))
    }),

    bindActiveGame: firestoreAction(({ bindFirestoreRef }) => {
      const activeGame = bindFirestoreRef('activeGame', db.collection('games').doc('SXkOIfauym3VxeRH6djV'))
      return activeGame
    }),
    copyTrainsToGame: async ({ commit }, payload) => {
      // const gameTemplateRef = await db.collection('gameTemplates').doc('YqavGvZGBpNKtLPDMHZy').get()
      // const trainRoster = gameTemplateRef.data().trainRoster
      // console.log(trainRoster)
      // const curGameRef = db.collection('games').doc('SXkOIfauym3VxeRH6djV')
      // curGameRef.update({ trainRoster: trainRoster })
    }
  },
  modules: {
  }

})
