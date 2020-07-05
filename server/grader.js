function compArr(arr1, arr2){
  if(arr1.length != arr2.length){
    return false;
  }
  for(var i=0; i<arr1.length; i++){
    if(arr1[i] != arr2[i]){
      return false;
    }
  }
  return true;
}

function saveResults(id, result, knex){
  var resString = JSON.stringify(result) + '&||&';
  knex('Ucenici')
    .select('ime', 'prezime', 'rezultati')
    .where('id', '=', id)
    .then(function(rows){
      res = rows[0].rezultati;
      res += resString;
      knex('Ucenici')
        .where('id', '=', id)
        .update({rezultati: res})
        .then((r)=>{null})
        .catch((err)=>{if(err)console.log(err);});
    }).catch(function(err){
      if(err) console.log(err);
    })
}

module.exports = async function(answers, testInfo, knex){
  var results = {};
  var ucenici = {};

  await knex('Ucenici').select('*')
    .where('razred', '=', testInfo.razred)
    .then(function(rows){
      for(row of rows){
        ucenici[row.id] = row;
      }
    }).catch(function(err) {
      if(err) console.log(err);
    })

  await knex('Pitanja').select('*')
    .whereIn('oblast', testInfo.oblasti)
    .then(function(pitanja){
      var questions = {};
      for(pitanje of pitanja){
        questions[pitanje.id] = pitanje;
      }

      for(var username of Object.keys(answers)){
        var id = username.substr(8);
        results[id] = {
          ime: ucenici[id].ime,
          prezime: ucenici[id].prezime,
          ukupnoBod: 0,
          osvojenoBod: 0,
          procenat: 0,
          odgovori: []
        };

        for(var qid of Object.keys(answers[username])){
          results[id].ukupnoBod += questions[qid].brojBodova;
          var odg = {
            pitanje: questions[qid],
            correct: false,
            ans: [],
            correctAns: questions[qid].tacniOdgovori.split('')
          };

          if(compArr(answers[username][qid], odg.correctAns)){
            results[id].osvojenoBod += questions[qid].brojBodova;
            odg.correct = true;
            odg.ans = odg.correctAns;
          } else{
            odg.ans = answers[username][qid];
          }

          results[id].odgovori.push(odg);
        }

        results[id].procenat = 100 * results[id].osvojenoBod / results[id].ukupnoBod;

        saveResults(id, results[id], knex);
      }
    })
    .catch(function(err) {
      if(err) throw err;
    });

    return results;
}
