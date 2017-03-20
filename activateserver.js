var express = require('express')
var fs = require('fs');
var bodyParser = require('body-parser')
var email = require('emailjs');
var exec = require('child_process')
    .exec;

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use('/public', express.static(__dirname + '/public'));
app.all('/*', function(req, res, next){
  console.log("URL:: " + req.path);
  console.log("Method:: " + req.method);
    next();
});


var Config = require('./public/config/config.json');
// Nodejs encryption with CTR
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';


var mailserver = email.server.connect({
    user: Config.mail_user,
    password: Config.mail_password,
    host: Config.mail_host,
    ssl: true
});

var ips = ['127.0.0.1'];

/*
app.use(ipfilter(ips, {
    mode: 'allow'
}));
*/

app.use(function (err, req, res, _next) {
    console.log('Error handler', err);
    res.status(err.status || 500)
        .send("Access denied");
});

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

createsecret = function (plaintext) {
    return encrypt(plaintext);
};

hashid = function (plaintext) {
    return crypto.createHash('md5')
        .update(plaintext)
        .digest("hex");
};

/* This part deals with emailjs mailer service XXX */

verify_activation = function (secret, codedid, res, next) {

    var idblob = decrypt(secret);
    var arr = idblob.split(',');
    var user_id = arr[0];

    var ourhash = hashid(idblob);

    if (ourhash !== codedid) {
        console.log("Auth failed");
        return res.status(401)
            .send("Bad activation link");
    }
    console.log("Activation succeeded");
    console.log(user_id);
    return res.status(200)
        .json({
            user_id: user_id
        });
}

function send_activation_mail(email, user_id, res) {

    console.log("Send mail to:: " + email);
    mailbody = "Activate mail";
    subject = "Password mailer";

    var plaintext = user_id + "," + jwt_secret;
    var secret = createsecret(plaintext);
    var codedid = hashid(plaintext);

    console.log("secret::" + secret);
    console.log("codedid::" + codedid);
    console.log("plaintext::" + plaintext);
    recipient = email;
    //recipient = 'girish1729@gmail.com';
    htmlbody = "<html>" +
        " <p>Hi,</p> <p><strong>Your accout has been</p> " +
        "<p>freshly created and you may click " +
        " <a href='https://localhost/activate.html#!" +
        "/activateuser/" + secret + "/" + codedid + "'>here</a>" +
        " for activation." +
        "<p></html>"; + "</html>";

    mailserver.send({
        text: "Mail activation link",
        from: '<noreply@anywhere.com>',
        to: recipient,
        cc: '',
        subject: subject,
        attachment: [{
            data: htmlbody,
            alternative: true
        }]

    }, function (err, message) {
        if (err) {
            console.log(err);
            return res.status(401)
                .send("Mail send err");
        }
        console.log(message);
        res.status(200)
            .send("Sent mail");
    });

};

function send_confirmation_mail(email, res) {

    console.log("Send confirmaion mail to:: " + email);
    subject = "Password set confirmation";
    recipient = email;
    //recipient = 'girish1729@gmail.com';
    htmlbody = "<html>" +
        " <p>Hi,</p> <p><strong>Your password was updated " +
        "successfully</strong></p></html>" ;

    mailserver.send({
        text: "Password set successfully",
        from: 'Automailer <noreply@foo.com>',
        to: recipient,
        cc: '',
        subject: subject,
        attachment: [{
            data: htmlbody,
            alternative: true
        }]
    }, function (err, message) {
        if (err) {
            console.log(err);
            return res.status(401)
                .send("Mail send err");
        }
        console.log(message);
        res.status(200)
            .send("Sent mail");
    });

}

app.get('/decryptverify/:secret/:hash', function (req, res, next) {
    var secret = req.params.secret;
    var codedid = req.params.hash;
    verify_in2nactivation(secret, codedid, res, next);
});


app.post('/sendmailer', function (req, res) {
    email = req.body.email;
    user_id = req.body.user_id;
    send_activation_mail(email, user_id, res);
});

app.post('/sendconfirmation', function (req, res) {
    email = req.body.email;
    send_confirmation_mail(email, res);
});

app.get('/activate.html', function(req, res, next){
  res.sendFile(__dirname + '/public/activate.html');
});


app.get('/*', function(req, res, next){
  res.sendFile(__dirname + '/public/index.html');
});


/* XXX Start express listen */
app.listen(5000, function() {
console.log("DB server listening at 5000");
});
