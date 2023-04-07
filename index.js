const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const GoalFollow = goals.GoalFollow

const bot = mineflayer.createBot({
    host: 'localhost',
    port: process.argv[2],
    username: 'CraftGPT'
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)

// Init plugins
bot.loadPlugin(pathfinder);

// User chatting with bot, activated by starting the message with '?'
bot.on('chat', (username, message) => {
    if (username === bot.username) return
    if (message.length < 1) return
    if (message.substring(0,1) != '?') return
    // bot.chat(message)
    followPlayer(username)
})

function followPlayer(username) {
    const player = bot.players[username]

    if (!player) {
        bot.chat("I can't follow: " + username)
        return
    }

    // Loads pathfinder into bot
    // Done once per program unless different Movements configurations
    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = [] // Removes bot from scafolding to player

    bot.pathfinder.setMovements(movements)
    

    const goal = new GoalFollow(player.entity, 1) // 1 = # of blocks away
    bot.pathfinder.setGoal(goal, true) // true if entity is dynamic (moving), constantly checks new position
}


