var tecs = [];
var tss = [];
var globalState = 0;
var globalMachine = [];

// Add a primary dictionary to start
var primaryTEC = [15, 12, 10];
primaryTEC.forEach(num => {
    tecs.push(num);
    $('.tec-opt').append(`<span class="tag is-light is-word tec-${num}">${num}<button class="delete is-small remove-word" onclick="removeWord('${num}')"></button></span>`);
});

var primaryTS = [9, 10, 11];
primaryTS.forEach(num => {
    tss.push(num);
    $('.ts-opt').append(`<span class="tag is-light is-word ts-${num}">${num}<button class="delete is-small remove-word" onclick="removeWord('${num}')"></button></span>`);
})

$(document).ready(function() {
    // Show the dictionary
    $(".submit").click(function(){
        queue();
    });

    $(".submit-tec").click(function(){
        var num = ($('.input-tec').val());
        includetec(num);
        $('.input-tec').val('')
    });

    $(".submit-ts").click(function(){
        var num = ($('.input-ts').val());
        includets(num);
        $('.input-ts').val('')
    });

    $(".submit-table").click(function(){
        table();
    });

    $(".submit-queue").click(function(){
        queue();
    });

    $(".reset").click(function(){
        clean();
    });

    // Verify if the word is reconigzed by the machine
    $('.clients').keyup(() => {
        probability($('.clients').val());
    });

    $(".close-modal").click(function(){
        $("#statistics").find("ul").remove();
        $('.modal').removeClass("is-active");
    });
})

function queue() {
    var lambdaa = parseFloat($(".lambda-a").val());
    var lambdab = parseFloat($(".lambda-b").val());
    var lambdac = parseFloat($(".lambda-c").val());

    var mia = parseFloat($(".mi-a").val());
    var mib = parseFloat($(".mi-b").val());
    var mic = parseFloat($(".mi-c").val());

    var tempo = parseFloat($(".time").val());

    if(isNaN(lambdaa) && isNaN(mia) || isNaN(tempo)) {
        iziToast.show({
            message: `Por favor, preencha todos os campos`,
            color: 'red',
            position: 'topCenter'
        });

        $(".time").addClass("invalid");
        $(".lambda-a").addClass("invalid");
        $(".lambda-b").addClass("invalid");
        $(".lambda-c").addClass("invalid");
        $(".mi-a").addClass("invalid");
        $(".mi-b").addClass("invalid");
        $(".mi-c").addClass("invalid");

        return;
    }

    $(".time").removeClass("invalid");
    $(".lambda-a").removeClass("invalid");
    $(".lambda-b").removeClass("invalid");
    $(".lambda-c").removeClass("invalid");
    $(".mi-a").removeClass("invalid");
    $(".mi-b").removeClass("invalid");
    $(".mi-c").removeClass("invalid");

    lambdaa = tempo / lambdaa;
    lambdab = tempo / lambdab;
    lambdac = tempo / lambdac;

    mia = tempo / mia;
    mib = tempo / mib;
    mic = tempo / mic;

    $(".arrive-a").text((lambdaa).toFixed(2));
    $(".arrive-b").text((lambdab).toFixed(2));
    $(".arrive-c").text((lambdac).toFixed(2));

    $(".service-a").text((mia).toFixed(2));
    $(".service-b").text((mib).toFixed(2));
    $(".service-c").text((mic).toFixed(2));

    $(".number-a").text((lambdaa / (mia - lambdaa)).toFixed(2));
    $(".number-b").text((lambdab / (mib - lambdab)).toFixed(2));
    $(".number-c").text((lambdac / (mic - lambdac)).toFixed(2));

    $(".time-a").text((1 / (mia - lambdaa)).toFixed(2));
    $(".time-b").text((1 / (mib - lambdab)).toFixed(2));
    $(".time-c").text((1 / (mic - lambdac)).toFixed(2));

    $(".tax-a").text((lambdaa / mia).toFixed(2));
    $(".tax-b").text((lambdab / mib).toFixed(2));
    $(".tax-c").text((lambdac / mic).toFixed(2));
}

function table() {
    $("#probability").find("tr").remove();

    // Clientes
    var i = 0;
    // Tempo a ser calculado
    var tempo = parseFloat($(".time").val());
    // Tempo final de serviço no relógio
    var tfsr = 0;
    // Tempo de chegada no relógio
    var tcr = 0;
    // Tempo de inicio de serviço no relógio
    var tisr = 0;
    // Tempo de fila
    var tf = 0;
    // Tempo de serviço
    var ts = 0;
    // Tempo do cliente no sistema
    var tcs = 0;
    // Tempo livre do operador
    var tlo = 0;

    while (tfsr < tempo) {
        row = `<td>${i}</td>`
        // Tempo desde ultima chegada
        tuc = tecs[Math.floor(Math.random()*tecs.length)];
        row += `<td>${tuc}</td>`;

        // Tempo de chegada no relógio
        tcr += tuc;
        row += `<td>${tcr}</td>`;

        // Calcula tempo de operador livre
        if (tfsr < tcr) {
            tlo = tcr - tfsr
        } else {
            tlo = 0;
        }

        // Tempo de serviço
        ts = tss[Math.floor(Math.random()*tss.length)];
        row += `<td class="service">${ts}</td>`;

        // Calcula tempo na fila
        if (tfsr >= tcr) {
            tf = tfsr - tcr;
        } else {
            tf = 0;
        }
        
        //Tempo de início do serviço no relógio
        tisr = tf + tcr;
        row += `<td>${tisr}</td>`;
        // Tempo na fila
        row += `<td class="queue">${tf}</td>`;

        // Tempo final de serviço no relógio
        tfsr = ts + tisr;
        row += `<td>${tfsr}</td>`;

        // Tempo do cliente no sistema
        tcs = ts + tf;
        row += `<td class="system">${tcs}</td>`;

        // Tempo de operador livre
        row += `<td class="free">${tlo}</td>`;

        // Adiciona na tabela
        $("#probability").append(`<tr>${row}</tr>`);

        // Incrementa cliente
        i++;
    }

    var sumQueue = 0;
    var sumClients = 0;
    var sumClientsWait = 0;
    var sumFree = 0;
    var sumService = 0;
    var sumSystem = 0;
    var list = '';

    $(".queue").each(function() {
        sumQueue += Number($(this).text());
        if (($(this).text() > 0)) {
            sumClientsWait++;
        }
    });

    $(".free").each(function() {
        sumFree += Number($(this).text());
    });

    $(".service").each(function() {
        sumService += Number($(this).text());
    });

    $(".system").each(function() {
        sumSystem += Number($(this).text());
    });

    list += `<li>Tempo médio de espera na fila: ${(sumQueue/i).toFixed(2)}</li>`
    list += `<li>Probabilidade de um cliente esperar na fila: ${(sumClientsWait/i).toFixed(2)}</li>`
    list += `<li>Probabilidade de operador livre: ${(sumFree/tfsr).toFixed(2)}</li>`
    list += `<li>Tempo médio de serviço: ${(sumService/i).toFixed(2)}</li>`
    list += `<li>Tempo médio despendido no sistema: ${(sumSystem/i).toFixed(2)}</li>`

    $("#statistics").append(`<ul>${list}</ul>`);

    // console.log(sumSystem);

    $('.modal').addClass('is-active');
}

function clean() {
    $(".arrive-a").text('0');
    $(".arrive-b").text('0');
    $(".arrive-c").text('0');

    $(".service-a").text('0');
    $(".service-b").text('0');
    $(".service-c").text('0');

    $(".number-a").text('0');
    $(".number-b").text('0');
    $(".number-c").text('0');

    $(".time-a").text('0');
    $(".time-b").text('0');
    $(".time-c").text('0');

    $(".tax-a").text('0');
    $(".tax-b").text('0');
    $(".tax-c").text('0');

    $("#probability").find("tr").remove();
}

function probability(n) {
    $('#probability').find("tr").remove();
    for(i = 0; i<n; i++) {
        var resulta = (1 - $(".tax-a").text()) * Math.pow($(".tax-a").text(),i);
        var resultb = (1 - $(".tax-b").text()) * Math.pow($(".tax-b").text(),i);
        var resultc = (1 - $(".tax-c").text()) * Math.pow($(".tax-c").text(),i);
        var row = `<td>P(${i})</td><td>${(resulta).toFixed(2)}</td><td>${(resultb).toFixed(2)}</td><td>${(resultc).toFixed(2)}</td>`;
        $('#probability').append(`<tr>${row}</tr>`);
    }
}

function includetec(num) {
    $('.tec-opt').append(`<span class="tag is-light tec-${num}">${num}<button class="delete is-small remove-word" onclick="removeWord('${num}')"></button></span>`);
    tecs.push(num);
}

function includets(num) {
    $('.ts-opt').append(`<span class="tag is-light ts-${num}">${num}<button class="delete is-small remove-word" onclick="removeWord('${num}')"></button></span>`);
    tss.push(num);
}

// Remove word from the dict and update machine to do not reconigze it
function removeWord(word) {
    words.splice($.inArray(word, words), 1);
    states = [[]];
    globalMachine = [[]];
    globalState = 0;
    $(".word-" + word).remove();
    updateMachine();
    $('.verify-word').val('');
    $('.verify-word').removeClass('valid');
    $('.verify-word').removeClass('invalid');

    iziToast.show({
        message: `Word '${word}' removed from the dict!`,
        color: 'green',
        position: 'topCenter'
    });
}

// Function to create/update the states machine
function updateMachine() {
    var next = 0;

    words.forEach(word => {
        var curr = 0;
        // Look for all letters in the word
        for (i = 0; i<word.length; i++) {
            // If the current state in the position of the actual letter is not defined, define
            if (typeof states[curr][word[i]] === 'undefined') {
                // Set the state that this actual position will point
                next = globalState + 1;
                states[curr][word[i]] = next;
                // Set the new state in the array/machine
                states[next] = [];
                // Change the current state to the next
                globalState = curr = next;
            } else {
                // This state for the actual letter was defined before, so change the current state to verify
                curr = states[curr][word[i]];
            }
            // If we are in the final letter of the word, set this current state as final
            if (i == (word.length -1)) {
                states[curr]['final'] = true;
            }
        }
    });

    $('#machine').html('');
    var machine = [];
    // For each state we will iterate to build the table machine
    for (i = 0; i < states.length; i++) {
        var aux = [];
        var row = '';
        // The columns are the letters A to Z
        for(j = 'a'.charCodeAt(0); j <= 'z'.charCodeAt(0); j++) {
            var letter = String.fromCharCode(j);
            // If the actual state-letter is not defined, do not set the next state, set state otherwise
            if (typeof states[i][letter] == 'undefined') {
               row = row + `<td class="column-${letter} state-"><img src="img/favicon.png"/ ></td>`;
               aux[letter] = '-';
            } else {
                row = row + `<td class="column-${letter}">q${states[i][letter]}</td>`;
                aux[letter] = states[i][letter];
            }
        }

        // Check if the state is not a final state
        if (typeof states[i]['final'] !== 'undefined') {
            row = `<td class="states">q${i}*</td>` + row;
            aux['final'] = true;
        } else {
            row = `<td class="states">q${i}</td>` + row;
        }
        
        $('#machine').append(`<tr class="row-${i}">${row}</tr>`);

        machine.push(aux);
    }

    globalMachine = machine;
}

function verifyWord(word){
    var state = 0;
    var err = false;
    for (var i = 0; i < word.length; i++) {
        $('#machine tr').removeClass('focus-row');
        $('#machine td').removeClass('focus-col');
        $('#machine tr').removeClass('focus-row-err');
        $('#machine td').removeClass('focus-col-err');

        if (word[i] >= 'a' && word[i] <= 'z'){
            if (globalMachine[state][word[i]] != '-' && !err){
                $('#machine .row-' + state).addClass('focus-row');
                $('#machine .column-' + word[i]).addClass('focus-col');
                $('.verify-word').addClass('valid');
                $('.verify-word').removeClass('invalid');
                state = globalMachine[state][word[i]];
            } else {
                $('.verify-word').removeClass('valid');
                $('.verify-word').addClass('invalid');
                $('#machine .row-' + state).addClass('focus-row-err');
                $('#machine .column-' + word[i]).addClass('focus-col-err');
                err = true;
                state++;
            }
        } else if (word[i] == ' ' && word.length > 1) {
            if (globalMachine[state]['final']){
                $('#machine .row-' + state).addClass('focus-row');
                $('.verify-word').addClass('valid');
                $('.verify-word').removeClass('invalid');

                if (err) {
                    $('.words').append(`<span class="tag is-danger">${word}</span>`);
                    iziToast.show({
                        title: 'Not Found!',
                        message: 'Lexus could not recognize the word.',
                        color: 'red',
                        position: 'topCenter'
                    });
                } else {
                    $('.words').append(`<span class="tag is-primary">${word}</span>`);
                    iziToast.show({
                        title: 'Found!',
                        message: 'Lexus recognized the word!',
                        color: 'green',
                        position: 'topCenter'
                    });
                }
            } else {
                $('.words').append(`<span class="tag is-danger">${word}</span>`);
                iziToast.show({
                    title: 'Not Found!',
                    message: 'Lexus could not recognize the word.',
                    color: 'red',
                    position: 'topCenter'
                });
            }
            $('.verify-word').val('');
                $('.verify-word').removeClass('valid');
                $('.verify-word').removeClass('invalid');
                state = 0;
        }
    }

    if (word.length == 0) {
        $('#machine tr').removeClass('focus-row');
        $('#machine td').removeClass('focus-col');
        $('#machine tr').removeClass('focus-row-err');
        $('#machine td').removeClass('focus-col-err');
        $('.verify-word').removeClass('valid');
        $('.verify-word').removeClass('invalid');
    }
}