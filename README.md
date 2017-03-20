Activate mailer service with encrypted link
===========================================

With Angular.js you can add a user by using the emailjs module and
activate the user with a unique link the is encryted and hashed for
security reasons. Once the user is activated he is free to choose his
password. Then the user is activated and ready to use the service you
proffer.

![s](https://cloud.githubusercontent.com/assets/6890469/23995134/3f4ee6e8-0a6e-11e7-801c-e7f267e18a6d.jpg)

Overview
========

It is not a good idea for the administrator to create users and set
their passwords. It is better to send an email once user is created and
the user should be able to set his password and if you so choose also
set a security question and answer for later password retrieval.

This project attempts to achieve this goal by giving a scaffolding which
you can modify for your needs.

Screenshots
===========

![shot](https://cloud.githubusercontent.com/assets/6890469/24108248/1774fe8a-0db3-11e7-8751-433f3dcb683f.png)

Usage
========

```

$ npm install
$ cd public
$ bower install
$ cd ..
$ npm start

```

Go to [http://localhost;2333](http://localhost:2333/)

Contact
=======

Girish Venkatachalam <girish@gayatri-hitech.com>
