const initPDJS = function() {
    const parsedToken = JSON.parse(localStorage.getItem("pd-token"));
    return new PDJSobj({
        token: parsedToken.access_token,
        tokenType: parsedToken.token_type,
        logging: true
    });
}

// pole for pd-token
const authCheckingPoll = function() {
    let checking = window.setInterval(function() {
        if (localStorage.getItem("pd-token")) {
            loadPage();
			initLogoutButton();
			window.history.replaceState({}, document.title, window.location.pathname);
            clearInterval(checking);
        }
    }, 500);
}

// init logout button
const initLogoutButton = function() {
    const logoutButton = document.getElementById("pd-logout-button");
    logoutButton.href = "#";
    
    // logout of pagerduty
    logoutButton.onclick = () => {
        localStorage.removeItem('pd-token');
        location.reload();
    }
}

function loadPage() {
	if (localStorage.getItem("pd-token")) {
		document.getElementById("auth").style.display = "none";
		document.getElementById("content").style.display = "block";

		const PDJS = initPDJS();
		initLogoutButton();
		document.getElementById("busy").style.display = "block";

		PDJS.api({
			res: `services`,
			type: `GET`,
			success: function(data) {
				let services = data.services;
				let serviceHTML = `<ul class="list-group">`;
				services.map(service => {
					serviceHTML += `<li class="list-group-item"><input type="checkbox" value="${service.summary}" id="${service.id}" ${(service.status == 'disabled' ? '' : ' checked')}>
					<label for="${service.id}">${service.summary}</label></li>
					`;
				});
				serviceHTML += "</ul>"
				document.getElementById("service-list").innerHTML = serviceHTML;
				services.map(service => {
					document.getElementById(service.id).addEventListener('change', function() {
						document.getElementById("busy").style.display = "block";
						if (this.checked) {
							PDJS.api({
								res: `services/${this.id}`,
								type: `PUT`,
								data: {
									service: {
										status: "active"
									}
								},
								success: function(data) {
									document.getElementById("result").innerHTML += `<div>${data.service.name} Service was enabled.</div>`;
									document.getElementById("busy").style.display = "none";
								}
							});
						} else {
							PDJS.api({
								res: `services/${this.id}`,
								type: `PUT`,
								data: {
									service: {
										status: "disabled"
									}
								},
								success: function(data) {
									document.getElementById("result").innerHTML += `<div>${data.service.name} Service was disabled.</div>`;
									document.getElementById("busy").style.display = "none";
								}
							});							
						}
					})
				});
				document.getElementById("busy").style.display = "none";
			}
		});
	} else {
		// show auth form
		document.getElementById("busy").style.display = "none";
		document.getElementById("content").style.display = "none";
		document.getElementById("auth").style.display = "block";
		authCheckingPoll();
	}
}
// initialize page
loadPage();
