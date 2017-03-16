Activate mailer service with encrypted link
===========================================

with Angular.js factory and nvd3 rendering using JSON
 from a HTTP express server fetching samples from postgres DB.

Overview
========

Using a simple Angular.js module we see how
 you can show double precision sample values 
against timestamps
from a database.

 material design principles.


Populate DB
===========


Here is how you populate it.
```
psql -U postgres
psql> create database d3samples;
psql> \c d3samples;
psql> create table d3samples(id serial,feed_id integer, ts timestamp,val
double precision);
psql> insert into d3samples values(DEFAULT, 20, 'now()', 23432.343);
psql> insert into d3samples values(DEFAULT, 20, 'now()', 32.0343);
psql> insert into d3samples values(DEFAULT, 20, 'now()', 132.0343);
psql> insert into d3samples values(DEFAULT, 20, 'now()', 82.038);
psql> insert into d3samples values(DEFAULT, 20, 'now()', 92.033);
...
psql>quit
```

Screenshots
===========

![s](https://cloud.githubusercontent.com/assets/6890469/23995134/3f4ee6e8-0a6e-11e7-801c-e7f267e18a6d.jpg)


Contact
=======

Girish Venkatachalam <girish@gayatri-hitech.com>
