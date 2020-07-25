const Discord = require('discord.js')
const {Client, MessageAttachment, MessageEmbed} = require('discord.js')
const client = new Client(); 

const PREFIX = '%'

const token = 'NzI2NDgxMTUwODM4ODMzMTk0.XveAAw.raPYpovAaXU2OW4pKJgD22pZZmk'


client.on('ready', () => {
    console.log('Ready!');
})

class Owner{
    constructor(name, plants, money, active){
        this.name = name
        this.plants = plants
        this.money = money
        this.active = active
    }
}

class Plant{
    constructor(owner, species, size, words, image, active, names){
        this.owner = owner 
        this.species = species 
        this.size = size 
        this.words = words 
        this.image = image
        this.active = active
        this.names = names
        this.data = {
            owner :  this.owner,
            species : this.species, 
            size : this.size, 
            words : this.words, 
            image: this.image,
            active: this.active,
            names: this.names
        }
    }

}


let fs = require("fs");
let flowers = ['dandelion', 'lily', 'ladyslipper']
let dict = {}

var plant_data = JSON.parse(fs.readFileSync('data.json').toString());
plant_data.forEach(element => {
    dict[element.owner] = element
});
console.log(dict)

client.on('message', message => {
    let args = message.content.substring(PREFIX.length).split(" ");
    let person = message.author.username

    if (dict[person] != undefined){
        let active = dict[person].active
        dict[person].words[active] += 1
        if(dict[person].words[active] > 100 * (dict[person].size[active] + 1) && dict[person].size[active] < 5){
            dict[person].size[active] += 1;
            message.reply("Your plant grew a little!");
            if(dict[person].size[active] <= 2){
                attachment_name = "./size" + dict[person].size[active] + ".png"
            }
            else{
                attachment_name = "./" + dict[person].species[active] + "_size" + dict[person].size[active] + ".png"
            }
            dict[person].image[active] = attachment_name
            const attachment = new MessageAttachment(dict[person].image[active])
            message.channel.send(attachment)
            dict[person].words[active] = 0
        }
        var plant_data = JSON.parse(fs.readFileSync('data.json').toString());
        plant_data.forEach(element => {
            if (element.owner == person){
                element.size = dict[person].size
                element.image = dict[person].image
                element.words = dict[person].words
            }
        });
        fs.writeFileSync('data.json', JSON.stringify(plant_data, null, 2), function(err){
            if (err) throw err;
            });
    }

    switch(args[0]){
        case 'plant':
            if (dict[message.author.username] != undefined){
                const attachment = new MessageAttachment(dict[message.author.username].image[dict[person].active])
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
                let person = message.author.username
                image = "./size0.png"
                if(!flowers.includes(args[1].trim())){
                    message.reply("That's not a flower you can make.")
                }
                else if (dict[person] != undefined){
                    dict[person].species.push(args[1].trim())
                    dict[person].size.push(0)
                    dict[person].words.push(0)
                    dict[person].image.push(image)
                    dict[person].names.push(args[1].trim())

                    var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                    more_plant_data.forEach(element => {
                        if (element.owner == person){
                            element.species = dict[person].species
                            element.size = dict[person].size
                            element.image = dict[person].image
                            element.words = dict[person].words
                            element.names = dict[person].names
                        }
                    });
                    fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                        if (err) throw err;
                        });

                    const attachment = new MessageAttachment(dict[person].image[dict[person].image.length -1])
                    message.reply("Congratulations! Here is your new plant. Keep typing to grow your plant! Make sure to switch your active plant if you want to grow this one.");
                    message.reply(attachment)
                }
                else{
                    const plant = new Plant(person, [args[1].trim()], [0], [0], [image], 0, [args[1].trim()])
                    dict[person] = plant.data
                    fs.readFile('data.json', function (err, data) {
                        var json = JSON.parse(data);
                        console.log(plant.data)
                        json.push(plant.data);    
                        fs.writeFile("data.json", JSON.stringify(json, null, 2), function(err){
                            if (err) throw err;
                            console.log('New plant created!');
                        });
                    })
                    const attachment = new MessageAttachment(dict[person].image[0])
                    message.reply("Congratulations! Here is your new plant. Keep typing to grow your plant!");
                    message.reply(attachment)
                }
        }
        break;
        case 'help':
            message.reply('Send ' + PREFIX + 'create followed by the plant name to create a plant, and ' + PREFIX + 'plant to view your plant. \
            \nType ' + PREFIX + 'flowers to see what flowers you can create. \
            \nType ' + PREFIX + 'switch followed by the number of the plant you want to switch to in order to change your active plant. \
            \nType ' + PREFIX + 'name followed by a name, one word long, to name your plant. \
            \nType ' + PREFIX + 'view to see what plants you currently have and their indices. \
            \nAs you keep typing in the chat, your plant will grow.')
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
            else if (num >= dict[person].species.length){
                message.reply("You don't have that many plants! Remember, your plants are indexed starting at 0.")
            }
            else if(dict[person].active == num){
                message.reply("That plant is already active.")
            }
            else{
                dict[person].active = num
                var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                    more_plant_data.forEach(element => {
                        if (element.owner == person){
                            element.active = dict[person].active 
                        }
                    });
                fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                    if (err) throw err;
                    });
                const attachment = new MessageAttachment(dict[person].image[0])
                message.reply("Here is your active plant, " + dict[person].names[dict[person].active] + "!");
                message.reply(attachment)
            }
        break;
        case 'name':
            active = dict[person].active
            if(dict[person] == undefined){
                message.reply("Bro, get some plants first.")
                return;
            }
            else if(args.length < 2){
                message.reply("Type %name 'name' to name your plant.")
            }
            else{
                dict[person].names[active] = args[1]
                var more_plant_data = JSON.parse(fs.readFileSync('data.json').toString());
                    more_plant_data.forEach(element => {
                        if (element.owner == person){
                            element.names = dict[person].names
                        }
                    });
                fs.writeFileSync('data.json', JSON.stringify(more_plant_data, null, 2), function(err){
                    if (err) throw err;
                    });
                message.reply("Your plant's name is now " + dict[person].names[active] + "!");
            }
        break;
        case 'flowers':
            let str = "The possible flowers include "
            for(obj in flowers){
                str += flowers[obj] + " "
            }
            message.reply(str)
        break;
        case 'view':
            const embed = new MessageEmbed()
            .setTitle(person + "' s Plants")
            .setColor(0x4BC980);
            for(i = 0; i < dict[person].names.length; i++){
                embed.addField(i, dict[person].names[i] + " the " + dict[person].species[i])
            }
            message.channel.send(embed)
        break;
    }
})

client.login(token);