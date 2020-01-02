import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Vue from 'vue'
import Vuex from 'vuex'
import firebaseConfig from '../../firebaseConfig'
import { isEmpty, isUndefined } from 'lodash-es'
const gameID = 'bWmLCmt1USbPKi997n0X' // 'SXkOIfauym3VxeRH6djV'

// console.log(firebaseConfig)

const db = firebase.initializeApp(firebaseConfig).firestore()
Vue.use(Vuex)

function getLowestShare (company, shareType, ownerID) {
  // console.log('getCert:', company.certificates)
  for (const certificate in company.certificates) {
    if ((company.certificates[certificate].type === shareType) &&
    (company.certificates[certificate].owner === ownerID)) {
      return certificate
    }
  }
  return null
}

function saleStockTransaction (payload, company, playerRef) {
  const targetCert = getLowestShare(company, 'certificate', payload.player)
  const cashGaned = company.stockPrice
  const companyUpdate = { ['certificates.' + targetCert + '.owner']: 'market' }
  return playerRef.update({
    currentCash: firebase.firestore.FieldValue.increment(cashGaned)
  })
    .then(function () {
      console.log('Player Shares Sold!')
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
  // let saleAction = {}
  // if (player.shares[payload.company] === payload.numberOfShares) {
  //   saleAction = { [targetCompany]: firebase.firestore.FieldValue.delete() }
  // } else {
  //   // saleAction = { [targetCompany]: firebase.firestore.FieldValue.increment(-payload.numberOfShares) }
  // }
  // const targetPayout = company.stockPrice * payload.numberOfShares
  // saleAction.currentCash = firebase.firestore.FieldValue.increment(targetPayout)
  // return playerRef.update(saleAction)
  //   .then(function () {
  //     console.log(player.shares[payload.company], 'Player Shares Sold!')
  //     const companyRef = db.collection('games').doc(gameID).collection('companies').doc(payload.companyID)
  //     return companyRef.update({
  //       marketShares: firebase.firestore.FieldValue.increment(payload.numberOfShares)
  //     }).then(function () {
  //       console.log('Company Shares Updated!')
  //     }).catch(function (error) {
  //       // The document probably doesn't exist.
  //       console.error('Error updating Company: ', error)
  //     })
  //   })
  //   .catch(function (error) {
  //     // The document probably doesn't exist.
  //     console.error('Error updating Player: ', error)
  //   })
}
function buyStockTransaction (payload, company, playerRef) {
  const targetCert = getLowestShare(company, 'certificate', payload.source)
  let pricePaid = 0
  const companyUpdate = { ['certificates.' + targetCert + '.owner']: payload.player }
  if (payload.source === 'par') {
    pricePaid = company.parPrice
  } else if (payload.source === 'market') {
    pricePaid = company.stockPrice
  }
  return playerRef.update({
    currentCash: firebase.firestore.FieldValue.increment(-pricePaid)
  })
    .then(function () {
      console.log('Player Shares Bought!')
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
}
function buyPresidnecyTransaction (payload, playerRef) {
  console.log('presidency', payload)
  const pricePaid = payload.parPrice * 2
  return playerRef.update({
    currentCash: firebase.firestore.FieldValue.increment(-pricePaid)
  })
    .then(function () {
      // console.log(player.shares[payload.company], 'Player Shares Bought!')
      const companyRef = db.collection('games').doc(gameID).collection('companies').doc(payload.companyID)
      // console.log(presidentLoc)
      return companyRef.update({
        parPrice: payload.parPrice,
        stockPrice: payload.parPrice,
        'certificates.presidentsCertificate.owner': payload.player
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
function comitStockTransaction (state, payload) {
  const player = state.getters.getPlayerByID(payload.player)
  const company = state.getters.getCompanyByID(payload.companyID)
  const targetCompany = 'shares.' + payload.company
  const playerRef = db.collection('games').doc(gameID).collection('players').doc(payload.player)
  if (payload.action === 'sell') {
    saleStockTransaction(state, payload, player, company, targetCompany, playerRef)
  } else if (payload.action === 'buy') {
    buyStockTransaction(payload, company, playerRef)
  } else if (payload.action === 'buyPresedincy') {
    buyPresidnecyTransaction(payload, playerRef)
  }
}
function presCheck (company) {
  if ((company.certificates.presidentsCertificate.owner === 'par') ||
  (company.certificates.presidentsCertificate.owner === 'company')) {
    return true
  } else {
    return false
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
      return state.allGameCompanies.filter(function (company) { return !presCheck(company) })
    },
    companiesWithoutPresidents: function (state) {
      return state.allGameCompanies.filter(function (company) { return presCheck(company) })
    },
    getShareholders: () => (company) => {
      const shareholders = {}
      // console.log('got to newGetShareholders', company)
      for (const certificate in company.certificates) {
        if (isUndefined(shareholders[company.certificates[certificate].owner])) {
          shareholders[company.certificates[certificate].owner] = company.certificates[certificate].shares
        } else {
          shareholders[company.certificates[certificate].owner] += company.certificates[certificate].shares
        }
        // console.log(company.certificates[certificate].owner, ' : ', company.certificates[certificate].shares, company.certificates[certificate].type)
      }
      // console.log('shareholders : ', company.initials, shareholders)
      return shareholders
    },
    getSharesByPlayerID: (state, getters) => (playerID) => {
      // console.log('get shares by ID: ', playerID)
      const playerShares = []
      state.allGameCompanies.forEach(company => {
        // console.log(company.initials, ' : ', getters.getShareholders(company))
        if (!isUndefined(getters.getShareholders(company)[playerID])) {
          playerShares.push({ company: company.initials, shares: getters.getShareholders(company)[playerID] })
        }
      })
      console.log(playerShares)
      return playerShares
    },

    oldGetShareholders: (state) => (company) => {
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
