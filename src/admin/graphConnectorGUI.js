class graphConnectorGUI {

	constructor(graphConnector) {
		if (!graphConnector) throw Error('graph Connector is not set!');

		let domain = "localhost";
		window.runtime = {
			"domain": domain
		};

		window.runtime = {"runtime": graphConnector};


		$('.graphConnector-page-show').on('click', (event) => {
			$('.policies-section').addClass('hide');
			$('.identities-section').addClass('hide');
			$('.graphConnector-section').removeClass('hide');
		});
	}

}

export default graphConnectorGUI;
