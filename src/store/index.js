import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Vue from 'vue'
import Vuex from 'vuex'
import firebaseConfig from '../../firebaseConfig'
import { isUndefined, filter, isEmpty } from 'lodash-es'
const gameID = 'SF0l06RKrMqfmoORa0gC'

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
function moveStockUp (gameStockMarket, startingLocation) {
  console.log('up')
  if (isUndefined(gameStockMarket[startingLocation.row][startingLocation.column].exitUp)) {
    if (startingLocation.row.toUpperCase() === 'A') {
      console.log(gameStockMarket[startingLocation.row][startingLocation.column])
      return startingLocation
    } else {
      return {
        row: (String.fromCharCode(startingLocation.row.toUpperCase().charCodeAt(0) - 1)),
        column: startingLocation.column
      }
    }
  } else {
    return moveStock(gameStockMarket, startingLocation, gameStockMarket[startingLocation.row][startingLocation.column].exitUp.toLowerCase())
  }
}

function moveStockLeft (gameStockMarket, startingLocation) {
  console.log('left')
  if (isUndefined(gameStockMarket[startingLocation.row][startingLocation.column].exitLeft)) {
    if (startingLocation.column === 1) {
      console.log(gameStockMarket[startingLocation.row][startingLocation.column])
      return startingLocation
    } else {
      return {
        row: (startingLocation.row - 1),
        column: startingLocation.column
      }
    }
  } else {
    return moveStock(gameStockMarket, startingLocation, gameStockMarket[startingLocation.row][startingLocation.column].exitLeft.toLowerCase())
  }
}
function moveStockRight (gameStockMarket, startingLocation) {
  console.log('right')
  if (isUndefined(gameStockMarket[startingLocation.row][startingLocation.column].exitLeft)) {
    if (startingLocation.column === gameStockMarket.maxColumn) {
      console.log(gameStockMarket[startingLocation.row][startingLocation.column])
      return startingLocation
    } else {
      return {
        row: (startingLocation.row + 1),
        column: startingLocation.column
      }
    }
  } else {
    return moveStock(gameStockMarket, startingLocation, gameStockMarket[startingLocation.row][startingLocation.column].exitLeft.toLowerCase())
  }
}

function moveStockDown (gameStockMarket, startingLocation) {
  console.log('down')
  if (isUndefined(gameStockMarket[startingLocation.row][startingLocation.column].exitDown)) {
    if (startingLocation.row.toUpperCase() === gameStockMarket.maxRow.toUpperCase()) {
      console.log(gameStockMarket[startingLocation.row][startingLocation.column])
      return startingLocation
    } else {
      return {
        row: (String.fromCharCode(startingLocation.row.toUpperCase().charCodeAt(0) + 1)),
        column: startingLocation.column
      }
    }
  } else {
    return moveStock(gameStockMarket, startingLocation, gameStockMarket[startingLocation.row][startingLocation.column].exitDown.toLowerCase())
  }
}
function moveStock (gameStockMarket, startingLocation, direction) {
  if (!isUndefined(gameStockMarket[startingLocation.row][startingLocation.column])) {
    console.log('move stock:', gameStockMarket[startingLocation.row][startingLocation.column])
    switch (direction.toLowerCase()) {
      case 'stop':
        console.log('stop')
        return startingLocation
      case 'right':
        return moveStockRight(gameStockMarket, startingLocation)
      case 'up':
        return moveStockUp(gameStockMarket, startingLocation)
      case 'down':
        return moveStockDown(gameStockMarket, startingLocation)
      case 'left':
        return moveStockLeft(gameStockMarket, startingLocation)
      default:
        console.error('Default', direction)
        return false
    }
  } else {
    console.error('The current location is invalid', startingLocation)
    return false
  }
}

function saleStockTransaction (gameOptions, gameStockMarket, payload, company) {
  console.log(gameStockMarket)
  console.log('sell stock', payload, company)
  let newStockLocation = company.stockLocation
  const gameRef = db.collection('games').doc(gameID)
  const companyPath = 'companies.' + payload.companyID + '.'
  const companyUpdate = {}
  const cashGained = company.stockPrice * payload.numberOfShares
  const targetCerts = getTargetSharesArray(company, 'certificate', payload.player)
  for (let i = 0; i < payload.numberOfShares; i++) {
    newStockLocation = moveStock(gameStockMarket, newStockLocation, 'down')
  }
  console.log('new location:', newStockLocation)
  for (let i = 0; i < payload.numberOfShares; i++) {
    companyUpdate[companyPath + 'certificates.' + targetCerts[i] + '.owner'] = 'market'
  }
  companyUpdate[companyPath + 'stockPrice'] = gameStockMarket[newStockLocation.row][newStockLocation.column].price
  companyUpdate[companyPath + 'stockLocation.row'] = newStockLocation.row
  companyUpdate[companyPath + 'stockLocation.column'] = newStockLocation.column
  companyUpdate['players.' + payload.player + '.currentCash'] = firebase.firestore.FieldValue.increment(cashGained)
  companyUpdate.bank = firebase.firestore.FieldValue.increment(-cashGained)
  console.log('update: ', companyUpdate)
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
  let pricePaid = 0
  if (payload.source === 'par') {
    pricePaid = company.parPrice
  } else if (payload.source === 'market') {
    pricePaid = company.stockPrice
  }
  console.log(targetCert, pricePaid)
  const gameRef = db.collection('games').doc(gameID)
  return gameRef.update({
    bank: firebase.firestore.FieldValue.increment(pricePaid),
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
    bank: firebase.firestore.FieldValue.increment(pricePaid),
    ['players.' + payload.player + '.currentCash']: firebase.firestore.FieldValue.increment(-pricePaid),
    ['companies.' + payload.companyID + '.parPrice']: payload.parPrice,
    ['companies.' + payload.companyID + '.stockPrice']: payload.parPrice,
    ['companies.' + payload.companyID + '.stockLocation']: payload.stockLocation,
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
function getParLoc (state, parPrice) {
  return state.getters.gameParPricesArray.filter(function (parRecord) {
    return parRecord.price === parPrice
  })[0].startingLocation
  //  return state.activeGame.companies.filter(function (company) { return !company.hasStarted })
}

function comitStockTransaction (state, payload) {
  console.log('stock comit: ', payload)
  const company = state.getters.activeGame.companies[payload.companyID]
  if (payload.action === 'sell') {
    saleStockTransaction(state.getters.gameOptions, state.getters.activeGame.stockMarket, payload, company)
  } else if (payload.action === 'buy') {
    buyStockTransaction(payload, company)
  } else if (payload.action === 'buyPresedincy') {
    payload.stockLocation = getParLoc(state, payload.parPrice)
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
    gameStockMarket: {},
    gameParPricesArray: [],
    bank: 0
  },
  getters: {
    bank: state => state.activeGame.bank,
    games: state => state.games,
    gameOptions: state => state.activeGame.options,
    gameStockMarket: state => state.activeGame.stockMarket,
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
          playerShares[company.initials] = getters.getShareholdersCollection(company)[playerID]
        }
      })
      if (isEmpty(playerShares)) {
        return false
      } else {
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
      // console.log('state.getters', state.getters)
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
