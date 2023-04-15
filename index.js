const mineflayer = require("mineflayer")
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock

// Init bot
const bot = mineflayer.createBot({
    host: "localhost",
    port: process.argv[2],
    username: "CraftGPT"
})

// Init plugins
bot.loadPlugin(pathfinder);

// Log errors and kick reasons:
bot.on("kicked", console.log)
bot.on("error", console.log)

// On spawn initialization
bot.on("spawn", () => {
    bot.chat("hello!")

    // Loads pathfinder into bot
    // Done once per program unless different Movements configurations
    const mcData = require("minecraft-data")(bot.version)
    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = [] // Removes bot from scafolding to player

    bot.pathfinder.setMovements(movements)
})

// User chatting with bot, activated by starting the message with "?"
bot.on("chat", async (username, message) => {
    // Checks if sender is not the bot (avoids feedback loop)
    if (username === bot.username) return

    // Checks if message is valid command format
    if (message.length < 1) return
    if (message.substring(0,1) != "?") return

    // Acquire command from message
    let cmdLen = message.indexOf(" ")
    let command = cmdLen != -1 ? message.substring(1, cmdLen) : message.substring(1)

    // Commands
    try {
        switch (command) {
            case "reset":
                goToSpawn()
                break
            case "echo":
                bot.chat(message.substring(6))
                break
            case "follow":
                followPlayer(username)
                break
            case "hi":
                await findBlock("farmland")
                break
            case "bye":
                await findHarvestableFarmland("wheat")
                break
            case "pickup":
                await collectItems(32)
                break
        }
    } catch (error) {
        console.log(error)
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

// Finds closest block given name
async function findBlock(blockName) {
    const block = bot.findBlock({
        matching: (block)=>{
			return block.name === blockName
		},
        maxDistance: 32
    })

    if (!block) {
        bot.chat("No " + blockName)
        return
    }

    await bot.pathfinder.goto(positionToGoalBlock(block.position, true))
}

// Finds closest harvestable farmland based on crop name and returns it
async function findHarvestableFarmland(cropName) {
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

    await bot.pathfinder.goto(positionToGoalBlock(harvestableFarmLand.position, true))

    return harvestableFarmLand
}

// Collects all dropped items in a given distance
async function collectItems(distance) {
    let itemEntity = bot.nearestEntity((entity) => {
		return entity.name.toLowerCase() === "item"
	});

    while (itemEntity && bot.entity.position.distanceTo(itemEntity.position) <= distance) {
        await bot.pathfinder.goto(positionToGoalBlock(itemEntity.position, false))
        itemEntity = bot.nearestEntity((entity) => { // Find anymore dropped items 
            return entity.name.toLowerCase() === "item"
        });
    }

    bot.chat("No more dropped items")
}

// Takes position of block and if bot should be on top of block, returns GoalBlock
function positionToGoalBlock(position, topOfBlock) {
    const x = position.x
    const y = topOfBlock ? position.y + 1 : position.y // Set goal to 1 block above so bot doesn't dig block
    const z = position.z
    return new GoalBlock(x, y, z)
}

