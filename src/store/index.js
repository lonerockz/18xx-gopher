import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Vue from 'vue'
import Vuex from 'vuex'
import firebaseConfig from '../../firebaseConfig'

// const increment = firebase.firestore.FieldValue.increment(1)

// console.log(firebaseConfig)

const db = firebase.initializeApp(firebaseConfig).firestore()
Vue.use(Vuex)

function comitStockTransaction (state, payload) {
  const player = state.getters.getPlayerByID(payload.player)
  console.log(player)
  const playerRef = db.collection('games').doc('SXkOIfauym3VxeRH6djV').collection('players').doc(payload.player)
  if (payload.action === 'sell') {
    const targetCompany = 'shares.' + payload.company
    return playerRef.update({
      [targetCompany]: firebase.firestore.FieldValue.increment(-payload.numberOfShares)
    })
      .then(function () {
        console.log(player.shares[payload.company], 'Player Shares Updated!')
        if (player.shares[payload.company] === 0) {
          console.log('Got Here!!!')
        }
        const companyRef = db.collection('games').doc('SXkOIfauym3VxeRH6djV').collection('companies').doc(payload.companyID)
        return companyRef.update({
          marketShares: firebase.firestore.FieldValue.increment(payload.numberOfShares)
        }).then(function () {
          console.log('Company Shares Updated!')
        }).catch(function (error) {
          // The document probably doesn't exist.
          console.error('Error updating Company: ', error)
        })
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error('Error updating Player: ', error)
      })
  } else if (payload.action === 'buy') {
    console.log('buy', payload)
  } else if (payload.action === 'buyPresedincy') {
    console.log('presidency', payload)
  }
}

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
    getPlayerByID: (state) => (playerID) => {
      return state.activeGamePlayers.filter(function (player) { return player.id === playerID })[0]
    },
    getCompanyByID: (state) => (companyID) => {
      return state.allGameCompanies.filter(function (company) { return company.id === companyID })[0]
    },
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
    addStockAction: (state, payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(action => comitStockTransaction(state, action))
      } else {
        comitStockTransaction(state, payload)
      }
    }
  },
  modules: {
  }

})
