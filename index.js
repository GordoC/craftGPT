const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock


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

bot.on('spawn', () => {
    bot.chat("hello!")

    // Loads pathfinder into bot
    // Done once per program unless different Movements configurations
    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = [] // Removes bot from scafolding to player

    bot.pathfinder.setMovements(movements)
})

// User chatting with bot, activated by starting the message with '?'
bot.on('chat', (username, message) => {
    if (username === bot.username) return
    if (message.length < 1) return
    if (message.substring(0,1) != '?') return
    // bot.chat(message)
    // followPlayer(username)
    if (message == "?hi") findFarmland()
    if (message == "?bye") findHarvestableFarmland('wheat')
    if (message == "?reset") goToSpawn()
})


// Follow player based on username
function followPlayer(username) {
    const player = bot.players[username]

    if (!player) {
        bot.chat("I can't follow: " + username)
        return
    }

    const goal = new GoalFollow(player.entity, 1) // 1 = # of blocks away
    bot.pathfinder.setGoal(goal, true) // true if entity is dynamic (moving), constantly checks new position
}

// Go to spawn: 0, -60, 0
function goToSpawn() {
    const x = 0
    const y = -60
    const z = 0
    const goal = new GoalBlock(x, y, z)
    bot.pathfinder.setGoal(goal)
}

// Finds closest farmland
function findFarmland() {
    const farmland = bot.findBlock({
        matching: (block)=>{
			return block.name === 'farmland'
		},
        maxDistance: 32
    })

    if (!farmland) {
        bot.chat("No farmlands")
        return
    }

    // Set goal to 1 block above farmland in bot
    const x = farmland.position.x
    const y = farmland.position.y + 1
    const z = farmland.position.z
    const goal = new GoalBlock(x, y, z)
    bot.pathfinder.setGoal(goal)
}

// Finds closest harvestable farmland based on crop name
function findHarvestableFarmland(cropName) {
    const harvestableFarmLand = bot.findBlock({
        matching: (block)=>{
			return (block.name == cropName && block.metadata == 7)
		},
        maxDistance: 32
    })

    if (!harvestableFarmLand) {
        bot.chat("No harvestable " + cropName)
        return
    }

    // Set goal to 1 block above harvestable farmland in bot
    const x = harvestableFarmLand.position.x
    const y = harvestableFarmLand.position.y + 1
    const z = harvestableFarmLand.position.z
    const goal = new GoalBlock(x, y, z)
    bot.pathfinder.setGoal(goal)
}

