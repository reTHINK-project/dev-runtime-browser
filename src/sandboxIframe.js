export function create(src, domain, id) {
	var iframe = document.createElement('iframe')
	iframe.setAttribute('id', id)
	iframe.title = 'reTHINK-project'
	iframe.setAttribute('seamless', '')
	iframe.setAttribute('src', src)
	iframe.setAttribute('sandbox', 'allow-forms allow-scripts allow-popups-to-escape-sandbox allow-popups allow-same-origin allow-top-navigation')
	iframe.style.display = 'none'
	document.querySelector('body').appendChild(iframe)

	return iframe
}
