const Discord = require('discord.js');

module.exports.run = async (MAIN, quest, channel, quest_reward, simple_reward, main_area, sub_area, embed_area, server, timezone) => {

  // GET STATIC MAP TILE
  let img_url = '';
  if(MAIN.config.Map_Tiles == 'ENABLED'){
    img_url = await MAIN.Static_Map_Tile(quest.latitude, quest.longitude, 'quest');
  }

  // GET THE QUEST TASK
  let quest_task = await get_quest_task(MAIN, quest);

  // DECLARE VARIABLES
  let expire_time = MAIN.Bot_Time(null, 'quest', timezone);

  // GET REWARD ICON
  let quest_url = '';
  if(quest_reward.indexOf('Encounter') >= 0){
    if(quest.rewards[0].info && quest.rewards[0].info.shiny == true){ quest_url = await MAIN.Get_Sprite('shiny', quest.rewards[0].info.pokemon_id); }
    else{ quest_url = await MAIN.Get_Sprite(quest.rewards[0].info.form_id, quest.rewards[0].info.pokemon_id); }
  } else{ quest_url = await MAIN.Get_Icon(quest, quest_reward); }

  // GET EMBED COLOR BASED ON QUEST DIFFICULTY
  let embed_color = '';
  switch(true){
    case quest.template.indexOf('easy') >= 0: embed_color = '00ff00'; break;
    case quest.template.indexOf('moderate') >= 0: embed_color = 'ffff00'; break;
    case quest.template.indexOf('hard') >= 0: embed_color = 'ff0000'; break;
    default: embed_color = '00ccff';
  }
  let roleID = '';
  // CREATE RICH EMBED
  if(!quest_url){ quest_url = quest.url; }
  let quest_embed = new Discord.RichEmbed()
    .setColor(embed_color).setThumbnail(quest_url)
    .addField( quest_reward+'  |  '+embed_area, quest_task, false)
    .addField('Pokéstop:', quest.pokestop_name, false)
    .setFooter('Expires: '+expire_time)
    .setImage(img_url)
    .addField('Directions:','[Google Maps](https://www.google.com/maps?q='+quest.latitude+','+quest.longitude+') | '
                           +'[Apple Maps](http://maps.apple.com/maps?daddr='+quest.latitude+','+quest.longitude+'&z=10&t=s&dirflg=d) | '
                           +'[Waze](https://waze.com/ul?ll='+quest.latitude+','+quest.longitude+'&navigate=yes) | '
                           +'[Scan Map]('+MAIN.config.FRONTEND_URL+'?lat='+quest.latitude+'&lon='+quest.longitude+'&zoom=15)',false);

  // LOGGING
  if(MAIN.debug.Quests == 'ENABLED'){ console.info('[DEBUG] [quests.js] '+quest_reward+' Quest PASSED Secondary Filters and Sent to '+channel.guild.name+' ('+channel.id+').'); }
  else if(MAIN.logging == 'ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] [Modules] [quests.js] Sent a '+quest_reward+' Quest for '+channel.guild.name+' ('+channel.id+').'); }

  // CHECK DISCORD CONFIG
  if(MAIN.config.QUEST.Discord_Feeds == 'ENABLED'){
    let report_dict = {
      "type":"research",
      "pokestop":quest.pokestop_name,
      "gps":quest.latitude + "," + quest.longitude,
      "quest":quest_task,
      "reward":quest_reward
    };
    let quest_message = "!alarm " + JSON.stringify(report_dict);
    MAIN.Send_Embed('quest', 0, server, roleID, quest_message, quest_embed, channel.id);
  } else{ console.info('[Pokébot] '+quest_reward+' Quest ignored due to Disabled Discord Feed Setting.'); }
  return;
}

function get_quest_task(MAIN, quest){
  // DETERMINE THE QUEST TASK
  let quest_task = '';
  switch(true){

    // CATCHING SPECIFIC POKEMON
    case quest.template.indexOf('catch_specific')>=0:
      if(quest.conditions[0].info && quest.conditions[0].info.pokemon_ids){
        quest_task = 'Catch '+quest.target+' '+MAIN.pokemon[quest.conditions[0].info.pokemon_ids[0]]+'.';
      } break;

    // CATCH POKEMON TYPES
    case quest.template.indexOf('catch_types')>=0:
      if(quest.conditions[0].info && quest.conditions[0].info.pokemon_type_ids){
        let catch_types = '';
        quest.conditions[0].info.pokemon_type_ids.forEach((type,index) => { catch_types += type+', '; });
        catch_types = catch_types.slice(0,-2);
        quest_task = 'Catch '+quest.target+' '+catch_types+' Type Pokémon.';
      } break;

    // CATCH WEATHER BOOSTED
    case quest.template.indexOf('catch_weather')>=0:
      if(quest.conditions[0].info && quest.conditions[0].info.pokemon_type_ids){
        quest_task = 'Catch '+quest.target+' Weather Boosted Pokémon.';
      } break;

    // CATCH POKEMON OTHER
    case quest.template.indexOf('catch')>=0:
      if(quest.conditions && quest.conditions[0]){
        if(quest.conditions[0].info && quest.conditions[0].info.pokemon_type_ids){
          quest_task = 'Catch '+quest.target+' '+MAIN.proto.values['poke_type_'+quest.conditions[0].info.pokemon_type_ids[0]]+' Type Pokémon.';
        } else{
          quest_task = 'Catch '+quest.target+' '+MAIN.proto.values['quest_condition_'+quest.conditions[0].type]+' Pokémon.';
        }
      } else{
        quest_task = 'Catch '+quest.target+' Pokémon.';
      } break;

    // LANDING SPECIFIC THROWS
    case quest.template.indexOf('land') >= 0:
      let curveball = '';
      if(quest.template.indexOf('curve') >= 0){ curveball = ' Curveball'; }
      if(quest.template.indexOf('inarow') >= 0){
        quest_task = 'Perform '+quest.target+' '+MAIN.proto.values['throw_type_'+quest.conditions[0].info.throw_type_id]+curveball+' Throw(s) in a Row.';
      } else{
        quest_task = 'Perform '+quest.target+' '+MAIN.proto.values['throw_type_'+quest.conditions[0].info.throw_type_id]+curveball+' Throw(s).';
      } break;

    // COMPLETE RAIDS
    case quest.template.indexOf('raid') >= 0:
      if(!quest.conditions[0]){ quest_task = 'Battle in '+quest.target+' Raid.'; }
      else if(quest.conditions[0].type == 6){ quest_task = 'Battle in '+quest.target+' Raid(s).'; }
      else{ quest_task = 'Win '+quest.target+' Level '+quest.conditions[0].info.raid_levels+' Raid(s).'; } break;

    // SEND GIFTS TO FRIENDS
    case quest.template.indexOf('gifts') >= 0:
      quest_task = 'Send '+quest.target+' Gift(s) to Friends.'; break;

    // GYM BATTLING
    case quest.template.indexOf('gym_easy') >= 0:
    case quest.template.indexOf('gym_try') >= 0:
      quest_task = 'Battle '+quest.target+' Time(s) in a Gym.'; break;
    case quest.template.indexOf('gym_win') >= 0:
      quest_task = 'Win '+quest.target+' Gym Battle(s).'; break;

    // CATCH WITH PINAP
    case quest.template.indexOf('berry_pinap') >= 0:
      quest_task = 'Catch '+quest.target+' Pokémon With a Pinap Berry.'; break;

    // CATCH WITH RAZZ
    case quest.template.indexOf('berry_razz') >= 0:
      quest_task = 'Catch '+quest.target+' Pokémon With a Razz Berry.'; break;

    // CATCH WITH ANY BERRY
    case quest.template.indexOf('berry_easy') >= 0:
      quest_task = 'Catch '+quest.target+' Pokémon With a Razz Berry.'; break;
    case quest.template.indexOf('challenge_berry_moderate') >= 0:
      quest_task = 'Catch '+quest.target+' Pokémon With Any Berry.'; break;

    // HATCH EGGS
    case quest.template.indexOf('hatch') >= 0:
      if(quest.target > 1){ quest_task='Hatch '+quest.target+' Eggs.'; }
      else{ quest_task = 'Hatch '+quest.target+' Egg.'; } break;

    // SPIN POKESTOPS
    case quest.template.indexOf('spin') >= 0:
      quest_task = 'Spin '+quest.target+' Pokéstops.'; break;

    // EVOLVE POKEMON
    case quest.template.indexOf('evolve_specific_plural') >= 0:
      let quest_pokemon = '';
      for(let p = 0; p < quest.conditions[0].info.pokemon_ids.length; p++){
        quest_pokemon = MAIN.pokemon[quest.conditions[0].info.pokemon_ids[p]].name+', ';
      }
      quest_pokemon = quest_pokemon.slice(0,-2);
      quest_task = 'Evolve a '+quest_pokemon; break;
    case quest.template.indexOf('evolve_item') >= 0:
      quest_task = 'Evolve '+quest.target+' Pokémon with an Evolution Item.'; break;
    case quest.template.indexOf('evolve') >= 0:
      quest_task = 'Evolve '+quest.target+' Pokémon.'; break;

    // BUDDY TASKS
    case quest.template.indexOf('buddy') >= 0:
      quest_task = 'Get '+quest.target+' Candy from Walking a Pokémon Buddy.'; break;

    // POWER UP POKEMON
    case quest.template.indexOf('powerup') >= 0:
      quest_task = 'Power Up '+quest.target+' Pokémon.'; break;

    // TRADE POKEMON
    case quest.template.indexOf('trade') >= 0:
      quest_task = 'Perform '+quest.target+' Trade(s) with a Friend.'; break;
    // TRANSFER POKEMON
    case quest.template.indexOf('transfer') >= 0:
      quest_task = 'Transfer '+quest.target+' Pokémon.'; break;

    // USE SPECIFIC CHARGE MOVES
    case quest.template.indexOf('charge') >= 0:
      if(quest.target > 1){ quest_task='Use a Super Effective Charge Move '+quest.target+' Times.'; }
      else{ quest_task = 'Use a Super Effective Charge Move '+quest.target+' Time.'; } break;

    // CATCH MISSING QUESTS
    default: return console.error('NO CASE FOR THIS QUEST ('+quest.pokestop_id+')', quest);
  }

  // RETURN THE TASK
  return quest_task;
}
