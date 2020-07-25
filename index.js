const Discord = require('discord.js')
const {Client, MessageAttachment, MessageEmbed} = require('discord.js')
const client = new Client(); 
const ms = require('ms')

const PREFIX = '%'

const token = 'NzI2NDgxMTUwODM4ODMzMTk0.XveAAw.raPYpovAaXU2OW4pKJgD22pZZmk'

let flowers = ['dandelion', 'lily', 'ladyslipper', 'rose']

client.on('ready', () => {
    console.log('Ready!');
    spawn('726636823996268624');
    spawn('730610793976168488');
});

class Owner{
    constructor(name, plants, money, active, modifier){
        this.name = name
        this.plants = plants
        this.money = money
        this.active = active
        this.modifier = modifier
        this.data = {
            name : this.name,
            plants : this.plants,
            money : this.money, 
            active : this.active,
            modifier : this.modifier
        }
    }
}

class Plant{
    constructor(owner, species, size, words, image, name){
        this.owner = owner
        this.species = species
        this.size = size
        this.words = words
        this.image = image
        this.name = name
        this.data = {
            owner :  this.owner,
            species : this.species, 
            size : this.size, 
            words : this.words, 
            image: this.image,
            name: this.name
        }
    }

}


let fs = require("fs");
let dict = {}

var plant_data = JSON.parse(fs.readFileSync('data.json').toString());
plant_data.forEach(element => {
    dict[element.name] = element
});
console.log(dict)

client.on('message', message => {
    let args = message.content.substring(PREFIX.length).split(" ");
    let person = message.author.username
    if(message.author.bot) return;
    if (dict[person] != undefined){
        let act = dict[person].active
        dict[person].plants[act].words += dict[person].modifier
        if(dict[person].plants[act].words >= (100 * (dict[person].plants[act].size + 1)) && dict[person].plants[act].size < 5){
            dict[person].plants[act].size += 1;
            if(dict[person].plants[act].size <= 2){
                attachment_name = "./size" + dict[person].plants[act].size + ".png"
            }
            else{
                attachment_name = "./" + dict[person].plants[act].species + "_size" + dict[person].plants[act].size + ".png"
            }

            const growth_embed = new MessageEmbed()
                .setColor(0xBA6BE9)
                .setTitle("Your plant grew a little!")
                .attachFiles(attachment_name)
                .setImage('attachment://' + (attachment_name).substring(2));

            dict[person].plants[act].image = attachment_name
            message.channel.send(growth_embed)
            dict[person].plants[act].words = 0
        }
        var plant_data = JSON.parse(fs.readFileSync('data.json').toString());
        plant_data.forEach(element => {
            if (element.name == person){
                element.plants = dict[person].plants
            }
        });
        fs.writeFileSync('data.json', JSON.stringify(plant_data, null, 2), function(err){
            if (err) throw err;
            }); 
    }
    if (!message.content.startsWith(PREFIX)) return;
    switch(args[0]){
        case 'plant':
            if (dict[person] != undefined){
                let active = dict[person].active
                const attachment = new MessageAttachment(dict[person].plants[active].image)
                message.channel.send(attachment)
            }
            else{
                message.reply("You do not have a plant yet. Create one using %create.")
            }
            
        break;
        case 'create':
            if(args.length < 2){
                message.reply("Please enter a valid command.")
            }
            else{
                image = "./size0.png"
                if(!flowers.includes(args[1].trim())){
                    message.reply("That's not a flower you can make.")
                }
                else if (dict[person] != undefined){
                    const plant = new Plant(person, args[1].trim(), 0, 0, image, args[1].trim())
                    dict[person].plants.push(plant.data)

                    var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                    more_plant_data.forEach(element => {
                        if (element.name == person){
                            element.plants = dict[person].plants
                        }
                    });
                    fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                        if (err) throw err;
                        });
                    let len = dict[person].plants.length
                    const attachment = new MessageAttachment(dict[person].plants[len-1].image)
                    message.reply("Congratulations! Here is your new plant. Keep typing to grow your plant! Make sure to switch your active plant if you want to grow this one.");
                    message.reply(attachment)
                }
                else{
                    const plant = new Plant(person, args[1].trim(), 0, 0, image, args[1].trim())
                    const owner = new Owner(person, [plant.data], 0, 0, 1)
                    dict[person] = owner.data
                    fs.readFile('data.json', function (err, data) {
                        var json = JSON.parse(data);
                        console.log(owner.data)
                        json.push(owner.data);    
                        fs.writeFile("data.json", JSON.stringify(json, null, 2), function(err){
                            if (err) throw err;
                            console.log('New plant created!');
                        });
                    })
                    const attachment = new MessageAttachment(dict[person].plants[0].image)
                    message.reply("Congratulations! Here is your new plant. Keep typing to grow your plant!");
                    message.reply(attachment)
                }
        }
        break;
        case 'help':
            message.reply('\nSend ' + PREFIX + 'create followed by the plant name to create a plant. For example, %create dandelion \
            \n\nType ' + PREFIX + 'plant to view your plant. \
            \n\nType ' + PREFIX + 'flowers to see what flowers you can create. \
            \n\nType ' + PREFIX + 'switch followed by the number of the plant you want to switch to in order to change your active plant. For example, %switch 1 \
            \n\nType ' + PREFIX + 'name followed by a name, one word long, to name your plant. For example, %name bob\
            \n\nType ' + PREFIX + 'all to see what plants you currently have and their indices. \
            \n\nType ' + PREFIX + 'sell followed by an index to sell the plant at that index. For example, %sell 0\
            \n\nType ' + PREFIX + 'shop to see what you can buy and their costs. \
            \n\nType ' + PREFIX + 'buy followed by something from the shop to purchase a modifier. For example, %buy water \
            \n\nType ' + PREFIX + 'money to see how much money you have. \
            \n\nType ' + PREFIX + 'active to see your active plant. \
            \n\nSometimes, plants will spawn randomly. Type %collect to collect it. Only one person can collect it, so make sure you are the first! \
            \n\nAs you keep typing in the chat, your plant will grow.')
        break;
        case 'switch':
            if(dict[person] == undefined){
                message.reply("Bro, get some plants first.")
                return;
            }
            else if(args.length < 2){
                message.reply("Choose which plant to switch to as a number.")
                return;
            }
            num = Number.parseInt(args[1])
            if(Number.isNaN(num)){
                message.reply("Choose which plant to switch to as a number.")
            }
            else if (num >= dict[person].plants.length){
                message.reply("You don't have that many plants! Remember, your plants are indexed starting at 0.")
            }
            else if(dict[person].active == num){
                message.reply("That plant is already active.")
            }
            else{
                dict[person].active = num
                var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                    more_plant_data.forEach(element => {
                        if (element.name == person){
                            element.active = dict[person].active 
                        }
                    });
                fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                    if (err) throw err;
                    });
                let active = dict[person].active
                const attachment = new MessageAttachment(dict[person].plants[active].image)
                message.reply("Here is your active plant, " + dict[person].plants[active].name + "!");
                message.reply(attachment)
            }
        break;
        case 'name':
            if(dict[person] == undefined){
                message.reply("Bro, get some plants first.")
                return;
            }
            else if(args.length < 2){
                message.reply("Type %name 'name' to name your plant.")
            }
            else{
                let a = dict[person].active
                dict[person].plants[a].name = args[1]
                var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                    more_plant_data.forEach(element => {
                        if (element.name == person){
                            element.plants = dict[person].plants
                        }
                    });
                
                fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                    if (err) throw err;
                    });
                message.reply("Your plant's name is now " + dict[person].plants[a].name + "!");
            }
        break;
        case 'flowers':
            let str = "The possible flowers include "
            for(obj in flowers){
                str += flowers[obj] + " "
            }
            message.reply(str)
        break;
        case 'all':
            if(dict[person] == undefined){
                message.reply("Bro, get some plants first.")
                return;
            }
            else{
                const embed = new MessageEmbed()
                .setTitle(person + "'s Plants")
                .setColor(0x4BC980);
                for(i = 0; i < dict[person].plants.length; i++){
                    embed.addField(dict[person].plants[i].name, "Position: " + i + "\nSpecies: " + dict[person].plants[i].species)
                }
                message.channel.send(embed)
            }
        break;
        case 'sell':
            if(dict[person] == undefined){
                message.reply("Bro, get some plants first.")
                return;
            }
            else if(args.length < 2){
                message.reply("Type %sell 'index' to sell your plant.")
                return;
            }
            num = Number.parseInt(args[1])
            if(Number.isNaN(num)){
                message.reply("Type %sell 'index' to sell your plant.")
            }
            else if (num >= dict[person].plants.length){
                message.reply("You don't have that many plants! Remember, your plants are indexed starting at 0. Check your plant's index using %view.")
            }
            else{
                let p = dict[person].plants.splice(args[1], 1)
                dict[person].money += (p[0].size + 1) * 50
                message.reply("You now have " + dict[person].money + " coins.")
                if(dict[person].active >= dict[person].plants.length){
                    dict[person].active = dict[person].plants.length - 1
                }
                var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                    more_plant_data.forEach(element => {
                        if (element.name == person){
                            element.plants = dict[person].plants
                            element.money = dict[person].money
                            element.active = dict[person].active
                        }
                    });
                fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                    if (err) throw err;
                    });
            }
        break;
        case 'buy': 
            if(dict[person] == undefined){
                message.reply("Bro, get some plants first.")
                return;
            }
            else if(args.length != 2){
                message.reply("Type %buy followed by what you want to buy.")
            }
            switch(args[1]){
                case 'water':
                    if(dict[person].money < 500){
                        message.reply("You don't have enough money for this.")
                    }
                    else{
                        dict[person].money -= 500
                        dict[person].modifier = 2
                        message.reply("You watered your plants! Now, they will grow twice as fast for 30 minutes.")
                        
                        var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                        more_plant_data.forEach(element => {
                            if (element.name == person){
                                element.money = dict[person].money
                                element.modifier = dict[person].modifier
                            }
                        });
                        fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                            if (err) throw err;
                        });

                        setTimeout(function(){
                            dict[person].modifier = 1
                            var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                            more_plant_data.forEach(element => {
                                if (element.name == person){
                                    element.modifier = dict[person].modifier
                                }
                            });
                            fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                                if (err) throw err;
                            });
                        }, ms('30m'));
                    }
                break;
                case 'fertilizer':
                    if(dict[person].money < 700){
                        message.reply("You don't have enough money for this.")
                    }
                    else{
                        dict[person].money -= 700
                        dict[person].modifier = 2
                        message.reply("You fertilized your plants! Now, they will grow twice times as fast for 1 hour.")
                        
                        var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                        more_plant_data.forEach(element => {
                            if (element.name == person){
                                element.money = dict[person].money
                                element.modifier = dict[person].modifier
                            }
                        });
                        fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                            if (err) throw err;
                        });

                        setTimeout(function(){
                            dict[person].modifier = 1
                            var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                            more_plant_data.forEach(element => {
                                if (element.name == person){
                                    element.modifier = dict[person].modifier
                                }
                            });
                            fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                                if (err) throw err;
                            });
                        }, ms('1h'));
                    }
                break;
            }
        break;
        case 'shop':
            if(dict[person] == undefined){
                message.reply("Bro, get some plants first.")
                return;
            }
            else{
                const shop_embed = new MessageEmbed()
                .setTitle("Shop")
                .setColor(0x4BC980)
                .addField("Water", "Cost: 500 coins\nUse: 2x modifier for 30 minutes.")
                .addField("Fertilizer", "Cost: 700 coins\nUse: 2x modifier for 1 hour.");
                message.channel.send(shop_embed)
            }
        break;
        case 'money':
            if(dict[person] == undefined){
                message.reply("Bro, get some plants first.")
                return;
            }
            else{
                message.reply("You have " + dict[person].money + " coins.")
            }
        break;
        case 'active':
            if(dict[person] == undefined){
                message.reply("Bro, get some plants first.")
                return;
            }
            else {
                let ac = dict[person].active
                const active_embed = new MessageEmbed()
                .setColor(0xBA6BE9)
                .setTitle(dict[person].plants[ac].name)
                .attachFiles([dict[person].plants[ac].image])
                .setImage('attachment://' + (dict[person].plants[ac].image).substring(2));
                if(dict[person].plants[ac].size < 5){
                    active_embed.addField("Words until next growth", ((dict[person].plants[ac].size + 1) * 100) - dict[person].plants[ac].words)
                }
                else{
                    active_embed.addField("Words until next growth", "You've grown your plant all the way!")
                }
                message.channel.send(active_embed)
            }
    }
});

function spawn(channelID){
    setTimeout(function(){
        var r_flower = Math.floor((Math.random() * flowers.length) + 1);
        var r_size = Math.floor((Math.random() * 6) + 1);
        var im = "./" + flowers[r_flower-1] + "_size" + (r_size-1) + ".png"
        if(r_size < 4){
        im = "./size" + (r_size-1) + ".png"
        } 
        const active_embed = new MessageEmbed()
            .setColor(0xBE197E)
            .setTitle("Wild Plant!")
            .addField("You've stumbled across a wild " + flowers[r_flower-1] + "!",  "Type %collect to collect it.")
            .attachFiles(im)
            .setImage('attachment://' + (im).substring(2));
        client.channels.cache.get(channelID).send(active_embed)

        const filter = m => m.content.includes('%collect');
        const collector =client.channels.cache.get(channelID).createMessageCollector(filter, {max: 1, time: 1800000}); 
        collector.on('collect', m => {
            addPlant(m, r_flower, r_size, im)
        });
        var r_timeout = Math.floor((Math.random() * 10000000) + 3600000);
        setInterval(function(){
            r_timeout = Math.floor((Math.random() * 10000000) + 3600000);
            r_flower = Math.floor((Math.random() * flowers.length) + 1);
            r_size = Math.floor((Math.random() * 6) + 1);
            var im = "./" + flowers[r_flower-1] + "_size" + (r_size-1) + ".png"
            if(r_size < 4){
                im = "./size" + (r_size-1) + ".png"
            } 
            const ac_embed = new MessageEmbed()
            .setColor(0xBE197E)
            .setTitle("Wild Plant!")
            .addField("You've stumbled across a wild " + flowers[r_flower-1] + "!", " Type %collect to collect it.")
            .attachFiles(im)
            .setImage('attachment://' + (im).substring(2));
            client.channels.cache.get(channelID).send(ac_embed)

            const filter = m => m.content.includes('%collect');
            const collector =client.channels.cache.get(channelID).createMessageCollector(filter, {max: 1, time: 1800000}); 
            collector.on('collect', m => {
                addPlant(m, r_flower, r_size, im)
        });
        }, r_timeout)
    }, 5000);
}

function addPlant(m, r, s, im){
    if(dict[m.author.username] == undefined){
        let person = m.author.username
        const pl = new Plant(person, flowers[r-1].trim(), (s-1), 0, im, flowers[r-1].trim())
        const ow = new Owner(person, [pl.data], 0, 0, 1)
        dict[person] = ow.data
        fs.readFile('data.json', function (err, data) {
            var json = JSON.parse(data);
            console.log(ow.data)
            json.push(ow.data);    
            fs.writeFile("data.json", JSON.stringify(json, null, 2), function(err){
                if (err) throw err;
                console.log('New plant created!');
            });
        })
        m.reply("Congratulations! You've collected your first plant, a " + flowers[r-1] + "!")
    }
    else{
        let per = m.author.username
        const p = new Plant(per, flowers[r-1].trim(), (s-1), 0, im, flowers[r-1].trim())
        dict[per].plants.push(p.data)

        var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
        more_plant_data.forEach(element => {
            if (element.name == per){
                element.plants = dict[per].plants
            }
        });
        fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
            if (err) throw err;
            });
        m.reply("Congratulations! You've collected a " + flowers[r-1] + "!")
    }
}
client.login(token);