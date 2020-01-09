import { isUndefined, filter, isEmpty } from 'lodash-es'

const presidencyCheck = function presidencyCheck (state, company, payload) {
  // if there is no change in presidnecy then return false.
  // if there is a change in presidency then return the new Presidents ID
  const sharesInTransaction = isUndefined(payload.numberOfShares) ? 1 : payload.numberOfShares
  const currentPresident = company.certificates.presidentsCertificate.owner
  const shareHoldersArray = state.getters.getPlayerShareholdersArray(company)
  const playersSharesArray = filter(shareHoldersArray, ['shareHolder', payload.player])
  const playersNumberOfShares = isEmpty(playersSharesArray) ? 0 : playersSharesArray[0].shares
  console.log('shareholders:', shareHoldersArray)
  // console.log('Players Number of Shares:', playersNumberOfShares, payload.action)
  // console.log(currentPresident, company.certificates.presidentsCertificate.shares)
  if (payload.action === 'buy') {
    if (payload.player === currentPresident) {
      // Already president and buying so stays president
      console.log('Already President')
      return false
    } else if ((playersNumberOfShares + sharesInTransaction) < company.certificates.presidentsCertificate.shares) {
      // player wont have enough shares to become president, so can't become president
      console.log('can\'t become president')
      return false
    } else {
      // not president and buying enough to get presdients share so check if new purchase will make play president
      const presidentsNumberOfShares = filter(shareHoldersArray, ['shareHolder', currentPresident])[0].shares
      if (presidentsNumberOfShares < (playersNumberOfShares + sharesInTransaction)) {
        console.log('New President!!!')
        return payload.player
      } else {
        console.log('Not enough Shares', presidentsNumberOfShares, '>', (playersNumberOfShares + sharesInTransaction))
        return false
      }
      // const max = shareHoldersCollection.reduce((prev, current) => (prev.y > current.y) ? prev : current)
    }
  } else if (payload.action === 'sell') {
    console.log('sell', payload.player, currentPresident)
    if (payload.player !== currentPresident) {
      // Not already president and selling so president does not change
      console.log('Already President')
      return false
    } else {
      console.log('got here!!!', playersNumberOfShares, sharesInTransaction)
      // check if there is a president after the number of shares is sold.
      const numberOfSharesLeft = playersNumberOfShares - sharesInTransaction
      const possiblePresidents = []
      for (const shareHolder of shareHoldersArray) {
        console.log(shareHolder, shareHolder.shares, numberOfSharesLeft)
        // console.log(shareHoldersArray[shareHolder], shareHoldersArray[shareHolder].shares, numberOfSharesLeft)
        if ((shareHolder.shares > numberOfSharesLeft) &&
        (shareHolder.shareHolder !== payload.player)) {
          possiblePresidents.push(shareHolder)
        }
      }
      console.log('Possible Presidents: ', possiblePresidents)
      if (possiblePresidents.length === 1) {
        // only 1 possible so assign it
        return possiblePresidents[0].shareHolder
      } else {
        // there are more than 1 possible president
        let maxPresidents = []
        let currentMax = 0
        for (const possiblePresident of possiblePresidents) {
          if (possiblePresident.shares > currentMax) {
            maxPresidents = []
            maxPresidents.push(possiblePresident)
            currentMax = possiblePresident.shares
          } else if (possiblePresident.shares === currentMax) {
            maxPresidents.push(possiblePresident)
          }
        }
        if (maxPresidents.lenght === 1) {
          return maxPresidents[0].shareHolder
        } else if (maxPresidents.length > 1) {
          // two or more players are eligible, so see which is closest in priority to the president
          // console.log(state)
          const oldPresidentPriority = state.getters.activeGame.players[payload.player].priorityOrder
          let curMaxPriority = 9999
          let newPresidentId = false
          let lowestPresdientPriority = 9999
          let lowestPresidentId = false
          for (const possiblePresident of maxPresidents) {
            console.log(possiblePresident.shareHolderPriority, curMaxPriority)
            if ((possiblePresident.shareHolderPriority < curMaxPriority) &&
             (possiblePresident.shareHolderPriority > oldPresidentPriority)) {
              curMaxPriority = possiblePresident.shareHolderPriority
              newPresidentId = possiblePresident.shareHolder
            }
            if (possiblePresident.shareHolderPriority < lowestPresdientPriority) {
              lowestPresdientPriority = possiblePresident.shareHolderPriority
              lowestPresidentId = possiblePresident.shareHolder
            }
          }
          if (!newPresidentId) {
            // possible presidents have lower priority than current president
            newPresidentId = lowestPresidentId
          }
          return newPresidentId
        }
      }
      if (playersNumberOfShares - sharesInTransaction) {

      }
    }
  } else {
    console.error('Something wierd is going on in presidencyCheck.', payload.action)
    return false
  }
}

export { presidencyCheck as default }
