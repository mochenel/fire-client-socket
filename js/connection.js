
const socket = io('https://fire-socket-server.herokuapp.com');
let CHAT = 0;

$(function(){
    $('#join-modal').modal('show');
    $('#join-modal').on('shown.bs.modal',function(){
        $('#gameID').get(0).focus();

    })
    $('#chat-modal').on('shown.bs.modal',function(){
        $('#chat-text').get(0).focus();

    })
    
    let playData = {
        "gameID":'',
        "socketID":'',
        "squareId":0
    };
    $('#join').click(joinHandler);
    $('#play').click(playHandler);
    $('#restart').click(restartHandler);
    $('#exit').click(exitHandler);
    $('#quit').click(exitHandler);
    $('#exit-ok').click(exitOKHandler);
    $('#chat').click(chatHandler);
    $('#send').click(sendHandler);
    $('#exit-game').click(exitHandler);

    function sendHandler(){
        const gameID = $('#gameID').val().trim();
        const username = $('#username').val().trim();
        const chatText = $('#chat-text').val().trim();
        const escapedText = chatText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

        if(chatText == ''){
            return;
        }
        const chatData = {
            "id":gameID,
            "username":username,
            "text":escapedText
        }
        socket.emit('chat',chatData)
        $('#chat-text').val("")

        
    }

    function chatHandler(){
       $('#chat-modal').modal('show')
       CHAT = 0;
       $('#badge').text(CHAT);
    }

    function exitOKHandler(){
        $('#exit-modal').modal('hide');
        window.location.replace("index.html");
    }
    // exit game
    function exitHandler(){
        const gameID = $('#gameID').val().trim();
        const username = $('#username').val().trim();
        const data = {
            "id":gameID,
            "username":username
        }
        const display = $('#join').css('display').trim();
        if((gameID == "" || username == "" )){
            window.location.replace("index.html");
            return;
        }
        else if(display == 'none'){
            socket.emit('exit',data);
           
        }
        else {
            window.location.replace("index.html");
            return;
        }
    }

    // user clicks join
    function joinHandler(){
        const gameID = $('#gameID').val().trim();
        const username = $('#username').val().trim();
        
        if(gameID == "" && username == ""){
            $('#join-error').text("game ID and username can't be empty")
            return;
        }
        else if(gameID == ""){
            $('#join-error').text("game ID  can't be empty")
            return;
        }
        else if(username == ""){
            $('#join-error').text("username can't be empty")
            return;
        }
        else{
            $('#join-error').text("")
        }

        const joinData = {
            "gameID" : gameID,
            "username":username
        }
        playData.gameID = gameID;
        socket.emit('join',joinData);

    }
    // user hit play
    function playHandler(){

        let randomNumber = Math.floor((Math.random()*6)+1);
        playData.squareId = randomNumber;
        socket.emit('play',playData);
    }

    // hit restart
    function restartHandler(){
        const gameID = $('#gameID').val();
        const username = $('#username').val();
        let data = {
            "id":gameID,
            "username":username
        }
        socket.emit('restart',data);
    }
    // chat

    socket.on('chat',function(data){
        const {username,text} = data;
        if(username != $('#username').val()){
            CHAT = CHAT + 1;
            $('#badge').text(CHAT);

        }
    
        const element = `<div class="chat-text mb-2">
                            <span > <strong >${username}:</strong> ${text}</span><br>
                        </div>`
        $('#chat-data').append(element)
    })
    // exit
    socket.on('exit',function(data){
        const username = $('#username').val();
        if(data == 'k15' || data == username){
            window.location.replace("index.html");
        }
        else{
            $('#win-modal').modal('hide');
            $('#chat-modal').modal('hide');
            $('#exit-modal').modal('show');
            
        }
       
    })
    // join to play 
    socket.on('join',function(data){

        if(data == 'error1'){
            $('#id-error').text('Game ID is in use, please provide different ID');
            $('#id-error').css('display','')
        }
        else if(data == 'error2'){
            $('#id-error').text('username cannot be the same as your opponent');
            $('#id-error').css('display','')
        }
        else if(data == null){
            $('#waiting-spin').css('display','')
            $('#join').css('display','none')
            $('#id-error').css('display','none')
            $('#gameID').prop('readonly',true)
            $('#username').prop('readonly',true)
            
            
        }
        else{
            $('#join-modal').modal('hide'); // hide modal
            $('#join').css('display','none')
            $('#room').text(data.id); 
            $('#player').css('display','');
            $('#opponent').css('display','');
            $('#player-img').css('display','');
            $('#opponent-img').css('display','');
           

            
        }
    })
    // get response after successful 
    let src1 = '';
    let src2 = '';
    socket.on('details',function(data){
            let {socketId,username,opponent,srcPlayer,srcOpponent} = data;
             src1 = srcPlayer;
             src2 = srcOpponent;
            $('#player').text(username); // player name
            $('#opponent').text(opponent); // opponent name
            $('#player-img').attr('src',srcPlayer) // player play img
            $('#opponent-img').attr('src',srcOpponent); // opponent paly img
            playData.socketID = socketId;


       
    })
    // turn 
    socket.on('turn',function(turn){

        if(turn == $('#player').text().trim()){
            $('#play').prop('disabled',false);
        }
        else{
            $('#play').prop('disabled',true);
        }
    })
    socket.on('win',function(winner){

        if(winner != null){
 
            $('#win-modal').modal('show');
            if(winner == $('#player').text().trim()){
                $('#win-msg').html('<p class="text-center text-success"><strong>Congrats!<strong> You won </p>');
            }
            else{
                $('#win-msg').html('<p class="text-center text-danger"><strong>Oopps!<strong> You lost </p>');
            }
        }
        
        else{
            
        }
    })
    //
    socket.on('restart',function(username){
        if(username == null){
            $('#win-modal').modal('hide');
            $('#restart-spin').css('display','none');
            $('#restart-request').text("");
            $('#restart').css('display','');
        }
        else if (username == $('#player').text().trim()){
  
            $('#restart-spin').css('display','');
            $('#restart-request').text("waiting for your opponent to accept replay");
            $('#restart').css('display','none');
        }
        else{
            $('#restart-request').text("Your opponent wants to play again, press restart to play");
        }

    })
    // game in progress
    socket.on('progress',function(data){
        let {playerSquareNumber,opponentSquareNumber,prevPlayerSquareNumber,prevOpponentSquareNumber} = data;
        removeImg(prevPlayerSquareNumber);
        displayDie("one",parseInt(playerSquareNumber) - parseInt(prevPlayerSquareNumber) );
        removeImg(prevOpponentSquareNumber);
        displayDie("three",parseInt(opponentSquareNumber) - parseInt(prevOpponentSquareNumber) );
        $(`#t${playerSquareNumber}`).css('display','');
        $(`#t${opponentSquareNumber}`).css('display','');
        $(`#t${playerSquareNumber}`).html(`<img src="${src1}" width = "20">`);
        $(`#t${opponentSquareNumber}`).html
        (`<img src="${src2}" width = "20">`);
    })

    // remove prev img
    function removeImg(id){

        $(`#t${id}`).html(id);
    }
    function displayDie(die,number){

        if(number > 0 && number < 7){
            
        let mapperArray = ["","assets/one.jpg","assets/two.jpg","assets/three.png","assets/four.png","assets/five.jpg","assets/six.jpg"];
        $(`#${die}`).attr('src',mapperArray[number]);

        return;

        }
        else{
            $(`#${die}`).attr('src','assets/greenFlag.png');
            return;
        }


    }
    
})
