const got = require('got');
const embedHelper = require('../../utils/embedbuilder');

//The base URL for danbooru
const base = "https://danbooru.donmai.us";

/**
 * Returns an embed with hentai from danbooru
 * @param {"discord.js", Message}
 * @param {String[]} args
 */
async function hentaiSearch(message, args) {

    if(!message.channel.nsfw){
        return embedHelper.createErrorEmbed("Tsubasa - Hentai", "The channel must be set to NSFW to use NSFW commands! To do this look here\nhttps://support.discord.com/hc/en-us/articles/115000084051-NSFW-Channels-and-Content")
    }
    //Create the query to search tags for
    const query = args.join(" ");

    //get tags from danbooru for the given query
    const tagData = await got.get(`${base}/tags.json?search[name_matches]=${query}*`)
        .then(function(res) {

            //if res is null return null
            if(res == null){
                return null;
            }

            //get the body of the response
            const body = res.body;

            //if the body length is 0 return null
            if(body.length === 0) {
                return null;
            }

            return JSON.parse(body);
        });

    //check if the tag data came back as null
    if(tagData === null){
        return embedHelper.createErrorEmbed("Tsubasa - Hentai", `An error occurred while getting tags for query ${query}.`);
    }

    //if the length of the data is 0 return an embed saying there was an error
    if(tagData.length === 0){
        return embedHelper.createErrorEmbed("Tsubasa - Hentai", `No tags found for query ${query}.`)
    }

    //sort tag data by the amount of posts per each tag
    tagData.sort(function(a, b) {
        return b['post_count'] - a['post_count'];
    });

    //Request for actual images from the tags we found.
    const imageData = await got.get(`${base}/posts.json?tags= -rating:safe -rating:questionable ${tagData[0].name} &random=true`)
        .then(function(res) {
            //if res is null return null
            if(res == null){
                return null;
            }

            //get the body of the response
            const body = res.body;

            //if the body length is 0 return null
            if(body.length === 0) {
                return null;
            }
            return JSON.parse(body);
        });
    //check if the tag data came back as null
    if(imageData === null){
        return embedHelper.createErrorEmbed("Tsubasa - Hentai", `An error occurred while getting images for query ${query}.`);
    }

    //if the length of the data is 0 return an embed saying there was an error
    if(imageData.length === 0){
        return embedHelper.createErrorEmbed("Tsubasa - Hentai", `No valid images found for query ${query}.`)
    }

    //TODO see if this ever breaks if so we have to check that large_file_url isn't a 404
    const url = imageData[Math.floor(Math.random() * imageData.length)]['large_file_url'];

    //if the url is invalid send an error message
    if(url == undefined){
        return embedHelper.createErrorEmbed("Tsubasa - Hentai", "There was an error in the acquired image, please try again!");
    }

    //if the url is a video, just send it
    if(url.includes("mp4") || url.includes("webm")){
        return `**Tsubasa - Hentai**\n${url}`;
    }



    //create the embed and return it
    return embedHelper.createEmbed("Tsubasa - Hentai","", url);
}

//Export the command
module.exports = {
    name: 'hentai',
    description: 'Searches danbooru for hentai.',
    async execute(message, args){
        await message.channel.send(await hentaiSearch(message, args));
    },
};

