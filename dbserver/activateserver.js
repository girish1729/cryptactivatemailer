var express = require('express')
var cors = require('cors');
var jwt = require('jsonwebtoken');
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
app.use(cors());

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

var jwt_secret = in2nConfig.jwt_secret;
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

var db = null;
var jwtmap = {};

function dbconn() {
    var pgp = require('pg-promise')(options);
    var connectionString = 'postgres://postgres:@localhost:5432/in2nsamples';
    db = pgp(connectionString);
}

dbconn();

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

function list_in2nallusers(req, res, next) {
    var company_id = req.params.company_id;
    var userlist = [];
    db.any('select user_id,name from in2nuser')
        .then(function (data) {
            data.forEach(function (val) {
                userlist.push(val.user_id + "," + val.name);
            });
            console.log(userlist);
            res.status(200)
                .json(userlist);
        })
        .catch(function (err) {
            return next(err);
        });
}

function list_in2nemails(req, res, next) {
    var emaillist = [];
    db.any('select email from in2nuser;')
        .then(function (data) {
            data.forEach(function (val) {
                emaillist.push(val.email);
            });
            console.log(emaillist);
            res.status(200)
                .json(emaillist);
        })
        .catch(function (err) {
            return next(err);
        });
}

function in2n_passcheck(req, res) {
    var user = req.body.user;
    var pass = req.body.pass;
    var company = req.body.company;
    console.log(user);
    console.log(pass);
    console.log(company);
    db.one('select user_id,name,email,pass from in2nuser ' +
            ' where company = $1' + 'and (name = $2 or email = $2);', [company, user])
        .then(function (data) {
            name = data.name, setpass = data.pass;
            email = data.email;
            user_id = data.user_id;
            console.log(name);
            console.log(email);
            company = parseInt(company);

            if (pass === setpass) {
                console.log('success');
                var payload = {
                    email: email,
                    user: name,
                    owner: user_id,
                    company: company
                };

                token = create_in2njwtauthtoken(payload);
                jwtmap[user_id] = token;
                return res.status(200)
                    .json({
                        token: token
                    });
            } else {
                console.log('failure');
                return res.status(401)
                    .send('Password failure')
            }
        }, function (err) {
            return res.status(401)
                .send('User not found');
        });
}


function detail_in2nuser(user_id, res, next) {
    db.any('select * from in2nuser where user_id = $1;', [user_id])
        .then(function (data) {

            db.any('select name from company where company_id = $1', [data[0].company])
                .then(function (company) {
                    data[0].companyname = company[0].name;
                    if (data[0].secques) {
                        tmp = data[0].secques.split(':');
                        data[0].security_question = tmp[0];
                        data[0].security_answer = tmp[1];
                    }
                    console.log(data[0]);
                    res.status(200)
                        .json(data[0]);
                });
        })
        .catch(function (err) {
            return next(err);
        });
}


function update_in2nuser(res, id, username, company, avatar, email,
    pass, adminflg, fullname, secques, newuser) {
    console.log(id);
    console.log(username);
    console.log(company);
    console.log(avatar);
    console.log(email);
    console.log(pass);
    console.log(adminflg);
    console.log(fullname);
    console.log(secques);
    console.log(newuser);

    stmt = ' name = $2, company = $3, avatar = $4, admin = $5,' + 'pass = $6, fullname = $7, secques = $8, newuser = $9 ';
    db.any(
            "update in2nuser set " + stmt +
            "where user_id = $1", [id, username, company,
                avatar, adminflg, pass, fullname, secques, newuser
            ])
        .then(function (data) {
            console.log(data);
            console.log('Updated user:: ' + data);
            res.status(200)
                .send("Updated successfully");
        })
        .catch(function (err) {
            console.log(err);
            res.status(501)
                .send("Update failed");
        });
}

/* This part deals with JWT authentication XXX */

create_in2njwtauthtoken = function (payload) {

    var token = jwt.sign(payload, jwt_secret);
    //console.log(token);
    var tok_exp = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        data: payload
    }, jwt_secret);

    return token;
};

verify_in2njwtauth = function (token, res, next) {
    console.log(token);

    /*
    var decoded = jwt.verify(token, jwt_secret);
    console.log(decoded.email);
	*/

    jwt.verify(token, jwt_secret, function (err, decoded) {
        if (!decoded) {
            console.log("Auth failed");
            return res.status(401)
                .send("Unauthorized");
        }
        console.log("Auth succeeded");
        console.log(decoded);
        console.log(decoded.email);
        console.log(decoded.user);
        console.log(decoded.company);
        console.log(decoded.owner);
        return res.status(200)
            .json({
                company: decoded.company,
                owner: decoded.owner
            });
    });

}

//token = init_in2njwtauth();

/*
try {
  var decoded = jwt.verify(token, 'wrong-secret');
} catch(err) {
	console.log("Reject auth");
}

jwt.verify(token, 'wrong-secret', function(err, decoded) {
	if(!decoded) {
		console.log("rejected");
	}
});
*/

createsecret = function (plaintext) {
    return encrypt(plaintext);
};

hashid = function (plaintext) {
    return crypto.createHash('md5')
        .update(plaintext)
        .digest("hex");
};

/* This part deals with emailjs mailer service XXX */

verify_in2nactivation = function (secret, codedid, res, next) {

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
        " <p>Hi,</p> <p><strong>Your in2nData accout has been</p> " +
        "<p>freshly created and you may click " +
        " <a href='https://localhost/activate.html#!" +
        "/activateuser/" + secret + "/" + codedid + "'>here</a>" +
        " for activation." +
        "<p><p><a href='http://www.in2ndata.com'>in2nData</a></html>"; + "</html>";

    mailserver.send({
        text: "Mail activation link",
        from: 'in2ndata <noreply@in2ndata.com>',
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
        "successfully</strong></p>" +
        "<p><a href='http://www.in2ndata.com'>in2nData</a></html>";

    mailserver.send({
        text: "Password set successfully",
        from: 'in2ndata <noreply@in2ndata.com>',
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

/******************** XXX Start endpoints **************/

/* XXX catch all */
app.all('*', function (req, res, next) {
    console.log(req.path);
    next();
});

/* R of cRud XXX */
app.get('/getallusers', function (req, res, next) {
    list_in2nallusers(req, res, next);
});

app.get('/getemails', function (req, res, next) {
    list_in2nemails(req, res, next);
});

app.post('/passcheck', function (req, res, next) {
    in2n_passcheck(req, res, next);
});

app.get('/getoneuser/:user_id', function (req, res, next) {
    user_id = req.params.user_id;
    detail_in2nuser(user_id, res, next);
});


/* U of crUd XXX */
app.put('/updateuser', function (req, res) {
    id = req.body.user_id;
    name = req.body.name;
    company = req.body.company;
    avatar = req.body.avatar;
    email = req.body.email;
    pass = req.body.pass;
    adminflg = req.body.adminflg;
    fullname = req.body.fullname;
    secques = req.body.secques;
    newuser = req.body.newuser;
    update_in2nuser(res, id, name, company, avatar, email, pass,
        adminflg, fullname, secques, newuser);
});

app.get('/tokencheck/:token', function (req, res, next) {
    var token = req.params.token;
    verify_in2njwtauth(token, res, next);
});

app.get('/decryptverify/:secret/:hash', function (req, res, next) {
    var secret = req.params.secret;
    var codedid = req.params.hash;
    verify_in2nactivation(secret, codedid, res, next);
});


app.get('/getjwt/:user_id', function (req, res, next) {
    var user_id = req.params.user_id;
    if (jwtmap[user_id] === undefined) {
        return res.status(401)
            .send("JWT not found");
    }
    res.status(200)
        .json({
            token: jwtmap[user_id]
        });
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



/* XXX Start express listen */

app.listen(5000, function() {
console.log("DB server listening at 5000");
});
