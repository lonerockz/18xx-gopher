import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Vue from 'vue'
import Vuex from 'vuex'
import firebaseConfig from '../../firebaseConfig'
import { isUndefined, filter, isEmpty } from 'lodash-es'
const gameID = 'g94p6lxmMNZUZSAI3J1J'

// console.log(firebaseConfig)

const db = firebase.initializeApp(firebaseConfig).firestore()
Vue.use(Vuex)

function getTargetSharesArray (company, shareType, ownerID) {
  // console.log('getCert:', company.certificates)
  const certificates = []
  for (const certificate in company.certificates) {
    if ((company.certificates[certificate].type === shareType) &&
    (company.certificates[certificate].owner === ownerID)) {
      certificates.push(certificate)
    }
  }
  if (certificates.length === 0) {
    return false
  } else {
    return certificates
  }
}

function saleStockTransaction (payload, company) {
  console.log(payload, company)
  const targetCerts = getTargetSharesArray(company, 'certificate', payload.player)
  const companyUpdate = {}
  for (let i = 0; i < payload.numberOfShares; i++) {
    companyUpdate['companies.' + payload.companyID + '.certificates.' + targetCerts[i] + '.owner'] = 'market'
  }
  const cashGained = company.stockPrice * payload.numberOfShares
  companyUpdate['players.' + payload.player + '.currentCash'] = firebase.firestore.FieldValue.increment(cashGained)
  console.log('update: ', companyUpdate)
  const gameRef = db.collection('games').doc(gameID)
  return gameRef.update(companyUpdate)
    .then(function () {
      console.log('Player Shares Sold!')
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      console.error('Error updating Player: ', error)
    })
}
function buyStockTransaction (payload, company) {
  const targetCert = getTargetSharesArray(company, 'certificate', payload.source)[0]
  console.log(company)
  let pricePaid = 0
  if (payload.source === 'par') {
    pricePaid = company.parPrice
  } else if (payload.source === 'market') {
    pricePaid = company.stockPrice
  }
  console.log(targetCert, pricePaid)
  const gameRef = db.collection('games').doc(gameID)
  return gameRef.update({
    ['players.' + payload.player + '.currentCash']: firebase.firestore.FieldValue.increment(-pricePaid),
    ['companies.' + payload.companyID + '.certificates.' + targetCert + '.owner']: payload.player
  })
    .then(function () {
      console.log('Company Shares Updated!')
    }).catch(function (error) {
      // The document probably doesn't exist.
      console.error('Error updating Company: ', error)
    })
}
function buyPresidnecyTransaction (payload) {
  const gameRef = db.collection('games').doc(gameID)
  console.log('presidency', payload)
  const pricePaid = payload.parPrice * 2
  return gameRef.update({
    ['players.' + payload.player + '.currentCash']: firebase.firestore.FieldValue.increment(-pricePaid),
    ['companies.' + payload.companyID + '.parPrice']: payload.parPrice,
    ['companies.' + payload.companyID + '.stockPrice']: payload.parPrice,
    ['companies.' + payload.companyID + '.certificates.presidentsCertificate.owner']: payload.player
  })
    .then(function () {
      // console.log(player.shares[payload.company], 'Player Shares Bought!')
      console.log('Game Updated: ', payload)
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      console.error('Error updating Player: ', error)
    })
}
function comitStockTransaction (state, payload) {
  console.log('stock comit: ', payload)
  // const player = state.getters.getPlayerByID(payload.player)
  const company = state.getters.activeGame.companies[payload.companyID]
  // const targetCompany = 'shares.' + payload.company
  // const playerRef = db.collection('games').doc(gameID).collection('players').doc(payload.player)
  if (payload.action === 'sell') {
    saleStockTransaction(payload, company)
  } else if (payload.action === 'buy') {
    buyStockTransaction(payload, company)
  } else if (payload.action === 'buyPresedincy') {
    buyPresidnecyTransaction(payload)
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
    allGameCompanies: {},
    navDrawer: true,
    currentStockActions: {},
    gameOptions: {},
    gameParPricesArray: []
  },
  getters: {
    games: state => state.games,
    gameOptions: state => state.activeGame.options,
    gameParPricesArray: state => state.activeGame.parPrices,
    gameTemplates: state => state.gameTemplates,
    activeGamePlayers: state => state.activeGame.players,
    activeGame: state => state.activeGame,
    allGameCompanies: state => state.activeGame.companies,
    getCompanyByInitials: (state) => (companyInitials) => {
      return filter(state.activeGame.companies, { initials: companyInitials })[0]
    },
    activeGameCompanies: function (state) {
      return filter(state.activeGame.companies, { hasStarted: true })
    },
    // inactiveGameCompanies: function (state) {
    //   return state.activeGame.companies.filter(function (company) { return !company.hasStarted })
    // },
    companiesWithPresidentsArray: function (state) {
      return filter(state.activeGame.companies, function (company) { return presCheck(company) })
    },
    companiesWithoutPresidentsArray: function (state) {
      return filter(state.activeGame.companies, function (company) { return !presCheck(company) })
    },
    getShareholdersCollection: () => (company) => {
      const shareholders = {}
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
    getSharesByPlayerIDCollection: (state, getters) => (playerID) => {
      const playerShares = {}
      Object.values(getters.activeGame.companies).forEach(company => {
        if (!isUndefined(getters.getShareholdersCollection(company)[playerID])) {
          // console.log(company.id, ' : ', getters.getShareholdersCollection(company)[playerID])
          playerShares[company.initials] = getters.getShareholdersCollection(company)[playerID]
        }
      })
      // console.log('getShares: ', playerShares, isEmpty(playerShares))
      if (isEmpty(playerShares)) {
        // console.log('empty player shares', playerID)
        return false
      } else {
      // console.log('playerShares: ', playerShares)
        return playerShares
      }
    },
    getPossiblePresidentsArray: (state) => (company) => {
      const companyOwners = []
      // console.log(company)
      state.activeGame.players.forEach(player => {
        Object.entries(player.shares).forEach(share => {
          if ((company === share[0]) && (share[1] > 1)) {
            companyOwners.push({ company: company, shares: share[1], player: player.player.id })
          }
        })
      })
      if (companyOwners.length === 0) {
        return false
      } else {
        return companyOwners
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
    bindActiveGame: firestoreAction(({ bindFirestoreRef }) => {
      const activeGame = bindFirestoreRef('activeGame', db.collection('games').doc(gameID))
      return activeGame
    }),
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
