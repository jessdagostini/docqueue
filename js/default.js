var words = [];
var states = [[]];
var globalState = 0;
var globalMachine = [];

// Add a primary dictionary to start
var primaryWords = ['include', 'define', 'using', 'namespace', 'main', 'string', 'unsigned'];
primaryWords.forEach(word => {
    words.push(word);
    $('#dict').append(`<span class="tag is-primary is-word word-${word}">${word}<button class="delete is-small remove-word" onclick="removeWord('${word}')"></button></span>`);
    updateMachine();
})
updateMachine();

$(document).ready(function() {
    // Show the dictionary
    $(".button").click(function(){
        queue();
    });

    // Verify if the word is reconigzed by the machine
    $('.clients').keyup(() => {
        probability($('.clients').val());
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

function probability(n) {
    for(i = 0; i<n; i++) {
        var resulta = $(".time-a").val() * Math.pow($(".tax-a").val(),n);
        console.log($(".time-a").val());
    }
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