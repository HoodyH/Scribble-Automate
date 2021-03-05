
// preset
let leagueChamps = "Aatrox,Ahri,Akali,Alistar,Amumu,Anivia,Annie,Aphelios,Ashe,Aurelion Sol,Azir,Bard,Blitzcrank,Brand,Braum,Caitlyn,Camille,Cassiopeia,Cho'Gath,Corki,Darius,Diana,Dr. Mundo,Draven,Ekko,Elise,Evelynn,Ezreal,Fiddlesticks,Fiora,Fizz,Galio,Gangplank,Garen,Gnar,Gragas,Graves,Hecarim,Heimerdinger,Illaoi,Irelia,Ivern,Janna,Jarvan IV,Jax,Jayce,Jhin,Jinx,Kai'Sa,Kalista,Karma,Karthus,Kassadin,Katarina,Kayle,Kayn,Kennen,Kha'Zix,Kindred,Kled,Kog'Maw,LeBlanc,Lee Sin,Leona,Lillia,Lissandra,Lucian,Lulu,Lux,Malphite,Malzahar,Maokai,Master Yi,Miss Fortune,Mordekaiser,Morgana,Nami,Nasus,Nautilus,Neeko,Nidalee,Nocturne,Nunu and Willump,Olaf,Orianna,Ornn,Pantheon,Poppy,Pyke,Qiyana,Quinn,Rakan,Rammus,Rek'Sai,Rell,Renekton,Rengar,Riven,Rumble,Ryze,Samira,Sejuani,Senna,Seraphine,Sett,Shaco,Shen,Shyvana,Singed,Sion,Sivir,Skarner,Sona,Soraka,Swain,Sylas,Syndra,Tahm Kench,Taliyah,Talon,Taric,Teemo,Thresh,Tristana,Trundle,Tryndamere,Twisted Fate,Twitch,Udyr,Urgot,Varus,Vayne,Veigar,Vel'Koz,Vi,Viktor,Vladimir,Volibear,Warwick,Wukong,Xayah,Xerath,Xin Zhao,Yasuo,Yone,Yorick,Yuumi,Zac,Zed,Ziggs,Zilean,Zoe,Zyra"

// put here your words list comma separated
// this is the default 
let initWordlist = leagueChamps;

let wordlist;
let currentQuery = null;
let candidates = [];
let numCandidatesBeforeGuessing = 10;
let interval = null;

// convert words to lower case and split them by the separator
let updateWordList = function(list){
    wordlist = list.toLowerCase().split(",");
}


let checkAllUnderscore = function(pattern){
    for(let idx in pattern){
        if(pattern[idx] != "_")
            return false;
    }
    return true;
}

// get common elements from an array
let diff = function(arr, arr2) {
    var out = [];
    for(var i in arr) {   
        if(arr2.indexOf(arr[i]) > -1){
            out.push(arr[i]);
        }
    }
    return out;
};
    
// find the matching words 
let getMatchingWords = function(pattern, currentCandidates) {

	let output = [];
    let isAllUnderscore = checkAllUnderscore(pattern);

    for(let i in wordlist) {
		
        let el = wordlist[i];
		
        // the pattern lenght is incompatible with the current word
		if(pattern.length != el.length)
            continue;
        
        // the pattern is all underscore try to match by lenght
        else if(isAllUnderscore) {
            output.push(el);
            continue;
        }
        
        // the pattern is not all underscore find matches by pattern
        for(let pidx in pattern){
            if(pattern[pidx] != "_" && pattern[pidx] == el[pidx])
                output.push(el);
		}
    }

    // filter by common words if there are currentCandidates else jus return the outout
    /*
    if(currentCandidates){
        return diff(currentCandidates, output);
    }
    */

	return output;
}

// get the word that the user is guessing or is drawing
let getCurrentWord = function() {
    return $("#currentWord").text().toLowerCase();
}

// return true if the player is drawing or is guessing
let isPlayerDrawing = function(){
    return true;
}   

// send message to the chat
let postMessage = function(word){
	$("#inputChat").val(word);
	$("#formChat").submit();
}

//find the player name in the current session
let getPlayerName = function(){
    let playersContainer = document.getElementById("containerGamePlayers").childNodes;
    
    for (let idx in playersContainer){

        let playerContainer = playersContainer[idx];
        let playerInfoContainer = playerContainer.getElementsByClassName("info").item(0);
        let playerNameContainer = playerInfoContainer.getElementsByClassName("name").item(0);
        let playerName = playerNameContainer.innerHTML;
        
        let keyword = '(You)';
        if(playerName.slice(-5) == keyword)
            return playerName.slice(0, (playerName.length-1) - keyword.length);
    }
}

// check if the last word sent is the right guess
let checkSuccess = function(){
    
    let playerName = getPlayerName();

    let boxMessagesContainer = document.getElementById("boxMessages");
    
    messageContainersList = boxMessagesContainer.childNodes;

    if(!messageContainersList) return; // if the array of messages is empty abort

    for(let i = messageContainersList.length - 1;  i >= 0; i--){
        
        let message = messageContainersList.item(i).firstChild.innerHTML;
        
        // the player dont have won already
        if (message.startsWith('(V)')) return false;
        messageContainersList.item(i).firstChild.innerHTML = `(V)${message}`; // update the message as verified
        if (message.startsWith('(V)The word was')) return true; // the round is end in falure
        
        if (message == `${playerName} guessed the word!`){
            return true;
        }
    }
    return false;
}

// main logic
let update = function(){

    // check if the previous message has guess the word
    // if yes abort
    if (candidates && checkSuccess()) {
        console.log('Solved!');
        candidates = [];
        return;
    }
	
    let query = getCurrentWord();
	
    // check if there is an update
    // if not skip this block
	if(currentQuery != query){

        // check if the plater is in drawing mode
        // by looking if there are _ in the query
        if(query.indexOf("_") == -1){
            console.log(`Now drawing: ${query}`);
            return;
        }

        console.log(`Query update: ${query} len(${query.length})`);
		
        currentQuery = query;
		candidates = getMatchingWords(query, candidates);
        console.log(`Candidates: ${candidates.length} ${candidates}`);
	}

	if(candidates.length != 0 && candidates.length < numCandidatesBeforeGuessing){

		let idx = Math.round(candidates.length * Math.random());
		let choosenWord = candidates[idx];
		candidates.splice(idx, 1); // remove from array
		
        console.log(`Sending: ${choosenWord}`);
		postMessage(choosenWord);
	}
};

let stop = function(){
    clearInterval(interval);
}

let start = function(time){
    interval = setInterval(update, 1000 * time);
}

updateWordList(initWordlist); // generate the word list
intervl = setInterval(update, 1000 * 2.0); // update interval in milliseconds default 2 second

