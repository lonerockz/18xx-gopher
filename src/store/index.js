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
    navDrawer: true,
    currentStockActions: {}
  },
  getters: {
    games: state => state.games,
    gameTemplates: state => state.gameTemplates,
    activeGamePlayers: state => state.activeGamePlayers,
    activeGame: state => state.activeGame,
    allGameCompanies: state => state.allGameCompanies,
    activeGameCompanies: function (state) {
      return state.allGameCompanies.filter(function (company) { return company.hasStarted })
    },
    inactiveGameCompanies: function (state) {
      return state.allGameCompanies.filter(function (company) { return !company.hasStarted })
    },
    getShareholders: (state) => (company) => {
      const companyOwners = []

      state.activeGamePlayers.forEach(player => {
        Object.entries(player.shares).forEach(share => {
          if (company === share[0]) {
            companyOwners.push({ company: company, shares: share[1], player: player.player.id })
          }
        })
      })
      // console.log(companyOwners)
      return companyOwners
    },
    getPossiblePresidents: (state) => (company) => {
      const companyOwners = []
      // console.log(company)
      state.activeGamePlayers.forEach(player => {
        Object.entries(player.shares).forEach(share => {
          if ((company === share[0]) && (share[1] > 1)) {
            companyOwners.push({ company: company, shares: share[1], player: player.player.id })
          }
        })
      })
      return companyOwners
    }

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
    bindAllGameCompanies: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('allGameCompanies', db.collection('games').doc('SXkOIfauym3VxeRH6djV')
        .collection('companies').orderBy('operatingOrder'))
    }),

    bindActiveGame: firestoreAction(({ bindFirestoreRef }) => {
      const activeGame = bindFirestoreRef('activeGame', db.collection('games').doc('SXkOIfauym3VxeRH6djV'))
      return activeGame
    }),
    // copyTrainsToGame: async ({ commit }, payload) => {
    // const gameTemplateRef = await db.collection('gameTemplates').doc('YqavGvZGBpNKtLPDMHZy').get()
    // const trainRoster = gameTemplateRef.data().trainRoster
    // console.log(trainRoster)
    // const curGameRef = db.collection('games').doc('SXkOIfauym3VxeRH6djV')
    // curGameRef.update({ trainRoster: trainRoster })
    // },
    addStockAction: ({ commit }, payload) => {
      console.log(payload.action, payload.company, payload.player)
    }
  },
  modules: {
  }

})
