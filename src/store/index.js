import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Vue from 'vue'
import Vuex from 'vuex'
import firebaseConfig from '../../firebaseConfig'
import { isEmpty } from 'lodash-es'
const gameID = 'bWmLCmt1USbPKi997n0X' // 'SXkOIfauym3VxeRH6djV'

// const increment = firebase.firestore.FieldValue.increment(1)

// console.log(firebaseConfig)

const db = firebase.initializeApp(firebaseConfig).firestore()
Vue.use(Vuex)

function comitStockTransaction (state, payload) {
  const player = state.getters.getPlayerByID(payload.player)
  const company = state.getters.getCompanyByID(payload.companyID)
  const targetCompany = 'shares.' + payload.company
  const playerRef = db.collection('games').doc(gameID).collection('players').doc(payload.player)
  if (payload.action === 'sell') {
    let saleAction = {}
    if (player.shares[payload.company] === payload.numberOfShares) {
      saleAction = { [targetCompany]: firebase.firestore.FieldValue.delete() }
    } else {
      saleAction = { [targetCompany]: firebase.firestore.FieldValue.increment(-payload.numberOfShares) }
    }
    const targetPayout = company.stockPrice * payload.numberOfShares
    saleAction.currentCash = firebase.firestore.FieldValue.increment(targetPayout)
    return playerRef.update(saleAction)
      .then(function () {
        console.log(player.shares[payload.company], 'Player Shares Sold!')
        const companyRef = db.collection('games').doc(gameID).collection('companies').doc(payload.companyID)
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
    let pricePaid = 0
    let companyUpdate = {}
    if (payload.source === 'par') {
      pricePaid = company.parPrice
      companyUpdate = { parShares: firebase.firestore.FieldValue.increment(-1) }
    } else {
      pricePaid = company.stockPrice
      companyUpdate = { marketShares: firebase.firestore.FieldValue.increment(-1) }
    }
    return playerRef.update({
      [targetCompany]: firebase.firestore.FieldValue.increment(1),
      currentCash: firebase.firestore.FieldValue.increment(-pricePaid)
    })
      .then(function () {
        console.log(player.shares[payload.company], 'Player Shares Bought!')
        const companyRef = db.collection('games').doc(gameID).collection('companies').doc(payload.companyID)
        return companyRef.update(companyUpdate)
          .then(function () {
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
  } else if (payload.action === 'buyPresedincy') {
    console.log('presidency', payload)
    const pricePaid = payload.parPrice * 2
    return playerRef.update({
      [targetCompany]: firebase.firestore.FieldValue.increment(2),
      currentCash: firebase.firestore.FieldValue.increment(-pricePaid)
    })
      .then(function () {
        // console.log(player.shares[payload.company], 'Player Shares Bought!')
        const companyRef = db.collection('games').doc(gameID).collection('companies').doc(payload.companyID)
        const presidentLoc = '/games/' + gameID + '/players/' + payload.player
        console.log(presidentLoc)
        return companyRef.update({
          parShares: firebase.firestore.FieldValue.increment(-2),
          parPrice: payload.parPrice,
          stockPrice: payload.parPrice,
          president: db.doc(presidentLoc)
        })
          .then(function () {
            console.log('Company Shares Updated!')
          })
          .catch(function (error) {
            // The document probably doesn't exist.
            console.error('Error updating Company Shares: ', error)
          })
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        console.error('Error updating Player: ', error)
      })
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
    companiesWithPresidents: function (state) {
      return state.allGameCompanies.filter(function (company) { return !isEmpty(company.president) })
    },
    companiesWithoutPresidents: function (state) {
      return state.allGameCompanies.filter(function (company) { return isEmpty(company.president) })
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
    },
    companiesOwnedByPlayer: (state) => (player) => {
      if (isEmpty(player.shares)) {
        return null
      } else {
        const ownedCos = []
        // console.log(Object.entries(player.shares))
        for (const [ownedCompany, share] of Object.entries(player.shares)) {
          ownedCos.push({
            company: state.allGameCompanies.filter(function (company) { return company.initials === ownedCompany })[0],
            shares: share
          })
        }
        return ownedCos
      }
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
      return bindFirestoreRef('activeGamePlayers', db.collection('games').doc(gameID).collection('players'))
    }),
    bindAllGameCompanies: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('allGameCompanies', db.collection('games').doc(gameID)
        .collection('companies').orderBy('operatingOrder'))
    }),

    bindActiveGame: firestoreAction(({ bindFirestoreRef }) => {
      const activeGame = bindFirestoreRef('activeGame', db.collection('games').doc(gameID))
      return activeGame
    }),
    // copyTrainsToGame: async ({ commit }, payload) => {
    // const gameTemplateRef = await db.collection('gameTemplates').doc('YqavGvZGBpNKtLPDMHZy').get()
    // const trainRoster = gameTemplateRef.data().trainRoster
    // console.log(trainRoster)
    // const curGameRef = db.collection('games').doc(gameID)
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
