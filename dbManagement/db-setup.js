module.exports = function(app){
  const path = require('path');
  const fs = require('fs');
//   const sqlite3 = require('sqlite3');

  // create 'images' directory
  const imgDir = path.join(app.getPath('userData'), 'images');
  fs.access(imgDir, function(err) {
    if (err && err.code === 'ENOENT') { // if not exists
      fs.mkdir(imgDir, function(err){  // create a directory
        if(err) console.log(err);
      });
    }
  });

  // set up the database
  const dbDir = path.join(app.getPath('userData'), 'data.sqlite3');
//   const db = new sqlite3.Database(dbDir);

  const knex = require('knex')({
    client: 'sqlite3',
    connection:{
      filename: dbDir
    },
    useNullAsDefault: true
  });

  knex.schema.hasTable('Pitanja').then(function(exists){
    if(!exists){
      return knex.schema.createTable('Pitanja', function(table){
        table.increments('id').primary();
        table.text('textPitanja');
        table.text('odgovori');
        table.text('tacniOdgovori');
        table.text('predmet');
        table.text('oblast');
        table.text('slika');
        table.integer('brojBodova');
      });
    }
  });

  knex.schema.hasTable('Predmeti').then(function(exists){
    if(!exists){
      return knex.schema.createTable('Predmeti', function(table){
        table.increments('id').primary();
        table.text('predmet');
        table.text('oblasti');
      });
    }
  });

  knex.schema.hasTable('Razredi').then(function(exists){
    if(!exists){
      return knex.schema.createTable('Razredi', function(table){
        table.increments('id').primary();
        table.text('razred');
        table.integer('brojUcenika');
      });
    }
  });

  knex.schema.hasTable('Ucenici').then(function(exists){
    if(!exists){
      return knex.schema.createTable('Ucenici', function(table){
        table.increments('id').primary();
        table.text('ime');
        table.text('prezime');
        table.text('razred');
        table.text('rezultati');
      });
    }
  });

  return knex;
}
