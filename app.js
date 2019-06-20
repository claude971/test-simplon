// define dependencies
const express = require('express');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const session = require('express-session'); // utilisation des sessions du module express
const bcrypt = require("bcrypt"); // module de cryptage/décryptage du mot de passe
const app = express();
const PORT = 3000; // you can change this if this port number is not available
var mysql =  require('mysql');
var fs = require("fs");

// Définition du moteur de template pour les vues
app.set('view engine', 'ejs');
// Définition du dossier statique pour les scripts et les styles
app.use(express.static('pub'));
// Mise en place des paramètres de la session
app.use(
  session({
    secret: "iy98hcbh489n38984y4h498", 
    resave: true,
    saveUninitialized: false
  })
);

var urlencodedParser = bodyParser.urlencoded({ extended: false })

/* connection à la base de données */
  var connection =  mysql.createConnection({
  	host : "localhost",
  	user : "root",
  	password: ""
  });
  connection.connect();

  // Génération d'un mot de passe administrateur
bcrypt.genSalt(10, function(err, salt) {
	bcrypt.hash('administration', salt, function(err, hash){
		// console.log("salt : " + salt + " hash : " + hash);
	});
});

// Vue par défaut
app.get('/', (req, res) => {
  res.render('index.ejs',{msg: '', theId:''});
})
// Page attributions
app.get('/attributions', (req, res) => {
  if (req.session.user) {
	// Récupérer la liste des attributions en cours
	connection.query("use simplon");
	console.log("ttributions");
	strQuery = "select a.attrId, a.duree, a.depart, o.nom as ordi, u.nom as user from attribution a inner join ordinateur o on o.ordId=a.ordinateur inner join utilisateur u on u.userId=a.utilisateur";
	connection.query( strQuery, function(err, attrData, rows){
		if(err)	{
			console.log('Erreur MYSQL dans la récupération des attributions');
		}else{
			res.render('accueil.ejs',{adminName:req.session.user.username, dataSet:attrData});
		}
	});
  }
  else
	  return res.redirect('/');
})
// Page utilisateurs
app.get('/utilisateurs', (req, res) => {
  if (req.session.user) {
	// Récupérer la liste des utilisateurs
	connection.query("use simplon");
	console.log("utilisateurs");
	strQuery = "select * from utilisateur";
	connection.query( strQuery, function(err, userData, rows){
		if(err)	{
			console.log('Erreur MYSQL dans la récupération des utilisateurs');
		}else{
			res.render('utilisateurs.ejs',{adminName:req.session.user.username, dataSet:userData});
		}
	});
  }
  else
	  return res.redirect('/');
})

/*
Identification de l'administrateur
=============
*/
app.post('/login', urlencodedParser, function (req, res) {
  connection.query("use simplon");
  var strQuery = "select * from user where identifiant=" +"'" + req.body.inputId + "'";	  
  connection.query( strQuery, function(err, userData, rows){
  	if(err)	{
  		console.log('Erreur MYSQL');
  	}else{
		// Vérifier le résultat de la requête
		if(userData.length > 0) {
		console.log(userData[0]);// Mettre le résultat de la requete dans userData
			// Comparer les mots de passe
			bcrypt.compare(req.body.inputPassword, userData[0].password, function(err, reponse){
			if (reponse)  { 
				// Créer la session
				req.session.user = {
					inputId: userData[0].identifiant,
					username: userData[0].fullname
				 };
				 req.session.user.expires = new Date(
					Date.now() + 3 * 24 * 3600 * 1000 // session expires in 3 days
				 );
				// Initialiser les données
				// 1. Récupérer la liste des attributions en cours
				strQuery = "select a.attrId, o.nom as ordi, u.nom as user from attribution a inner join ordinateur o on o.ordId=a.ordinateur inner join utilisateur u on u.userId=a.utilisateur";
				connection.query( strQuery, function(err, attrData, rows){
					if(err)	{
						console.log('Erreur MYSQL dans la récupération des attriutions');
					}else{
						// Vérifier le résultat de la requête
						res.render('accueil.ejs',{adminName:req.session.user.username, dataSet:attrData});
					}
				});
			}
			else {
				res.render('index.ejs',{msg:'Mot de passe incorrect', theId:req.body.inputId});
				}
			});
			}
		else {
			// Identifiant non reconnu
			res.render('index.ejs',{msg:'Identifiant incorrect', theId:req.body.inputId});
        		}
			
  	}
    });
})

// Retirer une atribution
app.post('/removeAttr', urlencodedParser, function(req, res) {
	connection.query("use simplon");
	console.log(req.body.attribut);
	var strQuery = "delete from attribution where attrId=" + req.body.attribut;	  
	connection.query( strQuery, function(err, data, rows){
		if(err)	{
			console.log('Erreur MYSQL dans la suppression de l\'attribution n°' + req.body.attribut);
		}else{
			// Récupérer la liste des attributions en cours
			strQuery = "select a.attrId, a.duree, a.depart, o.nom as ordi, u.nom as user from attribution a inner join ordinateur o on o.ordId=a.ordinateur inner join utilisateur u on u.userId=a.utilisateur";
			connection.query( strQuery, function(err, attrData, rows){
				if(err)	{
					console.log('Erreur MYSQL dans la récupération des attributions');
				}else{
					res.render('accueil.ejs',{adminName:req.session.user.username, dataSet:attrData});
				}
			});
		}
	});
})

// Nouvelle attribution
app.post('/nAttrib', urlencodedParser, (req, res) => {
  connection.query("use simplon");
  var datecreation = new Date();
  var depart = datecreation.getHours() + ":" + datecreation.getMinutes() + ":00"; 
  var strQuery = "insert into attribution values (0," + req.body.ordinateurs + "," + req.body.utilisateurs + "," + req.body.creneau + "," + "'" + depart + "')";
  console.log(strQuery);
  connection.query( strQuery, function(err, data, rows){
  	if(err)	{
  		console.log('Erreur MYSQL dans la création de l\'attribution');
  	}else{
		// Récupérer la liste des attributions en cours
		strQuery = "select a.attrId, a.duree, a.depart, o.nom as ordi, u.nom as user from attribution a inner join ordinateur o on o.ordId=a.ordinateur inner join utilisateur u on u.userId=a.utilisateur";
		connection.query( strQuery, function(err, attrData, rows){
			if(err)	{
				console.log('Erreur MYSQL dans la récupération des attributions');
			}else{
				return res.redirect('/attributions');
			}
		});
	}
  });
})
// Nouvel utilisateur
app.post('/nUSer', urlencodedParser, (req, res) => {
  connection.query("use simplon");
  var strQuery = "insert into utilisateur values (0,'" + req.body.inputNom + "','" + req.body.inputEmail + "')";
  console.log(strQuery);
  connection.query( strQuery, function(err, data, rows){
  	if(err)	{
  		console.log('Erreur MYSQL dans la création de l\'utilisateur');
  	}else
		return res.redirect('/utilisateurs');
	});
})
// Supprimer un utilisateur
app.post('/removeUser', urlencodedParser, function(req, res) {
	connection.query("use simplon");
	console.log(req.body.attribut);
	var strQuery = "delete from utilisateur where userId=" + req.body.attribut;	  
	connection.query( strQuery, function(err, userData, rows){
		if(err)	{
			console.log('Erreur MYSQL dans la suppression de l\'utilisateur n°' + req.body.attribut);
		}else{
			res.render('utilisateurs.ejs',{adminName:req.session.user.username, dataSet:userData});
			}
	});
})
// Ordinateurs disponibles
app.get('/ordisp', (req, res) => {
	 connection.query("use simplon");
	  var strQuery = "select * from ordinateur where ordId NOT IN (select ordinateur from attribution)";	  
	  connection.query( strQuery, function(err, ordiData, rows){
		if(err)	{
			console.log('Erreur MYSQL dans la récupération des ordinateurs disponibles');
		}else{
			res.send(ordiData);
		}
	  });
})
// Utilisateurs disponibles
app.get('/users', (req, res) => {
  if (req.session.user) {
	  connection.query("use simplon");
	  var strQuery = "select * from utilisateur where userId NOT IN (select utilisateur from attribution)";	  
	  connection.query( strQuery, function(err, userData, rows){
		if(err)	{
			console.log('Erreur MYSQL dans la récupération des utilisateurs disponibles');
		}else{
			res.send(userData);
		}
	  });
  }
  else
	  return res.redirect('/');
})

/*
Autorisations
=============
Tester si la session est valide pour permettre la navigation
*/
app.use((req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send('Vous n\'avez pas l\'autorisation d\'afficher cette page. Veuillez vous identifier');
  }
});

/*
4. Logout
=============
*/
app.all('/logout', (req, res) => {
  	req.session.destroy(); // any of these works
    res.status(200).send('logout successful');
	res.render('index.ejs',{msg: ''});
})

app.listen(PORT, () => {
  console.log("L\'application a démarré sur le port 3000")
})