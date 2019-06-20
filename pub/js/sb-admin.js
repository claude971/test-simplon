(function($) {
	// Annuler une attribution
	$(".deleteA").on('click', function(e) {
		e.preventDefault();
		var cible = e.target;
		attrId = cible.getAttribute("cible");
		var jqxhr = $.post( "/removeAttr", {attribut:attrId})
		  .done(function() {
			 alert( "L'attribution a été supprimée." );
			 window.location.href = "/attributions";
		  })
		  .fail(function() {
			 alert( "Une erreur est survenue lors de la suppresionn de l'attribution." );
		  })
	});
	// Faire une nouvelle attribution
	$("#nAttrib").on('click', function(e) {
		e.preventDefault();
		var nokO = 0, nokU = 0;
		var jqxhr = $.get( "/users", function(data){
			if(data.length == 0){
				$("#ut").append("<option>Pas d'utilisateur disponible</option>");
				nokU = 1;
			}
			else
				for(i=0; i<data.length; i++)
					$("#ut").append("<option value='" + data[i].userId + "'>" + data[i].nom + "</option>");
		});
		jqxhr = $.get( "/ordisp", function(data){
			if(data.length == 0){
				$("#ordinateurs").append("<option>Pas d'ordinateur disponible</option>");
				nokO = 1;
			}
			else
				for(i=0; i<data.length; i++)
					$("#ordinateurs").append("<option value='" + data[i].ordId + "'>" + data[i].nom + "</option>");
		})
		  .done(function() {
			  // Afficher le formulaire
			 $('#formulaire').addClass('d-block');
			 $('#dataAttr').removeClass('d-block');
			 $('#dataAttr').addClass('d-none');
			 $('#nAttrib').addClass('d-none');
			 if(nokO || nokU) $('#attribuer').attr('disabled', true);
			 $('#retourAttrib').addClass('d-block');
		  })
		  .fail(function() {
			 alert( "Une erreur est survenue lors de la création de l'attribution." );
		  })
	});
	
	$("#retourAttrib").on('click', function(e) {
		e.preventDefault();
		window.location.href = "/attributions";
	});
	// Supprimer un utilisateur
	$(".deleteU").on('click', function(e) {
		e.preventDefault();
		var cible = e.target;
		userId = cible.getAttribute("cible");
		var jqxhr = $.post( "/removeUser", {attribut:userId})
		  .done(function() {
			 alert( "L'utilisateur a été supprimé." );
			 window.location.href = "/utilisateurs";
		  })
		  .fail(function() {
			 alert( "Une erreur est survenue lors de la suppresion de l'utilisateur." );
		  })
	});
	// Créer une nouvel utilisateur
	$("#nUser").on('click', function(e) {
		e.preventDefault();
	  // Afficher le formulaire
	 $('#formulaire').addClass('d-block');
	 $('#dataUser').removeClass('d-block');
	 $('#dataUser').addClass('d-none');
	 $('#nUser').addClass('d-none');
	 $('#retourUser').addClass('d-block');
	});

// NAVIGATION
  $(".navcard").on('mouseenter',function(e) {
    e.preventDefault();
	 $(this).addClass("edgar");
  });
  $(".navcard").on('mouseleave',function(e) {
    e.preventDefault();
	 $(this).removeClass("edgar");
  });
	// Afficher les utilisateurs
	$("#utilisateurs").on('click', function(e) {
		e.preventDefault();
	   window.location.href = "/utilisateurs";
	});
	// Afficher les attributions
	$("#attributions").on('click', function(e) {
		e.preventDefault();
	   window.location.href = "/attributions";
	});

})(jQuery); // End of use strict
