const {
  searchUsers,
  searchMessages,
  search,
} = require('../../controllers/search')
const { socketTryCatcher } = require('../../utils/tryCatcher')
const events = {
  search: 'search',
  searchUsers: 'searchUsers',
  searchMessages: 'searchMessages',
}

module.exports.searchEventHandlers = {
  [events.search]: socketTryCatcher(async (_io, socket, data = {}) => {
    const results = await search({ userId: socket.user._id, data })
    socket.emit(events.search, results)
  }),
  [events.searchUsers]: socketTryCatcher(async (_io, socket, data = {}) => {
    const { search, page, limit } = data
    const results = await searchUsers({
      userId: socket.user._id,
      search,
      page,
      limit,
    })
    socket.emit(events.searchUsers, results)
  }),
  [events.searchMessages]: socketTryCatcher(async (_io, socket, data) => {
    const { search, page, limit } = data
    const results = await searchMessages({
      userId: socket.user._id,
      search,
      page,
      limit,
    })
    socket.emit(events.searchMessages, results)
  }),
}
