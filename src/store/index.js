import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Vue from 'vue'
import Vuex from 'vuex'
import firebaseConfig from '../../firebaseConfig'
import { isEmpty, isUndefined, filter } from 'lodash-es'
const gameID = 'g94p6lxmMNZUZSAI3J1J'

// console.log(firebaseConfig)

const db = firebase.initializeApp(firebaseConfig).firestore()
Vue.use(Vuex)

function getTargetShares (company, shareType, ownerID) {
  // console.log('getCert:', company.certificates)
  const certificates = []
  for (const certificate in company.certificates) {
    if ((company.certificates[certificate].type === shareType) &&
    (company.certificates[certificate].owner === ownerID)) {
      certificates.push(certificate)
    }
  }
  return certificates
}

function saleStockTransaction (payload, company, playerRef) {
  console.log(payload, company)
  const targetCerts = getTargetShares(company, 'certificate', payload.player)
  const companyUpdate = {}
  for (let i = 0; i < payload.numberOfShares; i++) {
    companyUpdate['certificates.' + targetCerts[i] + '.owner'] = 'market'
  }
  const cashGained = company.stockPrice * payload.numberOfShares
  console.log(' cash:', cashGained, 'update: ', companyUpdate)
  playerRef.update({
    currentCash: firebase.firestore.FieldValue.increment(cashGained)
  })
    .then(function () {
      console.log('Player Shares Sold!')
      const companyRef = db.collection('games').doc(gameID).collection('companies').doc(payload.companyID)
      companyRef.update(companyUpdate)
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
function buyStockTransaction (payload, company, playerRef) {
  const targetCert = getTargetShares(company, 'certificate', payload.source)[0]
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
  // const player = state.getters.getPlayerByID(payload.player)
  // const company = state.getters.getCompanyByID(payload.companyID) - old for document model
  const company = state.activeGame.company[payload.companyID]
  // const targetCompany = 'shares.' + payload.company
  const playerRef = db.collection('games').doc(gameID).collection('players').doc(payload.player)
  if (payload.action === 'sell') {
    saleStockTransaction(payload, company, playerRef)
  } else if (payload.action === 'buy') {
    buyStockTransaction(payload, company, playerRef)
  } else if (payload.action === 'buyPresedincy') {
    buyPresidnecyTransaction(payload, playerRef)
  }
}
function presCheck (company) {
  // console.log('prez check: ', company)
  if ((company.certificates.presidentsCertificate.owner === 'par') ||
  (company.certificates.presidentsCertificate.owner === 'company')) {
    return false
  } else {
    return true
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
    activeGamePlayers: state => state.activeGame.players,
    activeGame: state => state.activeGame,
    allGameCompanies: state => state.activeGame.companies,
    // getPlayerByID: (state) => (playerID) => {
    //   return state.activeGame.players.filter(function (player) { return player.id === playerID })[0]
    // },
    getCompanyByID: (state) => (companyID) => {
      return filter(state.activeGame.companies, { 'company.id': companyID })[0]
    },
    getCompanyByInitials: (state) => (companyInitials) => {
      return filter(state.activeGame.companies, { 'company.initials': companyInitials })[0]
    },
    activeGameCompanies: function (state) {
      return filter(state.activeGame.companies, { 'company.hasStarted': true })
    },
    // inactiveGameCompanies: function (state) {
    //   return state.activeGame.companies.filter(function (company) { return !company.hasStarted })
    // },
    companiesWithPresidents: function (state) {
      return filter(state.activeGame.companies, function (company) { return presCheck(company) })
    },
    companiesWithoutPresidents: function (state) {
      return filter(state.activeGame.companies, function (company) { return !presCheck(company) })
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
      const playerShares = {}
      console.log('shares: ', state.activeGame.companies)
      for (const company in Object.values(state.activeGame.companies)) {
        // console.log(company.initials, ' : ', getters.getShareholders(company))
        if (!isUndefined(getters.getShareholders(company)[playerID])) {
          playerShares[company.initials] = getters.getShareholders(company)[playerID]
          // playerShares.push({ company: company.initials, shares: getters.getShareholders(company)[playerID] })
        }
      }
      console.log('playerShares: ', playerShares)
      return playerShares
    },

    oldGetShareholders: (state) => (company) => {
      const companyOwners = []

      state.activeGame.players.forEach(player => {
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
      state.activeGame.players.forEach(player => {
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
            company: filter(state.activeGame.companies, { 'company.initials': ownedCompany })[0],
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
    // bindGames: firestoreAction(({ bindFirestoreRef }) => {
    //   return bindFirestoreRef('games', db.collection('games'))
    // }),
    bindGameTemplates: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef('gameTemplates', db.collection('gameTemplates'))
    }),
    // bindActiveGamePlayers: firestoreAction(({ bindFirestoreRef }) => {
    //   return bindFirestoreRef('activeGamePlayers', db.collection('games').doc(gameID).collection('players'))
    // }),
    // bindAllGameCompanies: firestoreAction(({ bindFirestoreRef }) => {
    //   return bindFirestoreRef('allGameCompanies', db.collection('games').doc(gameID)
    //     .collection('companies').orderBy('operatingOrder'))
    // }),
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
