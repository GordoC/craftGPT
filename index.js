const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
    host: 'localhost',
    port: 62239,
    username: 'CraftGPT'
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)

// User chatting with bot, activated by starting the message with '?'
bot.on('chat', (username, message) => {
    if (username === bot.username) return
    if (message.length < 1) return
    if (message.substring(0,1) != '?') return
    bot.chat(message)
})
  
