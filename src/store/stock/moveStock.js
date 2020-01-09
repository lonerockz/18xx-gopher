import { isUndefined } from 'lodash-es'
function moveStockUp (gameStockMarket, startingLocation) {
  // console.log('up')
  if (isUndefined(gameStockMarket[startingLocation.row][startingLocation.column].exitUp)) {
    if (startingLocation.row.toUpperCase() === 'A') {
      // console.log(gameStockMarket[startingLocation.row][startingLocation.column])
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
  // console.log('left')
  if (isUndefined(gameStockMarket[startingLocation.row][startingLocation.column].exitLeft)) {
    if (startingLocation.column === 1) {
      // console.log(gameStockMarket[startingLocation.row][startingLocation.column])
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
  // console.log('right')
  if (isUndefined(gameStockMarket[startingLocation.row][startingLocation.column].exitLeft)) {
    if (startingLocation.column === gameStockMarket.maxColumn) {
      // console.log(gameStockMarket[startingLocation.row][startingLocation.column])
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
  // console.log('down')
  if (isUndefined(gameStockMarket[startingLocation.row][startingLocation.column].exitDown)) {
    if (startingLocation.row.toUpperCase() === gameStockMarket.maxRow.toUpperCase()) {
      // console.log(gameStockMarket[startingLocation.row][startingLocation.column])
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
    // console.log('move stock:', gameStockMarket[startingLocation.row][startingLocation.column])
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

export { moveStock as default }
