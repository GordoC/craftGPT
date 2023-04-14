const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock

// Init bot
const bot = mineflayer.createBot({
    host: 'localhost',
    port: process.argv[2],
    username: 'CraftGPT'
})

// Init plugins
bot.loadPlugin(pathfinder);

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)

// On spawn initialization
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
    // Checks if sender is not the bot (avoids feedback loop)
    if (username === bot.username) return

    // Checks if message is valid command format
    if (message.length < 1) return
    if (message.substring(0,1) != '?') return

    // Acquire command from message
    let cmdLen = message.indexOf(' ')
    let command = cmdLen != -1 ? message.substring(1, cmdLen) : message.substring(1)

    // Commands
    switch (command) {
        case 'reset':
            goToSpawn()
            break
        case 'echo':
            bot.chat(message.substring(6))
            break
        case 'follow':
            followPlayer(username)
            break
        case 'hi':
            findFarmland()
            break
        case 'bye':
            findHarvestableFarmland('wheat')
            break
    }
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

// Finds closest harvestable farmland based on crop name and returns it
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

    return harvestableFarmLand
    // // Break the harvestable crop
    // bot.dig(harvestableFarmLand)
}

// Collects all dropped items in a given distance
function collectItems(distance) {
    let itemEntity = bot.nearestEntity((entity)=>{
		return entity.name.toLowerCase() === 'item'
	});

    while (itemEntity && bot.position.distanceTo(itemEntity.position) <= distance) {
        bot.goto(itemEntity.position);
        if (bot.position = itemEntity.position) {
            itemEntity = bot.nearestEntity((entity)=>{
                return entity.name.toLowerCase() === 'item'
            });
        }
    }
}

